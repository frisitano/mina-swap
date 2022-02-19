import {
  prop,
  PublicKey,
  CircuitValue,
  Signature,
  UInt64,
  UInt32,
  KeyedAccumulatorFactory,
  ProofWithInput,
  proofSystem,
  branch,
  shutdown,
  PrivateKey,
  Circuit,
} from 'snarkyjs';

const accountsDepth: number = 32;
const accounts = KeyedAccumulatorFactory<PublicKey, Account>(accountsDepth);
type Accounts = InstanceType<typeof accounts>;

const balancesDepth: number = 32;
const balances = KeyedAccumulatorFactory<UInt32, UInt64>(balancesDepth);
type Balances = InstanceType<typeof balances>;

class Account extends CircuitValue {
  @prop publicKey: PublicKey;
  @prop nonce: UInt32;
  @prop balances: Balances;

  constructor(publicKey: PublicKey, nonce: UInt32, balances: Balances) {
    super();
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.balances = balances;
  }
}

const pairsDepth: number = 32;
const pairs = KeyedAccumulatorFactory<UInt32, Pair>(pairsDepth);
type Pairs = InstanceType<typeof pairs>;

class Pair extends CircuitValue {
  @prop token0Id: UInt32;
  @prop token1Id: UInt32;
  @prop reserve0: UInt64;
  @prop reserve1: UInt64;
  @prop lpTokenId: UInt32;
  @prop lpTotalAmount: UInt64;

  constructor(
    token0Id: UInt32,
    token1Id: UInt32,
    reserve0: UInt64,
    reserve1: UInt64,
    lpTokenId: UInt32,
    lpTotalAmount: UInt64
  ) {
    super();
    this.token0Id = token0Id;
    this.token1Id = token1Id;
    this.reserve0 = reserve0;
    this.reserve1 = reserve1;
    this.lpTokenId = lpTokenId;
    this.lpTotalAmount = lpTotalAmount;
  }
}

class State extends CircuitValue {
  @prop accounts: Accounts;
  @prop pairs: Pairs;

  constructor(accounts: Accounts, pairs: Pairs) {
    super();
    this.accounts = accounts;
    this.pairs = pairs;
  }
}

class Swap extends CircuitValue {
  @prop sender: PublicKey;
  @prop nonce: UInt32;
  @prop pairId: UInt32;
  @prop token0Id: UInt32;
  @prop token1Id: UInt32;
  @prop amount: UInt64;
  @prop amountOutMin: UInt64;

  constructor(
    sender: PublicKey,
    nonce: UInt32,
    pairId: UInt32,
    token0Id: UInt32,
    token1Id: UInt32,
    amount: UInt64,
    amountOutMin: UInt64
  ) {
    super();
    this.amount = amount;
    this.amountOutMin = amountOutMin;
    this.sender = sender;
    this.nonce = nonce;
    this.pairId = pairId;
    this.token0Id = token0Id;
    this.token1Id = token1Id;
  }
}

class StateTransition extends CircuitValue {
  @prop source: State;
  @prop target: State;
  constructor(source: State, target: State) {
    super();
    this.source = source;
    this.target = target;
  }
}

const feeTo = PrivateKey.random().toPublicKey();

@proofSystem
class RollupProof extends ProofWithInput<StateTransition> {
  @branch static swap(
    swap: Swap,
    sig: Signature,
    accounts: Accounts,
    pairs: Pairs
  ): RollupProof {
    // verify signiture and construct origin state
    sig.verify(swap.sender, swap.toFields()).assertEquals(true);
    const originState = new State(accounts, pairs);

    // fetch sender, assert account exists and nonce is correct
    let [sender, senderAccountProof] = accounts.get(swap.sender);
    sender.isSome.assertEquals(true);
    sender.value.nonce.assertEquals(swap.nonce);

    // fetch sender token balances
    const [senderToken0Balance, senderToken0BalanceProof] =
      sender.value.balances.get(swap.token0Id);
    const [senderToken1Balance, senderToken1BalanceProof] =
      sender.value.balances.get(swap.token1Id);

    // assert sender has sufficient token 0 balance
    senderToken0Balance.isSome.assertEquals(true);
    senderToken0Balance.value.assertGt(swap.amount); // change to Gte

    // fetch feeTo account and token0 balance
    const [feeToAccount, feeToAccountProof] = accounts.get(feeTo);
    const [feeToToken0Balance, feeToToken0BalanceProof] =
      feeToAccount.value.balances.get(swap.token0Id);

    // fetch pair and assert it exists
    let [pair, pairProof] = pairs.get(swap.pairId);
    pair.isSome.assertEquals(true);

    // compute swap amount and fee
    const amount = swap.amount
      .mul(977)
      .mul(pair.value.reserve1)
      .div(swap.amount.mul(977).mul(pair.value.reserve1).mul(1000));
    const fee = swap.amount.mul(5).div(1000);

    // update sender token balances and nonce
    sender.value.nonce.add(1);
    sender.value.balances.set(
      senderToken0BalanceProof,
      senderToken0Balance.value.sub(swap.amount)
    );
    sender.value.balances.set(
      senderToken1BalanceProof,
      Circuit.if(
        senderToken1Balance.isSome,
        senderToken1Balance.value.add(amount),
        amount
      )
    );

    // pay operator fee
    feeToAccount.value.balances.set(
      feeToToken0BalanceProof,
      Circuit.if(
        feeToToken0Balance.isSome,
        feeToToken0Balance.value.add(fee),
        fee
      )
    );

    // update accounts
    accounts.set(senderAccountProof, sender.value);
    accounts.set(feeToAccountProof, feeToAccount.value);

    // update pair reserves
    pair.value.reserve0 = pair.value.reserve0.add(swap.amount).sub(fee);
    pair.value.reserve1 = pair.value.reserve1.sub(amount);
    pairs.set(pairProof, pair.value);

    return new RollupProof(
      new StateTransition(originState, new State(accounts, pairs))
    );
  }

  @branch static merge(
    rollupProof1: RollupProof,
    rollupProof2: RollupProof
  ): RollupProof {
    rollupProof1.publicInput.target.assertEquals(
      rollupProof2.publicInput.source
    );
    return new RollupProof(
      new StateTransition(
        rollupProof1.publicInput.source,
        rollupProof2.publicInput.target
      )
    );
  }
}

shutdown();

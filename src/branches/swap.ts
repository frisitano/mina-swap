import { Signature, Circuit } from 'snarkyjs';
import { Accounts } from '../models/account';
import { Pairs } from '../models/pair';
import { State, StateTransition } from '../models/state';
import { Swap } from '../models/swap';
import { feeTo, RollupProof } from '../index';

export const swap = (
  sig: Signature,
  data: Swap,
  accounts: Accounts,
  pairs: Pairs
) => {
  // verify signiture and construct origin state
  sig.verify(data.sender, data.toFields()).assertEquals(true);
  const originState = new State(accounts, pairs);

  // fetch sender, assert account exists and nonce is correct
  let [sender, senderAccountProof] = accounts.get(data.sender);
  sender.isSome.assertEquals(true);
  sender.value.nonce.assertEquals(data.nonce);

  // fetch sender token balances
  const [senderToken0Balance, senderToken0BalanceProof] =
    sender.value.balances.get(data.token0Id);
  const [senderToken1Balance, senderToken1BalanceProof] =
    sender.value.balances.get(data.token1Id);

  // assert sender has sufficient token 0 balance
  senderToken0Balance.isSome.assertEquals(true);
  senderToken0Balance.value.assertGt(data.amount); // change to Gte

  // fetch feeTo account and token0 balance
  const [feeToAccount, feeToAccountProof] = accounts.get(feeTo);
  const [feeToToken0Balance, feeToToken0BalanceProof] =
    feeToAccount.value.balances.get(data.token0Id);

  // fetch pair and assert it exists
  let [pair, pairProof] = pairs.get(data.pairId);
  pair.isSome.assertEquals(true);

  // compute swap amount, fee and validate output amount is sufficient
  const amount = data.amount
    .mul(977)
    .mul(pair.value.reserve1)
    .div(data.amount.mul(977).mul(pair.value.reserve1).mul(1000));
  amount.assertGt(data.amountOutMin);
  const fee = data.amount.mul(5).div(1000);

  // update sender token balances and nonce
  sender.value.nonce.add(1);
  sender.value.balances.set(
    senderToken0BalanceProof,
    senderToken0Balance.value.sub(data.amount)
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
  pair.value.reserve0 = pair.value.reserve0.add(data.amount).sub(fee);
  pair.value.reserve1 = pair.value.reserve1.sub(amount);
  pairs.set(pairProof, pair.value);

  return new RollupProof(
    new StateTransition(originState, new State(accounts, pairs))
  );
};

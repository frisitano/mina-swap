import { Signature, Circuit } from 'snarkyjs';
import { Accounts } from '../models/account';
import { Pairs } from '../models/pair';
import { State, StateTransition } from '../models/state';
import { Swap } from '../models/swap';
import { feeTo, RollupProof } from '../rollup';

export const swap = (sig: Signature, data: Swap, state: State): State => {
  // dump state
  let accounts = state.accounts;
  let pairs = state.pairs;

  // verify signiture
  sig.verify(data.sender, data.toFields()).assertEquals(true);

  // fetch sender, assert account exists and nonce is correct
  let account = accounts.get(data.sender);
  account.isSome.assertEquals(true);
  account.value.nonce.assertEquals(data.nonce);

  // fetch sender token balances
  const senderToken0Balance = account.value.balances.get(
    data.token0Id.toString()
  );
  const senderToken1Balance = account.value.balances.get(
    data.token1Id.toString()
  );

  // assert sender has sufficient token 0 balance
  senderToken0Balance.isSome.assertEquals(true);
  senderToken0Balance.value.assertGt(data.amount); // change to Gte

  // fetch feeTo account and token0 balance
  const feeToAccount = accounts.get(feeTo);
  const feeToToken0Balance = feeToAccount.value.balances.get(
    data.token0Id.toString()
  );

  // fetch pair and assert it exists
  let pair = pairs.get(data.pairId.toString());
  pair.isSome.assertEquals(true);

  // compute swap amount, fee and validate output amount is sufficient
  const amount = data.amount
    .mul(977)
    .mul(pair.value.reserve1)
    .div(data.amount.mul(977).mul(pair.value.reserve1).mul(1000));
  amount.assertGt(data.amountOutMin);
  const fee = data.amount.mul(5).div(1000);

  // update sender token balances and nonce
  account.value.nonce.add(1);
  account.value.balances.set(
    pair.value.token0Id.toString(),
    senderToken0Balance.value.sub(data.amount)
  );
  account.value.balances.set(
    pair.value.token1Id.toString(),
    Circuit.if(
      senderToken1Balance.isSome,
      senderToken1Balance.value.add(amount),
      amount
    )
  );

  // pay operator fee
  feeToAccount.value.balances.set(
    data.token0Id.toString(),
    Circuit.if(
      feeToToken0Balance.isSome,
      feeToToken0Balance.value.add(fee),
      fee
    )
  );

  // update accounts
  accounts.set(data.sender, account.value);
  accounts.set(feeTo, feeToAccount.value);

  // update pair reserves
  pair.value.reserve0 = pair.value.reserve0.add(data.amount).sub(fee);
  pair.value.reserve1 = pair.value.reserve1.sub(amount);
  pairs.set(data.pairId.toString(), pair.value);

  return new State(accounts, pairs);
};

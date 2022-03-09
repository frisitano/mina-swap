import { Signature } from 'snarkyjs';
import { RollupProof } from '../rollup';
import { Burn } from '../models/liquidity';
import { State, StateTransition } from '../models/state';

export const burn = (sig: Signature, data: Burn, state: State): State => {
  // dump state
  let accounts = state.accounts;
  let pairs = state.pairs;

  // verify sig
  sig.verify(data.sender, data.toFields()).assertEquals(true);

  // fetch pair
  let pair = pairs.get(data.pairId.toString());
  pair.isSome.assertEquals(true);

  // fetch account
  let account = accounts.get(data.sender);
  account.isSome.assertEquals(true);

  // fetch account lpToken balance
  let lpTokenBalance = account.value.balances.get(
    pair.value.lpTokenId.toString()
  );
  lpTokenBalance.isSome.assertEquals(true);
  lpTokenBalance.value.lt(data.amountLpToken).assertEquals(false);

  // fetch token0 balance
  let token0Balance = account.value.balances.get(
    pair.value.token0Id.toString()
  );

  // fetch sufficient token1 balance
  let token1Balance = account.value.balances.get(
    pair.value.token1Id.toString()
  );

  const amountToken0 = data.amountLpToken
    .mul(pair.value.reserve0)
    .div(pair.value.lpTotalAmount);
  const amountToken1 = data.amountLpToken
    .mul(pair.value.reserve1)
    .div(pair.value.lpTotalAmount);

  // update pair
  pair.value.reserve0 = pair.value.reserve0.sub(amountToken0);
  pair.value.reserve1 = pair.value.reserve1.sub(amountToken1);
  pair.value.lpTotalAmount = pair.value.lpTotalAmount.sub(data.amountLpToken);
  pairs.set(data.pairId.toString(), pair.value);

  // update account
  account.value.balances.set(
    pair.value.lpTokenId.toString(),
    lpTokenBalance.value.sub(data.amountLpToken)
  );
  account.value.balances.set(
    pair.value.token0Id.toString(),
    token0Balance.value.add(amountToken0)
  );
  account.value.balances.set(
    pair.value.token1Id.toString(),
    token1Balance.value.add(amountToken1)
  );
  accounts.set(data.sender, account.value);

  return new State(accounts, pairs);
};

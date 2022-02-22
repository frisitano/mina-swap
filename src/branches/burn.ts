import { Signature } from 'snarkyjs';
import { RollupProof } from '..';
import { Burn } from '../models/liquidity';
import { State, StateTransition } from '../models/state';

export const burn = (sig: Signature, data: Burn, state: State): RollupProof => {
  // dump state
  let accounts = state.accounts;
  let pairs = state.pairs;

  // verify sig
  sig.verify(data.sender, data.toFields()).assertEquals(true);

  // fetch pair
  let [pair, pairProof] = pairs.get(data.pairId);
  pair.isSome.assertEquals(true);

  // fetch account
  let [account, accountProof] = accounts.get(data.sender);
  account.isSome.assertEquals(true);

  // fetch account lpToken balance
  let [lpTokenBalance, lpTokenBalanceProof] = account.value.balances.get(
    pair.value.lpTokenId
  );
  lpTokenBalance.isSome.assertEquals(true);
  lpTokenBalance.value.lt(data.amountLpToken).assertEquals(false);

  // fetch token0 balance
  let [token0Balance, token0Proof] = account.value.balances.get(
    pair.value.token0Id
  );

  // fetch sufficient token1 balance
  let [token1Balance, token1Proof] = account.value.balances.get(
    pair.value.token1Id
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
  pairs.set(pairProof, pair.value);

  // update account
  account.value.balances.set(
    lpTokenBalanceProof,
    lpTokenBalance.value.sub(data.amountLpToken)
  );
  account.value.balances.set(
    token0Proof,
    token0Balance.value.add(amountToken0)
  );
  account.value.balances.set(
    token1Proof,
    token1Balance.value.add(amountToken1)
  );
  accounts.set(accountProof, account.value);

  return new RollupProof(
    new StateTransition(state, new State(accounts, pairs))
  );
};

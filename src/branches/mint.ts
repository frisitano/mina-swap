import { Circuit, Signature, UInt64 } from 'snarkyjs';
import { Pairs } from '../models/pair';
import { Mint } from '../models/liquidity';
import { Accounts } from '../models/account';
import { RollupProof } from '../index';
import { StateTransition, State } from '../models/state';
import { min, sqrt } from '../lib/math';

export const mint = (
  sig: Signature,
  data: Mint,
  pairs: Pairs,
  accounts: Accounts
): RollupProof => {
  // verify sig
  sig.verify(data.sender, data.toFields()).assertEquals(true);
  const originState = new State(accounts, pairs);

  // fetch pair
  let [pair, pairProof] = pairs.get(data.pairId);
  pair.isSome.assertEquals(true);

  // fetch account
  let [account, accountProof] = accounts.get(data.sender);
  account.isSome.assertEquals(true);

  // assert sufficient token0 balance
  let [token0Balance, token0Proof] = account.value.balances.get(
    pair.value.token0Id
  );
  token0Balance.isSome.assertEquals(true);
  token0Balance.value.lt(data.amountToken0).assertEquals(false);

  // assert sufficient token balance
  let [token1Balance, token1Proof] = account.value.balances.get(
    pair.value.token1Id
  );
  token1Balance.isSome.assertEquals(true);
  token1Balance.value.lt(data.amountToken1).assertEquals(false);

  // fetch lp token balance
  let [lpTokenBalance, lpTokenBalanceProof] = account.value.balances.get(
    pair.value.lpTokenId
  );

  // compute liqudity
  const initialLiquidity = sqrt(data.amountToken0.mul(data.amountToken1)); // TODO do we need to add some liqudity to burn address
  const additionalLiqudity = min(
    data.amountToken0.mul(pair.value.lpTotalAmount).div(pair.value.reserve0),
    data.amountToken1.mul(pair.value.lpTotalAmount).div(pair.value.reserve1)
  );
  const liquidity = Circuit.if(
    pair.value.lpTotalAmount.equals(UInt64.zero),
    initialLiquidity,
    additionalLiqudity
  );

  // update pair and account
  pair.value.reserve0 = pair.value.reserve0.add(data.amountToken0);
  pair.value.reserve1 = pair.value.reserve1.add(data.amountToken1);
  pair.value.lpTotalAmount = pair.value.lpTotalAmount.add(liquidity);
  pairs.set(pairProof, pair.value);
  account.value.balances.set(
    lpTokenBalanceProof,
    Circuit.if(
      lpTokenBalance.isSome,
      lpTokenBalance.value.add(liquidity),
      liquidity
    )
  );
  account.value.balances.set(
    token0Proof,
    token0Balance.value.sub(data.amountToken0)
  );
  account.value.balances.set(
    token1Proof,
    token1Balance.value.sub(data.amountToken1)
  );
  accounts.set(accountProof, account.value);

  return new RollupProof(
    new StateTransition(originState, new State(accounts, pairs))
  );
};

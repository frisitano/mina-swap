import { Circuit, Signature, Poseidon } from 'snarkyjs';
import { Mint } from '../models/liquidity';
import { State } from '../models/state';
import { sqrt } from '../lib/math';

export const mint = (sig: Signature, data: Mint, state: State): State => {
  // dump state
  let accounts = state.accounts;
  let pairs = state.pairs;

  // verify sig
  sig.verify(data.sender, data.toFields()).assertEquals(true);

  // fetch pair
  let pair = pairs.get(data.pairId.toString());
  pair.isSome.assertEquals(true);

  // fetch account
  const accountHash = Poseidon.hash(data.sender.toFields()).toString();
  let account = accounts.get(accountHash);
  account.isSome.assertEquals(true);

  // assert sufficient token0 balance
  let token0Balance = account.value.balances.get(
    pair.value.token0Id.toString()
  );
  token0Balance.isSome.assertEquals(true);
  token0Balance.value.lt(data.amountToken0).assertEquals(false);

  // assert sufficient token1 balance
  let token1Balance = account.value.balances.get(
    pair.value.token1Id.toString()
  );
  token1Balance.isSome.assertEquals(true);
  token1Balance.value.lt(data.amountToken1).assertEquals(false);

  // fetch account lpToken balance
  let lpTokenBalance = account.value.balances.get(
    pair.value.lpTokenId.toString()
  );

  // compute liqudity
  const initialLiquidity = sqrt(data.amountToken0.mul(data.amountToken1)); // TODO do we need to add some liqudity to burn address
  // const reserve0 = Circuit.if(pair.value.reserve0.equals(UInt64.zero), new UInt64(new Field("1")), pair.value.reserve0);
  // const reserve1 = Circuit.if(pair.value.reserve1.equals(UInt64.zero), new UInt64(new Field("1")), pair.value.reserve1);
  // const token0Amount = data.amountToken0.mul(pair.value.lpTotalAmount).div(reserve0);
  // const token1Amount = data.amountToken1.mul(pair.value.lpTotalAmount).div(reserve1);
  // const additionalLiqudity = min(token0Amount, token1Amount);
  // const liquidity = Circuit.if(
  //   pair.value.lpTotalAmount.equals(UInt64.zero),
  //   initialLiquidity,
  //   additionalLiqudity
  // );
  const liquidity = initialLiquidity;

  // update pair
  pair.value.reserve0 = pair.value.reserve0.add(data.amountToken0);
  pair.value.reserve1 = pair.value.reserve1.add(data.amountToken1);
  pair.value.lpTotalAmount = pair.value.lpTotalAmount.add(liquidity);
  pairs.set(data.pairId.toString(), pair.value);

  // update account
  account.value.balances.set(
    pair.value.lpTokenId.toString(),
    Circuit.if(
      lpTokenBalance.isSome,
      lpTokenBalance.value.add(liquidity),
      liquidity
    )
  );
  account.value.balances.set(
    pair.value.token0Id.toString(),
    token0Balance.value.sub(data.amountToken0)
  );
  account.value.balances.set(
    pair.value.token1Id.toString(),
    token1Balance.value.sub(data.amountToken1)
  );
  accounts.set(accountHash, account.value);

  return new State(accounts, pairs);
};

import { Signature } from 'snarkyjs';
import { Pairs } from '../models/pair';
import { AddLiquidity } from '../models/liquidity';
import { Accounts } from '../models/account';

const addLiquidity = (
  sig: Signature,
  data: AddLiquidity,
  pairs: Pairs,
  accounts: Accounts
) => {
  // verify sig
  sig.verify(data.sender, data.toFields()).assertEquals(true);

  // fetch pair
  let [pair, pairProof] = pairs.get(data.pairId);
  pair.isSome.assertEquals(true);

  // fetch account
  let [account, accountProof] = accounts.get(data.sender);
  account.isSome.assertEquals(true);

  // fetch lp token balance
  let [lpTokenBalance, lpTokenBalanceProof] = account.value.balances.get(
    pair.value.lpTokenId
  );
};

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

  // fetch lp token balance
  let [lpTokenBalance, lpTokenBalanceProof] = account.value.balances.get(
    pair.value.lpTokenId
  );

  return new RollupProof(
    new StateTransition(originState, new State(accounts, pairs))
  );
};

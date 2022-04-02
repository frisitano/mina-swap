import { UInt64, UInt32, PrivateKey, Poseidon } from 'snarkyjs';
import { KeyedMerkleStore } from './models/keyed_data_store';
import { Account } from './models/account';
import { State } from './models/state';
import { Pair } from './models/pair';

export const getGenesis = (): State => {
  // Create core data structures
  const accounts = new KeyedMerkleStore<string, Account>(Account.zero);
  const balances = new KeyedMerkleStore<string, UInt64>(UInt64.zero);
  const pairs = new KeyedMerkleStore<string, Pair>(Pair.zero);

  // Specify account details
  const json = {
    s: '18710778922576709649533144894202208408329193787102160558713073596186390059280',
  };
  const privateKey = PrivateKey.fromJSON(json)!;
  // const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  const accountHash = Poseidon.hash(publicKey.toFields()).toString();

  // constants
  const token0Id = UInt32.fromNumber(0);
  const token1Id = UInt32.fromNumber(1);
  const pairId = UInt32.fromNumber(3);
  const lpTokenId = pairId;

  // Set balances and create account
  balances.set(token0Id.toString(), UInt64.fromNumber(10000));
  balances.set(token1Id.toString(), UInt64.fromNumber(10000));
  const testAccount = new Account(publicKey, UInt32.zero, balances);
  accounts.set(accountHash, testAccount);

  // Create test pair
  const testPair = new Pair(
    pairId,
    token0Id,
    token1Id,
    UInt64.zero,
    UInt64.zero,
    lpTokenId,
    UInt64.zero
  );
  pairs.set(pairId.toString(), testPair);
  const state = new State(accounts, pairs);
  return state;
};

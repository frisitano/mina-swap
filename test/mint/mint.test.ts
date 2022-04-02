import {
  Poseidon,
  isReady,
  PrivateKey,
  shutdown,
  UInt32,
  UInt64,
} from 'snarkyjs';
import { Mint } from '../../src/models/liquidity';
import { KeyedMerkleStore } from '../../src/models/keyed_data_store';
import { Account } from '../../src/models/account';
import { Pair } from '../../src/models/pair';
import { State } from '../../src/models/state';

describe('mint implementation', () => {
  describe('foo()', () => {
    // beforeAll(async () => {

    // });
    // afterAll(async () => {

    // });
    it('should be correct', async () => {
      await isReady;
      // instantiate composite strucutres
      const accounts = new KeyedMerkleStore<string, Account>(Account.zero);
      // const balances = new KeyedMerkleStore<string, UInt64>(UInt64.zero);
      // const pairs = new KeyedMerkleStore<string, Pair>(Pair.zero);

      // // instantiate test account
      let theMap = new Map<string, number>();
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const accountHash = Poseidon.hash(publicKey.toFields()).toString();
      const token0Id = UInt32.fromNumber(1);
      const token1Id = UInt32.fromNumber(2);
      // balances.set(token0Id.toString(), UInt64.fromNumber(10000));
      // balances.set(token1Id.toString(), UInt64.fromNumber(10000));
      // const testAccount = new Account(publicKey, UInt32.zero, balances);

      // // update accounts with test account
      // accounts.set(accountHash, testAccount);

      // // create test pair and update pairs
      // const pairId = UInt32.fromNumber(1);
      // const testPair = new Pair(
      //   pairId,
      //   token0Id,
      //   token1Id,
      //   UInt64.zero,
      //   UInt64.zero,
      //   UInt32.fromNumber(3),
      //   UInt64.zero
      // );
      // pairs.set('1', testPair);

      // // test state
      // const state = new State(accounts, pairs);

      // const amountToken1 = UInt64.fromNumber(5000);
      // const amountToken2 = UInt64.fromNumber(5000);
      // const mint = new Mint(publicKey, pairId, amountToken1, amountToken2);
      expect(UInt32.zero).toEqual(UInt32.zero);
      await shutdown();
    });
  });
});

import {
  isReady,
  shutdown,
  UInt64,
  UInt32,
  PublicKey,
  PrivateKey,
  Signature,
  Field,
  array,
  Poseidon,
} from 'snarkyjs';
import { KeyedMerkleStore } from './models/keyed_data_store';
import { Account } from './models/account';
import { State } from './models/state';
import { Pair } from './models/pair';
import { mint } from './branches/mint';
import { Mint } from './models/liquidity';

const main = async () => {
  await isReady;

  let accounts = new KeyedMerkleStore<string, Account>(Account.zero);

  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  const accountHash = Poseidon.hash(publicKey.toFields()).toString();
  const balances = new KeyedMerkleStore<string, UInt64>(UInt64.zero);
  balances.set('1', UInt64.fromNumber(10000));
  balances.set('2', UInt64.fromNumber(10000));
  const testAccount = new Account(publicKey, UInt32.zero, balances);

  accounts.set(accountHash, testAccount);

  let pairs = new KeyedMerkleStore<string, Pair>(Pair.zero);
  const testPair = new Pair(
    UInt32.fromNumber(1),
    UInt32.fromNumber(1),
    UInt32.fromNumber(2),
    UInt64.zero,
    UInt64.zero,
    UInt32.fromNumber(3),
    UInt64.zero
  );
  pairs.set('1', testPair);
  const state = new State(accounts, pairs);

  const mintPayload = new Mint(
    publicKey,
    UInt32.fromNumber(1),
    UInt64.fromNumber(5000),
    UInt64.fromNumber(5000)
  );
  const sig = Signature.create(privateKey, mintPayload.toFields());

  const result = mint(sig, mintPayload, state);

  const finalAccounts = result.accounts;
  const finalAccount = finalAccounts.get(accountHash);
  const finalBalance = finalAccount.value.balances.get('1');

  console.log(`final balance: ${finalBalance.value.toString()}`);

  console.log(result);
};
// const main = async () => {
//     await isReady;
//     const json = { s: '18710778922576709649533144894202208408329193787102160558713073596186390059280'};
//     const privateKey = PrivateKey.fromJSON(json);
//     console.log(privateKey);
//     console.log(privateKey?.toFields().length);
//     // const test = PublicKey.ofFields();
//     console.log(privateKey?.toPublicKey());
//     const arrayTest = ;
//     console.log(arrayTest);
// }

Promise.resolve()
  .then(async () => await main())
  .catch((err) => console.log(err));

shutdown();

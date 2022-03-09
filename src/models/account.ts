import { PublicKey, CircuitValue, UInt32, UInt64, prop, Field } from 'snarkyjs';
import { KeyedMerkleStore } from './keyed_data_store';

const balancesDepth: number = 10; // 1024 balance capacity per account
type Balances = KeyedMerkleStore<string, UInt64>;

export class Account extends CircuitValue {
  @prop publicKey: PublicKey;
  @prop nonce: UInt32;
  @prop balances: Balances;

  constructor(publicKey: PublicKey, nonce: UInt32, balances: Balances) {
    super();
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.balances = balances;
  }

  static get zero(): Account {
    return new Account(
      PublicKey.ofFields(Array(255).fill(Field.zero)),
      UInt32.zero,
      new KeyedMerkleStore<string, UInt64>(UInt64.zero)
    );
  }
}

const accountsDepth: number = 24; // 16777216 account capacity
export type Accounts = KeyedMerkleStore<PublicKey, Account>;

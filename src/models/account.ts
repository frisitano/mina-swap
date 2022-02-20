import {
  KeyedAccumulatorFactory,
  PublicKey,
  CircuitValue,
  UInt32,
  UInt64,
  prop,
} from 'snarkyjs';

const balancesDepth: number = 10; // 1024 balance capacity per account
const balances = KeyedAccumulatorFactory<UInt32, UInt64>(balancesDepth);
type Balances = InstanceType<typeof balances>;

class Account extends CircuitValue {
  @prop publicKey: PublicKey;
  @prop nonce: UInt32;
  @prop balances: Balances;

  constructor(publicKey: PublicKey, nonce: UInt32, balances: Balances) {
    super();
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.balances = balances;
  }
}

const accountsDepth: number = 24; // 16777216 account capacity
const accounts = KeyedAccumulatorFactory<PublicKey, Account>(accountsDepth);
export type Accounts = InstanceType<typeof accounts>;

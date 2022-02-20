import {
  KeyedAccumulatorFactory,
  PublicKey,
  CircuitValue,
  UInt32,
  UInt64,
  prop,
} from 'snarkyjs';

const balancesDepth: number = 32;
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

const accountsDepth: number = 32;
const accounts = KeyedAccumulatorFactory<PublicKey, Account>(accountsDepth);
export type Accounts = InstanceType<typeof accounts>;

import { CircuitValue, prop, PublicKey, UInt32, UInt64 } from 'snarkyjs';

export class Mint extends CircuitValue {
  @prop sender: PublicKey;
  @prop pairId: UInt32;
  @prop amountToken0: UInt64;
  @prop amountToken1: UInt64;

  constructor(
    sender: PublicKey,
    pairId: UInt32,
    amountToken0: UInt64,
    amountToken1: UInt64
  ) {
    super();
    this.sender = sender;
    this.pairId = pairId;
    this.amountToken0 = amountToken0;
    this.amountToken1 = amountToken1;
  }
}

export class Burn extends CircuitValue {
  @prop sender: PublicKey;
  @prop pairId: UInt32;
  @prop amountToken0Min: UInt64;
  @prop amountToken1Min: UInt64;
  @prop amountLpToken: UInt64;

  constructor(
    sender: PublicKey,
    pairId: UInt32,
    amountToken0Min: UInt64,
    amountToken1Min: UInt64,
    amountLpToken: UInt64
  ) {
    super();
    this.sender = sender;
    this.pairId = pairId;
    this.amountToken0Min = amountToken0Min;
    this.amountToken1Min = amountToken1Min;
    this.amountLpToken = amountLpToken;
  }
}

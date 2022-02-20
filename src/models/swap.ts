import { prop, PublicKey, CircuitValue, UInt64, UInt32 } from 'snarkyjs';

export class Swap extends CircuitValue {
  @prop sender: PublicKey;
  @prop nonce: UInt32;
  @prop pairId: UInt32;
  @prop token0Id: UInt32;
  @prop token1Id: UInt32;
  @prop amount: UInt64;
  @prop amountOutMin: UInt64;

  constructor(
    sender: PublicKey,
    nonce: UInt32,
    pairId: UInt32,
    token0Id: UInt32,
    token1Id: UInt32,
    amount: UInt64,
    amountOutMin: UInt64
  ) {
    super();
    this.amount = amount;
    this.amountOutMin = amountOutMin;
    this.sender = sender;
    this.nonce = nonce;
    this.pairId = pairId;
    this.token0Id = token0Id;
    this.token1Id = token1Id;
  }
}

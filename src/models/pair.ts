import {
  prop,
  CircuitValue,
  UInt64,
  UInt32,
  KeyedAccumulatorFactory,
} from 'snarkyjs';

class Pair extends CircuitValue {
  @prop pairId: UInt32;
  @prop token0Id: UInt32;
  @prop token1Id: UInt32;
  @prop reserve0: UInt64;
  @prop reserve1: UInt64;
  @prop lpTokenId: UInt32;
  @prop lpTotalAmount: UInt64;

  constructor(
    pairId: UInt32,
    token0Id: UInt32,
    token1Id: UInt32,
    reserve0: UInt64,
    reserve1: UInt64,
    lpTokenId: UInt32,
    lpTotalAmount: UInt64
  ) {
    super();
    this.pairId = pairId;
    this.token0Id = token0Id;
    this.token1Id = token1Id;
    this.reserve0 = reserve0;
    this.reserve1 = reserve1;
    this.lpTokenId = lpTokenId;
    this.lpTotalAmount = lpTotalAmount;
  }
}

const pairsDepth: number = 16; // 65536 pair capacity
const pairs = KeyedAccumulatorFactory<UInt32, Pair>(pairsDepth);
export type Pairs = InstanceType<typeof pairs>;

class CreatePair extends CircuitValue {
  @prop token0Id: UInt32;
  @prop tokne1Id: UInt32;

  constructor(token0Id: UInt32, token1Id: UInt32) {
    super();
    this.token0Id = token0Id;
    this.tokne1Id = token1Id;
  }
}

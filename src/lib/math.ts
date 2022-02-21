import { Circuit, UInt64, isReady, shutdown } from 'snarkyjs';

export const min = (x: UInt64, y: UInt64): UInt64 => {
  return Circuit.if(x.lt(y), x, y);
};

export const sqrt = (y: UInt64): UInt64 => {
  // TODO: Should also account for case x === 0!
  return Circuit.if(
    y.lte(UInt64.fromNumber(3)),
    UInt64.fromNumber(1),
    doSqrt(y)
  );
};

const SQRT_ITERATIONS = 36; // UInt64.MAXINT() converges after 36 iterations

// babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
const doSqrt = (y: UInt64): UInt64 => {
  let x = y.div(2).add(1);
  for (let i = 0; i < SQRT_ITERATIONS; i++) {
    x = x.add(y.div(x)).div(UInt64.fromNumber(2));
  }
  return x;
};

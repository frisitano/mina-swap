import { Field, isReady, PrivateKey, shutdown, UInt32, UInt64 } from 'snarkyjs';
import { Mint } from '../../src/models/liquidity';

describe('mint implementation', () => {
  describe('foo()', () => {
    const privateKey = PrivateKey.random();
    const publicKey = privateKey.toPublicKey();
    const pairId = UInt32.fromNumber(1);
    beforeAll(async () => {
      await isReady;
    });
    afterAll(async () => {
      await shutdown();
    });
    it('should be correct', async () => {
      const amountToken1 = UInt64.fromNumber(5000);
      const amountToken2 = UInt64.fromNumber(5000);
      const mint = new Mint(publicKey, pairId, amountToken1, amountToken2);
    });
  });
});

import { isReady, shutdown, Field, UInt64 } from 'snarkyjs';
import { sqrt, min } from '../../src/lib/math';

describe('math lib', () => {
  describe('test cases', () => {
    beforeAll(async () => {
      await isReady;
    });
    afterAll(async () => {
      await shutdown();
    });
    it.each`
      inputValue         | expectedResult
      ${'700'}           | ${'26'}
      ${'5000'}          | ${'70'}
      ${'9000000000'}    | ${'94868'}
      ${'2000000000000'} | ${'1414213'}
    `(
      "The sqrt of '$inputValue' should be '$expectedResult'",
      async ({ inputValue, expectedResult }) => {
        expect(sqrt(new UInt64(new Field(inputValue)))).toEqual(
          new UInt64(new Field(expectedResult))
        );
      }
    );
    // ${'2'}      | ${'16'}     | ${'2'}
    it.each`
      inputValue1 | inputValue2 | expectedResult
      ${'700'}    | ${'26'}     | ${'26'}
      ${'20'}     | ${'4'}      | ${'4'}
    `(
      "The min of '$inputValue1' and $inputValue2 should be '$expectedResult'",
      async ({ inputValue1, inputValue2, expectedResult }) => {
        expect(
          min(
            new UInt64(new Field(inputValue1)),
            new UInt64(new Field(inputValue2))
          )
        ).toEqual(new UInt64(new Field(expectedResult)));
      }
    );
  });
});

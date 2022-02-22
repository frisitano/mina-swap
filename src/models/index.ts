import { KeyedAccumulatorFactory } from './merkle_proof';
import { Keyed } from './data_store';
import { UInt64, UInt32, Field, isReady, shutdown } from 'snarkyjs';

Promise.resolve().then(async () => {
  await isReady;
  // const data = KeyedAccumulatorFactory<UInt64, UInt32>(20).create((v: UInt32) => new UInt64(Field(v.toString())), Keyed.InMemory(UInt32, UInt64,(v: UInt32) => new UInt64(Field(v.toString())),32));
  // const [value, membership ] = data.get(UInt64.zero);
  // console.log(value.isSome.toString());
  // console.log(value.value.toString());
  // console.log(membership);
  // data.set(membership, UInt32.fromNumber(10));
  // // const [ newValue ] = data.get(UInt64.zero);
  const dataStore = Keyed.InMemory<UInt32, UInt64>(
    UInt32,
    UInt64,
    (v: UInt32) => new UInt64(Field(v.toString())),
    32
  );
  dataStore.setValue(UInt32.fromNumber(1), UInt64.fromNumber(5));
  console.log(dataStore.getValue(UInt32.fromNumber(1)));
  shutdown();
});

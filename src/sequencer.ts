import {
  isReady,
  shutdown,
  UInt32,
  PrivateKey,
  Poseidon,
  PublicKey,
  Field,
  UInt64,
  Signature,
} from 'snarkyjs';
import express, {
  Express,
  Response,
  Request,
  NextFunction,
  response,
} from 'express';
import { getGenesis } from './utils';
import { State } from './models/state';
import { Mint } from './models/liquidity';
import { mint } from './branches/mint';
import { swap } from './branches/swap';
import { Swap } from './models/swap';

const testPrivateKey = {
  s: '18710778922576709649533144894202208408329193787102160558713073596186390059280',
};
const testPublicKey = {
  g: {
    x: '18951473509293345537706798555233905552435801399059344108964509420770365419861',
    y: '24386449108643384504232497550899024016084967755111855853151450526402863349465',
  },
};

const createApp = async (): Promise<Express> => {
  await isReady;

  // create app with genesis state
  const app = express();
  app.use(express.json());
  const genesis = getGenesis();
  app.set('state', genesis);

  // const swapPayload = new Swap(
  //   PublicKey.fromJSON(testPublicKey)!,
  //   new UInt32(new Field('0')),
  //   new UInt32(new Field('3')),
  //   new UInt32(new Field('0')),
  //   new UInt32(new Field('1')),
  //   new UInt64(new Field('2000')),
  //   new UInt64(new Field('0'))
  // );
  // const sig = Signature.create(
  //   PrivateKey.fromJSON(testPrivateKey)!,
  //   swapPayload.toFields()
  // );
  // console.log(sig.toJSON());

  //   const swapPayload = new Swap(
  //     PublicKey.fromJSON(testPublicKey)!,
  //     new UInt32(new Field(pairId)),
  //     new UInt32(new Field(token0Id)),
  //     new UInt32(new Field(token1Id)),
  //     new UInt64(new Field(amount)),
  //     new UInt64(new Field(amountOutMin))
  //   );
  //   const sig = Signature.fromJSON(signature)!;

  // {
  //     "publicKey": {
  //         "g": {
  //             "x": "18951473509293345537706798555233905552435801399059344108964509420770365419861",
  //             "y": "24386449108643384504232497550899024016084967755111855853151450526402863349465"
  //         }
  //     },
  //     "tokens": [
  //         "0",
  //         "1",
  //         "2",
  //         "3"
  //     ]
  // }
  app.post(
    '/balance',
    async (req: Request, res: Response, next: NextFunction) => {
      // parse request
      const serializedPublicKey = req.body.publicKey;
      const tokens: string[] = req.body.tokens;

      // compute account hash
      const publicKey = PublicKey.fromJSON(serializedPublicKey)!;
      const accountHash = Poseidon.hash(publicKey.toFields()).toString();

      // get account
      const state: State = app.get('state');
      const accounts = state.accounts;
      const account = accounts.get(accountHash);

      // compute result
      const output = tokens.reduce(
        (acc, token) => ({
          ...acc,
          [token]: account.value.balances.get(token),
        }),
        {}
      );

      res.send(output);
    }
  );

  app.post('/pair', async (req: Request, res: Response, next: NextFunction) => {
    // parse request
    const pairId = req.body.pairId;

    // compute result
    const state = app.get('state');
    const pair = state.pairs.get(pairId);
    res.send(pair);
  });

  // {
  //     "publicKey": {
  //         "g": {
  //             "x": "18951473509293345537706798555233905552435801399059344108964509420770365419861",
  //             "y": "24386449108643384504232497550899024016084967755111855853151450526402863349465"
  //         }
  //     },
  //     "token": "1",
  //     "amount": "10000"
  // }
  app.post(
    '/faucet',
    async (req: Request, res: Response, next: NextFunction) => {
      // parse request
      const serializedPublicKey = req.body.publicKey;
      const token = req.body.token;
      const amount = req.body.amount;

      // compute account hash
      const publicKey = PublicKey.fromJSON(serializedPublicKey)!;
      const accountHash = Poseidon.hash(publicKey.toFields()).toString();

      // get account
      const state: State = app.get('state');
      const account = state.accounts.get(accountHash);

      // mint amount to token balance
      const balance = account.value.balances.get(token).value;
      account.value.balances.set(
        token,
        balance.add(new UInt64(new Field(amount)))
      );

      // update account
      state.accounts.set(accountHash, account.value);

      res.send();
    }
  );

  // {
  //     "publicKey": {
  //         "g": {
  //             "x": "18951473509293345537706798555233905552435801399059344108964509420770365419861",
  //             "y": "24386449108643384504232497550899024016084967755111855853151450526402863349465"
  //         }
  //     },
  //     "pairId": "3",
  //     "amountToken0": "2000",
  //     "amountToken1": "2000",
  //     "sig": {
  //         "r": "21206810469439089813842027116381444280303355541157972929521476191054888505416",
  //         "s": "25116126732745098027492142371935272116806829567705922644900992793590458672731"
  //     }
  // }
  app.post('/mint', async (req: Request, res: Response, next: NextFunction) => {
    // parse request
    const serializedPublicKey = req.body.publicKey;
    const amountToken0 = req.body.amountToken0;
    const amountToken1 = req.body.amountToken1;
    const pairId = req.body.pairId;
    const signature = req.body.sig;

    // process mint
    const state: State = app.get('state');
    const mintPayload = new Mint(
      PublicKey.fromJSON(serializedPublicKey)!,
      new UInt32(new Field(pairId)),
      new UInt64(new Field(amountToken0)),
      new UInt64(new Field(amountToken1))
    );
    const sig = Signature.fromJSON(signature)!;
    const result = mint(sig, mintPayload, state);

    // update state
    app.set('state', result);

    res.send();
  });

  //   {
  //     "publicKey": {
  //         "g": {
  //             "x": "18951473509293345537706798555233905552435801399059344108964509420770365419861",
  //             "y": "24386449108643384504232497550899024016084967755111855853151450526402863349465"
  //         }
  //     },
  //     "pairId": "3",
  //     "token0Id": "0",
  //     "token1Id": "1",
  //     "amount": "2000",
  //     "amountOutMin": "0",
  //     "nonce": "0",
  //     "sig": {
  //         "r": "13749025292700959129533600955540788107574930542314941114877807605669421236090",
  //         "s": "3060907858972062067740537894666909667695612220173400441934984159394097675516"
  //     }
  // }
  app.post('/swap', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse request
      const serializedPublicKey = req.body.publicKey;
      const amount = req.body.amount;
      const amountOutMin = req.body.amountOutMin;
      const token0Id = req.body.token0Id;
      const token1Id = req.body.token1Id;
      const pairId = req.body.pairId;
      const nonce = req.body.nonce;
      const signature = req.body.sig;

      // process swap
      const state: State = app.get('state');
      const swapPayload = new Swap(
        PublicKey.fromJSON(serializedPublicKey)!,
        new UInt32(new Field(nonce)),
        new UInt32(new Field(pairId)),
        new UInt32(new Field(token0Id)),
        new UInt32(new Field(token1Id)),
        new UInt64(new Field(amount)),
        new UInt64(new Field(amountOutMin))
      );
      const sig = Signature.fromJSON(signature)!;
      const result = swap(sig, swapPayload, state);

      app.set('state', result);

      res.send();
    } catch (e) {
      next(e);
    }
  });

  return app;
};

Promise.resolve()
  .then(async () => {
    const app = await createApp();
    app.listen(8000, async () => {
      console.log('Reef explorer API is running on port 8000.');
    });
  })
  .catch((e) => console.error(e));

shutdown();

import {
  isReady,
  shutdown,
  UInt32,
  Poseidon,
  PublicKey,
  Field,
  UInt64,
  Signature,
} from 'snarkyjs';
import express, { Express, Response, Request, NextFunction } from 'express';
import { getGenesis } from './utils';
import { State } from './models/state';
import { Burn, Mint } from './models/liquidity';
import { mint } from './branches/mint';
import { swap } from './branches/swap';
import { Swap } from './models/swap';
import { burn } from './branches/burn';

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
      const publicKey = PublicKey.fromJSON(req.body.publicKey)!;
      const tokens: string[] = req.body.tokens;

      // compute account hash
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
      const publicKey = PublicKey.fromJSON(req.body.publicKey)!;
      const token = req.body.token;
      const amount = new UInt64(new Field(req.body.amount));

      // compute account hash
      const accountHash = Poseidon.hash(publicKey.toFields()).toString();

      // get account
      const state: State = app.get('state');
      const account = state.accounts.get(accountHash);

      // mint amount to token balance
      const balance = account.value.balances.get(token).value;
      account.value.balances.set(token, balance.add(amount));

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
    const publicKey = PublicKey.fromJSON(req.body.publicKey)!;
    const amountToken0 = new UInt64(new Field(req.body.amountToken0));
    const amountToken1 = new UInt64(new Field(req.body.amountToken1));
    const pairId = new UInt32(new Field(req.body.pairId));
    const sig = Signature.fromJSON(req.body.sig)!;

    // process mint
    const state: State = app.get('state');
    const mintPayload = new Mint(publicKey, pairId, amountToken0, amountToken1);
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
      const publicKey = PublicKey.fromJSON(req.body.publicKey)!;
      const amount = new UInt64(new Field(req.body.amount));
      const amountOutMin = new UInt64(new Field(req.body.amountOutMin));
      const token0Id = new UInt32(new Field(req.body.token0Id));
      const token1Id = new UInt32(new Field(req.body.token1Id));
      const pairId = new UInt32(new Field(req.body.pairId));
      const nonce = new UInt32(new Field(req.body.nonce));
      const sig = Signature.fromJSON(req.body.sig)!;

      // process swap
      const state: State = app.get('state');
      const swapPayload = new Swap(
        publicKey,
        nonce,
        pairId,
        token0Id,
        token1Id,
        amount,
        amountOutMin
      );
      const result = swap(sig, swapPayload, state);

      app.set('state', result);

      res.send();
    } catch (e) {
      next(e);
    }
  });

  //   {
  //     "publicKey": {
  //         "g": {
  //             "x": "18951473509293345537706798555233905552435801399059344108964509420770365419861",
  //             "y": "24386449108643384504232497550899024016084967755111855853151450526402863349465"
  //         }
  //     },
  //     "pairId": "3",
  //     "amountLpToken": "1000",
  //     "sig": {
  //         "r": "11155592306234973032526206224576738611222214421136713999849998293816313874346",
  //         "s": "3687187662026145344208465193528270345703089201860534423683933390783143271015"
  //     }
  // }
  app.post('/burn', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse request
      const serializedPublicKey = req.body.publicKey;
      const pairId = req.body.pairId;
      const amountLpToken = req.body.amountLpToken;
      const signature = req.body.sig;

      // process burn
      const state: State = app.get('state');
      const burnPayload = new Burn(
        PublicKey.fromJSON(serializedPublicKey)!,
        new UInt32(new Field(pairId)),
        new UInt64(new Field(amountLpToken))
      );
      const sig = Signature.fromJSON(signature)!;
      const result = burn(sig, burnPayload, state);

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
      console.log('Sequencer API is running on port 8000.');
    });
  })
  .catch((e) => console.error(e));

shutdown();

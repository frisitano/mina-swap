import {
  Signature,
  ProofWithInput,
  proofSystem,
  branch,
  shutdown,
  PrivateKey,
} from 'snarkyjs';
import { Accounts } from './models/account';
import { Pairs } from './models/pair';
import { StateTransition } from './models/state';
import { Swap } from './models/swap';
import { swap } from './branches/swap';
import { Mint, Burn } from './models/liquidity';
import { mint } from './branches/mint';
import { burn } from './branches/burn';

export const feeTo = PrivateKey.random().toPublicKey(); // mock for now

@proofSystem
export class DEX extends ProofWithInput<StateTransition> {
  @branch static swap(
    sig: Signature,
    data: Swap,
    accounts: Accounts,
    pairs: Pairs
  ): DEX {
    return swap(sig, data, accounts, pairs);
  }

  @branch static mint(
    sig: Signature,
    data: Mint,
    accounts: Accounts,
    pairs: Pairs
  ): DEX {
    return mint(sig, data, accounts, pairs);
  }

  @branch static burn(
    sig: Signature,
    data: Burn,
    accounts: Accounts,
    pairs: Pairs
  ): DEX {
    return burn(sig, data, accounts, pairs);
  }
}

shutdown();

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
import { Mint } from './models/liquidity';
import { mint } from './branches/mint';

export const feeTo = PrivateKey.random().toPublicKey();

@proofSystem
export class RollupProof extends ProofWithInput<StateTransition> {
  @branch static swap(
    sig: Signature,
    data: Swap,
    accounts: Accounts,
    pairs: Pairs
  ): RollupProof {
    return swap(sig, data, accounts, pairs);
  }

  @branch static mint(
    sig: Signature,
    data: Mint,
    accounts: Accounts,
    pairs: Pairs
  ): RollupProof {
    return mint(sig, data, pairs, accounts);
  }
}

shutdown();

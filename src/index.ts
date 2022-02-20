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
}

shutdown();

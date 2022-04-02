import {
  Signature,
  ProofWithInput,
  proofSystem,
  branch,
  shutdown,
  PrivateKey,
} from 'snarkyjs';
import { StateTransition } from './models/state';
import { Swap } from './models/swap';
import { swap } from './branches/swap';
import { Mint, Burn } from './models/liquidity';
import { mint } from './branches/mint';
import { burn } from './branches/burn';
import { State } from './models/state';

//TODO CANT MOCK THIS ANYMORE!!
// export const feeTo = PrivateKey.fromJSON().toPublicKey(); // mock for now

@proofSystem
export class RollupProof extends ProofWithInput<StateTransition> {
  @branch static swap(sig: Signature, data: Swap, state: State): RollupProof {
    return new RollupProof(new StateTransition(state, swap(sig, data, state)));
  }

  @branch static mint(sig: Signature, data: Mint, state: State): RollupProof {
    return new RollupProof(new StateTransition(state, mint(sig, data, state)));
  }

  @branch static burn(sig: Signature, data: Burn, state: State): RollupProof {
    return new RollupProof(new StateTransition(state, burn(sig, data, state)));
  }

  @branch static merge(proof1: RollupProof, proof2: RollupProof): RollupProof {
    proof1.publicInput.target.assertEquals(proof2.publicInput.source);
    return new RollupProof(
      new StateTransition(proof1.publicInput.source, proof2.publicInput.target)
    );
  }
}

shutdown();

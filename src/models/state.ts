import { prop, CircuitValue } from 'snarkyjs';
import { Accounts } from './account';
import { Pairs } from './pair';

export class State extends CircuitValue {
  @prop accounts: Accounts;
  @prop pairs: Pairs;

  constructor(accounts: Accounts, pairs: Pairs) {
    super();
    this.accounts = accounts;
    this.pairs = pairs;
  }
}

export class StateTransition extends CircuitValue {
  @prop source: State;
  @prop target: State;
  constructor(source: State, target: State) {
    super();
    this.source = source;
    this.target = target;
  }
}

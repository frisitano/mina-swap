# Mina Snapp

Mina swap is a ZK rollup based constant product AMM decentralised exchange.
Mina swap provides a non-custodial, scalable platform for trustlessly
exchanging tokens.

Mina swap is a L2 scaling solution that utilises a ZK rollup architecture.
In this architecture funds are held and maintained in an on-chain smart contract.
Computation of transactions and state transitions happens off-chain. This is achieved
by combining transactions into a block for which a ZK rollup proof is generated to
attest to the integrity of the applied state transitions. The state deltas and
associated ZK rollup proof is then posted to the on-chain smart contract.
Due to the achitecture of this solution the system achieves the following properties:

- non-custodial and therefore rollup operators can not steal funds
- scalable as transactions are processed off-chain
- based on validity proofs and therefore a quick withdrawal time
- escape hatch provided to withdraw funds from on-chain contract if operator stops cooperating

## Architecture

![image](architecture.png)

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)

# Mina Snapp

Mina swap is a ZK rollup based constant product AMM decentralised exchange.
Mina swap provides a non-custodial, scalable platform for trustlessly
exchanging tokens.

Mina swap is a L2 scaling solution that utilises a ZK rollup architecture.
In this architecture funds are held and maintained in an on-chain smart contract.
Computation of transactions and state transitions happens off-chain. This is achieved
by combining transactions into a block for which a ZK rollup proof is generated to
attest to the integrity of the applied state transitions. The state deltas and
associated ZK rollup proof are then posted to the on-chain smart contract.
Due to the achitecture of this solution the system achieves the following properties:

- non-custodial and therefore rollup operators can not steal funds
- scalable as transactions are processed off-chain
- based on validity proofs and therefore a quick withdrawal time
- escape hatch provided to withdraw funds from on-chain contract if operator stops cooperating

## Architecture

![image](architecture.png)

## DEX Design Specification

### Data Model

Mina swap has core data structres that constitutes its state, these are:

- Account merkle tree
- Pair merkle tree

#### Account Merkle Tree

The account merkle tree is used to store balances associated with a user account.
The account merkle tree has a depth of 24 providing capacity for 16777216 accounts.
The balances merkle tree has a depth of 10 providing capacity for 1024 token balances
per user acccount. The table below illustrates the account model.

| Name      | Type                             |
| --------- | -------------------------------- |
| publicKey | PublicKey                        |
| nonce     | UInt32                           |
| balances  | KeyedMerkleTree<TokenId, UInt64> |

#### Pair Merkle Tree

The pair merkle tree is used to store information associated with swap pairs.
The pair merkle tree has a depth of 16 providing capacity for 65536 pairs.
The table below illustrates the pair model.

| Name          | Type   |
| ------------- | ------ |
| pairId        | UInt32 |
| token0Id      | UInt32 |
| token1Id      | UInt32 |
| reserve0      | UInt64 |
| reserve1      | UInt64 |
| lpTokenId     | UInt32 |
| lpTotalAmount | UInt64 |

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

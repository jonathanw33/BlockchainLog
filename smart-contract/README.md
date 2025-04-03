# Smart Contract

Ethereum smart contract for storing Merkle roots on the blockchain.

## Features

- Store Merkle roots of log batches
- Retrieve Merkle roots by batch ID
- Basic access control for write operations
- Gas-efficient storage pattern

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your deployment configuration:
   ```
   INFURA_KEY=your_infura_key
   PRIVATE_KEY=your_ethereum_private_key
   ```

3. Configure Truffle in `truffle-config.js` to use the Sepolia testnet.

## Deployment

Compile the contract:
```
npm run compile
```

Deploy to Sepolia testnet:
```
npm run migrate
```

Take note of the deployed contract address. You'll need it to configure the Aggregation Service.

## Contract Interface

### Store Merkle Root
```solidity
function storeMerkleRoot(bytes32 _merkleRoot) external onlyOwner returns (uint256)
```
Stores a new Merkle root and returns the assigned batch ID.

### Get Merkle Root
```solidity
function getMerkleRoot(uint256 _batchId) external view returns (bytes32, uint256)
```
Retrieves a stored Merkle root and its timestamp by batch ID.

### Get Latest Batch ID
```solidity
function getLatestBatchId() external view returns (uint256)
```
Returns the latest batch ID (helpful for verification tools).

## Integration

- Configure the Aggregation Service with the deployed contract address.
- Ensure the private key used by the Aggregation Service has permission to call the `storeMerkleRoot` function.

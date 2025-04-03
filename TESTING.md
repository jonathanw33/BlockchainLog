# Testing Guide for Blockchain-Based Log Integrity System

This guide explains how to test the system components individually and how to run an end-to-end test of the entire workflow.

## Prerequisites

Before running the tests, make sure you have:

1. Node.js installed (v14 or higher recommended)
2. Run `npm install` in each component directory to install dependencies

## Individual Component Testing

### 1. Log Generator

The Log Generator simulates log creation for testing purposes.

```bash
cd log-generator
npm install
node test.js
```

This will generate 10 sample logs in the `../logs` directory. You can check the logs to verify they were created correctly.

For more control, you can use the CLI directly:
```bash
# Generate a specific number of logs
node src/index.js generate --count 20

# Start continuous log generation
node src/index.js start --rate 30

# Stop continuous log generation
node src/index.js stop
```

### 2. Log Shipper

The Log Shipper detects new logs and forwards them to the Aggregation Service.

```bash
cd log-shipper
npm install
node test.js
```

This will attempt to read logs created by the Log Generator and parse them. Note that this test doesn't actually send logs to the Aggregation Service (which may not be running yet).

### 3. Aggregation Service

The Aggregation Service processes logs, creates Merkle trees, and stores roots on the blockchain.

```bash
cd aggregation-service
npm install
node test.js
```

This will:
1. Store sample logs in temporary storage
2. Process those logs into a batch
3. Create a Merkle tree and calculate proofs
4. Simulate storing the Merkle root on the blockchain
5. Archive the batch with all metadata
6. Verify a log from the batch

### 4. Verification Tool

The Verification Tool checks if a log entry has been tampered with.

```bash
cd verification-tool
npm install
node test.js
```

This will:
1. Create a sample log file
2. Search for a batch containing that log
3. Provide instructions for verifying the log

After running the Aggregation Service test, you can verify a log using:
```bash
node src/index.js verify --file "sample_log.json"
```

## End-to-End Testing

For a complete test of the entire system, run the master test script from the root directory:

```bash
node test-flow.js
```

This script will:
1. Generate sample logs using the Log Generator
2. Process those logs with the Aggregation Service
3. Verify a log using the Verification Tool

The test runs in `TEST_MODE`, which simulates blockchain interactions without requiring an actual connection to Ethereum.

## Testing Tamper Detection

To verify that the system can detect tampering:

1. Run the end-to-end test to create logs and process them
2. Locate a processed batch in `log-archive/archive/batch_X/`
3. Modify a log entry in the `logs.json` file (e.g., change a message)
4. Run the verification tool on the modified log:
   ```bash
   cd verification-tool
   node src/index.js verify --file "sample_log.json"
   ```
5. The verification should fail, indicating the log has been tampered with

## Real Blockchain Integration Testing

To test with a real Ethereum testnet (Sepolia):

1. Deploy the smart contract to Sepolia:
   ```bash
   cd smart-contract
   npm install
   # Create .env file with INFURA_KEY and PRIVATE_KEY
   npm run migrate
   ```

2. Update the configuration files with your contract address:
   - `aggregation-service/config/default.json`
   - `verification-tool/config/default.json`

3. Set `TEST_MODE=false` in your environment and run the tests again

## Testing the Web UI

The Web UI component is not included in the automated tests, but after running the other tests, you can start it:

```bash
cd web-ui
npm install
npm start
```

This will start a development server that you can access in your browser at `http://localhost:3000`.

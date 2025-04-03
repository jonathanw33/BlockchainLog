# Installation and Testing Instructions

Follow these steps to install and test the Blockchain-Based Log Integrity System.

## Prerequisites

- Node.js (v14 or higher)
- npm (usually comes with Node.js)

## Installation

You need to install the dependencies for each component:

```bash
# Navigate to the project directory
cd G:\Documents\AA ITB\BlockchainLog

# Install dependencies for Log Generator
cd log-generator
npm install

# Install dependencies for Log Shipper
cd ..\log-shipper
npm install

# Install dependencies for Aggregation Service
cd ..\aggregation-service
npm install

# Install dependencies for Verification Tool
cd ..\verification-tool
npm install

# Return to the root directory
cd ..
```

## Running the Tests

### Option 1: Manual Testing (Component by Component)

1. **Generate logs**:
   ```bash
   cd log-generator
   node src/index.js generate --count 10
   cd ..
   ```

2. **Process logs with the Aggregation Service**:
   ```bash
   cd aggregation-service
   node test.js
   cd ..
   ```

3. **Verify logs**:
   ```bash
   cd verification-tool
   node test.js
   # Follow the instructions output by the test
   cd ..
   ```

### Option 2: Automated End-to-End Test

Run the entire workflow with a single command:
```bash
node test-flow.js
```

This will:
1. Generate sample logs
2. Process them with the Aggregation Service
3. Test the verification process

## What to Expect

When the tests run successfully:

1. The Log Generator will create JSON log files in the `logs` directory
2. The Aggregation Service will:
   - Process logs from the temporary storage
   - Create Merkle trees for verification
   - Simulate blockchain storage (in test mode)
   - Archive processed logs with proofs

3. The Verification Tool will:
   - Find a batch containing a specific log
   - Verify the log against the Merkle proof
   - Confirm that the log has not been tampered with

## Testing Tamper Detection

After running the tests:

1. Find a log file in `log-archive/archive/batch_X/logs.json`
2. Modify some content in the file (change a message, for example)
3. Run the verification tool again
   ```bash
   cd verification-tool
   node src/index.js verify --file "sample_log.json"
   ```
4. The verification should fail, showing that the system can detect tampering

## Troubleshooting

- **Module not found errors**: Make sure you've run `npm install` in each component directory
- **No logs found**: Ensure the Log Generator has created logs before running the Aggregation Service
- **Verification fails**: Check that the Aggregation Service has processed logs and created batches

## Next Steps

Once the system is working in test mode, you can:

1. Deploy the smart contract to Ethereum Sepolia testnet
2. Update configuration files with your contract address and Infura key
3. Set `TEST_MODE=false` in your environment to use real blockchain integration

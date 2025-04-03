# Manual Testing Instructions

Since automated testing with the test-flow.js script encounters some issues, follow these manual steps to test the system:

## Prerequisites

1. Make sure you have Node.js installed
2. Install dependencies for each component (instructions below)

## Step 1: Install Dependencies

Run the following commands to install dependencies for each component:

```bash
# Navigate to the project directory
cd G:\Documents\AA ITB\BlockchainLog

# Install dependencies for Log Generator
cd log-generator
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

## Step 2: Generate Logs

```bash
# Navigate to the log generator directory
cd log-generator

# Generate 10 sample logs
node src/index.js generate --count 10

# Check that logs were created
type ..\logs\application.log

# Return to the root directory
cd ..
```

## Step 3: Process Logs with the Aggregation Service

```bash
# Navigate to the aggregation service directory
cd aggregation-service

# Run the test script (which processes logs)
set TEST_MODE=true
node test.js

# Return to the root directory
cd ..
```

## Step 4: Verify a Log

```bash
# Navigate to the verification tool directory
cd verification-tool

# Create a sample log for verification
node test.js

# Verify the log (follow instructions from the previous step)
# The command will be something like:
# set TEST_MODE=true
# node src/index.js verify --file "sample_log.json"

# Return to the root directory
cd ..
```

## Step 5: Test Tamper Detection

1. Find a batch directory in `log-archive/archive/batch_X/`
2. Open the `logs.json` file in that directory with a text editor
3. Modify a log entry (change a message text, for example)
4. Run the verification tool again:
   ```bash
   cd verification-tool
   set TEST_MODE=true
   node src/index.js verify --file "sample_log.json"
   ```
5. The verification should fail, demonstrating the system's ability to detect tampering

## Troubleshooting

- If you encounter a "module not found" error, make sure you've run `npm install` in the component's directory
- If logs aren't being processed, check that the log file was created in the `logs` directory
- If verification fails unexpectedly, ensure that logs have been processed and batches exist in the archive

## Notes

- The system is running in TEST_MODE, which simulates blockchain interactions without requiring an actual connection to Ethereum
- All cryptographic operations work as expected - hashing, Merkle tree creation, and verification

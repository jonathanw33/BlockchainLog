# Blockchain-Based Log Integrity System

A system that ensures log integrity by creating Merkle trees from log batches and storing their roots on a blockchain. This creates tamper-evident logging where any modification to historical logs can be detected through cryptographic verification.

## Project Structure

- **log-generator**: Test component that simulates log creation
- **log-shipper**: Collects logs from sources and forwards them to the aggregation service
- **aggregation-service**: Core backend service for log processing and blockchain interaction
- **smart-contract**: Ethereum smart contract for storing Merkle roots
- **verification-tool**: Tool for verifying the integrity of specific log entries
- **web-ui**: Visual interface for system monitoring and demonstration
- **log-archive**: Storage for logs and verification metadata
- **docs**: Project documentation

## Component Interaction

1. **Log Flow**:
   - `log-generator` creates sample logs (in a production environment, these would be real application logs)
   - `log-shipper` monitors log files, collects new entries, and sends them to the aggregation service
   - `aggregation-service` receives logs through its API and temporarily stores them

2. **Processing Flow**:
   - `aggregation-service` batches logs at fixed intervals
   - For each batch, it creates a Merkle tree and calculates the root hash
   - The Merkle root is submitted to the `smart-contract` on the Ethereum testnet
   - Processed logs and their Merkle proofs are stored in the `log-archive`

3. **Verification Flow**:
   - `verification-tool` allows auditors to verify specific log entries
   - It retrieves the log entry and Merkle proof from the archive
   - It checks the blockchain for the corresponding Merkle root
   - It verifies the log entry against the root using the proof

4. **User Interface**:
   - `web-ui` provides a dashboard for monitoring the system
   - It allows users to search logs and verify their integrity
   - It visualizes the verification process for demonstration purposes

## Getting Started

Instructions for setting up and running each component can be found in their respective directories.

## Batch Processing Behavior

The aggregation service processes logs into batches at regular intervals (default: 5 minutes) as defined in the configuration. This means:

1. Logs sent to the system are first stored in temporary storage
2. Every 5 minutes, the batch processing job runs and:
   - Collects all unprocessed logs
   - Creates a Merkle tree from these logs
   - Stores the Merkle root on the blockchain
   - Archives the logs and their proofs

**Important**: There is an intentional delay between sending logs and their appearance as batches. This is normal behavior and helps to:
- Efficiently process logs in reasonable-sized groups
- Reduce blockchain transaction costs
- Provide a predictable processing schedule

## Utility Scripts

The project includes several utility scripts to help with testing and debugging:

- **send-logs.js**: A simple script to generate and send random logs directly to the API
  ```
  node send-logs.js [count]
  ```

- **fix-logs.js**: An enhanced version of send-logs.js that uses axios to send logs to the deployed backend
  ```
  node fix-logs.js [count]
  ```

- **force-batch-process.js**: Attempts to trigger immediate batch processing instead of waiting for the scheduled interval
  ```
  node force-batch-process.js
  ```

- **create-batch.js**: Creates a large number of logs to force batch creation and can also create local test data
  ```
  node create-batch.js
  ```
  
  To check if batches exist:
  ```
  node create-batch.js check
  ```

## Troubleshooting

If logs are not appearing as batches:

1. **Wait at least 5 minutes** - The batch processing job runs at 5-minute intervals
2. **Ensure the log-shipper is running** if you're using the log-generator component
3. **Check network connectivity** to the backend service
4. **Use the utility scripts** to send logs directly and force batch processing

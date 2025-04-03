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

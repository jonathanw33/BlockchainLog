# Log Archive

Storage for logs and verification metadata.

## Structure

The Log Archive is organized as follows:

### Temporary Storage (`temp/`)
Stores incoming logs before they are processed into batches. Files are organized by timestamp:
```
temp/
  2025-03-30/
    2025-03-30T22-00-00Z_2025-03-30T22-05-00Z.json
    2025-03-30T22-05-00Z_2025-03-30T22-10-00Z.json
    ...
```

### Archive Storage (`archive/`)
Stores processed logs with their verification metadata. Files are organized by batch ID:
```
archive/
  batch_1/
    metadata.json
    logs.json
    proofs.json
  batch_2/
    metadata.json
    logs.json
    proofs.json
  ...
```

## File Formats

### metadata.json
```json
{
  "batchId": 1,
  "timestamp": "2025-03-30T22:10:00Z",
  "merkleRoot": "0x1234...",
  "transactionHash": "0xabcd...",
  "blockNumber": 12345,
  "logCount": 42,
  "timeRange": {
    "start": "2025-03-30T22:05:00Z",
    "end": "2025-03-30T22:10:00Z"
  }
}
```

### logs.json
```json
[
  {
    "id": "log_1",
    "timestamp": "2025-03-30T22:06:15Z",
    "level": "INFO",
    "message": "User 'alice' logged in successfully",
    "source": "auth-service"
  },
  ...
]
```

### proofs.json
```json
{
  "log_1": {
    "index": 0,
    "hash": "0x5678...",
    "proof": ["0xdef0...", "0x9abc..."]
  },
  ...
}
```

## Usage

The Log Archive is primarily managed by the Aggregation Service, which:
- Stores incoming logs in the temporary storage
- Processes logs into batches
- Creates Merkle trees and proofs
- Archives processed logs with their verification metadata

The Verification Tool and Web UI access the archive to retrieve logs and their proofs for verification.

## Maintenance

- Implement a retention policy based on your requirements
- Consider backing up the archive regularly
- Monitor disk space usage

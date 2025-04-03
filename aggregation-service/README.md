# Log Aggregation Service

Core backend service that processes logs and interacts with the blockchain.

## Features

- HTTP endpoint to receive logs securely (HTTPS)
- Batching logic to process logs at fixed intervals
- Merkle tree processing for cryptographic verification
- Blockchain integration to store Merkle roots
- Log archiving with verification metadata

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the service in `config/default.json`:
   ```json
   {
     "server": {
       "port": 3000
     },
     "auth": {
       "username": "admin",
       "password": "changeme"
     },
     "storage": {
       "tempPath": "../log-archive/temp",
       "archivePath": "../log-archive/archive"
     },
     "processing": {
       "batchIntervalMinutes": 5
     },
     "blockchain": {
       "provider": "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
       "contractAddress": "YOUR_CONTRACT_ADDRESS",
       "privateKey": "YOUR_PRIVATE_KEY"
     }
   }
   ```

3. Update the blockchain configuration with your Infura key, contract address, and private key.

## Usage

Start the aggregation service:
```
npm start
```

The service will:
- Listen for incoming logs on the configured port
- Process logs in batches at the specified interval
- Create Merkle trees and calculate roots for each batch
- Store Merkle roots on the blockchain
- Archive processed logs with their verification metadata

## API Endpoints

### Submit Logs
```
POST /api/logs
Headers: 
  - Authorization: Basic {credentials}
  - Content-Type: application/json
Body:
  {
    "timestamp": "2025-03-30T22:10:00Z",
    "level": "INFO",
    "message": "User 'alice' logged in successfully",
    "source": "auth-service"
  }
```

### Verify Log
```
POST /api/verify
Body:
  {
    "log": {
      "timestamp": "2025-03-30T22:10:00Z",
      "level": "INFO",
      "message": "User 'alice' logged in successfully",
      "source": "auth-service"
    }
  }
```

## Integration

- Configure Log Shippers to send logs to this service.
- Ensure the smart contract is deployed and its address is correctly configured.
- Set up the Web UI to connect to this service's API.

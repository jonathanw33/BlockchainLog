# Verification Tool

Command-line tool for verifying the integrity of specific log entries.

## Features

- Verify log entries against blockchain-stored Merkle roots
- Support for different input methods (file, JSON string)
- Clear verification result reporting

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the tool in `config/default.json`:
   ```json
   {
     "blockchain": {
       "provider": "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
       "contractAddress": "YOUR_CONTRACT_ADDRESS"
     },
     "archive": {
       "path": "../log-archive/archive"
     }
   }
   ```

## Usage

Verify a log entry by providing JSON directly:
```
node src/index.js verify --log '{"timestamp":"2025-03-30T22:10:00Z","level":"INFO","message":"User alice logged in successfully","source":"auth-service"}' --batch 42
```

Verify a log entry from a file:
```
node src/index.js verify --file path/to/log.json --batch 42
```

Verify the latest batch that contains a specific log:
```
node src/index.js verify --log '{"timestamp":"2025-03-30T22:10:00Z","level":"INFO","message":"User alice logged in successfully","source":"auth-service"}'
```

## Output

The tool will display:
- Log entry details
- Verification result (verified/not verified)
- Blockchain transaction details
- Merkle proof information

## Integration

- Ensure the tool is configured with the correct contract address.
- Make sure it has access to the log archive where proofs are stored.

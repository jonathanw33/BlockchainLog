# Log Generator

Test component that simulates log creation for testing the blockchain-based log integrity system.

## Features

- Generate sample logs with timestamps
- Support configurable log formats and generation rates
- Simple CLI to control log generation

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the generator in `config/default.json`:
   ```json
   {
     "output": {
       "directory": "../logs",
       "filename": "application.log"
     },
     "generation": {
       "rate": 10,  // logs per minute
       "format": "json"  // or "text"
     },
     "templates": [
       {"level": "INFO", "message": "User '{user}' logged in successfully", "source": "auth-service"},
       {"level": "ERROR", "message": "Failed to connect to database", "source": "db-service"},
       {"level": "WARN", "message": "High memory usage detected: {usage}%", "source": "monitor-service"}
     ]
   }
   ```

## Usage

Start generating logs:
```
node src/index.js start
```

Generate logs at a specific rate:
```
node src/index.js start --rate 20
```

Stop log generation:
```
node src/index.js stop
```

Generate a single batch of logs:
```
node src/index.js generate --count 100
```

## Integration

The Log Generator writes logs to files that are monitored by the Log Shipper component. Configure the Log Shipper to watch the output directory specified in your configuration.

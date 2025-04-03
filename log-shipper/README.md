# Log Shipper

Collects logs from sources and forwards them securely to the aggregation service.

## Features

- Lightweight process that runs on log source machines
- File-watching capability to detect new log entries
- Secure transmission of logs to the aggregation service
- Buffering capability for handling network interruptions

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the shipper in `config/default.json`:
   ```json
   {
     "sources": [
       {
         "path": "../logs/application.log",
         "type": "json"
       }
     ],
     "destination": {
       "url": "http://localhost:3000/api/logs",
       "auth": {
         "username": "admin",
         "password": "changeme"
       },
       "batchSize": 10,
       "retryInterval": 5000
     },
     "buffer": {
       "enabled": true,
       "path": "./buffer",
       "maxSize": 100
     }
   }
   ```

## Usage

Start the log shipper:
```
npm start
```

The Log Shipper will monitor the specified log files, detect new entries, and forward them to the Aggregation Service. If the service is unavailable, logs will be buffered locally and retry sending will be attempted at the configured interval.

## Integration

- Ensure that the Log Shipper is configured to watch the correct log files.
- Verify that the destination URL points to a running instance of the Aggregation Service.
- Make sure the authentication credentials match those configured in the Aggregation Service.

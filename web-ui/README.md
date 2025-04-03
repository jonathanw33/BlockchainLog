# Blockchain Log Integrity System - Web UI

This is the web user interface for the Blockchain-Based Log Integrity System. It provides a visual interface for system monitoring, log verification, and demonstration.

## Features

- Dashboard showing system status and recent batches
- Log search and browsing functionality
- Verification interface for auditors
- Visual explanation of the verification process

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Running instance of the Aggregation Service (backend)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the application by editing `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard

The dashboard provides an overview of the system status, including:
- Aggregation service status
- Number of batches processed
- Storage usage
- Blockchain status
- Recent logs

### Log Browser

The log browser allows you to:
- View all logs in the system
- Filter logs by level, source, message, or batch ID
- Paginate through large log sets

### Verification Tool

The verification tool allows you to:
- Enter log details in JSON format
- Specify a batch ID (optional)
- Verify log integrity against the blockchain
- View verification results

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Available Scripts:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the configuration (one-way operation)

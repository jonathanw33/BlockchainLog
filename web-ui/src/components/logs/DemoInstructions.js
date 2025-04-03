import React from 'react';
import { Paper, Typography, Box, Stepper, Step, StepLabel, StepContent } from '@mui/material';

const DemoInstructions = () => {
  const steps = [
    {
      label: 'Browse Logs',
      description: 'View logs from the system. Each log entry shows timestamp, level, source, message, and batch ID.'
    },
    {
      label: 'Verify Logs',
      description: 'Click the verify icon (shield) next to any log to check its integrity against the blockchain.'
    },
    {
      label: 'View Details',
      description: 'Click the view icon (eye) to see complete log details and verification information.'
    },
    {
      label: 'Try Tamper Simulation',
      description: 'Enable "Tamper Simulation Mode" to edit logs and see how verification detects tampering. You can edit just the message or the entire JSON in Advanced Mode.'
    },
    {
      label: 'Understand the Merkle Tree',
      description: 'In the details view, see the Merkle tree visualization showing how your log connects to the blockchain. The visualization highlights the verification path.'
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Enhanced Log Browser Tutorial
      </Typography>

      <Box sx={{ maxWidth: 600, mb: 2 }}>
        <Typography variant="body1" paragraph>
          This enhanced interface combines log browsing and verification in one intuitive interface.
          Learn how blockchain-based log integrity works with this interactive browser.
        </Typography>
      </Box>

      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={index} active={true}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default DemoInstructions;

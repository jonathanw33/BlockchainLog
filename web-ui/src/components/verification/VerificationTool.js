import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { api } from '../../services/api';
import MerkleVisualizer from '../merkle/MerkleVisualizer';

const VerificationTool = () => {
  const [logInput, setLogInput] = useState(JSON.stringify({
    timestamp: "2025-03-31T10:00:00Z",
    level: "INFO",
    message: "User alice logged in successfully",
    source: "auth-service"
  }, null, 2));
  
  const [batchId, setBatchId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      let log;
      try {
        log = JSON.parse(logInput);
      } catch (err) {
        throw new Error('Invalid JSON format for log data');
      }
      
      // Call verification API
      const result = await api.verifyLog(log, batchId ? parseInt(batchId) : null);
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify log. Please check your input and try again.');
      setVerificationResult(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Log Verification Tool
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enter Log Details
            </Typography>
            <TextField
              fullWidth
              label="Log Data (JSON)"
              multiline
              rows={10}
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Batch ID (Optional)"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              variant="outlined"
              margin="normal"
              type="number"
              helperText="Leave empty to automatically find the batch containing this log"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerify}
              disabled={verifying}
              sx={{ mt: 2 }}
              fullWidth
            >
              {verifying ? <CircularProgress size={24} /> : 'Verify Log'}
            </Button>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Verification Process
            </Typography>
            <Stepper orientation="vertical">
              <Step active={true}>
                <StepLabel>Log Hashing</StepLabel>
                <StepContent>
                  <Typography>
                    The log entry is normalized and hashed using keccak256 to create a unique fingerprint.
                  </Typography>
                </StepContent>
              </Step>
              <Step active={true}>
                <StepLabel>Batch Identification</StepLabel>
                <StepContent>
                  <Typography>
                    The system identifies which batch contains the log entry or uses the specified batch ID.
                  </Typography>
                </StepContent>
              </Step>
              <Step active={true}>
                <StepLabel>Merkle Proof Retrieval</StepLabel>
                <StepContent>
                  <Typography>
                    The Merkle proof for this log is retrieved from the batch data.
                  </Typography>
                </StepContent>
              </Step>
              <Step active={true}>
                <StepLabel>Blockchain Verification</StepLabel>
                <StepContent>
                  <Typography>
                    The Merkle root is retrieved from the blockchain and compared with the root 
                    reconstructed from the log hash and its proof.
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
        </Grid>
        
        {verificationResult && (
          <>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Verification Result: {' '}
                    <Box component="span" sx={{ 
                      color: verificationResult.verified ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {verificationResult.verified ? 'VALID ✅' : 'INVALID ❌'}
                    </Box>
                  </Typography>
                  
                  {!verificationResult.verified && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Verification Failed
                      </Typography>
                      <Typography variant="body2">
                        {verificationResult.diagnosticInfo && verificationResult.diagnosticInfo.discrepancies ? (
                          <>
                            The log data does not match the stored version. 
                            Differences found in: {verificationResult.diagnosticInfo.discrepancies.join(', ')}
                          </>
                        ) : (
                          <>
                            The log's cryptographic proof could not be verified against the blockchain record.
                            This may indicate data tampering or corruption.
                          </>
                        )}
                      </Typography>
                    </Alert>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Log Details
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Timestamp:</strong> {new Date(verificationResult.log.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Level:</strong> {verificationResult.log.level}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Source:</strong> {verificationResult.log.source}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Message:</strong> {verificationResult.log.message}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Verification Details
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Batch ID:</strong> {verificationResult.batchId}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Merkle Root:</strong> {verificationResult.merkleRoot}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Blockchain Timestamp:</strong> {
                          typeof verificationResult.blockchainTimestamp === 'number' 
                            ? new Date(verificationResult.blockchainTimestamp * 1000).toLocaleString()
                            : verificationResult.blockchainTimestamp
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <MerkleVisualizer logs={[verificationResult.log]} height={300} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default VerificationTool;

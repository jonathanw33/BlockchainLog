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
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme
} from '@mui/material';
import { 
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon,
  FindInPage as FindInPageIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import MerkleVisualizer from '../merkle/MerkleVisualizer';
import VerificationVisualizer from './VerificationVisualizer';

const VerificationTool = () => {
  const theme = useTheme();
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
  const [activeStep, setActiveStep] = useState(0);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      setActiveStep(1);
      
      let log;
      try {
        log = JSON.parse(logInput);
        setActiveStep(2);
      } catch (err) {
        throw new Error('Invalid JSON format for log data');
      }
      
      // Short pause for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call verification API - handle batch ID 0 properly
      const batchIdValue = batchId === '' ? null : parseInt(batchId);
      
      setActiveStep(3);
      const result = await api.verifyLog(log, batchIdValue);
      setVerificationResult(result);
      setActiveStep(4);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify log. Please check your input and try again.');
      setVerificationResult(null);
      setActiveStep(0);
    } finally {
      setVerifying(false);
    }
  };

  // Format the verification result details
  const formatVerificationResults = () => {
    if (!verificationResult) return null;
    
    const isVerified = verificationResult.verified;
    const resultColor = isVerified ? theme.palette.success.main : theme.palette.error.main;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined" sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: isVerified ? 'success.light' : 'error.light',
              color: 'white',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {isVerified ? (
              <CheckCircleIcon />
            ) : (
              <FindInPageIcon />
            )}
            <Typography variant="h6" component="h2">
              Verification Result: {isVerified ? 'VALID ✅' : 'INVALID ❌'}
            </Typography>
          </Box>
          
          <CardContent>
            {!isVerified && (
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
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Log Details
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Timestamp:</strong> {new Date(verificationResult.log.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Level:</strong> {verificationResult.log.level}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Source:</strong> {verificationResult.log.source}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Message:</strong> {verificationResult.log.message}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Verification Details
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Batch ID:</strong> {verificationResult.batchId}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all' }}>
                    <strong>Merkle Root:</strong> {verificationResult.merkleRoot}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Blockchain Timestamp:</strong> {
                      typeof verificationResult.blockchainTimestamp === 'number' 
                        ? new Date(verificationResult.blockchainTimestamp * 1000).toLocaleString()
                        : verificationResult.blockchainTimestamp
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #7b1fa2 0%, #9c27b0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Log Verification Tool
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Verify log integrity using Merkle proofs
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Enter Log Details
                </Typography>
                <Tooltip title="Enter a JSON log object to verify against the blockchain">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <TextField
                  fullWidth
                  label="Log Data (JSON)"
                  multiline
                  rows={12}
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: <CodeIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  sx={{ mb: 2, flexGrow: 1 }}
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
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleVerify}
                  disabled={verifying}
                  sx={{ mt: 2 }}
                  fullWidth
                  size="large"
                  startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                >
                  {verifying ? 'Verifying...' : 'Verify Log'}
                </Button>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <VerificationVisualizer 
            verificationResult={verificationResult} 
            verifying={verifying} 
          />
          
          <Card 
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ mt: 3 }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  How Blockchain Verification Works
                </Typography>
                <Tooltip title="The verification process ensures logs haven't been tampered with">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Stepper orientation="vertical" activeStep={activeStep}>
                <Step>
                  <StepLabel>Prepare Log Data</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Enter the log data you want to verify as a JSON object. Include fields like timestamp, level, message, and source.
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>Parse JSON</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      The system validates and parses the JSON format of your log entry.
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>Locate in Batch</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      The system locates which batch contains this log. You can specify a batch ID or let the system find it automatically.
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>Verify Integrity</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      The system recreates the Merkle path and verifies the log against the blockchain record.
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>View Results</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      See the verification results, including whether the log is valid and hasn't been tampered with.
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                When logs are generated, they are grouped into batches. Each batch creates a Merkle tree - 
                a cryptographic data structure that efficiently proves content integrity. The root hash of this Merkle tree is stored on the blockchain.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Verification Results */}
        {verificationResult && (
          <>
            <Grid item xs={12}>
              {formatVerificationResults()}
            </Grid>
            
            <Grid item xs={12}>
              <MerkleVisualizer logs={[verificationResult.log]} height={300} selectedLog={verificationResult.log} verificationResult={verificationResult} />
            </Grid>
          </>
        )}
      </Grid>
    </motion.div>
  );
};

export default VerificationTool;
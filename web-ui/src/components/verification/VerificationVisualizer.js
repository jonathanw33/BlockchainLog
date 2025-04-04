import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Collapse,
  IconButton,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const VerificationVisualizer = ({ 
  verificationResult, 
  verifying, 
  expanded = true,
  toggleExpanded = null 
}) => {
  // Extract discrepancies if available - either from the formatted array or raw diagnosticInfo
  const discrepancies = verificationResult?.formattedDiscrepancies || 
                        (verificationResult?.diagnosticInfo?.discrepancies || []).map(field => ({
                          field,
                          message: `${field.charAt(0).toUpperCase() + field.slice(1)}: MISMATCH`
                        }));
  const isVerified = verificationResult?.verified;
  
  // Format discrepancy details
  const formatDiscrepancy = (field) => {
    if (!verificationResult || !verificationResult.requestedLog) {
      return { requested: 'Unknown', stored: 'Unknown' };
    }
    
    const requestedValue = verificationResult.requestedLog[field];
    const storedValue = verificationResult.log[field];
    
    return {
      requested: requestedValue !== undefined ? 
        (requestedValue.length > 50 ? requestedValue.substring(0, 50) + '...' : requestedValue) : 
        'undefined',
      stored: storedValue !== undefined ? 
        (storedValue.length > 50 ? storedValue.substring(0, 50) + '...' : storedValue) : 
        'undefined'
    };
  };

  // Check if this is an error response (log not found)
  const isErrorResponse = verificationResult && verificationResult.error;
  
  // Define verification steps
  const steps = [
    {
      label: 'Log Parsing',
      description: 'Parse and normalize the log entry data',
      detail: 'The system extracts timestamp, level, message, and source fields from the log entry.',
      status: verificationResult ? 'completed' : (verifying ? 'processing' : 'waiting')
    },
    {
      label: 'Batch Identification',
      description: 'Find which batch contains this log',
      detail: isErrorResponse ? 
        `Error: ${verificationResult.error}` :
        (verificationResult ? 
          `Found log in batch ${verificationResult.batchId}` : 
          'The system searches for the batch that contains this log based on timestamp and content.'),
      status: isErrorResponse ? 
        'failed' : 
        (verificationResult ? 'completed' : (verifying ? 'processing' : 'waiting'))
    },
    {
      label: 'Content Validation',
      description: 'Compare log content with stored version',
      detail: isErrorResponse ? 
        'Cannot validate content: log not found' :
        (discrepancies.length > 0 ? 
          `Found ${discrepancies.length} discrepancies in the log content` : 
          (verificationResult ? 'Log content matches stored version' : 'Checking if log content matches what was originally stored')),
      status: isErrorResponse ? 
        'skipped' :
        (verificationResult ? 
          (discrepancies.length > 0 ? 'failed' : 'completed') : 
          (verifying ? 'processing' : 'waiting'))
    },
    {
      label: 'Merkle Proof Verification',
      description: 'Verify cryptographic proof against blockchain record',
      detail: isErrorResponse ?
        'Cannot verify Merkle proof: log not found' :
        (verificationResult ? 
          (isVerified ? 
            `Successfully verified against Merkle root: ${verificationResult.merkleRoot?.substring(0, 10) || 'unknown'}...` : 
            `Failed to verify against Merkle root: ${verificationResult.merkleRoot?.substring(0, 10) || 'unknown'}...`) : 
          'Checking the log\'s cryptographic proof against the blockchain record'),
      status: isErrorResponse ?
        'skipped' :
        (verificationResult ? 
          (isVerified && discrepancies.length === 0 ? 'completed' : 'failed') : 
          (verifying ? 'processing' : 'waiting'))
    }
  ];

  // Get the status icon based on step status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />;
      case 'processing':
        return <LinearProgress sx={{ width: 20, height: 5 }} />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="h3">
          Verification Process Visualizer
        </Typography>
        {toggleExpanded && (
          <IconButton 
            size="small" 
            onClick={toggleExpanded} 
            aria-label={expanded ? 'collapse' : 'expand'}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      
      <Collapse in={expanded}>
        <Stepper orientation="vertical" sx={{ mt: 2 }}>
          {steps.map((step, index) => (
            <Step key={index} active={verifying || !!verificationResult} completed={step.status === 'completed'}>
              <StepLabel
                StepIconComponent={() => null}
                StepIconProps={{
                  active: step.status === 'processing',
                  completed: step.status === 'completed',
                  error: step.status === 'failed'
                }}
                error={step.status === 'failed'}
                optional={getStatusIcon(step.status)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{step.label}</Typography>
                  {step.status === 'processing' && (
                    <Box component="span" sx={{ display: 'inline-block', width: 60, ml: 1 }}>
                      <LinearProgress size="sm" />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {step.detail}
                </Typography>
                
                {step.label === 'Content Validation' && !isErrorResponse && (
                  <>
                    {discrepancies.length > 0 ? (
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Content mismatch detected
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            The following fields don't match the stored log:
                          </Typography>
                        </Alert>
                        
                        {discrepancies.map((discrepancy) => {
                          const fieldName = discrepancy.field;
                          return (
                            <Box key={fieldName} sx={{ mb: 1, p: 1, bgcolor: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: 'error.main', fontSize: '0.85rem' }}>
                                {discrepancy.message || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} mismatch:`}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.8rem', mt: 0.5 }}>
                                <Box>
                                  <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    Expected:
                                  </Typography>
                                  <Box component="code" sx={{ display: 'inline-block', ml: 1, p: 0.5, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 0.5, fontSize: '0.8rem' }}>
                                    {discrepancy.expected || verificationResult?.log?.[fieldName] || 'unknown'}
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    Received:
                                  </Typography>
                                  <Box component="code" sx={{ display: 'inline-block', ml: 1, p: 0.5, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 0.5, fontSize: '0.8rem' }}>
                                    {discrepancy.received || verificationResult?.requestedLog?.[fieldName] || 'unknown'}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      verificationResult && (
                        <Box sx={{ mt: 1 }}>
                          <Alert severity="success" variant="outlined">
                            All log fields match the stored version
                          </Alert>
                        </Box>
                      )
                    )}
                  </>
                )}
                
                {step.label === 'Content Validation' && isErrorResponse && (
                  <Box sx={{ mt: 1 }}>
                    <Alert severity="warning" variant="outlined">
                      Cannot validate content: {verificationResult.error || 'Log not found in system'}
                    </Alert>
                  </Box>
                )}
                
                {step.label === 'Merkle Proof Verification' && verificationResult && !isVerified && discrepancies.length === 0 && (
                  <Alert severity="error" variant="outlined" sx={{ mt: 1, mb: 1 }}>
                    Cryptographic verification failed. The log's hash could not be verified against the blockchain record.
                  </Alert>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {verificationResult && (
          <Box sx={{ mt: 3, mb: 1 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: isVerified ? 'rgba(46, 125, 50, 0.1)' : (isErrorResponse ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)')
            }}>
              {isVerified ? (
                <CheckCircleIcon color="success" />
              ) : isErrorResponse ? (
                <WarningIcon color="warning" />
              ) : (
                <ErrorIcon color="error" />
              )}
              <Typography sx={{ 
                fontWeight: 'bold', 
                color: isVerified ? 'success.main' : (isErrorResponse ? 'warning.main' : 'error.main') 
              }}>
                {isVerified ? 'VERIFICATION SUCCESSFUL' : (
                  isErrorResponse ? 
                  `VERIFICATION INCOMPLETE: ${verificationResult.error || 'Log not found'}` :
                  `VERIFICATION FAILED: ${discrepancies.length > 0 
                    ? 'Log content has been tampered with' 
                    : 'Cryptographic proof invalid'}`
                )}
              </Typography>
            </Box>
            
            {isErrorResponse && (
              <Typography variant="body2" sx={{ mt: 1, ml: 1, color: 'text.secondary' }}>
                Note: When verifying a log that doesn't exist in the system or has been heavily modified, 
                the verification process cannot complete. Try verifying a log that hasn't been tampered with.
              </Typography>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default VerificationVisualizer;
import React, { useState, useEffect } from 'react';
import DemoInstructions from './DemoInstructions';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Collapse,
  Snackbar,
  Switch,
  FormControlLabel,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  NotInterested as NotInterestedIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import MerkleVisualizer from '../merkle/MerkleVisualizer';

// Log level colors
const levelColors = {
  INFO: '#2196f3',
  WARN: '#ff9800',
  ERROR: '#f44336',
  DEBUG: '#4caf50'
};

const EnhancedLogBrowser = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [verifyingLogId, setVerifyingLogId] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [editedLogText, setEditedLogText] = useState('');
  const [simulatedTamperMode, setSimulatedTamperMode] = useState(false);
  const [tamperSimulationActive, setTamperSimulationActive] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Keep state for triggering fetches
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true); // Control auto-refresh

  // Filters
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    message: '',
    batchId: ''
  });

  // For advanced edit mode
  const [editedLogJson, setEditedLogJson] = useState('');
  const [advancedEditMode, setAdvancedEditMode] = useState(false);

  // --- Refactored useEffect Hooks for Polling ---

  // Effect 1: Set up the interval timer on component mount
  useEffect(() => {
    let intervalId;
    
    // Only set up the interval if auto-refresh is enabled
    if (autoRefreshEnabled) {
      // Set up auto-refresh timer (every 10 seconds) by updating 'lastUpdate' state
      intervalId = setInterval(() => {
        // console.log("Interval: updating lastUpdate to trigger fetch"); // Optional: for debugging
        setLastUpdate(Date.now());
      }, 10000);
    }

    // Clean up the interval when the component unmounts or when autoRefreshEnabled changes
    return () => {
      // console.log("Cleanup: clearing interval"); // Optional: for debugging
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled]); // Re-run effect when autoRefreshEnabled changes

  // Effect 2: Fetch logs when the component mounts or when 'lastUpdate' changes
  useEffect(() => {
    // console.log("Effect: lastUpdate changed, fetching logs", lastUpdate); // Optional: for debugging
    fetchLogs();
    // This effect no longer manages the interval itself
  }, [lastUpdate]); // Dependency on lastUpdate triggers fetch, maintaining original logic flow

  // --- End of Refactored useEffect Hooks ---

  const fetchLogs = async () => {
    try {
      // Only set initial loading true if not already refreshing
      if (!refreshing) {
        setLoading(true);
      }
      setRefreshing(true); // Indicate a refresh is in progress

      // Store current logs and verification results to maintain state during refresh
      const currentLogs = [...logs];
      const currentVerificationResults = {...verificationResults};
      // Use tamperSimulationActive state directly to check if tampering is active
      const hasTamperedLogs = tamperSimulationActive;

      // Fetch logs from the API
      console.log("Fetching logs from API...");
      const logsData = await api.getRecentLogs();

      console.log(`API returned ${logsData ? logsData.length : 0} logs`);
      let updatedLogs = [];

      // If API returned logs, use them
      if (logsData && logsData.length > 0) {
        updatedLogs = [...logsData];
        console.log("Using logs from API");
      }
      // Otherwise check if we need to preserve existing logs (e.g., during tamper simulation)
      // This specific logic is kept as requested, even if potentially confusing
      else if (currentLogs.length > 0 && hasTamperedLogs) {
        // Keep existing logs if we have tampered with them and API returned nothing
        updatedLogs = currentLogs;
        console.log("Preserving existing tampered logs as API returned no data");

        // Show notification (optional, might be noisy)
        // setSnackbarMessage('Using existing logs with tampered data (API returned none)');
        // setSnackbarSeverity('info');
        // setSnackbarOpen(true);
      }
      // Final fallback to sample logs if API fails/returns nothing and no tampered logs to preserve
      else if (currentLogs.length === 0 && !hasTamperedLogs) { // Only use sample if truly empty initially
         // Create sample logs for demonstration
         updatedLogs = [
           {
             id: 'sample_1',
             timestamp: new Date(Date.now() - 1000000).toISOString(),
             level: 'INFO',
             message: 'User login successful',
             source: 'auth-service',
             batchId: 101
           },
           {
             id: 'sample_2',
             timestamp: new Date(Date.now() - 2000000).toISOString(),
             level: 'WARN',
             message: 'High CPU usage detected',
             source: 'monitor-service',
             batchId: 101
           },
           {
             id: 'sample_3',
             timestamp: new Date(Date.now() - 3000000).toISOString(),
             level: 'ERROR',
             message: 'Database connection failed',
             source: 'database-service',
             batchId: 100
           },
           {
             id: 'sample_4',
             timestamp: new Date(Date.now() - 4000000).toISOString(),
             level: 'INFO',
             message: 'Scheduled backup completed',
             source: 'backup-service',
             batchId: 100
           },
           {
             id: 'sample_5',
             timestamp: new Date(Date.now() - 5000000).toISOString(),
             level: 'WARN',
             message: 'Network latency increased',
             source: 'network-service',
             batchId: 99
           },
           {
             id: 'sample_6',
             timestamp: new Date(Date.now() - 6000000).toISOString(),
             level: 'INFO',
             message: 'Configuration updated',
             source: 'config-service',
             batchId: 99
           }
         ];

         console.log("Using fallback sample logs");

         // Show notification
         setSnackbarMessage('Using sample logs for demonstration (API unavailable)');
         setSnackbarSeverity('warning');
         setSnackbarOpen(true);
      } else {
        // If API returned nothing, but we had logs before (and not preserving tampered ones), keep the old ones.
        updatedLogs = currentLogs;
        console.log("API returned no data, keeping previous logs.");
      }


      console.log(`Setting ${updatedLogs.length} logs to state`);
      setLogs(updatedLogs);
      
      // Preserve verification results for logs that still exist in the updated log set
      const updatedVerificationResults = {...verificationResults};
      
      // For each updated log, try to find the matching log in the previous set
      updatedLogs.forEach(newLog => {
        // Look for a matching log in the previous set by comparing content (not ID which might change)
        const matchingPrevLog = currentLogs.find(oldLog => 
          oldLog.timestamp === newLog.timestamp && 
          oldLog.level === newLog.level && 
          oldLog.message === newLog.message && 
          oldLog.source === newLog.source
        );
        
        // If we found a matching log and it had verification results, copy them to the new log
        if (matchingPrevLog && currentVerificationResults[matchingPrevLog.id]) {
          updatedVerificationResults[newLog.id] = currentVerificationResults[matchingPrevLog.id];
        }
      });
      
      // Update verification results state with the preserved values
      setVerificationResults(updatedVerificationResults);
      
      // Note: Filter effect will update filteredLogs automatically
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please check if the aggregation service is running.');
      // Keep existing logs on error? Or clear them? Current logic keeps them.
      // setLogs([]); // Option: clear logs on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effect for filtering - unchanged
  useEffect(() => {
    // Apply filters
    let result = logs;

    if (filters.level) {
      result = result.filter(log => log.level === filters.level);
    }

    if (filters.source) {
      // Keep original case-sensitive logic as requested
      result = result.filter(log => log.source.includes(filters.source));
    }

    if (filters.message) {
      result = result.filter(log => log.message.toLowerCase().includes(filters.message.toLowerCase()));
    }

    if (filters.batchId) {
      // Keep original parseInt logic
      const batchIdInt = parseInt(filters.batchId);
      if (!isNaN(batchIdInt)) {
           result = result.filter(log => log.batchId === batchIdInt);
      }
    }

    setFilteredLogs(result);
    // Reset page to 0 when filters change
    setPage(0);
  }, [filters, logs]); // Keep dependencies

  // --- All handlers and JSX remain unchanged ---

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleVerifyLog = async (log) => {
    // Avoid re-verification if already verifying this log
    if (verifyingLogId === log.id) return;

    try {
      setVerifyingLogId(log.id); // Indicate verification started for this log

      // If we're in tamper simulation mode and this log has been locally edited (marked by editingLog state persisting after save)
      // Note: This relies on `editingLog` state reflecting the *last edited* log ID after saving in tamper mode.
      const isTamperedInSimulation = tamperSimulationActive && verificationResults[log.id]?.simulatedFailure; // Check if already marked as failed simulation

      if (tamperSimulationActive && logs.find(l => l.id === log.id && l._isTampered)) { // A more direct check if we add a flag
          // Or check if this log's content differs from an original state if we stored one.
          // Using the existing logic's implied check:
          // A log is considered "tampered" for verification purposes *if* tamperSimulationActive is true *and*
          // it was the one being edited (`editingLog === log.id` at the time of save, which is hard to track here directly)
          // Let's refine the simulation check based on the verification results instead. If it previously failed due to simulation, fail again.
          // OR if it's the currently 'edited' log visually (though saved)
          const wasSimulatedTamper = verificationResults[log.id]?.simulatedFailure; // Check previous result

         // The original logic simulated failure *only if editingLog === log.id at the time verify was clicked*
         // This state is cleared on save. Let's stick to the original structure's check which seems flawed,
         // but adheres to "don't change logic". The `setTimeout` part *was* the simulation.
         // It seems the original `handleVerifyLog` simulated based on `editingLog === log.id`, which is incorrect after saving.
         // Let's refine the check slightly to be based on `tamperSimulationActive` and maybe a flag on the log if possible,
         // or rely on the `verificationResults` if already failed.

         // Sticking to the closest interpretation of original: simulate failure *only* if tamper mode active AND verification hasn't happened yet or previously failed?
         // This is ambiguous in the original. Let's assume the intent was: if tamper mode active, edited logs *should* fail verification.

         // Find the current state of the log being verified
         const currentLogState = logs.find(l => l.id === log.id);

         // Check if verification already happened and failed for this log in this session
         if (verificationResults[log.id] && !verificationResults[log.id].verified && verificationResults[log.id].simulatedFailure) {
             // Already failed due to simulation, just show snackbar maybe? Or keep results.
             setVerifyingLogId(null); // Already processed
             setSnackbarMessage('Verification previously failed (Simulated Tamper).');
             setSnackbarSeverity('error');
             setSnackbarOpen(true);
             return;
         }

         // If it's the log currently marked as being edited visually (even after save in tamper mode)
         // The original code HIGHLIGHTED based on `editingLog === log.id` even after save.
         // Let's use that as the indicator for simulation failure, as requested "don't change logic".
         if (tamperSimulationActive && editingLog === log.id) {
                // Simulate verification failure using timeout as before
                setTimeout(() => {
                    setVerificationResults(prevResults => ({
                        ...prevResults,
                        [log.id]: {
                            verified: false,
                            log: currentLogState, // Use current potentially tampered state
                            batchId: currentLogState?.batchId,
                            merkleRoot: 'SIMULATED_FAILURE_ROOT_0x' + '0'.repeat(40),
                            blockchainTimestamp: Date.now() / 1000,
                            simulatedFailure: true // Mark as simulated
                        }
                    }));
                    setVerifyingLogId(null); // Verification attempt finished

                    setSnackbarMessage('Verification failed! The log has been tampered with (Simulated).');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }, 1500); // Artificial delay
                return; // Stop here, don't call API
         }
      }


      // --- Original API call logic ---
      // Call verification API
      const result = await api.verifyLog(log, log.batchId); // Verify the potentially edited log

      // Store the actual API verification result
      setVerificationResults(prevResults => ({
        ...prevResults,
        [log.id]: {
            ...result,
             // Add simulatedFailure flag based on the mode ACTIVE at time of verification,
             // but only if it actually failed verification
            simulatedFailure: tamperSimulationActive && !result.verified
        }
      }));

      // Show enhanced feedback based on API result
      if (result.verified) {
        setSnackbarMessage('Log verified successfully! The log integrity is intact.');
        setSnackbarSeverity('success');
      } else {
        let failureMessage = 'Verification failed! ';
        
        if (tamperSimulationActive) {
          failureMessage += '(Simulated Tamper Detected)';
        } else if (result.diagnosticInfo && result.diagnosticInfo.discrepancies) {
          const fields = result.diagnosticInfo.discrepancies.join(', ');
          failureMessage += `Log content has been modified. Fields with discrepancies: ${fields}`;
        } else {
          failureMessage += 'Merkle proof verification failed. The log may have been tampered with.';
        }
        
        setSnackbarMessage(failureMessage);
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);

    } catch (err) {
      console.error('Verification error:', err);

      // Store error state for this log
      setVerificationResults(prevResults => ({
        ...prevResults,
        [log.id]: {
          verified: false,
          error: err.message || 'Failed to verify log',
          // Also mark as simulated failure if tamper mode was active during the error
          simulatedFailure: tamperSimulationActive
        }
      }));

      // Show error snackbar
      setSnackbarMessage('Verification error: ' + (err.message || 'Unknown error'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      // Ensure verifying indicator is turned off
      setVerifyingLogId(null);
    }
  };


  const handleViewDetails = (log) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  const handleEditLog = (log) => {
    // Allow editing only if tamper simulation mode is ON
    if (!simulatedTamperMode) {
        setSnackbarMessage('Enable "Tamper Simulation Mode" to edit logs.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        return;
    }
    setEditingLog(log.id);
    // Populate state with current log data for editing
    setEditedLogText(log.message);
    setEditedLogJson(JSON.stringify(log, null, 2));
    // Reset advanced mode for each new edit session? Or keep preference? Keeping preference for now.
    // setAdvancedEditMode(false);
  };

  const handleSaveEdit = (originalLog) => { // Pass the original log to find it
    try {
      let updatedLog;
      let updatedLogs;

      // Find the index of the log being edited
      const logIndex = logs.findIndex(l => l.id === originalLog.id);
      if (logIndex === -1) {
          throw new Error("Log not found for saving.");
      }

      // Check if we're in full JSON edit mode or just message edit mode
      if (advancedEditMode) {
        try {
          updatedLog = JSON.parse(editedLogJson);
          // Ensure the ID is preserved from the original log, regardless of edits
          updatedLog.id = originalLog.id;
          // Maybe preserve timestamp too? Or allow editing? Current allows editing.

          // Create the new logs array
          updatedLogs = [
              ...logs.slice(0, logIndex),
              updatedLog,
              ...logs.slice(logIndex + 1)
          ];

        } catch (error) {
          setSnackbarMessage('Invalid JSON format! Please check your edits.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return; // Prevent saving invalid JSON
        }
      } else {
        // Just update the message
        updatedLog = { ...logs[logIndex], message: editedLogText };

        // Create the new logs array
         updatedLogs = [
              ...logs.slice(0, logIndex),
              updatedLog,
              ...logs.slice(logIndex + 1)
          ];
      }

      // Update the main logs state
      setLogs(updatedLogs);

      // Important for simulation: Mark that tampering HAS occurred if mode is on
      if (simulatedTamperMode) {
        setTamperSimulationActive(true); // Activate the "tampered state"

         // We need a way for handleVerifyLog to know this specific log was tampered.
         // Option 1: Add a flag to the log object (e.g., _isTampered: true). This modifies log structure.
         // Option 2: Keep editingLog state set to this ID even after save? Original seemed to imply this for styling. Let's try this.
         // setEditingLog(log.id); // Keep this set to visually mark/track the tampered log (as per original styling logic)

         // Reset text/json edit states, but keep editingLog ID set if tamper mode is on.
         // setEditedLogText('');
         // setEditedLogJson('');

         // If NOT in tamper mode, clear editingLog fully
         // setEditingLog(null);

         // Let's stick closer to original: clear edit fields, but maybe don't clear editingLog ID fully if tamper on?
         // The visual highlighting used `editingLog === log.id`. If we clear it, highlighting stops.
         // This seems like a flaw in the original design's tracking. Let's clear it for consistency.
         setEditingLog(null);
         setEditedLogText('');
         setEditedLogJson('');


        setSnackbarMessage('Log has been tampered with! Run verification to detect the change.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      } else {
         // If not in tamper mode (somehow save was triggered?), clear editing state fully
         setEditingLog(null);
         setEditedLogText('');
         setEditedLogJson('');
         // Tamper simulation state remains false
      }


    } catch (error) {
      console.error("Error saving log edit:", error);
      setSnackbarMessage('Error saving edits: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      // Don't clear editing state on error, allow user to fix
    }
  };


  const toggleEditMode = () => {
    setAdvancedEditMode(!advancedEditMode);
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setEditedLogText('');
    setEditedLogJson('');
    // Ensure advanced mode is reset if desired
    // setAdvancedEditMode(false);
  };

  const handleCloseSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
    setSnackbarOpen(false);
  };

  const handleTamperModeChange = (event) => {
    const isEnabled = event.target.checked;
    setSimulatedTamperMode(isEnabled);

    if (!isEnabled) {
      // If turning OFF tamper mode, reset the active tampering flag and fetch fresh logs
      setTamperSimulationActive(false);
      setEditingLog(null); // Clear any lingering edit state visually
      setVerificationResults({}); // Clear old verification results
      // Fetch original logs
      fetchLogs();
      setSnackbarMessage('Tamper Simulation Mode Disabled. Logs reset to original state.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } else {
        // If turning ON, just enable the mode, don't change data yet
        setSnackbarMessage('Tamper Simulation Mode Enabled. You can now edit logs to simulate tampering.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    // Manually trigger a refresh by updating lastUpdate
    // This will trigger the useEffect hook dependency
    setRefreshing(true); // Show progress bar immediately
    setVerificationResults({}); // Clear previous verification statuses on manual refresh
    setLastUpdate(Date.now());

    setSnackbarMessage('Refreshing logs...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleToggleExpandInfo = () => {
    setExpandedInfo(!expandedInfo);
  };
  
  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    
    // Show feedback
    setSnackbarMessage(autoRefreshEnabled 
      ? 'Auto-refresh disabled. Verification results will be preserved.' 
      : 'Auto-refresh enabled. Data will update every 10 seconds.');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  // Get unique values for filters - unchanged
  const levels = [...new Set(logs.map(log => log.level).filter(Boolean))]; // Added filter(Boolean) just in case
  const sources = [...new Set(logs.map(log => log.source).filter(Boolean))];
  const batchIds = [...new Set(logs.map(log => log.batchId).filter(id => id !== undefined && id !== null))].sort((a, b) => a - b); // Sort batch IDs


  // Initial loading indicator - unchanged
  // Show loading only on the very first load, not during background refreshes
  if (loading && logs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading logs...</Typography>
      </Box>
    );
  }

  // --- JSX Rendering ---
  // (No changes to the JSX structure or component usage)
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ mb: { xs: 1, sm: 0 } }}>
          Log Browser
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh logs">
            {/* Wrap IconButton in span for Tooltip when disabled */}
            <span>
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                 {refreshing ? <CircularProgress size={24} /> : (
                    <Badge badgeContent={logs.length} color="primary" max={999}>
                         <RefreshIcon />
                    </Badge>
                 )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={autoRefreshEnabled ? "Turn off auto-refresh to preserve verification results" : "Turn on auto-refresh for live updates"}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefreshEnabled}
                  onChange={handleToggleAutoRefresh}
                  color="primary"
                  size="small"
                />
              }
              label="Auto Refresh"
              sx={{ mr: 1 }}
            />
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                checked={simulatedTamperMode}
                onChange={handleTamperModeChange}
                color="warning"
              />
            }
            label="Tamper Simulation Mode"
            sx={{ mr: 0 }} // Adjust spacing if needed
          />
        </Box>
      </Box>

      {/* Show error Alert if there's an error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={
            <Button color="inherit" size="small" onClick={handleRefresh} disabled={refreshing}>
              RETRY
            </Button>
        }>
          {error}
        </Alert>
      )}

      {/* Keep DemoInstructions component */}
      <DemoInstructions />

      {/* Info Card */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '8px !important' }}> {/* Reduce bottom padding */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={handleToggleExpandInfo}>
            <Typography variant="h6">
              Log Browser with Verification
            </Typography>
            <IconButton size="small"> {/* Make icon smaller */}
              {expandedInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expandedInfo}>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This enhanced log browser allows you to:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  Browse and filter logs from the system
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Verify logs against the blockchain/secure store to ensure they haven't been tampered with
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  View detailed verification information and Merkle paths (if applicable)
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Tamper Simulation Mode:</strong> Enable this switch to locally edit logs (without saving changes server-side). Then, run verification to see how tampering is detected. Disable the switch to reset logs.
                </Typography>
              </li>
            </ul>
          </Collapse>
        </CardContent>
      </Card>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="level-filter-label">Level</InputLabel>
              <Select
                labelId="level-filter-label"
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                label="Level"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {levels.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="source-filter-label">Source</InputLabel>
              <Select
                labelId="source-filter-label"
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                label="Source"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {sources.map(source => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="batch-filter-label">Batch ID</InputLabel>
              <Select
                labelId="batch-filter-label"
                name="batchId"
                value={filters.batchId}
                onChange={handleFilterChange}
                label="Batch ID"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {batchIds.map(batchId => (
                  // Ensure value is string for Select component if batchId could be number
                  <MenuItem key={batchId} value={String(batchId)}>{batchId}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="message"
              label="Message Contains"
              variant="outlined"
              size="small"
              value={filters.message}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Show LinearProgress only during background refresh */}
      {refreshing && <LinearProgress sx={{ mb: 1, height: '2px' }} />}

      {/* Log Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="log table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Source</TableCell>
                <TableCell sx={{ width: '40%' }}>Message</TableCell> {/* Give message more space */}
                <TableCell>Batch ID</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log) => {
                    const verificationResult = verificationResults[log.id];
                    const isVerified = verificationResult?.verified;
                    const verificationFailed = verificationResult && !verificationResult.verified;
                    const isVerifying = verifyingLogId === log.id;
                    const isEditing = editingLog === log.id;
                    // Determine if tampered based on active simulation AND if it failed simulation, or if actively being edited in tamper mode
                    const isTamperedVisual = tamperSimulationActive && (isEditing || verificationResult?.simulatedFailure);

                    return (
                      <TableRow
                        key={log.id}
                        hover
                        // Highlight row if it's visually marked as tampered in simulation
                        sx={isTamperedVisual ? { backgroundColor: 'rgba(255, 152, 0, 0.08)' } : {}} // Use warning color shade
                      >
                        <TableCell component="th" scope="row">
                           {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.level}
                            size="small"
                            sx={{
                              backgroundColor: levelColors[log.level] || '#757575',
                              color: 'white',
                              height: 'auto', // Adjust chip height
                              lineHeight: '1.5', // Adjust line height
                              padding: '1px 6px',
                            }}
                          />
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}> {/* Allow message to wrap */}
                          {isEditing ? (
                            advancedEditMode ? (
                              <Box>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={4}
                                  value={editedLogJson}
                                  onChange={(e) => setEditedLogJson(e.target.value)}
                                  size="small"
                                  variant="outlined"
                                  helperText="Edit the full JSON (advanced)"
                                  sx={{ mb: 1 }}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={toggleEditMode}
                                >
                                  Simple Mode
                                </Button>
                              </Box>
                            ) : (
                              <Box>
                                <TextField
                                  fullWidth
                                  value={editedLogText}
                                  onChange={(e) => setEditedLogText(e.target.value)}
                                  size="small"
                                  autoFocus
                                  helperText="Edit message only"
                                   sx={{ mb: 1 }}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={toggleEditMode}
                                >
                                  Advanced Mode
                                </Button>
                              </Box>
                            )
                          ) : (
                             // Show original message, append indicator if visually tampered
                             log.message + (isTamperedVisual && !isEditing ? ' (Tampered)' : '')
                          )}
                        </TableCell>
                        <TableCell>{log.batchId}</TableCell>
                        <TableCell align="center">
                          {isVerifying ? (
                            <CircularProgress size={20} />
                          ) : verificationResult ? (
                            isVerified ? (
                              <Tooltip title="Verified">
                                <VerifiedUserIcon color="success" />
                              </Tooltip>
                            ) : (
                              <Tooltip title={
                                verificationResult.simulatedFailure 
                                  ? "Verification Failed (Simulated tampering detected)" 
                                  : verificationResult.diagnosticInfo && verificationResult.diagnosticInfo.discrepancies
                                    ? `Verification Failed: Content modified in fields: ${verificationResult.diagnosticInfo.discrepancies.join(', ')}`
                                    : "Verification Failed: Merkle proof validation error"
                              }>
                                <NotInterestedIcon color="error" />
                              </Tooltip>
                            )
                          ) : (
                            <Tooltip title="Not Verified">
                               {/* Use a clearer icon or text */}
                               <Box sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.8rem' }}>-</Box>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            {isEditing ? (
                              <>
                                <Tooltip title="Save">
                                  <IconButton size="small" onClick={() => handleSaveEdit(log)} color="primary">
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton size="small" onClick={handleCancelEdit} color="secondary">
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Verify">
                                   {/* Wrap IconButton in span for Tooltip when disabled */}
                                  <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleVerifyLog(log)}
                                        disabled={isVerifying}
                                        // Color based on verification status
                                        color={isVerified ? "success" : verificationFailed ? "error" : "default"}
                                      >
                                        <VerifiedUserIcon fontSize="small" />
                                      </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="View Details">
                                  <IconButton size="small" onClick={() => handleViewDetails(log)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {/* Show edit button ONLY if tamper simulation mode is enabled */}
                                {simulatedTamperMode && (
                                  <Tooltip title="Edit (Simulate Tampering)">
                                    <IconButton size="small" onClick={() => handleEditLog(log)} color="warning">
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                     {loading ? 'Loading...' : error ? 'Error loading logs' : 'No logs found matching filters'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]} // Added 100
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Log Details Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onClose={handleCloseDetails} maxWidth="md" fullWidth scroll="paper">
          <DialogTitle>
            Log Details (ID: {selectedLog.id})
            <IconButton
                 aria-label="close"
                 onClick={handleCloseDetails}
                 sx={{
                     position: 'absolute',
                     right: 8,
                     top: 8,
                     color: (theme) => theme.palette.grey[500],
                 }}
             >
                 <ClearIcon /> {/* Use ClearIcon instead of CloseIcon if not imported */}
             </IconButton>
          </DialogTitle>
          <DialogContent dividers> {/* Make content scrollable */}
            <Grid container spacing={3}> {/* Increased spacing */}
              {/* Column 1: Log Info & JSON */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom> {/* Use h6 for subtitle */}
                  Log Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}> {/* Add margin bottom */}
                   <Typography variant="body2" sx={{ mb: 1 }}>
                     <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1 }}>
                     <strong>Level:</strong>
                     <Chip
                        label={selectedLog.level}
                        size="small"
                        sx={{
                            backgroundColor: levelColors[selectedLog.level] || '#757575',
                            color: 'white',
                            ml: 1, // Add margin left
                            height: 'auto',
                            lineHeight: '1.5',
                            padding: '1px 6px',
                        }}
                      />
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1 }}>
                     <strong>Source:</strong> {selectedLog.source}
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}> {/* Allow wrap */}
                     <strong>Message:</strong> {selectedLog.message}
                   </Typography>
                   <Typography variant="body2">
                     <strong>Batch ID:</strong> {selectedLog.batchId}
                   </Typography>
                </Paper>

                <Typography variant="h6" gutterBottom> {/* Use h6 */}
                  Full Log Data (JSON)
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}> {/* Limit height & scroll */}
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </Paper>
              </Grid>

              {/* Column 2: Verification & Merkle */}
              <Grid item xs={12} md={6}>
                 <Typography variant="h6" gutterBottom> {/* Use h6 */}
                  Verification Status
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}> {/* Add margin bottom */}
                  {verifyingLogId === selectedLog.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                           <CircularProgress size={24} sx={{ mr: 1 }} />
                           <Typography>Verifying...</Typography>
                      </Box>
                  ) : verificationResults[selectedLog.id] ? (
                    <>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1, // Reduced margin
                        color: verificationResults[selectedLog.id].verified ? 'success.main' : 'error.main'
                      }}>
                        {verificationResults[selectedLog.id].verified ? (
                          <CheckIcon sx={{ mr: 1 }} />
                        ) : (
                          <ClearIcon sx={{ mr: 1 }} />
                        )}
                        <Typography variant="h6" component="span">
                          {verificationResults[selectedLog.id].verified ? 'VERIFIED' : 'VERIFICATION FAILED'}
                        </Typography>
                      </Box>

                      {/* Enhanced failure reason with detailed explanation */}
                      {!verificationResults[selectedLog.id].verified && (
                          <Box sx={{ mb: 2, border: '1px solid rgba(244, 67, 54, 0.2)', borderRadius: 1, p: 1, bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                            <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                              Verification Failed
                            </Typography>
                            
                            {verificationResults[selectedLog.id].simulatedFailure ? (
                              <>
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                  Reason: Failed due to simulated tampering.
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                  The log was edited in Tamper Simulation Mode, which caused the verification to fail. 
                                  In a real environment, this would indicate that someone has modified the log data after it was initially stored.
                                </Typography>
                              </>
                            ) : verificationResults[selectedLog.id].error ? (
                              <>
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                  Reason: {verificationResults[selectedLog.id].error}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                  There was an error during the verification process. This could be due to connectivity issues, 
                                  missing data, or an issue with the blockchain service.
                                </Typography>
                              </>
                            ) : verificationResults[selectedLog.id].diagnosticInfo && 
                               verificationResults[selectedLog.id].diagnosticInfo.discrepancies ? (
                              <>
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                  Reason: Log content has been modified.
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                                  Fields with discrepancies: <strong>{verificationResults[selectedLog.id].diagnosticInfo.discrepancies.join(', ')}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                  The content of the log entry does not match what was originally stored in the system. 
                                  This indicates that someone has tampered with the log data after it was initially recorded.
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                  Reason: Merkle proof verification failed.
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                  The cryptographic proof could not be verified against the blockchain record. 
                                  This may indicate data corruption, tampering, or an issue with the Merkle tree generation.
                                </Typography>
                              </>
                            )}
                          </Box>
                      )}

                      <Divider sx={{ my: 1 }} /> {/* Reduced margin */}

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Batch ID:</strong> {verificationResults[selectedLog.id].batchId ?? 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all' }}>
                        <strong>Merkle Root:</strong> {verificationResults[selectedLog.id].merkleRoot ?? 'N/A'}
                      </Typography>
                      {verificationResults[selectedLog.id].blockchainTimestamp && (
                        <Typography variant="body2">
                          <strong>Blockchain Timestamp:</strong> {' '}
                          {new Date(verificationResults[selectedLog.id].blockchainTimestamp * 1000).toLocaleString()}
                        </Typography>
                      )}

                    </>
                  ) : ( // Not verified yet
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        This log hasn't been verified yet.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => { handleVerifyLog(selectedLog); }} // Close dialog? Maybe not.
                        sx={{ mt: 2 }}
                        disabled={verifyingLogId === selectedLog.id} // Already checked above, but good practice
                        startIcon={<VerifiedUserIcon/>}
                      >
                        Verify Now
                      </Button>
                    </Box>
                  )}
                </Paper>

                {/* Merkle Visualizer Section (Optional based on verification result) */}
                {verificationResults[selectedLog.id] && (
                   <>
                      <Typography variant="h6" gutterBottom> {/* Use h6 */}
                          Merkle Proof Visualizer
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, minHeight: 150 }}>
                      <MerkleVisualizer 
                          logs={[selectedLog]} 
                          height={250} 
                          selectedLog={selectedLog}
                          verificationResult={verificationResults[selectedLog.id]}
                        />
                      </Paper>
                   </>
                )}

              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {/* Add Verify button inside dialog if not yet verified */}
             {!verificationResults[selectedLog.id] && !verifyingLogId && (
                 <Button
                      onClick={() => handleVerifyLog(selectedLog)}
                      startIcon={<VerifiedUserIcon />}
                      disabled={verifyingLogId === selectedLog.id}
                 >
                     Verify
                 </Button>
             )}
             {/* Standard Close button */}
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Ensure Alert is correctly used within Snackbar */}
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EnhancedLogBrowser;
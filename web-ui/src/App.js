import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';
import Dashboard from './components/dashboard/Dashboard';
import EnhancedLogBrowser from './components/logs/EnhancedLogBrowser';
import VerificationTool from './components/verification/VerificationTool';
import Welcome from './components/welcome/Welcome';
import LogGenerator from './components/generator/LogGenerator';
import { api } from './services/api';
import theme from './theme/theme';
import MainLayout from './components/layout/MainLayout';

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [mode, setMode] = useState(null);
  const [firstVisit, setFirstVisit] = useState(true);
  const [generatedLogs, setGeneratedLogs] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Check if this is the first visit and if the mode is already set in local storage
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    const savedMode = localStorage.getItem('logMode');
    
    if (hasVisitedBefore === 'true') {
      setFirstVisit(false);
      if (savedMode) {
        setMode(savedMode);
        // If mode is 'existing', make sure we're not in simulation mode
        if (savedMode === 'existing') {
          api.resetSimulationMode();
        }
      } else {
        // Default to 'existing' if mode is missing but not first visit
        setMode('existing');
        api.resetSimulationMode();
      }
    }
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    localStorage.setItem('logMode', selectedMode);
    localStorage.setItem('hasVisitedBefore', 'true');
    setFirstVisit(false);
    
    // If user selects "generate" mode, show the log generator tab
    if (selectedMode === 'generate') {
      setTabValue(3); // Generator tab
      showSnackbar('Generate some logs to get started!', 'info');
    } else {
      // Reset simulation mode to use real backend data
      api.resetSimulationMode();
      setTabValue(0); // Dashboard tab
      showSnackbar('Connected to existing logs system', 'info');
    }
  };
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleLogsGenerated = (logs) => {
    setGeneratedLogs(logs);
    
    // Create batches from the generated logs
    const batches = [...new Set(logs.map(log => log.batchId))].map(batchId => {
      const batchLogs = logs.filter(log => log.batchId === batchId);
      return {
        batchId,
        timestamp: new Date().toISOString(),
        merkleRoot: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        logCount: batchLogs.length,
        timeRange: {
          start: batchLogs.reduce((min, log) => !min || log.timestamp < min ? log.timestamp : min, null),
          end: batchLogs.reduce((max, log) => !max || log.timestamp > max ? log.timestamp : max, null)
        }
      };
    });
    
    // Update system status to reflect generated logs
    const updatedSystemStatus = {
      aggregationService: 'Online (Simulation)',
      batchesProcessed: batches.length,
      lastProcessed: new Date().toISOString(),
      storageUsage: `${Math.round(JSON.stringify(logs).length / 1024)}KB`,
      blockchain: {
        network: 'Simulated Blockchain',
        lastRoot: batches.length > 0 ? batches[0].merkleRoot : '0x0',
        latestBatchId: batches.length > 0 ? batches[0].batchId : 0
      }
    };
    
    // Completely replace the simulated data using the API's method
    api.updateSimulatedData({
      logs: logs,
      batches: batches,
      systemStatus: updatedSystemStatus
    });
    
    // Force switch to simulation mode
    api.forceSimulationMode();
    
    // Show success message and switch to log browser
    showSnackbar(`Successfully generated ${logs.length} logs across ${batches.length} batches!`, 'success');
    setTabValue(1); // Switch to Log Browser tab
  };
  
  const handleToggleMode = () => {
    const newMode = mode === 'generate' ? 'existing' : 'generate';
    setMode(newMode);
    localStorage.setItem('logMode', newMode);
    
    if (newMode === 'generate') {
      // Set to generation mode
      setTabValue(3); // Generator tab
      showSnackbar('Switched to log generation mode!', 'info');
    } else {
      // Reset simulation mode to use real backend data
      api.resetSimulationMode();
      setTabValue(0); // Dashboard tab
      showSnackbar('Switched to existing logs mode - fetching data from backend!', 'info');
    }
  };
  
  const resetWelcomeScreen = () => {
    localStorage.removeItem('hasVisitedBefore');
    localStorage.removeItem('logMode');
    setFirstVisit(true);
    setMode(null);
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  const handleNavigateToLogs = () => {
    setTabValue(1); // Switch to Log Browser tab
  };
  
  // If it's the first visit or no mode is selected, show the welcome screen
  if (firstVisit || !mode) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Welcome onSelectMode={handleSelectMode} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout
        tabValue={tabValue}
        handleTabChange={handleTabChange}
        mode={mode}
        handleToggleMode={handleToggleMode}
        resetWelcomeScreen={resetWelcomeScreen}
      >
        {tabValue === 0 && (
          <Dashboard 
            key={`dashboard-${mode}-${generatedLogs.length}`}
            onNavigateToLogs={handleNavigateToLogs}
          />
        )}
        
        {tabValue === 1 && (
          <EnhancedLogBrowser 
            key={`browser-${mode}-${generatedLogs.length}`}
          />
        )}
        
        {tabValue === 2 && (
          <VerificationTool 
            key={`verification-${mode}-${generatedLogs.length}`}
          />
        )}
        
        {tabValue === 3 && (
          <LogGenerator 
            onLogsGenerated={handleLogsGenerated}
          />
        )}
        
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
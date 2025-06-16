import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  QueryStats as QueryStatsIcon,
  AccountTree as AccountTreeIcon,
  CloudQueue as CloudQueueIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

// Import our new widget components
import StatCard from './widgets/StatCard';
import LogLevelDistribution from './widgets/LogLevelDistribution';
import BatchProcessingCard from './widgets/BatchProcessingCard';
import RecentLogs from './widgets/RecentLogs';
import BlockchainStatus from './widgets/BlockchainStatus';

const Dashboard = ({ onNavigateToLogs }) => {
  const theme = useTheme();
  const [status, setStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const refreshTimer = setInterval(fetchData, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statusData, logsData] = await Promise.all([
        api.getSystemStatus(),
        api.getRecentLogs()
      ]);
      setStatus(statusData);
      setRecentLogs(logsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check if the aggregation service is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Force a full refresh by clearing any cached data
    api.resetSimulationMode(); // Make sure we're using real backend data
    fetchData();
  };
  
  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      // Force a complete refresh by fetching fresh data from the server
      await fetch(`${api.apiClient?.defaults?.baseURL || '/api'}/status?forceRefresh=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      // Then refresh our local data
      await fetchData();
    } catch (err) {
      console.error('Force refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1976d2 0%, #2c5364 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            System Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor log integrity and system performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleForceRefresh}
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            Force Refresh
          </Button>
          
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* Show error Alert if there's an error */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh} disabled={refreshing}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Status Cards Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Aggregation Service" 
            value={status?.aggregationService || 'Offline'} 
            icon={<SpeedIcon />}
            color={status?.aggregationService?.includes('Online') ? theme.palette.success.main : theme.palette.error.main}
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Batches Processed" 
            value={status?.batchesProcessed !== undefined ? status.batchesProcessed : 0}
            icon={<TimelineIcon />}
            color={theme.palette.primary.main}
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Storage Usage" 
            value={status?.storageUsage || '0KB'} 
            icon={<StorageIcon />}
            color={theme.palette.info.main}
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Logs" 
            value={recentLogs?.length || 0} 
            subtitle="Recent activity"
            icon={<QueryStatsIcon />}
            color={theme.palette.secondary.main}
            loading={refreshing}
          />
        </Grid>
        
        {/* Blockchain Status */}
        <Grid item xs={12} md={6}>
          <BlockchainStatus 
            blockchainData={status?.blockchain || {}} 
            loading={refreshing} 
          />
        </Grid>
        
        {/* Batch Processing Status */}
        <Grid item xs={12} md={6}>
          <BatchProcessingCard 
            batchesProcessed={status?.batchesProcessed !== undefined ? status.batchesProcessed : 0} 
            lastProcessed={status?.lastProcessed} 
            loading={refreshing}
          />
        </Grid>
        
        {/* Log Level Distribution */}
        <Grid item xs={12} md={4}>
          <LogLevelDistribution logs={recentLogs || []} loading={refreshing} />
        </Grid>
        
        {/* Recent Logs List */}
        <Grid item xs={12} md={8}>
          <RecentLogs 
            logs={recentLogs || []} 
            loading={refreshing} 
            onViewAllLogs={() => {
              if (typeof onNavigateToLogs === 'function') {
                onNavigateToLogs();
              }
            }} 
          />
        </Grid>
        
        {/* Info Card */}
        <Grid item xs={12}>
          <Paper 
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              right: -20, 
              top: -20, 
              opacity: 0.1, 
              transform: 'rotate(20deg)'
            }}>
              <AccountTreeIcon sx={{ fontSize: 160 }} />
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                How Log Integrity Works
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This system ensures log integrity using blockchain technology and Merkle trees. 
                As logs are generated, they're grouped into batches and a Merkle tree is created. 
                The root hash of this tree is stored on the blockchain, creating an immutable reference.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                When verifying a log, we reconstruct its path in the Merkle tree and compare the 
                calculated root with the one stored on-chain. Any discrepancy indicates tampering.
              </Typography>
              
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  if (typeof onNavigateToLogs === 'function') {
                    onNavigateToLogs();
                  }
                }}
                startIcon={<VerifiedUserIcon />}
              >
                Try Log Verification
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
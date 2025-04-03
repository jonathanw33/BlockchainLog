import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { api } from '../../services/api';

const StatCard = ({ title, value, subtitle }) => (
  <Card sx={{ minWidth: 275, height: '100%' }}>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: 1.5 }} color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const refreshTimer = setInterval(fetchData, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Dashboard
        </Typography>
      </Grid>
      
      {/* Status Cards */}
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Aggregation Service" 
          value={status?.aggregationService} 
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Batches Processed" 
          value={status?.batchesProcessed}
          subtitle={`Last: ${new Date(status?.lastProcessed).toLocaleString()}`}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Storage Usage" 
          value={status?.storageUsage} 
        />
      </Grid>
      
      {/* Blockchain Info */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Blockchain Status
          </Typography>
          <Typography variant="body1">
            Network: {status?.blockchain.network}
          </Typography>
          <Typography variant="body1">
            Latest Batch ID: {status?.blockchain.latestBatchId}
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
            Last Merkle Root: {status?.blockchain.lastRoot}
          </Typography>
        </Paper>
      </Grid>
      
      {/* Recent Logs */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Logs
          </Typography>
          <List>
            {recentLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`[${log.level}] ${log.message}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                        {` — ${log.source} (Batch: ${log.batchId})`}
                      </>
                    }
                  />
                </ListItem>
                {index < recentLogs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;

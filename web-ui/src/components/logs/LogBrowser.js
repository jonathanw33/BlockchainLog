import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { api } from '../../services/api';

// Log level colors
const levelColors = {
  INFO: '#2196f3',
  WARN: '#ff9800',
  ERROR: '#f44336',
  DEBUG: '#4caf50'
};

const LogBrowser = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  
  // Filters
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    message: '',
    batchId: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would fetch logs from API
        // For demo purposes, we'll use the simulated recent logs
        const logsData = await api.getRecentLogs();
        
        // Add more sample logs for demo
        const sampleLogs = [...logsData];
        for (let i = 0; i < 20; i++) {
          const baseLog = logsData[i % logsData.length];
          const newLog = {
            ...baseLog,
            id: `log_${i + 4}`,
            timestamp: new Date(Date.now() - (i * 500000)).toISOString()
          };
          sampleLogs.push(newLog);
        }
        
        setLogs(sampleLogs);
        setFilteredLogs(sampleLogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs. Please check if the aggregation service is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = logs;
    
    if (filters.level) {
      result = result.filter(log => log.level === filters.level);
    }
    
    if (filters.source) {
      result = result.filter(log => log.source.includes(filters.source));
    }
    
    if (filters.message) {
      result = result.filter(log => log.message.toLowerCase().includes(filters.message.toLowerCase()));
    }
    
    if (filters.batchId) {
      result = result.filter(log => log.batchId === parseInt(filters.batchId));
    }
    
    setFilteredLogs(result);
    setPage(0);
  }, [filters, logs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

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

  // Get unique values for filters
  const levels = [...new Set(logs.map(log => log.level))];
  const sources = [...new Set(logs.map(log => log.source))];
  const batchIds = [...new Set(logs.map(log => log.batchId))];

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Log Browser
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
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
                  <MenuItem key={batchId} value={batchId}>{batchId}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="message"
              label="Message"
              variant="outlined"
              size="small"
              value={filters.message}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Log Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="log table">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Batch ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.level}
                        size="small"
                        sx={{ 
                          backgroundColor: levelColors[log.level] || '#757575',
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.batchId}</TableCell>
                  </TableRow>
              ))}
              
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
};

export default LogBrowser;

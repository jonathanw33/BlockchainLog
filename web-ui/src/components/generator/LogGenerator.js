import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

// Sample data for log generation
const nameOrigins = [
  { value: 'indonesian', label: 'Indonesian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'american', label: 'American' },
  { value: 'european', label: 'European' }
];

const industries = [
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'manufacturing', label: 'Manufacturing' }
];

// Sample name data
const names = {
  indonesian: ['Agus', 'Budi', 'Dewi', 'Eko', 'Ferry', 'Gita', 'Hadi', 'Ina', 'Joko', 'Kartika', 'Laras', 'Maman', 'Nining', 'Opik', 'Putra', 'Rina', 'Surya', 'Tuti', 'Umar', 'Vina', 'Wati', 'Yanto', 'Zaenal'],
  japanese: ['Akira', 'Haruki', 'Yuta', 'Kenji', 'Takashi', 'Sakura', 'Yuki', 'Naomi', 'Hina', 'Aiko', 'Daiki', 'Fumio', 'Hiroshi', 'Ichiro', 'Jiro', 'Kenta', 'Mai', 'Nori', 'Ren', 'Shinji', 'Taro', 'Ume', 'Yoshi'],
  american: ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Emily', 'Donna'],
  european: ['François', 'Klaus', 'Sofia', 'Maria', 'Antonio', 'José', 'Manuel', 'Luigi', 'Anna', 'Olga', 'Hans', 'Franz', 'Ivan', 'Gustav', 'Henrik', 'Isabella', 'Jürgen', 'Karl', 'Luca', 'Matteo', 'Natalia', 'Oscar', 'Paolo']
};

// Log message templates by industry
const logTemplates = {
  cybersecurity: [
    { level: 'INFO', template: '[USER] successfully logged in from [IP]' },
    { level: 'INFO', template: 'Password successfully changed for user [USER]' },
    { level: 'INFO', template: 'Multi-factor authentication enabled for [USER]' },
    { level: 'WARN', template: 'Failed login attempt for user [USER] from [IP]' },
    { level: 'WARN', template: 'Multiple failed login attempts detected from [IP]' },
    { level: 'WARN', template: 'Unusual access pattern detected for user [USER]' },
    { level: 'ERROR', template: 'Possible brute force attack detected from [IP]' },
    { level: 'ERROR', template: 'Firewall rule violation: [IP] attempting to access [PORT]' },
    { level: 'ERROR', template: 'Intrusion detection alert: suspicious activity from [IP]' },
    { level: 'DEBUG', template: 'Security scan completed for network segment [SEGMENT]' }
  ],
  finance: [
    { level: 'INFO', template: 'Transaction #[TRANSID] processed successfully for [USER]' },
    { level: 'INFO', template: 'Account balance updated for user [USER]' },
    { level: 'INFO', template: 'New payment method added for user [USER]' },
    { level: 'WARN', template: 'Large transaction #[TRANSID] ($[AMOUNT]) requires approval' },
    { level: 'WARN', template: 'Unusual transaction pattern detected for account #[ACCID]' },
    { level: 'WARN', template: 'Multiple currency conversions detected for user [USER]' },
    { level: 'ERROR', template: 'Transaction #[TRANSID] failed: insufficient funds' },
    { level: 'ERROR', template: 'Compliance alert: suspicious transaction #[TRANSID]' },
    { level: 'ERROR', template: 'Failed transfer between accounts #[ACCID] and #[ACCID2]' },
    { level: 'DEBUG', template: 'Daily reconciliation process completed' }
  ],
  healthcare: [
    { level: 'INFO', template: 'Patient record accessed by Dr. [USER]' },
    { level: 'INFO', template: 'New appointment scheduled for patient #[PATID]' },
    { level: 'INFO', template: 'Medication prescribed for patient #[PATID]' },
    { level: 'WARN', template: 'Multiple access to patient #[PATID] records in short period' },
    { level: 'WARN', template: 'Potential medication interaction detected for patient #[PATID]' },
    { level: 'WARN', template: 'Lab results pending for over 48 hours for patient #[PATID]' },
    { level: 'ERROR', template: 'Unauthorized access attempt to patient records by [USER]' },
    { level: 'ERROR', template: 'Critical lab result for patient #[PATID] requires immediate attention' },
    { level: 'ERROR', template: 'System downtime affecting patient monitoring systems' },
    { level: 'DEBUG', template: 'Daily backup of patient records completed' }
  ],
  ecommerce: [
    { level: 'INFO', template: 'User [USER] placed order #[ORDERID]' },
    { level: 'INFO', template: 'Payment received for order #[ORDERID]' },
    { level: 'INFO', template: 'New product review submitted by [USER]' },
    { level: 'WARN', template: 'Inventory low alert for product #[PRODID]' },
    { level: 'WARN', template: 'Multiple abandoned carts detected for user [USER]' },
    { level: 'WARN', template: 'Shipping delay detected for order #[ORDERID]' },
    { level: 'ERROR', template: 'Payment failed for order #[ORDERID]' },
    { level: 'ERROR', template: 'Product #[PRODID] out of stock but still showing available' },
    { level: 'ERROR', template: 'Order #[ORDERID] fulfillment failed' },
    { level: 'DEBUG', template: 'Daily product inventory reconciliation completed' }
  ],
  manufacturing: [
    { level: 'INFO', template: 'Production batch #[BATCHID] started by operator [USER]' },
    { level: 'INFO', template: 'Equipment maintenance completed by technician [USER]' },
    { level: 'INFO', template: 'Quality check passed for batch #[BATCHID]' },
    { level: 'WARN', template: 'Temperature above threshold on production line #[LINEID]' },
    { level: 'WARN', template: 'Preventive maintenance due for machine #[MACHINEID]' },
    { level: 'WARN', template: 'Production rate below target for line #[LINEID]' },
    { level: 'ERROR', template: 'Emergency stop triggered on production line #[LINEID]' },
    { level: 'ERROR', template: 'Critical failure detected in machine #[MACHINEID]' },
    { level: 'ERROR', template: 'Quality check failed for batch #[BATCHID]' },
    { level: 'DEBUG', template: 'Daily equipment diagnostic completed' }
  ]
};

// Helper function to generate an IP address
const generateIP = () => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
};

// Helper function to generate an ID (numeric string)
const generateId = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

// Helper function to generate a random amount
const generateAmount = (min = 100, max = 10000) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Helper function to generate a network segment
const generateSegment = () => {
  return `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.0/24`;
};

// Helper function to replace placeholders in templates
const fillTemplate = (template, nameOrigin, industry) => {
  let result = template;
  
  // Replace user placeholder with a random name
  if (result.includes('[USER]')) {
    const randomName = names[nameOrigin][Math.floor(Math.random() * names[nameOrigin].length)];
    result = result.replace('[USER]', randomName);
  }
  
  // Replace other placeholders based on the industry
  if (result.includes('[IP]')) {
    result = result.replace(/\[IP\]/g, generateIP());
  }
  
  if (result.includes('[TRANSID]')) {
    result = result.replace(/\[TRANSID\]/g, generateId(8));
  }
  
  if (result.includes('[ACCID]')) {
    result = result.replace(/\[ACCID\]/g, generateId(10));
  }
  
  if (result.includes('[ACCID2]')) {
    result = result.replace(/\[ACCID2\]/g, generateId(10));
  }
  
  if (result.includes('[AMOUNT]')) {
    result = result.replace(/\[AMOUNT\]/g, generateAmount());
  }
  
  if (result.includes('[PATID]')) {
    result = result.replace(/\[PATID\]/g, generateId(6));
  }
  
  if (result.includes('[ORDERID]')) {
    result = result.replace(/\[ORDERID\]/g, generateId(7));
  }
  
  if (result.includes('[PRODID]')) {
    result = result.replace(/\[PRODID\]/g, generateId(5));
  }
  
  if (result.includes('[BATCHID]')) {
    result = result.replace(/\[BATCHID\]/g, generateId(5));
  }
  
  if (result.includes('[LINEID]')) {
    result = result.replace(/\[LINEID\]/g, generateId(2));
  }
  
  if (result.includes('[MACHINEID]')) {
    result = result.replace(/\[MACHINEID\]/g, generateId(4));
  }
  
  if (result.includes('[SEGMENT]')) {
    result = result.replace(/\[SEGMENT\]/g, generateSegment());
  }
  
  if (result.includes('[PORT]')) {
    result = result.replace(/\[PORT\]/g, Math.floor(Math.random() * 65536).toString());
  }
  
  return result;
};

// Generate a distribution of log levels based on slider values
const getLogLevelDistribution = (infoPercentage, warnPercentage, errorPercentage, debugPercentage) => {
  // Normalize to ensure they sum to 100%
  const total = infoPercentage + warnPercentage + errorPercentage + debugPercentage;
  
  return {
    INFO: infoPercentage / total,
    WARN: warnPercentage / total,
    ERROR: errorPercentage / total,
    DEBUG: debugPercentage / total
  };
};

// Logic to generate random timestamps within a time range
const generateTimestamp = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  
  return new Date(start + Math.random() * (end - start)).toISOString();
};

// Main log generator function
const generateLogs = (params) => {
  const {
    count,
    nameOrigin,
    industry,
    timeRange,
    infoPercentage,
    warnPercentage,
    errorPercentage,
    debugPercentage
  } = params;
  
  // Setup time range
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  // Calculate level distribution
  const distribution = getLogLevelDistribution(
    infoPercentage,
    warnPercentage,
    errorPercentage,
    debugPercentage
  );
  
  // Generate logs
  const logs = [];
  const templates = logTemplates[industry];
  
  // Generate logs based on the distribution
  for (let i = 0; i < count; i++) {
    // Determine log level based on distribution
    const rand = Math.random();
    let level;
    
    if (rand < distribution.INFO) {
      level = 'INFO';
    } else if (rand < distribution.INFO + distribution.WARN) {
      level = 'WARN';
    } else if (rand < distribution.INFO + distribution.WARN + distribution.ERROR) {
      level = 'ERROR';
    } else {
      level = 'DEBUG';
    }
    
    // Filter templates by level
    const levelTemplates = templates.filter(t => t.level === level);
    
    // Pick a random template
    const template = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
    
    // Create the log entry
    const log = {
      id: uuidv4(),
      timestamp: generateTimestamp(startDate, now),
      level: level,
      message: fillTemplate(template.template, nameOrigin, industry),
      source: `${industry}-service`,
      batchId: Math.floor(Math.random() * 5) + 100 // Random batch ID between 100-104
    };
    
    logs.push(log);
  }
  
  // Sort logs by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return logs;
};

// Main component
const LogGenerator = ({ onLogsGenerated }) => {
  // State for generator parameters
  const [nameOrigin, setNameOrigin] = useState('indonesian');
  const [industry, setIndustry] = useState('cybersecurity');
  const [count, setCount] = useState(20);
  const [timeRange, setTimeRange] = useState('day');
  const [infoPercentage, setInfoPercentage] = useState(60);
  const [warnPercentage, setWarnPercentage] = useState(25);
  const [errorPercentage, setErrorPercentage] = useState(10);
  const [debugPercentage, setDebugPercentage] = useState(5);
  
  // UI states
  const [generating, setGenerating] = useState(false);
  const [previewLogs, setPreviewLogs] = useState([]);
  const [error, setError] = useState(null);
  
  // Generate a preview of logs
  const generatePreview = () => {
    try {
      const params = {
        count: 3, // Just a few for preview
        nameOrigin,
        industry,
        timeRange,
        infoPercentage,
        warnPercentage,
        errorPercentage,
        debugPercentage
      };
      
      const logs = generateLogs(params);
      setPreviewLogs(logs);
      setError(null);
    } catch (err) {
      setError('Error generating preview: ' + err.message);
    }
  };
  
  // Handle generating logs
  const handleGenerateLogs = () => {
    setGenerating(true);
    setError(null);
    
    try {
      // Generate logs with current parameters
      const params = {
        count,
        nameOrigin,
        industry,
        timeRange,
        infoPercentage,
        warnPercentage,
        errorPercentage,
        debugPercentage
      };
      
      const logs = generateLogs(params);
      
      // Simulate API delay
      setTimeout(() => {
        setGenerating(false);
        
        // Pass generated logs back to parent component
        if (onLogsGenerated) {
          onLogsGenerated(logs);
        }
      }, 1000);
    } catch (err) {
      setGenerating(false);
      setError('Error generating logs: ' + err.message);
    }
  };
  
  // Reset form to defaults
  const handleReset = () => {
    setNameOrigin('indonesian');
    setIndustry('cybersecurity');
    setCount(20);
    setTimeRange('day');
    setInfoPercentage(60);
    setWarnPercentage(25);
    setErrorPercentage(10);
    setDebugPercentage(5);
    setPreviewLogs([]);
  };
  
  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Log Generator
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Configure and generate sample logs to demonstrate the blockchain-based verification system.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Log Configuration
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="name-origin-label">Name Origin</InputLabel>
              <Select
                labelId="name-origin-label"
                value={nameOrigin}
                label="Name Origin"
                onChange={(e) => setNameOrigin(e.target.value)}
              >
                {nameOrigins.map(origin => (
                  <MenuItem key={origin.value} value={origin.value}>{origin.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="industry-label">Industry</InputLabel>
              <Select
                labelId="industry-label"
                value={industry}
                label="Industry"
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <MenuItem key={ind.value} value={ind.value}>{ind.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <Typography id="count-slider-label" gutterBottom>
                Number of Logs: {count}
              </Typography>
              <Slider
                value={count}
                onChange={(e, newValue) => setCount(newValue)}
                aria-labelledby="count-slider-label"
                min={10}
                max={100}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' }
                ]}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="hour">Last Hour</MenuItem>
                <MenuItem value="day">Last Day</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Log Level Distribution
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography id="info-slider-label" gutterBottom>
                  INFO: {infoPercentage}%
                </Typography>
                <Slider
                  value={infoPercentage}
                  onChange={(e, newValue) => setInfoPercentage(newValue)}
                  aria-labelledby="info-slider-label"
                  min={0}
                  max={100}
                  sx={{ color: '#2196f3' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography id="warn-slider-label" gutterBottom>
                  WARN: {warnPercentage}%
                </Typography>
                <Slider
                  value={warnPercentage}
                  onChange={(e, newValue) => setWarnPercentage(newValue)}
                  aria-labelledby="warn-slider-label"
                  min={0}
                  max={100}
                  sx={{ color: '#ff9800' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography id="error-slider-label" gutterBottom>
                  ERROR: {errorPercentage}%
                </Typography>
                <Slider
                  value={errorPercentage}
                  onChange={(e, newValue) => setErrorPercentage(newValue)}
                  aria-labelledby="error-slider-label"
                  min={0}
                  max={100}
                  sx={{ color: '#f44336' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography id="debug-slider-label" gutterBottom>
                  DEBUG: {debugPercentage}%
                </Typography>
                <Slider
                  value={debugPercentage}
                  onChange={(e, newValue) => setDebugPercentage(newValue)}
                  aria-labelledby="debug-slider-label"
                  min={0}
                  max={100}
                  sx={{ color: '#4caf50' }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          
          <Button variant="outlined" onClick={generatePreview}>
            Preview Sample
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateLogs}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : null}
          >
            {generating ? 'Generating...' : 'Generate Logs'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      {previewLogs.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preview Sample
          </Typography>
          
          {previewLogs.map((log, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body2">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={1}>
                    <Typography variant="caption" color="text.secondary">
                      Level
                    </Typography>
                    <Box>
                      <Chip
                        label={log.level}
                        size="small"
                        sx={{ 
                          backgroundColor: 
                            log.level === 'INFO' ? '#2196f3' : 
                            log.level === 'WARN' ? '#ff9800' : 
                            log.level === 'ERROR' ? '#f44336' : 
                            '#4caf50',
                          color: 'white',
                          mt: 0.5
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Source
                    </Typography>
                    <Typography variant="body2">
                      {log.source}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={1}>
                    <Typography variant="caption" color="text.secondary">
                      Batch ID
                    </Typography>
                    <Typography variant="body2">
                      {log.batchId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Message
                    </Typography>
                    <Typography variant="body2">
                      {log.message}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              This is a preview of 3 logs. Generating will create {count} logs with similar pattern.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default LogGenerator;

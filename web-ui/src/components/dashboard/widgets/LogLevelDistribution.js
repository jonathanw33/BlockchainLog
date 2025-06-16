import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const LogLevelDistribution = ({ logs = [], loading = false }) => {
  const theme = useTheme();
  const [distribution, setDistribution] = useState({
    INFO: 0,
    WARN: 0,
    ERROR: 0,
    DEBUG: 0
  });
  
  const [totalLogs, setTotalLogs] = useState(0);
  
  useEffect(() => {
    if (logs.length > 0) {
      // Count logs by level
      const counts = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {});
      
      // Fill in missing levels with 0
      const fullDistribution = {
        INFO: counts.INFO || 0,
        WARN: counts.WARN || 0,
        ERROR: counts.ERROR || 0,
        DEBUG: counts.DEBUG || 0
      };
      
      setDistribution(fullDistribution);
      setTotalLogs(logs.length);
    } else {
      setDistribution({
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        DEBUG: 0
      });
      setTotalLogs(0);
    }
  }, [logs]);
  
  const levelColors = {
    INFO: theme.palette.logLevel.INFO,
    WARN: theme.palette.logLevel.WARN,
    ERROR: theme.palette.logLevel.ERROR,
    DEBUG: theme.palette.logLevel.DEBUG
  };
  
  const renderBars = () => {
    return Object.entries(distribution).map(([level, count]) => {
      const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
      
      return (
        <Box key={level} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {level}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {count} ({percentage}%)
            </Typography>
          </Box>
          <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 10, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                height: '100%',
                backgroundColor: levelColors[level],
                borderRadius: 4
              }}
            />
          </Box>
        </Box>
      );
    });
  };
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Log Level Distribution
        </Typography>
        
        {loading ? (
          <Box sx={{ mt: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ width: '30%', height: 20, bgcolor: '#f0f0f0', borderRadius: 1 }} />
                  <Box sx={{ width: '20%', height: 20, bgcolor: '#f0f0f0', borderRadius: 1 }} />
                </Box>
                <Box sx={{ width: '100%', bgcolor: '#f5f5f5', borderRadius: 1, height: 10 }} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {renderBars()}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Logs: {totalLogs}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LogLevelDistribution;
import React from 'react';
import { Box, Card, CardContent, Typography, Tooltip, IconButton, useTheme } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BatchProcessingCard = ({ batchesProcessed, lastProcessed, loading = false }) => {
  const theme = useTheme();
  
  // Format the last processed date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      
      // Convert to appropriate unit
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    } catch (e) {
      return '';
    }
  };
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
            Batch Processing Status
          </Typography>
          <Tooltip title="Logs are processed in batches to create Merkle trees. Each batch's root hash is stored for verification.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ width: '60%', height: 30, bgcolor: '#f0f0f0', borderRadius: 1, mb: 2 }} />
            <Box sx={{ width: '80%', height: 20, bgcolor: '#f0f0f0', borderRadius: 1, mb: 3 }} />
            <Box sx={{ width: '100%', height: 40, bgcolor: '#f5f5f5', borderRadius: 1 }} />
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                mt: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '4px',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '4px 4px 0 0'
                }}
              />
              
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                {batchesProcessed !== undefined ? batchesProcessed.toLocaleString() : 'N/A'}
              </Typography>
              
              <Typography variant="body2" align="center" color="text.secondary">
                Total Batches Processed
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                Last Batch Processed:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, mt: 0.5 }}>
                {formatDate(lastProcessed)}
              </Typography>
              
              {lastProcessed && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'inline-block', 
                    mt: 0.5, 
                    bgcolor: 'rgba(25, 118, 210, 0.1)', 
                    p: 0.5, 
                    borderRadius: 1,
                    fontWeight: 500
                  }}
                >
                  {getTimeAgo(lastProcessed)}
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchProcessingCard;
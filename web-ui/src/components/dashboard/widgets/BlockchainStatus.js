import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tooltip, 
  IconButton, 
  Divider,
  Grid,
  Skeleton,
  Chip
} from '@mui/material';
import { 
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const BlockchainStatus = ({ blockchainData = {}, loading = false }) => {
  // Function to truncate Merkle root hash
  const truncateHash = (hash) => {
    if (!hash || typeof hash !== 'string') return 'N/A';
    return hash.length > 15 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : hash;
  };

  // Function to determine network color
  const getNetworkColor = (network) => {
    if (!network) return 'default';
    
    const networkLower = network.toLowerCase();
    if (networkLower.includes('ethereum') || networkLower.includes('main')) return 'primary';
    if (networkLower.includes('test')) return 'info';
    if (networkLower.includes('simul')) return 'warning';
    return 'default';
  };

  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Blockchain Status
          </Typography>
          <Tooltip title="Merkle root hashes for each batch are stored on the blockchain for immutable verification">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Network
              </Typography>
              <Chip 
                label={blockchainData.network || 'Unknown'} 
                color={getNetworkColor(blockchainData.network)}
                size="small"
                icon={<CheckCircleIcon />}
                variant="outlined"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                mb: 3
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Latest Batch ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {blockchainData.latestBatchId !== undefined ? blockchainData.latestBatchId : 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Last Merkle Root Hash
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(25, 118, 210, 0.05)', 
                  borderRadius: 2,
                  border: '1px dashed rgba(25, 118, 210, 0.3)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    left: 10, 
                    bgcolor: 'background.paper', 
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                    <LinkIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    On-Chain Reference
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {blockchainData.lastRoot || 'N/A'}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  This hash serves as the cryptographic reference point for verifying log integrity
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainStatus;
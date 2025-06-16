import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Divider, 
  Button, 
  Skeleton,
  useTheme
} from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const RecentLogs = ({ logs = [], loading = false, onViewAllLogs }) => {
  const theme = useTheme();
  
  // Get level color
  const getLevelColor = (level) => {
    return theme.palette.logLevel[level] || theme.palette.grey[500];
  };
  
  // Format timestamp
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Log Activity
          </Typography>
          {!loading && logs.length > 0 && (
            <Chip 
              label={`${logs.length} entries`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {loading ? (
            <List>
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <ListItem alignItems="flex-start" sx={{ px: 1 }}>
                    <ListItemText
                      primary={<Skeleton width="80%" height={24} />}
                      secondary={
                        <React.Fragment>
                          <Skeleton width="60%" height={20} />
                          <Skeleton width="40%" height={20} />
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {i < 4 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : logs.length > 0 ? (
            <List>
              {logs.map((log, index) => (
                <React.Fragment key={log.id || index}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      px: 1, 
                      borderLeft: `4px solid ${getLevelColor(log.level)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={log.level}
                            size="small"
                            sx={{
                              backgroundColor: getLevelColor(log.level),
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                            {log.message}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', fontSize: '0.75rem', mt: 0.5 }}
                          >
                            {formatDate(log.timestamp)}
                          </Typography>
                          <Typography 
                            component="span" 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            Source: {log.source} • Batch: {log.batchId}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < logs.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                p: 3
              }}
            >
              <StorageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="subtitle1" color="text.secondary" align="center">
                No logs available
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Check your connection or generate sample logs
              </Typography>
            </Box>
          )}
        </Box>
        
        {!loading && logs.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={onViewAllLogs}
              endIcon={<StorageIcon />}
            >
              View All Logs
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLogs;
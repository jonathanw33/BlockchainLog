import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatCard = ({ title, value, subtitle, icon, color = 'primary.main', loading = false }) => {
  // Format value for numeric display if applicable
  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
  
  return (
    <Card 
      component={motion.div}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        minWidth: 275, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: color,
          borderRadius: '4px 4px 0 0',
        },
      }}
    >
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '4px',
            zIndex: 1
          }} 
        />
      )}
      
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            sx={{ 
              fontSize: '1rem', 
              color: 'text.secondary', 
              fontWeight: 500,
              mb: 0.5
            }} 
            gutterBottom
          >
            {title}
          </Typography>
          
          {icon && (
            <Avatar 
              sx={{ 
                backgroundColor: `${color}15`, 
                color: color,
                width: 40,
                height: 40
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              lineHeight: 1.2,
              mb: 1
            }}
          >
            {loading ? (
              <Box sx={{ width: '80%', height: 45, bgcolor: '#f0f0f0', borderRadius: 1 }} />
            ) : isNumeric ? (
              <CountUp 
                start={0} 
                end={parseFloat(value)} 
                duration={2} 
                separator="," 
                decimals={parseFloat(value) % 1 !== 0 ? 2 : 0}
                decimal="."
              />
            ) : (
              value
            )}
          </Typography>
          
          {subtitle && (
            <Typography 
              sx={{ 
                mt: 'auto', 
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
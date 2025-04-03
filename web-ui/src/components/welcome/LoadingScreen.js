import React from 'react';
import { Backdrop, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';

const LoadingScreen = ({ loading }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
      }}
      open={loading}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360, 0]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity
        }}
      >
        <VerifiedUserIcon sx={{ fontSize: 80, mb: 2 }} />
      </motion.div>
      <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
        Initializing Secure Environment
      </Typography>
      <Box sx={{ width: '300px', mt: 4 }}>
        <motion.div
          animate={{
            scaleX: [0, 1],
            opacity: [0.5, 1]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #64b5f6 0%, #e3f2fd 100%)',
            borderRadius: '2px'
          }}
        />
      </Box>
    </Backdrop>
  );
};

export default LoadingScreen;

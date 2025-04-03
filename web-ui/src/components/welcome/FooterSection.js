import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  }
};

const FooterSection = () => {
  return (
    <motion.div variants={itemVariants}>
      <Divider sx={{ mb: 3, opacity: 0.2 }} />
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography sx={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          mb: 3,
          fontSize: { xs: '1.1rem', md: '1.25rem' },
          lineHeight: 1.6,
          maxWidth: '900px',
          mx: 'auto'
        }}>
          This project explores the intersection of blockchain technology and log security.
          It represents my own investigation into how cryptographic principles from distributed
          ledgers can solve real-world problems.
        </Typography>
        
        <Typography sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: { xs: '1rem', md: '1.1rem' }
        }}>
          This welcome screen appears only on your first visit. You can easily switch between modes
          anytime using the toggle in the application header.
        </Typography>
        
        <Typography sx={{ 
          mt: 2, 
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: { xs: '0.95rem', md: '1rem' }
        }}>
          Blockchain-Based Log Integrity System | Prototype April 2025
        </Typography>
      </Box>
    </motion.div>
  );
};

export default FooterSection;

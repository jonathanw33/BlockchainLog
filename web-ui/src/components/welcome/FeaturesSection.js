import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import {
  AccountTree as MerkleIcon,
  VerifiedUser as VerifiedUserIcon,
  Storage as StorageIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  }
};

const concepts = [
  { 
    icon: <MerkleIcon sx={{ fontSize: 40 }} />, 
    title: "Merkle Trees", 
    description: "Logs are batched and hashed into Merkle trees, creating a cryptographic fingerprint that can't be tampered with." 
  },
  { 
    icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />, 
    title: "Cryptographic Verification", 
    description: "Individual logs can be verified against the root hash without needing to process the entire dataset." 
  },
  { 
    icon: <StorageIcon sx={{ fontSize: 40 }} />, 
    title: "Tamper Evidence", 
    description: "Any modification to a log is immediately detectable through hash verification failure, ensuring data integrity." 
  },
  { 
    icon: <CodeIcon sx={{ fontSize: 40 }} />, 
    title: "Blockchain Principles", 
    description: "Using the same concepts that power blockchain technology, but focused specifically on log security." 
  }
];

const FeaturesSection = () => {
  return (
    <>
      <motion.div variants={itemVariants}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              background: 'linear-gradient(90deg, #64b5f6 0%, #e3f2fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.2rem', md: '2.8rem' }
            }}
          >
            Core Blockchain Concepts Applied
          </Typography>
        </Box>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography variant="h6" sx={{ 
          maxWidth: '900px', 
          mx: 'auto', 
          mb: 5, 
          textAlign: 'center',
          fontSize: { xs: '1.2rem', md: '1.3rem' },
          lineHeight: 1.6,
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          This prototype demonstrates how key blockchain principles can be repurposed to create
          a tamper-evident log storage and verification system.
        </Typography>
      </motion.div>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 8
        }}
      >
        {concepts.map((concept, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <Card sx={{ 
              height: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#64b5f6'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  mb: 2, 
                  color: '#64b5f6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {concept.icon}
                </Box>
                <Typography variant="h5" component="h3" sx={{ 
                  mb: 1, 
                  fontWeight: 600, 
                  color: 'white',
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}>
                  {concept.title}
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.5
                }}>
                  {concept.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </>
  );
};

export default FeaturesSection;

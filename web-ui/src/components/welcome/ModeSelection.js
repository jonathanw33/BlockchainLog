import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Storage as StorageIcon } from '@mui/icons-material';

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const ModeSelection = ({ onSelectMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <>
      <Typography 
        variant="h3" 
        component="h2" 
        align="center" 
        sx={{ 
          mb: 4, 
          background: 'linear-gradient(90deg, #64b5f6 0%, #e3f2fd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
          fontSize: { xs: '2.2rem', md: '2.8rem' }
        }}
      >
        Explore The Prototype
      </Typography>

      <Typography variant="h6" sx={{ 
        mb: 5, 
        textAlign: 'center', 
        color: 'rgba(255, 255, 255, 0.9)', 
        maxWidth: '900px', 
        mx: 'auto',
        fontSize: { xs: '1.2rem', md: '1.3rem' },
        lineHeight: 1.6,
        fontWeight: 400
      }}>
        This prototype demonstrates the application of Merkle trees for log integrity verification. Choose between 
        generating test logs or exploring the backend with pre-existing log data.
      </Typography>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 6, 
          justifyContent: 'center',
          mb: 8
        }}
      >
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          onMouseEnter={() => setSelectedCard('generate')}
          onMouseLeave={() => setSelectedCard(null)}
        >
          <Card 
            sx={{ 
              width: isMobile ? '100%' : 400,
              height: 500,
              background: 'rgba(25, 118, 210, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(25, 118, 210, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderColor: '#64b5f6',
                background: 'rgba(25, 118, 210, 0.2)',
              }
            }}
          >
            <CardContent sx={{ 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 4,
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ width: '120px', height: '120px', mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    rotateY: selectedCard === 'generate' ? [0, 360] : 0,
                    scale: selectedCard === 'generate' ? [1, 1.1, 1] : 1,
                    color: selectedCard === 'generate' 
                      ? ['#42a5f5', '#64b5f6', '#90caf9', '#64b5f6'] 
                      : '#64b5f6'
                  }}
                  transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity
                  }}
                >
                  <AddIcon sx={{ fontSize: 100, color: 'inherit' }} />
                </motion.div>
              </Box>
              
              <Typography variant="h4" component="h3" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1.8rem', md: '2.1rem' },
                textAlign: 'center'
              }}>
                Test Log Generator
              </Typography>
              
              <Typography sx={{ 
                mb: 5, 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
                px: 2
              }}>
                Generate sample logs to see how they're batched into Merkle trees. Simulate
                tampering attempts and see how the verification process detects changes.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 'auto' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => onSelectMode('generate')}
                  sx={{ 
                    py: 1.5,
                    px: 6,
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                    }
                  }}
                >
                  Generate Logs
                </Button>
              </Box>
            </CardContent>
            
            {/* Animated background gradient */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: selectedCard === 'generate' ? 0.08 : 0,
              transition: 'opacity 0.5s ease',
              background: 'radial-gradient(circle at center, #64b5f6 0%, transparent 70%)',
              zIndex: 0
            }} />
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          onMouseEnter={() => setSelectedCard('existing')}
          onMouseLeave={() => setSelectedCard(null)}
        >
          <Card 
            sx={{ 
              width: isMobile ? '100%' : 400,
              height: 500,
              background: 'rgba(123, 31, 162, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(123, 31, 162, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderColor: '#ce93d8',
                background: 'rgba(123, 31, 162, 0.2)',
              }
            }}
          >
            <CardContent sx={{ 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 4,
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ width: '120px', height: '120px', mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    rotateY: selectedCard === 'existing' ? [0, 360] : 0,
                    scale: selectedCard === 'existing' ? [1, 1.1, 1] : 1,
                    color: selectedCard === 'existing' 
                      ? ['#9c27b0', '#ba68c8', '#ce93d8', '#ba68c8'] 
                      : '#ba68c8'
                  }}
                  transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity
                  }}
                >
                  <StorageIcon sx={{ fontSize: 100, color: 'inherit' }} />
                </motion.div>
              </Box>
              
              <Typography variant="h4" component="h3" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1.8rem', md: '2.1rem' },
                textAlign: 'center'
              }}>
                Existing Log Archive
              </Typography>
              
              <Typography sx={{ 
                mb: 5, 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
                px: 2
              }}>
                Explore pre-existing logs in the system. Verify their integrity using 
                Merkle proofs and see the batching system in action.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 'auto' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={() => onSelectMode('existing')}
                  sx={{ 
                    py: 1.5,
                    px: 6,
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, #7b1fa2 0%, #9c27b0 100%)',
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    '&:hover': {
                      background: 'linear-gradient(90deg, #6a1b9a 0%, #7b1fa2 100%)',
                    }
                  }}
                >
                  Use Existing Logs
                </Button>
              </Box>
            </CardContent>
            
            {/* Animated background gradient */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: selectedCard === 'existing' ? 0.08 : 0,
              transition: 'opacity 0.5s ease',
              background: 'radial-gradient(circle at center, #ce93d8 0%, transparent 70%)',
              zIndex: 0
            }} />
          </Card>
        </motion.div>
      </Box>
    </>
  );
};

export default ModeSelection;

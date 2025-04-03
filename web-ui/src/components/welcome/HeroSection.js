import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { AccountTree as AccountTreeIcon, Security as SecurityIcon, StorageOutlined as StorageIcon } from '@mui/icons-material';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  }
};

// Create a component for the animated diagram
const MerkleTreeDiagram = () => {
  return (
    <motion.div
      style={{ 
        width: '100%', 
        height: '200px', 
        position: 'relative',
        margin: '30px 0'
      }}
    >
      {/* Root node */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '40px',
          backgroundColor: 'rgba(100, 181, 246, 0.3)',
          borderRadius: '8px',
          border: '2px solid rgba(100, 181, 246, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
          color: 'white',
          fontSize: '12px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Merkle Root
      </motion.div>
      
      {/* Lines connecting root to children */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          position: 'absolute',
          top: '40px',
          left: '25%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          position: 'absolute',
          top: '40px',
          left: '75%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      
      {/* Child nodes (hash pairs) */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{
          position: 'absolute',
          top: '80px',
          left: '25%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '30px',
          backgroundColor: 'rgba(186, 104, 200, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(186, 104, 200, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '11px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Hash A+B
      </motion.div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{
          position: 'absolute',
          top: '80px',
          left: '75%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '30px',
          backgroundColor: 'rgba(186, 104, 200, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(186, 104, 200, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '11px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Hash C+D
      </motion.div>
      
      {/* Lines connecting to leaf nodes */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '110px',
          left: '12.5%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '110px',
          left: '37.5%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '110px',
          left: '62.5%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '40px', opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '110px',
          left: '87.5%',
          width: '1px',
          backgroundColor: 'rgba(100, 181, 246, 0.5)'
        }}
      />
      
      {/* Leaf nodes (logs) */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        style={{
          position: 'absolute',
          top: '150px',
          left: '12.5%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '25px',
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(76, 175, 80, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '10px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Log A
      </motion.div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        style={{
          position: 'absolute',
          top: '150px',
          left: '37.5%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '25px',
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(76, 175, 80, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '10px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Log B
      </motion.div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        style={{
          position: 'absolute',
          top: '150px',
          left: '62.5%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '25px',
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(76, 175, 80, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '10px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Log C
      </motion.div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        style={{
          position: 'absolute',
          top: '150px',
          left: '87.5%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '25px',
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          borderRadius: '6px',
          border: '2px solid rgba(76, 175, 80, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '10px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Log D
      </motion.div>
    </motion.div>
  );
};

const HeroSection = () => {
  return (
    <Box sx={{ textAlign: 'center', mb: 8 }}>
      <motion.div variants={itemVariants}>
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: { xs: '3rem', md: '4.5rem' }, 
            fontWeight: 800,
            background: 'linear-gradient(90deg, #64b5f6 0%, #90caf9 50%, #e3f2fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          BLOCKCHAIN LOG INTEGRITY
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Box sx={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 300, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            <Typewriter
              options={{
                strings: [
                  'A Personal Journey Into Blockchain',
                  'Securing Corporate Logs',
                  'Merkle Trees Meet Log Files',
                  'Blockchain Concepts Applied'
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </Typography>
        </Box>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography 
          variant="h5" 
          sx={{ 
            mt: 3, 
            mb: 5, 
            maxWidth: '850px', 
            mx: 'auto', 
            opacity: 0.9,
            fontSize: { xs: '1.3rem', md: '1.5rem' },
            lineHeight: 1.5 
          }}
        >
          This project began as an exploration: what if we applied blockchain's core 
          concepts to secure high-value corporate logs?
        </Typography>
      </motion.div>
      
      {/* Visual Merkle Tree Diagram */}
      <Box sx={{ maxWidth: '900px', mx: 'auto', my: 5, overflow: 'hidden' }}>
        <MerkleTreeDiagram />
      </Box>

      <Grid container spacing={4} sx={{ mb: 6, mt: 2 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Card sx={{ 
              height: '100%',
              background: 'rgba(25, 118, 210, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(100, 181, 246, 0.2)',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountTreeIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Merkle Trees
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  I was fascinated by how Merkle trees create tamper-proof records while studying blockchain technology.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Card sx={{ 
              height: '100%',
              background: 'rgba(123, 31, 162, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(186, 104, 200, 0.2)',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ color: '#ba68c8', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Log Vulnerability
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  At the same time, I realized how vulnerable critical log files are in enterprise environments.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Card sx={{ 
              height: '100%',
              background: 'rgba(76, 175, 80, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(129, 199, 132, 0.2)',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ color: '#81c784', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Perfect Application
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  The recursive beauty of blockchain verification for logs seemed like the perfect application.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        style={{
          margin: '0 auto',
          maxWidth: '800px',
          padding: '25px',
          background: 'rgba(25, 118, 210, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(100, 181, 246, 0.2)',
        }}
      >
        <Typography 
          variant="h5" 
          component="blockquote" 
          sx={{ 
            fontStyle: 'italic', 
            color: '#e3f2fd',
            fontWeight: 300,
            position: 'relative',
            px: 5,
            fontSize: { xs: '1.3rem', md: '1.6rem' },
            lineHeight: 1.6
          }}
        >
          <Box component="span" sx={{ 
            position: 'absolute', 
            left: 0, 
            top: -10, 
            fontSize: '4rem', 
            opacity: 0.5, 
            color: '#64b5f6',
            fontFamily: 'serif'
          }}>
            "
          </Box>
          What if we could take the most powerful aspect of blockchain — the ability to 
          cryptographically verify data hasn't been tampered with — and apply it specifically 
          to log integrity? That's the core idea behind this experiment.
          <Box component="span" sx={{ 
            position: 'absolute', 
            right: 0, 
            bottom: -30, 
            fontSize: '4rem', 
            opacity: 0.5, 
            color: '#64b5f6',
            fontFamily: 'serif'
          }}>
            "
          </Box>
        </Typography>
      </motion.div>
    </Box>
  );
};

export default HeroSection;

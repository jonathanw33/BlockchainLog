import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

// A simpler particle effect using CSS instead of the particles library
const ParticleBackground = () => {
  // Create an array of 50 particles
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden' }}>
      {particles.map((i) => {
        // Generate random properties for each particle
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        return (
          <motion.div 
            key={i}
            style={{
              position: 'absolute',
              left: `${posX}%`,
              top: `${posY}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.5)',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        );
      })}
      
      {/* Add some animated "connections" between particles */}
      {particles.slice(0, 10).map((i) => {
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const endX = Math.random() * 100;
        const endY = Math.random() * 100;
        const duration = Math.random() * 30 + 20;
        
        return (
          <motion.div 
            key={`line-${i}`}
            style={{
              position: 'absolute',
              left: `${startX}%`,
              top: `${startY}%`,
              width: Math.random() * 100 + 50,
              height: 1,
              background: 'linear-gradient(90deg, rgba(100, 181, 246, 0.1), rgba(100, 181, 246, 0.5), rgba(100, 181, 246, 0.1))',
              transformOrigin: 'left center',
            }}
            animate={{
              rotate: [0, Math.random() * 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        );
      })}
    </Box>
  );
};

export default ParticleBackground;

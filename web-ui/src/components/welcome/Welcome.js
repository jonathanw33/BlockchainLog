import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';

// Import our custom components
import ParticleBackground from './ParticleBackground';
import LoadingScreen from './LoadingScreen';
import HeroSection from './HeroSection';
import ModeSelection from './ModeSelection';
import FeaturesSection from './FeaturesSection';
import FooterSection from './FooterSection';
import GlobalStyles from './GlobalStyles';

// Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2,
      duration: 0.8
    }
  }
};

const Welcome = ({ onSelectMode }) => {
  const [loading, setLoading] = useState(true);

  // Simulate loading for effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen loading={loading} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        color: 'white',
      }}
    >
      <GlobalStyles />
      {/* Particles Background */}
      <ParticleBackground />

      <Container maxWidth="lg" sx={{ pt: 8, pb: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <HeroSection />

          {/* Mode Selection Cards */}
          <ModeSelection onSelectMode={onSelectMode} />

          {/* Features Section */}
          <FeaturesSection />

          {/* Footer Info */}
          <FooterSection />
        </motion.div>
      </Container>
    </Box>
  );
};

export default Welcome;

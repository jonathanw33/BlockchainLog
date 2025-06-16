import React from 'react';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  Switch, 
  FormControlLabel,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  VerifiedUser as VerifiedUserIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  AccountTree as AccountTreeIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Security as SecurityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MainLayout = ({ 
  children, 
  tabValue, 
  handleTabChange, 
  mode, 
  handleToggleMode, 
  resetWelcomeScreen 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const getTabIcon = (index) => {
    switch(index) {
      case 0: return <DashboardIcon fontSize="small" />;
      case 1: return <StorageIcon fontSize="small" />;
      case 2: return <VerifiedUserIcon fontSize="small" />;
      case 3: return <AddIcon fontSize="small" />;
      default: return null;
    }
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Blockchain Logs
        </Typography>
        <IconButton onClick={handleDrawerClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem 
          button 
          selected={tabValue === 0} 
          onClick={(e) => { handleTabChange(e, 0); handleDrawerClose(); }}
        >
          <ListItemIcon>
            <DashboardIcon color={tabValue === 0 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          selected={tabValue === 1} 
          onClick={(e) => { handleTabChange(e, 1); handleDrawerClose(); }}
        >
          <ListItemIcon>
            <StorageIcon color={tabValue === 1 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Log Browser & Verification" />
        </ListItem>
        
        <ListItem 
          button 
          selected={tabValue === 2} 
          onClick={(e) => { handleTabChange(e, 2); handleDrawerClose(); }}
        >
          <ListItemIcon>
            <VerifiedUserIcon color={tabValue === 2 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Manual Verification" />
        </ListItem>
        
        {mode === 'generate' && (
          <ListItem 
            button 
            selected={tabValue === 3} 
            onClick={(e) => { handleTabChange(e, 3); handleDrawerClose(); }}
          >
            <ListItemIcon>
              <AddIcon color={tabValue === 3 ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Log Generator" />
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'generate'}
                onChange={handleToggleMode}
                color={mode === 'generate' ? "secondary" : "primary"}
              />
            }
            label={mode === 'generate' ? "Generated Logs Mode" : "Existing Logs Mode"}
          />
        </ListItem>
        <ListItem button onClick={resetWelcomeScreen}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Reset Welcome" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box 
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.light',
                  mr: 1,
                  width: 40,
                  height: 40,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                <SecurityIcon />
              </Avatar>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: 'white',
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                Blockchain-Based Log Integrity
              </Typography>
            </Box>

            <Badge 
              badgeContent="Beta" 
              color="secondary"
              sx={{ 
                mr: 1,
                display: { xs: 'flex', md: 'none' }
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                BlockLog
              </Typography>
            </Badge>

            {!isMobile && (
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="navigation tabs"
                textColor="inherit"
                indicatorColor="secondary"
                sx={{ ml: 1, flexGrow: 1 }}
              >
                <Tab 
                  icon={getTabIcon(0)} 
                  label="Dashboard" 
                  iconPosition="start"
                />
                <Tab 
                  icon={getTabIcon(1)} 
                  label="Log Browser" 
                  iconPosition="start"
                />
                <Tab 
                  icon={getTabIcon(2)} 
                  label="Verification" 
                  iconPosition="start"
                />
                {mode === 'generate' && (
                  <Tab 
                    icon={getTabIcon(3)} 
                    label="Generator" 
                    iconPosition="start"
                  />
                )}
              </Tabs>
            )}

            {!isMobile && (
              <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'generate'}
                      onChange={handleToggleMode}
                      color="secondary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem' }}>
                      {mode === 'generate' ? "Simulator" : "Live Logs"}
                    </Typography>
                  }
                  sx={{ mr: 2, color: 'white' }}
                />
                <Button 
                  color="inherit" 
                  onClick={resetWelcomeScreen} 
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Reset
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
      >
        {drawer}
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: 3, 
          pb: 5,
          backgroundColor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          mt: 'auto'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Blockchain Log Integrity System — {new Date().getFullYear()}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Data secured using Merkle trees and blockchain technology
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
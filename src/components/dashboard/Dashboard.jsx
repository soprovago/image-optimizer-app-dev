import React, { useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import weSuiteLogo from '../../assets/we_suite.svg';
import Home from './Home';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  PhotoCamera as ImageIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import ImageOptimizer from '../imageOptimizer/ImageOptimizer';
import PdfOptimizer from '../pdfOptimizer/PdfOptimizer';
import VideoOptimizer from '../videoOptimizer/VideoOptimizer';

const drawerWidth = 240;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  
  const navigateToHome = () => {
    navigate('/dashboard');
    if (isMobile) setMobileOpen(false);
  };
  
  const navigateToImageOptimizer = () => {
    navigate('/dashboard/optimize');
    if (isMobile) setMobileOpen(false);
  };
  
  const navigateToPdfOptimizer = () => {
    navigate('/dashboard/pdf');
    if (isMobile) setMobileOpen(false);
  };
  
  const navigateToVideoOptimizer = () => {
    navigate('/dashboard/video');
    if (isMobile) setMobileOpen(false);
  };
  const drawerContent = (
    <Box>
      <Toolbar>
        <img 
          src={weSuiteLogo} 
          alt="WE Suite Logo" 
          style={{ 
            height: '45px',
            maxWidth: '100%',
            objectFit: 'contain'
          }} 
        />
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={navigateToHome}
            selected={location.pathname === '/dashboard'}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={navigateToImageOptimizer}
            selected={location.pathname === '/dashboard/optimize'}>
            <ListItemIcon>
              <ImageIcon />
            </ListItemIcon>
            <ListItemText primary="Optimize Images" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={navigateToPdfOptimizer}
            selected={location.pathname === '/dashboard/pdf'}>
            <ListItemIcon>
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary="Optimizar PDF" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={navigateToVideoOptimizer}
            selected={location.pathname === '/dashboard/video'}>
            <ListItemIcon>
              <VideoFileIcon />
            </ListItemIcon>
            <ListItemText primary="Optimizar Video" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ¡Hola! {currentUser?.displayName || 'User'}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Add space for the AppBar */}
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="optimize" element={<ImageOptimizer />} />
          <Route path="pdf" element={<PdfOptimizer />} />
          <Route path="video" element={<VideoOptimizer />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;

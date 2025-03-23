import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useMediaQuery,
  Container,
  CircularProgress,
  Avatar,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import PhotoIcon from '@mui/icons-material/Photo';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import weSuiteLogo from '../assets/we_suite.svg';

const drawerWidth = 240;

/**
 * MainLayout - The primary layout component for the application.
 * 
 * Features:
 * - Responsive layout that adapts to screen size
 * - Collapsible sidebar navigation with icons and labels
 * - App bar with navigation controls
 * - Main content area with configurable padding
 * - Built-in error boundary and loading state handling
 * - Theme integration
 * 
 * @component
 */
const MainLayout = ({
  children,
  title = 'Image Optimizer',
  loading = false,
  navItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'My Images', icon: <PhotoIcon />, path: '/images' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ],
  onLogout = () => console.log('Logout clicked'),
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)' 
            : 'linear-gradient(90deg, #1c1c1c 0%, #2d2d2d 100%)',
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          minHeight: 64
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: 'none' }),
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1)
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box 
              component="img" 
              src={weSuiteLogo} 
              alt="WE Suite Logo" 
              sx={{ 
                height: 40, 
                mr: 2, 
                display: 'flex' 
              }} 
            />
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {title}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerClose : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            ...(isMobile && !open && { display: 'none' }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [2],
            backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.dark, 0.15),
            minHeight: 64
          }}
        >
          <Box 
            component="img" 
            src={weSuiteLogo} 
            alt="WE Suite Logo" 
            sx={{ 
              height: 40,
              maxWidth: 140,
              objectFit: 'contain',
            }} 
          />
          <IconButton 
            onClick={handleDrawerClose}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15)
              }
            }}
          >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <Box sx={{ overflow: 'auto', flexGrow: 1, p: 1 }}>
          <List component="nav" sx={{ px: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={item.component || 'div'}
                to={item.path}
                onClick={item.onClick}
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <List component="nav" sx={{ px: 1 }}>
            <ListItemButton 
              onClick={onLogout}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: theme.palette.error.main 
              }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: theme.palette.error.main
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer to push content below app bar */}
        <ErrorBoundary>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <LoadingSpinner />
            </Box>
          ) : (
            children
          )}
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  /**
   * The content to be rendered in the main area
   */
  children: PropTypes.node.isRequired,
  
  /**
   * The title to display in the app bar
   */
  title: PropTypes.string,
  
  /**
   * Whether to display a loading indicator
   */
  loading: PropTypes.bool,
  
  /**
   * Navigation items to display in the sidebar
   */
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      path: PropTypes.string,
      component: PropTypes.elementType,
      onClick: PropTypes.func,
    })
  ),
  
  /**
   * Function to call when the logout button is clicked
   */
  onLogout: PropTypes.func,
};

export default MainLayout;


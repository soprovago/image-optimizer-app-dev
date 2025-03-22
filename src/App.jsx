import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

const RouteGuard = ({ children, requireAuth }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return null; // or a loading spinner
  }
  
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" />;
  }

  if (!requireAuth && currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => (
  <RouteGuard requireAuth>{children}</RouteGuard>
);

const UnprotectedRoute = ({ children }) => (
  <RouteGuard requireAuth={false}>{children}</RouteGuard>
);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            <Route 
              path="/login" 
              element={
                <UnprotectedRoute>
                  <Login />
                </UnprotectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <UnprotectedRoute>
                  <Register />
                </UnprotectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

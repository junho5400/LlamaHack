import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

// Import components
import EnhancedNavigation from './components/EnhancedNavigation';
import EnhancedHome from './components/EnhancedHome';
import EnhancedChatInterface from './components/EnhancedChatInterface';
import EnhancedSavedRecipes from './components/EnhancedSavedRecipes';
import EnhancedPreferences from './components/EnhancedPreferences';
import Login from './components/Login';
import Register from './components/Register';

// Global styles
const GlobalContainer = styled.div`
  font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333;
`;

const MainContent = styled.main`
  min-height: calc(100vh - 70px);
`;

const Footer = styled.footer`
  background-color: #fff;
  padding: 30px;
  text-align: center;
  border-top: 1px solid #eee;
  
  p {
    color: #777;
    font-size: 14px;
  }
`;

// Theme definition
const theme = {
  colors: {
    primary: '#4a6fa5',
    secondary: '#5e9b8b',
    accent: '#f5a623',
    background: '#f5f7fa',
    cardBg: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    error: '#d9534f',
    success: '#5cb85c'
  },
  fonts: {
    body: "'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif"
  },
  shadows: {
    small: '0 2px 5px rgba(0, 0, 0, 0.05)',
    medium: '0 5px 15px rgba(0, 0, 0, 0.1)',
    large: '0 10px 25px rgba(0, 0, 0, 0.15)'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    extraLarge: '24px'
  }
};

// Configure axios with base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Add authorization header to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Routes wrapper component with location state handling
const AppRoutes = ({ isAuthenticated, user, setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle initial message for chat component
  const getInitialMessage = () => {
    if (location.state && location.state.initialMessage) {
      return location.state.initialMessage;
    }
    return null;
  };
  
  return (
    <Routes>
      <Route path="/" element={<EnhancedHome navigate={navigate} />} />
      
      <Route 
        path="/chat" 
        element={<EnhancedChatInterface user={user} initialMessage={getInitialMessage()} />} 
      />
      
      <Route 
        path="/recipes" 
        element={
          isAuthenticated ? 
          <EnhancedSavedRecipes /> : 
          <Navigate to="/login" state={{ from: location }} />
        } 
      />
      
      <Route 
        path="/preferences" 
        element={
          isAuthenticated ? 
          <EnhancedPreferences /> : 
          <Navigate to="/login" state={{ from: location }} />
        } 
      />
      
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/" /> : 
          <Login setIsAuthenticated={setIsAuthenticated} />
        } 
      />
      
      <Route 
        path="/register" 
        element={
          isAuthenticated ? 
          <Navigate to="/" /> : 
          <Register setIsAuthenticated={setIsAuthenticated} />
        } 
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token is valid
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 20px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4a6fa5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading AI Chef...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <GlobalContainer>
          <EnhancedNavigation 
            isAuthenticated={isAuthenticated} 
            user={user} 
            onLogout={handleLogout} 
          />
          
          <MainContent>
            <AppRoutes 
              isAuthenticated={isAuthenticated}
              user={user}
              setIsAuthenticated={setIsAuthenticated}
            />
          </MainContent>
          
          <Footer>
            <p>© {new Date().getFullYear()} AI Chef Culinary Assistant. All rights reserved.</p>
            <p>Created for WashU Meta Hackathon 2025</p>
          </Footer>
        </GlobalContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;
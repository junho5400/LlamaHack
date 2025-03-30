import React, { useState, useEffect } from 'react';
import CustomChatInterface from './CustomChatInterface';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';

// Configure axios to use your API base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
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

const AppContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  background-color: #4a6fa5;
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const NavBar = styled.nav`
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const NavList = styled.ul`
  display: flex;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
  gap: 30px;
`;

const NavItem = styled.li``;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
  font-size: 18px;
  
  &:hover {
    color: #4a6fa5;
  }
`;

const MainContent = styled.main`
  min-height: 70vh;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    color: #4a6fa5;
  }
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token is valid by making a request to /auth/me
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <AppContainer>
        <Header>
          <h1>AI Culinary Assistant</h1>
          <p>Your AI-powered guide to delicious meals</p>
        </Header>
        
        <NavBar>
          <NavList>
            <NavItem><StyledLink to="/">Home</StyledLink></NavItem>
            <NavItem><StyledLink to="/chat">Chat</StyledLink></NavItem>
            {isAuthenticated ? (
              <>
                <NavItem><StyledLink to="/recipes">Saved Recipes</StyledLink></NavItem>
                <NavItem><StyledLink to="/preferences">Preferences</StyledLink></NavItem>
                <NavItem><LogoutButton onClick={handleLogout}>Logout</LogoutButton></NavItem>
              </>
            ) : (
              <>
                <NavItem><StyledLink to="/login">Login</StyledLink></NavItem>
                <NavItem><StyledLink to="/register">Register</StyledLink></NavItem>
              </>
            )}
          </NavList>
        </NavBar>
        
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<CustomChatInterface user={user} />} />
            <Route 
              path="/recipes" 
              element={isAuthenticated ? <SavedRecipes userId={user?.id} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/preferences" 
              element={isAuthenticated ? <Preferences userId={user?.id} /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

// Home component
const Home = () => {
  const HomeContainer = styled.div`
    text-align: center;
    padding: 50px 20px;
  `;
  
  const HomeTitle = styled.h2`
    font-size: 28px;
    margin-bottom: 20px;
    color: #4a6fa5;
  `;
  
  const HomeDescription = styled.p`
    font-size: 18px;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto 30px;
  `;
  
  const StartButton = styled(Link)`
    display: inline-block;
    background-color: #4a6fa5;
    color: white;
    font-size: 18px;
    padding: 12px 30px;
    border-radius: 30px;
    text-decoration: none;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #3a5a8f;
    }
  `;
  
  return (
    <HomeContainer>
      <HomeTitle>Welcome to Your Personal AI Chef!</HomeTitle>
      <HomeDescription>
        Discover delicious recipes from any cuisine, customize them to your taste, or create your own unique dishes.
        Our AI-powered culinary assistant will guide you through the entire process, from choosing ingredients
        to cooking the perfect meal for any occasion.
      </HomeDescription>
      <StartButton to="/chat">Start Cooking</StartButton>
    </HomeContainer>
  );
};

// Saved Recipes component (placeholder)
const SavedRecipes = () => {
  return (
    <div>
      <h2>Your Saved Recipes</h2>
      <p>Your saved recipes will appear here.</p>
    </div>
  );
};

// Preferences component (placeholder)
const Preferences = () => {
  return (
    <div>
      <h2>Your Preferences</h2>
      <p>Set your dietary preferences and allergies here.</p>
    </div>
  );
};

export default App;
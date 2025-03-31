// client/src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useUser from '../hooks/useUser';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  color: #4a6fa5;
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4a6fa5;
    box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #3a5a8f;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #d9534f;
  text-align: center;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 15px;
`;

const StyledLink = styled.span`
  color: #4a6fa5;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Use the login function from UserContext
      await login({ email, password });
      
      // Redirect to home page on success
      navigate('/');
    } catch (error) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <Title>Log In to AI Chef</Title>
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </Form>
      <LinkText>
        Don't have an account?{' '}
        <StyledLink onClick={() => navigate('/register')}>
          Register
        </StyledLink>
      </LinkText>
    </LoginContainer>
  );
};

export default Login;
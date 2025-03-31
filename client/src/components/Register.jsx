// client/src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useUser from '../hooks/useUser';

const RegisterContainer = styled.div`
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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useUser();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Use the register function from UserContext
      await register({ name, email, password });
      
      // Redirect to home page on success
      navigate('/');
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <Title>Create Account</Title>
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
      </Form>
      <LinkText>
        Already have an account?{' '}
        <StyledLink onClick={() => navigate('/login')}>
          Log In
        </StyledLink>
      </LinkText>
    </RegisterContainer>
  );
};

export default Register;
// client/src/components/common/EmptyState.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  color: #4a6fa5;
  margin-bottom: 10px;
  font-size: 24px;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 25px;
  max-width: 500px;
`;

const Button = styled(motion.button)`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

// Icon components
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RecipeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19h16" />
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M9 9l-2-2 2-2" />
    <path d="M15 13l2 2-2 2" />
  </svg>
);

const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/**
 * EmptyState - Component for displaying empty state with call to action
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.buttonText - Button text
 * @param {string} props.buttonIcon - Icon type ('chat', 'recipe', or 'add')
 * @param {Function} props.onButtonClick - Function to handle button click
 * @returns {JSX.Element} - Rendered component
 */
const EmptyState = ({ 
  title, 
  description, 
  buttonText, 
  buttonIcon = 'chat',
  onButtonClick 
}) => {
  // Select icon based on prop
  const getIcon = () => {
    switch (buttonIcon) {
      case 'recipe':
        return <RecipeIcon />;
      case 'add':
        return <AddIcon />;
      case 'chat':
      default:
        return <ChatIcon />;
    }
  };
  
  return (
    <Container>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <Button
        onClick={onButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getIcon()}
        {buttonText}
      </Button>
    </Container>
  );
};

export default EmptyState;
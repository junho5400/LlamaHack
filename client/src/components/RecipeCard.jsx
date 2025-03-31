import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components with improved design
const Card = styled(motion.div)`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
`;

const CardImageContainer = styled.div`
  height: 180px;
  overflow: hidden;
  background-color: ${props => props.placeholderColor || '#f5f5f5'};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CardPlaceholder = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 60px;
    height: 60px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const DifficultyBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.85);
  color: ${props => {
    switch(props.difficulty) {
      case 'easy': return '#2ecc71';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#3498db';
    }
  }};
`;

const CardContent = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 48px;
`;

const QuickInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 4px;
  }
`;

const NutritionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const NutritionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  
  span:first-child {
    font-weight: 600;
    color: #4a6fa5;
  }
  
  span:last-child {
    color: #666;
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  svg {
    margin-right: 6px;
  }
  
  ${props => props.primary ? `
    background-color: #4a6fa5;
    color: white;
    
    &:hover {
      background-color: #3a5a8f;
    }
  ` : `
    background-color: #f0f0f0;
    color: #333;
    
    &:hover {
      background-color: #e0e0e0;
    }
  `}
`;

// Icons for the UI
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ServingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ViewIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const FoodIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

// Function to get a placeholder color based on recipe type
const getPlaceholderColor = (type) => {
  switch(type) {
    case 'appetizer': return '#e74c3c';
    case 'main': return '#3498db';
    case 'side': return '#2ecc71';
    case 'dessert': return '#9b59b6';
    case 'breakfast': return '#f1c40f';
    case 'lunch': return '#e67e22';
    case 'dinner': return '#34495e';
    case 'snack': return '#1abc9c';
    case 'drink': return '#d35400';
    default: return '#7f8c8d';
  }
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.2 
    }
  },
  tap: { 
    scale: 0.95 
  }
};

// Main Component
const RecipeCard = ({ recipe, onView, onSave, delay = 0 }) => {
  const placeholderColor = getPlaceholderColor(recipe.type);
  
  return (
    <Card 
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      transition={{ delay }}
    >
      <CardImageContainer 
        imageUrl={recipe.image}
        placeholderColor={placeholderColor}
      >
        {!recipe.image && (
          <CardPlaceholder>
            <FoodIcon />
          </CardPlaceholder>
        )}
        <DifficultyBadge difficulty={recipe.difficulty}>
          {recipe.difficulty}
        </DifficultyBadge>
      </CardImageContainer>
      
      <CardContent>
        <CardTitle>{recipe.name}</CardTitle>
        
        <QuickInfoBar>
          <InfoItem>
            <ClockIcon />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </InfoItem>
          <InfoItem>
            <ServingsIcon />
            <span>{recipe.servings} servings</span>
          </InfoItem>
        </QuickInfoBar>
        
        <NutritionBar>
          <NutritionItem>
            <span>Calories</span>
            <span>{recipe.nutrition?.calories || 'N/A'}</span>
          </NutritionItem>
          <NutritionItem>
            <span>Protein</span>
            <span>{recipe.nutrition?.protein || 'N/A'}g</span>
          </NutritionItem>
          <NutritionItem>
            <span>Carbs</span>
            <span>{recipe.nutrition?.carbs || 'N/A'}g</span>
          </NutritionItem>
        </NutritionBar>
        
        <CardActions>
          <ActionButton 
            onClick={() => onView(recipe._id)}
            primary
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ViewIcon />
            View Recipe
          </ActionButton>
          
          {onSave && (
            <ActionButton
              onClick={() => onSave(recipe)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <SaveIcon />
              Save
            </ActionButton>
          )}
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
// client/src/components/features/recipes/RecipeCard.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components
const Card = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  height: 180px;
  background-color: #e1f5fe;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ImagePlaceholder = styled.div`
  color: #4a6fa5;
  text-align: center;
  
  svg {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  background-color: #e1f5fe;
  color: #4a6fa5;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
`;

// Icon component
const RecipeIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 11h.01"></path>
    <path d="M11 15h.01"></path>
    <path d="M16 16h.01"></path>
    <path d="M2 12a10 10 0 0 0 14 9.236"></path>
    <path d="M5 19a14.94 14.94 0 0 1 9-9"></path>
    <path d="M12 3a10 10 0 0 0-9.236 14"></path>
    <path d="M15 5h3.5a2.5 2.5 0 0 1 0 5H15"></path>
    <path d="M19 12v6.5a2.5 2.5 0 0 1-5 0V12"></path>
  </svg>
);

// Card animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: delay,
      duration: 0.4,
      ease: "easeOut"
    } 
  })
};

/**
 * RecipeCard - Component for displaying a recipe card
 * 
 * @param {Object} props - Component props
 * @param {Object} props.recipe - Recipe data
 * @param {Function} props.onView - Function to handle viewing the recipe
 * @param {number} props.delay - Animation delay
 * @returns {JSX.Element} - Rendered component
 */
const RecipeCard = ({ recipe, onView, delay = 0 }) => {
  return (
    <Card 
      onClick={() => onView(recipe._id)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CardImage image={recipe.image}>
        {!recipe.image && (
          <ImagePlaceholder>
            <RecipeIcon />
          </ImagePlaceholder>
        )}
      </CardImage>
      <CardContent>
        <CardTitle>{recipe.name}</CardTitle>
        <MetaInfo>
          <span>{recipe.prepTime + recipe.cookTime} min</span>
          <span>{recipe.difficulty}</span>
        </MetaInfo>
        <TagContainer>
          {recipe.cuisine && <Tag>{recipe.cuisine}</Tag>}
          {recipe.dishType && <Tag>{recipe.dishType}</Tag>}
          {recipe.mealType && <Tag>{recipe.mealType}</Tag>}
        </TagContainer>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
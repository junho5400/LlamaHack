// client/src/components/features/recipes/RecipeDetailModal.jsx
import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 30px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: #333;
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  
  h3 {
    margin: 0;
    color: #4a6fa5;
    font-size: 24px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  
  svg {
    margin-right: 6px;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #4a6fa5;
  color: white;
  
  &:hover {
    background-color: #3a5a8f;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #e1f5fe;
  color: #4a6fa5;
  
  &:hover {
    background-color: #b3e5fc;
  }
`;

const DangerButton = styled(Button)`
  background-color: #f8d7da;
  color: #721c24;
  
  &:hover {
    background-color: #f5c2c7;
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 24px;
  
  h4 {
    color: #4a6fa5;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
    }
  }
`;

const IngredientList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 0;
  list-style: none;
`;

const IngredientItem = styled.li`
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #4a6fa5;
`;

const InstructionList = styled.ol`
  padding-left: 20px;
  
  li {
    margin-bottom: 15px;
    line-height: 1.6;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const NutritionItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  
  span:first-child {
    font-weight: bold;
    margin-bottom: 8px;
    color: #4a6fa5;
  }
  
  span:last-child {
    font-size: 20px;
    font-weight: 600;
  }
`;

const RecipeMetadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  
  div {
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 6px;
    }
  }
`;

// Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IngredientsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const InstructionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const NutritionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);

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

const DifficultyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// Modal animations
const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.4,
      type: "spring",
      damping: 25,
      stiffness: 300
    } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9, 
    transition: { duration: 0.3 } 
  }
};

/**
 * RecipeDetailModal - Modal component for displaying recipe details
 * 
 * @param {Object} props - Component props
 * @param {Object} props.recipe - Recipe data
 * @param {Function} props.onClose - Function to handle modal close
 * @param {Function} props.onRemove - Function to handle recipe removal
 * @param {Function} props.onCustomize - Function to handle recipe customization
 * @returns {JSX.Element} - Rendered component
 */
const RecipeDetailModal = ({ recipe, onClose, onRemove, onCustomize }) => {
  if (!recipe) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <ModalContent
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>×</CloseButton>
          
          <RecipeHeader>
            <h3>{recipe.name}</h3>
            <ButtonGroup>
              <PrimaryButton
                onClick={() => onCustomize(recipe)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EditIcon />
                Customize
              </PrimaryButton>
              <DangerButton
                onClick={() => onRemove(recipe._id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DeleteIcon />
                Remove
              </DangerButton>
            </ButtonGroup>
          </RecipeHeader>

          <RecipeSection>
            <h4><IngredientsIcon />Ingredients</h4>
            <IngredientList>
              {recipe.ingredients.map((ingredient, index) => (
                <IngredientItem key={index}>
                  {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
                </IngredientItem>
              ))}
            </IngredientList>
          </RecipeSection>

          <RecipeSection>
            <h4><InstructionsIcon />Instructions</h4>
            <InstructionList>
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </InstructionList>
          </RecipeSection>

          <RecipeSection>
            <h4><NutritionIcon />Nutrition Information</h4>
            <NutritionGrid>
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
              <NutritionItem>
                <span>Fat</span>
                <span>{recipe.nutrition?.fat || 'N/A'}g</span>
              </NutritionItem>
              <NutritionItem>
                <span>Fiber</span>
                <span>{recipe.nutrition?.fiber || 'N/A'}g</span>
              </NutritionItem>
            </NutritionGrid>
          </RecipeSection>

          <RecipeMetadata>
            <div>
              <ClockIcon />
              <span>Prep: {recipe.prepTime} min</span>
            </div>
            <div>
              <ClockIcon />
              <span>Cook: {recipe.cookTime} min</span>
            </div>
            <div>
              <ServingsIcon />
              <span>Servings: {recipe.servings}</span>
            </div>
            <div>
              <DifficultyIcon />
              <span>Difficulty: {recipe.difficulty}</span>
            </div>
          </RecipeMetadata>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default RecipeDetailModal;
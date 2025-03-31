// client/src/components/features/preferences/PreferencesForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import TagInput from './TagInput';
import SpiceLevelSelector from './SpiceLevelSelector';
import NutritionGoalsForm from './NutritionGoalsForm';
import Notification from '../../common/Notification';

// Import services and hooks
import { userService } from '../../../services/api';
import useErrorHandler from '../../../hooks/useErrorHandler';

// Styled components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    color: #4a6fa5;
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: #f9f9f9;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  svg {
    margin-right: 10px;
    color: #4a6fa5;
  }
  
  h3 {
    margin: 0;
    color: #4a6fa5;
    font-size: 20px;
  }
`;

const SectionDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const SaveButton = styled(motion.button)`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 8px;
  }
`;

// Icons
const AllergiesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
    <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
  </svg>
);

const DietaryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" />
    <rect x="5" y="7" width="14" height="10" rx="2" />
  </svg>
);

const FavoriteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const DislikeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 10 6-6m-6 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2Z" />
    <path d="M12 19c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 1.1.9 2 2 2Z" />
  </svg>
);

const CuisineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 18 4-6 4 6" />
    <path d="M12 9V2" />
    <path d="M20 22H4a9 9 0 0 1 16 0Z" />
  </svg>
);

const NutritionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.29 4.29 0 0 0 0-6.07 4.29 4.29 0 0 0-6.07 0c-2.86 2.86-6.36 12.73-6.36 12.73" />
    <path d="M15.42 15.41a4.29 4.29 0 0 0 6.07 0 4.29 4.29 0 0 0 0-6.07c-2.86-2.86-12.73-6.36-12.73-6.36s3.5 9.87 6.36 12.73Z" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/**
 * PreferencesForm - Component for managing user dietary preferences
 * @returns {JSX.Element} - Rendered component
 */
const PreferencesForm = () => {
  // State for form fields
  const [allergies, setAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState([]);
  const [dislikedIngredients, setDislikedIngredients] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [mealTypes, setMealTypes] = useState(['breakfast', 'lunch', 'dinner']);
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, handleError, showSuccess, clearError } = useErrorHandler();
  
  // Fetch user preferences on component mount
  useEffect(() => {
    fetchUserPreferences();
  }, []);
  
  // Fetch user preferences from API
  const fetchUserPreferences = async () => {
    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const { data } = await userService.getPreferences(user.id);
      
      // Update state with fetched preferences
      if (data) {
        setAllergies(data.allergies || []);
        setDietaryRestrictions(data.dietaryRestrictions || []);
        setFavoriteIngredients(data.favoriteIngredients || []);
        setDislikedIngredients(data.dislikedIngredients || []);
        setCuisinePreferences(data.cuisinePreferences || []);
        setSpiceLevel(data.spiceLevel || 'medium');
        setMealTypes(data.mealTypes || ['breakfast', 'lunch', 'dinner']);
        setNutritionGoals(data.nutritionGoals || {
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        });
      }
    } catch (error) {
      handleError(error, 'Failed to load preferences');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found. Please log in again.');
      }
      
      const user = JSON.parse(userStr);
      
      // Format nutrition goals to ensure numbers
      const formattedNutritionGoals = {
        calories: nutritionGoals.calories ? Number(nutritionGoals.calories) : undefined,
        protein: nutritionGoals.protein ? Number(nutritionGoals.protein) : undefined,
        carbs: nutritionGoals.carbs ? Number(nutritionGoals.carbs) : undefined,
        fat: nutritionGoals.fat ? Number(nutritionGoals.fat) : undefined
      };
      
      // Prepare preferences data
      const preferencesData = {
        allergies,
        dietaryRestrictions,
        favoriteIngredients,
        dislikedIngredients,
        cuisinePreferences,
        spiceLevel,
        mealTypes,
        nutritionGoals: formattedNutritionGoals
      };
      
      // Send update request
      await userService.updatePreferences(user.id, preferencesData);
      
      // Show success message
      showSuccess('Preferences saved successfully!');
    } catch (error) {
      handleError(error, 'Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      <FormHeader>
        <h2>Your Dietary Preferences</h2>
        <p>Customize your food preferences to get personalized recipe recommendations</p>
      </FormHeader>
      
      <form onSubmit={handleSubmit}>
        <FormSection>
          <SectionHeader>
            <AllergiesIcon />
            <h3>Allergies</h3>
          </SectionHeader>
          <SectionDescription>
            Add any food allergies you have. Our AI assistant will avoid suggesting recipes with these ingredients.
          </SectionDescription>
          <TagInput
            tags={allergies}
            setTags={setAllergies}
            placeholder="Add an allergy (e.g., peanuts, shellfish)"
            suggestions={['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Fish', 'Shellfish', 'Soy', 'Wheat', 'Gluten']}
          />
        </FormSection>
        
        <FormSection>
          <SectionHeader>
            <DietaryIcon />
            <h3>Dietary Restrictions</h3>
          </SectionHeader>
          <SectionDescription>
            Add any dietary restrictions or specific diets you follow. Our AI will tailor recipes to match these requirements.
          </SectionDescription>
          <TagInput
            tags={dietaryRestrictions}
            setTags={setDietaryRestrictions}
            placeholder="Add a dietary restriction (e.g., vegetarian, vegan, keto)"
            suggestions={['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Low Carb', 'Low Fat', 'Low Sodium', 'Gluten Free', 'Dairy Free']}
          />
        </FormSection>
        
        <FormSection>
          <SectionHeader>
            <FavoriteIcon />
            <h3>Favorite Ingredients</h3>
          </SectionHeader>
          <SectionDescription>
            Add ingredients you love. Our AI will prioritize recipes that include these ingredients.
          </SectionDescription>
          <TagInput
            tags={favoriteIngredients}
            setTags={setFavoriteIngredients}
            placeholder="Add a favorite ingredient (e.g., garlic, avocado)"
          />
        </FormSection>
        
        <FormSection>
          <SectionHeader>
            <DislikeIcon />
            <h3>Disliked Ingredients</h3>
          </SectionHeader>
          <SectionDescription>
            Add ingredients you dislike. Our AI will try to avoid recipes that include these ingredients.
          </SectionDescription>
          <TagInput
            tags={dislikedIngredients}
            setTags={setDislikedIngredients}
            placeholder="Add a disliked ingredient (e.g., cilantro, olives)"
          />
        </FormSection>
        
        <FormSection>
          <SectionHeader>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <path d="m16 6 6-6" />
              <path d="M17 14v-4h-4" />
              <path d="M21 14h-4" />
              <path d="M14 17h-4" />
              <path d="M14 21h-4" />
            </svg>
            <h3>Spice Preference</h3>
          </SectionHeader>
          <SectionDescription>
            Set your preferred level of spiciness in recipes.
          </SectionDescription>
          <SpiceLevelSelector
            value={spiceLevel}
            onChange={setSpiceLevel}
          />
        </FormSection>
        
        <FormSection>
          <SectionHeader>
            <NutritionIcon />
            <h3>Nutrition Goals</h3>
          </SectionHeader>
          <SectionDescription>
            Set your daily nutrition goals to receive recipe recommendations that align with your dietary needs.
          </SectionDescription>
          <NutritionGoalsForm
            nutritionGoals={nutritionGoals}
            setNutritionGoals={setNutritionGoals}
          />
        </FormSection>
        
        <ButtonContainer>
          <SaveButton
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
          >
            <SaveIcon />
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </SaveButton>
        </ButtonContainer>
      </form>
      
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearError}
          />
        )}
      </AnimatePresence>
    </FormContainer>
  );
};

export default PreferencesForm;
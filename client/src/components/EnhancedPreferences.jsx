import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components with improved design
const PreferencesContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const SectionContainer = styled.div`
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: #f9f9f9;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  svg {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    color: #4a6fa5;
  }
  
  h3 {
    color: #4a6fa5;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`;

const InputContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
  
  &:focus {
    border-color: #4a6fa5;
    box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
  }
`;

const AddButton = styled(motion.button)`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 18px;
  margin-left: 10px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const Tag = styled(motion.div)`
  background-color: #e1f5fe;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  font-size: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const DeleteButton = styled(motion.button)`
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  margin-left: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SaveButton = styled(motion.button)`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Notification = styled(motion.div)`
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
`;

const PreferenceInfo = styled.div`
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 8px;
  border-left: 4px solid #4a6fa5;
  font-size: 14px;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  font-size: 15px;
  color: #666;
  font-style: italic;
`;

// Icons
const AllergiesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z" />
    <path d="m4.93 4.93 14.14 14.14" />
  </svg>
);

const DietaryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);

const FavoriteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const DislikeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z" />
    <line x1="16" x2="8" y1="8" y2="16" />
    <line x1="8" x2="16" y1="8" y2="16" />
  </svg>
);

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// Animation variants
const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Main component
const EnhancedPreferences = () => {
  const [allergies, setAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState([]);
  const [dislikedIngredients, setDislikedIngredients] = useState([]);
  
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newFavoriteIngredient, setNewFavoriteIngredient] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, text: '', type: '' });
  
  // Get user ID from localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };
  
  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // Make sure the token is included in the request
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Please log in to view and save preferences', 'error');
          return;
        }
        
        const response = await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const { preferences } = response.data.user;
        
        if (preferences) {
          setAllergies(preferences.allergies || []);
          setDietaryRestrictions(preferences.dietaryRestrictions || []);
          setFavoriteIngredients(preferences.favoriteIngredients || []);
          setDislikedIngredients(preferences.dislikedIngredients || []);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        showNotification(`Failed to load preferences: ${error.response?.data?.error || error.message}`, 'error');
      }
    };
    
    fetchPreferences();
  }, []);
  
  // Helper to show notifications
  const showNotification = (text, type) => {
    setNotification({ show: true, text, type });
    
    // Hide after 4 seconds
    setTimeout(() => {
      setNotification({ show: false, text: '', type: '' });
    }, 4000);
  };
  
  // Save preferences
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const userId = getUserId();
    if (!userId) {
      showNotification('You must be logged in to save preferences', 'error');
      setIsSaving(false);
      return;
    }
    
    try {
      await axios.put(`/users/${userId}/preferences`, {
        allergies,
        dietaryRestrictions,
        favoriteIngredients,
        dislikedIngredients
      });
      
      showNotification('Preferences saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showNotification('Failed to save preferences. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add functions
  const addAllergy = (e) => {
    e.preventDefault();
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };
  
  const addDietaryRestriction = (e) => {
    e.preventDefault();
    if (newDietaryRestriction.trim() && !dietaryRestrictions.includes(newDietaryRestriction.trim())) {
      setDietaryRestrictions([...dietaryRestrictions, newDietaryRestriction.trim()]);
      setNewDietaryRestriction('');
    }
  };
  
  const addFavoriteIngredient = (e) => {
    e.preventDefault();
    if (newFavoriteIngredient.trim() && !favoriteIngredients.includes(newFavoriteIngredient.trim())) {
      setFavoriteIngredients([...favoriteIngredients, newFavoriteIngredient.trim()]);
      setNewFavoriteIngredient('');
    }
  };
  
  const addDislikedIngredient = (e) => {
    e.preventDefault();
    if (newDislikedIngredient.trim() && !dislikedIngredients.includes(newDislikedIngredient.trim())) {
      setDislikedIngredients([...dislikedIngredients, newDislikedIngredient.trim()]);
      setNewDislikedIngredient('');
    }
  };
  
  // Remove functions
  const removeAllergy = (allergy) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };
  
  const removeDietaryRestriction = (restriction) => {
    setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
  };
  
  const removeFavoriteIngredient = (ingredient) => {
    setFavoriteIngredients(favoriteIngredients.filter(i => i !== ingredient));
  };
  
  const removeDislikedIngredient = (ingredient) => {
    setDislikedIngredients(dislikedIngredients.filter(i => i !== ingredient));
  };
  
  return (
    <PreferencesContainer>
      <Header>
        <h2>Your Dietary Preferences</h2>
        <p>Customize your food preferences to get personalized recipe recommendations</p>
      </Header>
      
      <Form onSubmit={handleSave}>
        <SectionContainer>
          <SectionHeader>
            <AllergiesIcon />
            <h3>Allergies</h3>
          </SectionHeader>
          
          <PreferenceInfo>
            Add any food allergies you have. The AI assistant will avoid suggesting recipes with these ingredients.
          </PreferenceInfo>
          
          <AnimatePresence>
            {allergies.length > 0 ? (
              <TagsContainer>
                {allergies.map((allergy, index) => (
                  <Tag 
                    key={allergy} 
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tagVariants}
                    layout
                  >
                    {allergy}
                    <DeleteButton 
                      onClick={() => removeAllergy(allergy)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </DeleteButton>
                  </Tag>
                ))}
              </TagsContainer>
            ) : (
              <EmptyState>No allergies added yet</EmptyState>
            )}
          </AnimatePresence>
          
          <InputContainer>
            <Input
              type="text"
              placeholder="Add an allergy (e.g., peanuts, shellfish)"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
            />
            <AddButton 
              type="button" 
              onClick={addAllergy}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <AddIcon />
              Add
            </AddButton>
          </InputContainer>
        </SectionContainer>
        
        <SectionContainer>
          <SectionHeader>
            <DietaryIcon />
            <h3>Dietary Restrictions</h3>
          </SectionHeader>
          
          <PreferenceInfo>
            Add any dietary restrictions or specific diets you follow. The AI will tailor recipes to match these requirements.
          </PreferenceInfo>
          
          <AnimatePresence>
            {dietaryRestrictions.length > 0 ? (
              <TagsContainer>
                {dietaryRestrictions.map((restriction) => (
                  <Tag 
                    key={restriction}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tagVariants}
                    layout
                  >
                    {restriction}
                    <DeleteButton 
                      onClick={() => removeDietaryRestriction(restriction)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </DeleteButton>
                  </Tag>
                ))}
              </TagsContainer>
            ) : (
              <EmptyState>No dietary restrictions added yet</EmptyState>
            )}
          </AnimatePresence>
          
          <InputContainer>
            <Input
              type="text"
              placeholder="Add a dietary restriction (e.g., vegetarian, vegan, keto)"
              value={newDietaryRestriction}
              onChange={(e) => setNewDietaryRestriction(e.target.value)}
            />
            <AddButton 
              type="button" 
              onClick={addDietaryRestriction}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <AddIcon />
              Add
            </AddButton>
          </InputContainer>
        </SectionContainer>
        
        <SectionContainer>
          <SectionHeader>
            <FavoriteIcon />
            <h3>Favorite Ingredients</h3>
          </SectionHeader>
          
          <PreferenceInfo>
            Add ingredients you love. The AI will prioritize recipes that include these ingredients.
          </PreferenceInfo>
          
          <AnimatePresence>
            {favoriteIngredients.length > 0 ? (
              <TagsContainer>
                {favoriteIngredients.map((ingredient) => (
                  <Tag 
                    key={ingredient}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tagVariants}
                    layout
                  >
                    {ingredient}
                    <DeleteButton 
                      onClick={() => removeFavoriteIngredient(ingredient)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </DeleteButton>
                  </Tag>
                ))}
              </TagsContainer>
            ) : (
              <EmptyState>No favorite ingredients added yet</EmptyState>
            )}
          </AnimatePresence>
          
          <InputContainer>
            <Input
              type="text"
              placeholder="Add a favorite ingredient (e.g., garlic, avocado)"
              value={newFavoriteIngredient}
              onChange={(e) => setNewFavoriteIngredient(e.target.value)}
            />
            <AddButton 
              type="button" 
              onClick={addFavoriteIngredient}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <AddIcon />
              Add
            </AddButton>
          </InputContainer>
        </SectionContainer>
        
        <SectionContainer>
          <SectionHeader>
            <DislikeIcon />
            <h3>Disliked Ingredients</h3>
          </SectionHeader>
          
          <PreferenceInfo>
            Add ingredients you dislike. The AI will try to avoid recipes that include these ingredients.
          </PreferenceInfo>
          
          <AnimatePresence>
            {dislikedIngredients.length > 0 ? (
              <TagsContainer>
                {dislikedIngredients.map((ingredient) => (
                  <Tag 
                    key={ingredient}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tagVariants}
                    layout
                  >
                    {ingredient}
                    <DeleteButton 
                      onClick={() => removeDislikedIngredient(ingredient)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </DeleteButton>
                  </Tag>
                ))}
              </TagsContainer>
            ) : (
              <EmptyState>No disliked ingredients added yet</EmptyState>
            )}
          </AnimatePresence>
          
          <InputContainer>
            <Input
              type="text"
              placeholder="Add a disliked ingredient (e.g., cilantro, olives)"
              value={newDislikedIngredient}
              onChange={(e) => setNewDislikedIngredient(e.target.value)}
            />
            <AddButton 
              type="button" 
              onClick={addDislikedIngredient}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <AddIcon />
              Add
            </AddButton>
          </InputContainer>
        </SectionContainer>
        
        <SaveButton 
          type="submit" 
          disabled={isSaving}
          whileHover={!isSaving ? "hover" : undefined}
          whileTap={!isSaving ? "tap" : undefined}
          variants={buttonVariants}
        >
          <SaveIcon />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </SaveButton>
        
        <AnimatePresence>
          {notification.show && (
            <Notification
              type={notification.type}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={notificationVariants}
            >
              {notification.text}
            </Notification>
          )}
        </AnimatePresence>
      </Form>
    </PreferencesContainer>
  );
};

export default EnhancedPreferences;
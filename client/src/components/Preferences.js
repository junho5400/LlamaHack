// client/src/components/Preferences.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const PreferencesContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  color: #4a6fa5;
  margin: 20px 0 10px;
`;

const InputContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const AddButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin-left: 10px;
  cursor: pointer;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tag = styled.div`
  background-color: #e1f5fe;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
`;

const SaveButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
`;

const MessageBox = styled.div`
  padding: 10px;
  text-align: center;
  margin-top: 15px;
  border-radius: 4px;
  background-color: ${props => props.type === 'success' ? '#dff0d8' : '#f2dede'};
  color: ${props => props.type === 'success' ? '#3c763d' : '#a94442'};
`;

const Preferences = () => {
  const [allergies, setAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState([]);
  const [dislikedIngredients, setDislikedIngredients] = useState([]);
  
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newFavoriteIngredient, setNewFavoriteIngredient] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
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
        console.log("Fetching preferences");
        const response = await axios.get('/auth/me');
        console.log("Auth response:", response.data);
        
        const { preferences } = response.data.user;
        console.log("User preferences:", preferences);
        
        if (preferences) {
          setAllergies(preferences.allergies || []);
          setDietaryRestrictions(preferences.dietaryRestrictions || []);
          setFavoriteIngredients(preferences.favoriteIngredients || []);
          setDislikedIngredients(preferences.dislikedIngredients || []);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setMessage({ 
          text: 'Failed to load preferences. Please try again later.', 
          type: 'error' 
        });
      }
    };
    
    fetchPreferences();
  }, []);
  
  // Save preferences
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    const userId = getUserId();
    if (!userId) {
      setMessage({ text: 'You must be logged in to save preferences', type: 'error' });
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
      
      setMessage({ 
        text: 'Preferences saved successfully!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ 
        text: 'Failed to save preferences. Please try again.', 
        type: 'error' 
      });
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
      <h2>Your Preferences</h2>
      <p>Set your dietary preferences and allergies to get personalized recipe recommendations.</p>
      
      <Form onSubmit={handleSave}>
        <SectionTitle>Allergies</SectionTitle>
        <TagsContainer>
          {allergies.map((allergy, index) => (
            <Tag key={index}>
              {allergy}
              <DeleteButton type="button" onClick={() => removeAllergy(allergy)}>×</DeleteButton>
            </Tag>
          ))}
        </TagsContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="Add an allergy (e.g., peanuts, shellfish)"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
          />
          <AddButton type="button" onClick={addAllergy}>Add</AddButton>
        </InputContainer>
        
        <SectionTitle>Dietary Restrictions</SectionTitle>
        <TagsContainer>
          {dietaryRestrictions.map((restriction, index) => (
            <Tag key={index}>
              {restriction}
              <DeleteButton type="button" onClick={() => removeDietaryRestriction(restriction)}>×</DeleteButton>
            </Tag>
          ))}
        </TagsContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="Add a dietary restriction (e.g., vegetarian, vegan)"
            value={newDietaryRestriction}
            onChange={(e) => setNewDietaryRestriction(e.target.value)}
          />
          <AddButton type="button" onClick={addDietaryRestriction}>Add</AddButton>
        </InputContainer>
        
        <SectionTitle>Favorite Ingredients</SectionTitle>
        <TagsContainer>
          {favoriteIngredients.map((ingredient, index) => (
            <Tag key={index}>
              {ingredient}
              <DeleteButton type="button" onClick={() => removeFavoriteIngredient(ingredient)}>×</DeleteButton>
            </Tag>
          ))}
        </TagsContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="Add a favorite ingredient"
            value={newFavoriteIngredient}
            onChange={(e) => setNewFavoriteIngredient(e.target.value)}
          />
          <AddButton type="button" onClick={addFavoriteIngredient}>Add</AddButton>
        </InputContainer>
        
        <SectionTitle>Disliked Ingredients</SectionTitle>
        <TagsContainer>
          {dislikedIngredients.map((ingredient, index) => (
            <Tag key={index}>
              {ingredient}
              <DeleteButton type="button" onClick={() => removeDislikedIngredient(ingredient)}>×</DeleteButton>
            </Tag>
          ))}
        </TagsContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="Add a disliked ingredient"
            value={newDislikedIngredient}
            onChange={(e) => setNewDislikedIngredient(e.target.value)}
          />
          <AddButton type="button" onClick={addDislikedIngredient}>Add</AddButton>
        </InputContainer>
        
        <SaveButton type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </SaveButton>
        
        {message.text && (
          <MessageBox type={message.type}>
            {message.text}
          </MessageBox>
        )}
      </Form>
    </PreferencesContainer>
  );
};

export default Preferences;
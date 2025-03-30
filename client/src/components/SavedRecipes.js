// client/src/components/SavedRecipes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const SavedRecipesContainer = styled.div`
  padding: 20px;
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const RecipeCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const RecipeTitle = styled.h3`
  color: #4a6fa5;
  margin-bottom: 10px;
`;

const RecipeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
`;

const ViewButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #3a5a8f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const SavedRecipes = ({ userId }) => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const navigate = useNavigate();

  const handleViewRecipe = (recipeId) => {
    setSelectedRecipe(recipes.find(r => r._id === recipeId));
    setShowRecipeModal(true);
  };
  
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        console.log('Fetching saved recipes for user ID:', userId);
        
        const response = await axios.get(`/users/${userId}/recipes`);
        console.log('Saved recipes response:', response.data);
        
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        console.error('Error details:', error.response?.data);
        setError('Failed to load saved recipes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchSavedRecipes();
    } else {
      setIsLoading(false);
      setError('User ID not found. Please log in again.');
    }
  }, [userId]);
  
  if (isLoading) {
    return <LoadingSpinner>Loading your saved recipes...</LoadingSpinner>;
  }
  
  if (error) {
    return <EmptyState>{error}</EmptyState>;
  }
  
  if (recipes.length === 0) {
    return (
      <SavedRecipesContainer>
        <h2>Your Saved Recipes</h2>
        <EmptyState>
          <p>You haven't saved any recipes yet.</p>
          <p>Start chatting with the assistant to discover and save recipes!</p>
        </EmptyState>
      </SavedRecipesContainer>
    );
  }
  
  return (
    <SavedRecipesContainer>
      <h2>Your Saved Recipes</h2>
      <RecipeGrid>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id}>
            <RecipeTitle>{recipe.name || "Custom Recipe"}</RecipeTitle>
            <RecipeInfo>
              <span>Prep: {recipe.prepTime} min</span>
              <span>Cook: {recipe.cookTime} min</span>
              <span>Difficulty: {recipe.difficulty}</span>
            </RecipeInfo>
            <RecipeInfo>
              <span>Calories: {recipe.nutrition?.calories || 'N/A'}</span>
              <span>Protein: {recipe.nutrition?.protein || 'N/A'}g</span>
            </RecipeInfo>
            <ViewButton onClick={() => handleViewRecipe(recipe._id)}>
              View Recipe
            </ViewButton>
          </RecipeCard>
        ))}
      </RecipeGrid>
      
      {showRecipeModal && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setShowRecipeModal(false)} 
        />
      )}
    </SavedRecipesContainer>
  );
};

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{
            float: 'right',
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        
        <h2 style={{ color: '#4a6fa5', marginBottom: '20px' }}>{recipe.name}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#4a6fa5' }}>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
              </li>
            ))}
          </ul>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#4a6fa5' }}>Instructions</h3>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#4a6fa5' }}>Nutrition Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <strong>Calories</strong><br />
              {recipe.nutrition?.calories || 'N/A'}
            </div>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <strong>Protein</strong><br />
              {recipe.nutrition?.protein || 'N/A'}g
            </div>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <strong>Carbs</strong><br />
              {recipe.nutrition?.carbs || 'N/A'}g
            </div>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <strong>Fat</strong><br />
              {recipe.nutrition?.fat || 'N/A'}g
            </div>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <strong>Fiber</strong><br />
              {recipe.nutrition?.fiber || 'N/A'}g
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
          <span>Prep Time: {recipe.prepTime} min</span>
          <span>Cook Time: {recipe.cookTime} min</span>
          <span>Servings: {recipe.servings}</span>
          <span>Difficulty: {recipe.difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;
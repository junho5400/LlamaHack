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
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get(`/users/${userId}/recipes`);
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        setError('Failed to load saved recipes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedRecipes();
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
            <RecipeTitle>{recipe.name}</RecipeTitle>
            <RecipeInfo>
              <span>Prep: {recipe.prepTime} min</span>
              <span>Cook: {recipe.cookTime} min</span>
              <span>Difficulty: {recipe.difficulty}</span>
            </RecipeInfo>
            <RecipeInfo>
              <span>Calories: {recipe.nutrition?.calories || 'N/A'}</span>
              <span>Protein: {recipe.nutrition?.protein || 'N/A'}g</span>
            </RecipeInfo>
            <ViewButton onClick={() => navigate(`/recipes/${recipe._id}`)}>
              View Recipe
            </ViewButton>
          </RecipeCard>
        ))}
      </RecipeGrid>
    </SavedRecipesContainer>
  );
};

export default SavedRecipes;
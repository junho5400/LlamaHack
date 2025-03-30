// client/src/components/RecipeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const RecipeDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4a6fa5;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RecipeTitle = styled.h2`
  color: #4a6fa5;
  margin-bottom: 5px;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
`;

const RecipeImage = styled.div`
  height: 300px;
  background-color: #f0f0f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #4a6fa5;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 15px;
`;

const IngredientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const IngredientItem = styled.div`
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
`;

const StepItem = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const StepNumber = styled.div`
  background-color: #4a6fa5;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
`;

const StepText = styled.div`
  flex: 1;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const NutritionCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  
  span:first-child {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #4a6fa5;
  }
  
  span:last-child {
    font-size: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/recipes/${recipeId}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecipe();
  }, [recipeId]);
  
  if (isLoading) {
    return (
      <RecipeDetailContainer>
        <LoadingContainer>Loading recipe...</LoadingContainer>
      </RecipeDetailContainer>
    );
  }
  
  if (error) {
    return (
      <RecipeDetailContainer>
        <BackButton onClick={() => navigate(-1)}>← Back to recipes</BackButton>
        <div>{error}</div>
      </RecipeDetailContainer>
    );
  }
  
  if (!recipe) {
    return (
      <RecipeDetailContainer>
        <BackButton onClick={() => navigate(-1)}>← Back to recipes</BackButton>
        <div>Recipe not found.</div>
      </RecipeDetailContainer>
    );
  }
  
  return (
    <RecipeDetailContainer>
      <BackButton onClick={() => navigate(-1)}>← Back to recipes</BackButton>
      
      <RecipeTitle>{recipe.name}</RecipeTitle>
      <RecipeMeta>
        <span>Prep: {recipe.prepTime} min</span>
        <span>Cook: {recipe.cookTime} min</span>
        <span>Total: {recipe.prepTime + recipe.cookTime} min</span>
        <span>Servings: {recipe.servings}</span>
        <span>Difficulty: {recipe.difficulty}</span>
      </RecipeMeta>
      
      {recipe.image ? (
        <RecipeImage>
          <img src={recipe.image} alt={recipe.name} />
        </RecipeImage>
      ) : (
        <RecipeImage>
          <span>No image available</span>
        </RecipeImage>
      )}
      
      <RecipeSection>
        <SectionTitle>Ingredients</SectionTitle>
        <IngredientsGrid>
          {recipe.ingredients.map((ingredient, index) => (
            <IngredientItem key={index}>
              {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
            </IngredientItem>
          ))}
        </IngredientsGrid>
      </RecipeSection>
      
      <RecipeSection>
        <SectionTitle>Instructions</SectionTitle>
        {recipe.instructions.map((step, index) => (
          <StepItem key={index}>
            <StepNumber>{index + 1}</StepNumber>
            <StepText>{step}</StepText>
          </StepItem>
        ))}
      </RecipeSection>
      
      <RecipeSection>
        <SectionTitle>Nutrition Information</SectionTitle>
        <NutritionGrid>
          <NutritionCard>
            <span>Calories</span>
            <span>{recipe.nutrition?.calories || 'N/A'}</span>
          </NutritionCard>
          <NutritionCard>
            <span>Protein</span>
            <span>{recipe.nutrition?.protein || 'N/A'}g</span>
          </NutritionCard>
          <NutritionCard>
            <span>Carbs</span>
            <span>{recipe.nutrition?.carbs || 'N/A'}g</span>
          </NutritionCard>
          <NutritionCard>
            <span>Fat</span>
            <span>{recipe.nutrition?.fat || 'N/A'}g</span>
          </NutritionCard>
          <NutritionCard>
            <span>Fiber</span>
            <span>{recipe.nutrition?.fiber || 'N/A'}g</span>
          </NutritionCard>
        </NutritionGrid>
      </RecipeSection>
    </RecipeDetailContainer>
  );
};

export default RecipeDetail;
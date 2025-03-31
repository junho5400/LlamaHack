import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeCard from './RecipeCard';

// Styled components with improved design
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    color: #4a6fa5;
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 18px;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FiltersContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const FilterLabel = styled.div`
  font-weight: 500;
  color: #4a6fa5;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 15px;
  outline: none;
  
  &:focus {
    border-color: #4a6fa5;
  }
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex: 1;
  min-width: 250px;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #4a6fa5;
  }
`;

const ClearFiltersButton = styled(motion.button)`
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
  
  h3 {
    color: #4a6fa5;
    margin-bottom: 15px;
  }
  
  p {
    color: #666;
    margin-bottom: 25px;
  }
`;

const ActionButton = styled(motion.button)`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin: 0 auto;
  
  svg {
    margin-right: 8px;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c5d1e5;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #4a6fa5;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const RecipeDetail = styled.div`
  h2 {
    color: #4a6fa5;
    margin-bottom: 20px;
    padding-right: 40px;
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 30px;
  
  h3 {
    color: #4a6fa5;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    font-weight: 600;
    
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
    line-height: 1.5;
    position: relative;
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
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a6fa5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Notification = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
`;

// Icons
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IngredientsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

// Animation variants
const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalContentVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
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
    y: 50,
    scale: 0.95,
    transition: { 
      duration: 0.3 
    }
  }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const notificationVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.3 } }
};

// Main component
const EnhancedSavedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, text: '', type: '' });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  
  const navigate = useNavigate();
  
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
  
  // Helper to show notifications
  const showNotification = (text, type) => {
    setNotification({ show: true, text, type });
    
    // Hide after 4 seconds
    setTimeout(() => {
      setNotification({ show: false, text: '', type: '' });
    }, 4000);
  };
  
  // Fetch saved recipes
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(`/users/${userId}/recipes`);
        setRecipes(response.data);
        setFilteredRecipes(response.data);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        showNotification('Failed to load recipes', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedRecipes();
  }, []);
  
  // Apply filters when filter states change
  useEffect(() => {
    let filtered = [...recipes];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(recipe => recipe.difficulty === difficultyFilter);
    }
    
    // Apply cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine === cuisineFilter || 
        recipe.tags?.includes(cuisineFilter.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOption) {
      switch(sortOption) {
        case 'name_asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'calories_asc':
          filtered.sort((a, b) => (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0));
          break;
        case 'calories_desc':
          filtered.sort((a, b) => (b.nutrition?.calories || 0) - (a.nutrition?.calories || 0));
          break;
        case 'protein_desc':
          filtered.sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));
          break;
        case 'time_asc':
          filtered.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
          break;
        default:
          break;
      }
    }
    
    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, difficultyFilter, cuisineFilter, sortOption]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setCuisineFilter('');
    setSortOption('');
  };
  
  // Extract unique cuisines for the filter dropdown
  const uniqueCuisines = [...new Set(recipes
    .filter(recipe => recipe.cuisine)
    .map(recipe => recipe.cuisine)
  )];
  
  // Handle recipe view
  const handleViewRecipe = (recipeId) => {
    const recipe = recipes.find(r => r._id === recipeId);
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300); // delay to allow exit animation
  };
  
  // Handle recipe removal
  const handleRemoveRecipe = async (recipeId) => {
    try {
      const userId = getUserId();
      if (!userId) return;
      
      await axios.delete(`/users/${userId}/recipes/${recipeId}`);
      
      setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      showNotification('Recipe removed successfully', 'success');
      
      if (isModalOpen && selectedRecipe?._id === recipeId) {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error removing recipe:', error);
      showNotification('Failed to remove recipe', 'error');
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <Header>
          <h2>Your Saved Recipes</h2>
          <p>Loading your culinary collection...</p>
        </Header>
        <LoadingContainer>
          <Spinner />
          <p>Loading your recipes...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  if (recipes.length === 0) {
    return (
      <PageContainer>
        <Header>
          <h2>Your Saved Recipes</h2>
          <p>Your personal collection of favorite recipes</p>
        </Header>
        <EmptyState>
          <h3>No Saved Recipes Yet</h3>
          <p>Start chatting with the AI Assistant to discover and save delicious recipes!</p>
          <ActionButton
            onClick={() => navigate('/chat')}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <ChatIcon />
            Chat with AI Assistant
          </ActionButton>
        </EmptyState>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header>
        <h2>Your Saved Recipes</h2>
        <p>Your personal collection of favorite recipes</p>
      </Header>
      
      <FiltersContainer>
        <FilterLabel>
          <FilterIcon />
          Filters:
        </FilterLabel>
        
        <SearchInput
          type="text"
          placeholder="Search by name, ingredient, or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </FilterSelect>
        
        <FilterSelect
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
        >
          <option value="">All Cuisines</option>
          {uniqueCuisines.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="calories_asc">Calories (Low to High)</option>
          <option value="calories_desc">Calories (High to Low)</option>
          <option value="protein_desc">Protein (High to Low)</option>
          <option value="time_asc">Total Time (Quick First)</option>
        </FilterSelect>
        
        {(searchTerm || difficultyFilter || cuisineFilter || sortOption) && (
          <ClearFiltersButton
            onClick={clearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ClearIcon />
            Clear Filters
          </ClearFiltersButton>
        )}
      </FiltersContainer>
      
      {filteredRecipes.length === 0 ? (
        <EmptyState>
          <h3>No Matches Found</h3>
          <p>Try changing your search or filter criteria</p>
          <ActionButton
            onClick={clearFilters}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <ClearIcon />
            Clear Filters
          </ActionButton>
        </EmptyState>
      ) : (
        <RecipeGrid>
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard 
              key={recipe._id}
              recipe={recipe}
              onView={handleViewRecipe}
              delay={index * 0.05}
            />
          ))}
        </RecipeGrid>
      )}
      
      <AnimatePresence>
        {isModalOpen && selectedRecipe && (
          <Modal
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            onClick={handleCloseModal}
          >
            <ModalContent
              variants={modalContentVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton 
                onClick={handleCloseModal}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </CloseButton>
              
              <RecipeDetail>
                <h2>{selectedRecipe.name}</h2>
                
                <RecipeSection>
                  <h3><IngredientsIcon />Ingredients</h3>
                  <IngredientList>
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <IngredientItem key={index}>
                        {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
                      </IngredientItem>
                    ))}
                  </IngredientList>
                </RecipeSection>
                
                <RecipeSection>
                  <h3><InstructionsIcon />Instructions</h3>
                  <InstructionList>
                    {selectedRecipe.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </InstructionList>
                </RecipeSection>
                
                <RecipeSection>
                  <h3><NutritionIcon />Nutrition Information</h3>
                  <NutritionGrid>
                    <NutritionItem>
                      <span>Calories</span>
                      <span>{selectedRecipe.nutrition?.calories || 'N/A'}</span>
                    </NutritionItem>
                    <NutritionItem>
                      <span>Protein</span>
                      <span>{selectedRecipe.nutrition?.protein || 'N/A'}g</span>
                    </NutritionItem>
                    <NutritionItem>
                      <span>Carbs</span>
                      <span>{selectedRecipe.nutrition?.carbs || 'N/A'}g</span>
                    </NutritionItem>
                    <NutritionItem>
                      <span>Fat</span>
                      <span>{selectedRecipe.nutrition?.fat || 'N/A'}g</span>
                    </NutritionItem>
                    <NutritionItem>
                      <span>Fiber</span>
                      <span>{selectedRecipe.nutrition?.fiber || 'N/A'}g</span>
                    </NutritionItem>
                  </NutritionGrid>
                </RecipeSection>
                
                <RecipeMetadata>
                  <div>
                    <ClockIcon />
                    <span>Prep: {selectedRecipe.prepTime} min</span>
                  </div>
                  <div>
                    <ClockIcon />
                    <span>Cook: {selectedRecipe.cookTime} min</span>
                  </div>
                  <div>
                    <ServingsIcon />
                    <span>Servings: {selectedRecipe.servings}</span>
                  </div>
                  <div>
                    <DifficultyIcon />
                    <span>Difficulty: {selectedRecipe.difficulty}</span>
                  </div>
                </RecipeMetadata>
                
                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                  <ActionButton
                    onClick={() => handleRemoveRecipe(selectedRecipe._id)}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    style={{ 
                      backgroundColor: '#dc3545', 
                      marginRight: '10px' 
                    }}
                  >
                    <ClearIcon />
                    Remove Recipe
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => {
                      handleCloseModal();
                      navigate('/chat', { 
                        state: { 
                          initialMessage: `I'd like to cook ${selectedRecipe.name} again but with some modifications.` 
                        }
                      });
                    }}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <ChatIcon />
                    Customize Recipe
                  </ActionButton>
                </div>
              </RecipeDetail>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
      
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
    </PageContainer>
  );
};

export default EnhancedSavedRecipes;
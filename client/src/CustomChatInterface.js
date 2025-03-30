import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Styled components for the chat interface
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
`;

const ChatHeader = styled.div`
  text-align: center;
  padding: 15px;
  background-color: #4a6fa5;
  color: white;
  border-radius: 10px 10px 0 0;
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ChatFooter = styled.div`
  display: flex;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 0 0 10px 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: #4a6fa5;
  }
`;

const SendButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #3a5a8f;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-line;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #dcf8c6;
  ` : `
    align-self: flex-start;
    background-color: #f0f0f0;
  `}
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  align-self: flex-start;
`;

const OptionButton = styled.button`
  background-color: #e1f5fe;
  border: 1px solid #81d4fa;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #b3e5fc;
  }
`;

// Add these styled components to your existing styled components section
const RecipeContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 15px 0;
  align-self: stretch;
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #4a6fa5;
  }
`;

const SaveRecipeButton = styled.button`
  background-color: ${props => props.disabled ? '#cccccc' : '#4a6fa5'};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#3a5a8f'};
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 20px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #4a6fa5;
  }
  
  ul, ol {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const NutritionItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  
  span:first-child {
    font-weight: bold;
    margin-bottom: 5px;
  }
`;

const RecipeMetadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
`;

const ErrorNotification = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 5px;
  margin: 10px 0;
  align-self: center;
`;

const SuccessNotification = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 10px 15px;
  border-radius: 5px;
  margin: 10px 0;
  align-self: center;
`;

const CustomChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [options, setOptions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietaryRestrictions: []
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [systemInstructions, setSystemInstructions] = useState(`
    You are a culinary assistant that helps users find recipes, customize them, and create their own recipes.
    
    Follow this workflow:
    1. When a user asks for a type of dish, offer 4-5 specific options, always including "Create my own recipe"
    2. If they select a specific recipe, provide detailed ingredients, steps, and nutrition info
    3. If they want to customize a recipe, apply their requested changes
    4. If they choose "Create my own recipe":
       a. First ask about nutritional targets
       b. Then ask about main ingredients/base
       c. Then ask about protein
       d. Then ask about vegetables
       e. Then ask about seasonings
       f. Finally ask about cooking method
    5. For custom recipes, recommend ingredients that pair well with their previous choices
    6. Always provide complete cooking instructions and nutrition details
    
    Always offer contextual recommendations based on the user's previous choices.
    
    In your responses, you should also include structured data in the following format to help the UI:
    
    STRUCTURED_DATA: {
      "responseType": "options" | "recipe" | "custom_step" | "general",
      "options": [{"name": "Option 1", "description": "Description"}, ...] (if responseType is "options"),
      "recipe": { ... recipe details ... } (if responseType is "recipe"),
      "currentStep": "nutrition" | "base" | "protein" | "vegetables" | "seasonings" | "cookingMethod" (if responseType is "custom_step"),
      "recommendations": [{"name": "Recommendation", "reason": "Reason"}, ...] (if applicable)
    }
    
    Put this structured data at the END of your response, it will be removed before showing to the user.
  `);
  
  const messagesEndRef = useRef(null);

  // Add a function to save recipes
  // Add console logs to trace the issue
  const saveRecipe = async (recipe) => {
  console.log("Attempting to save recipe:", recipe);
  
  const userString = localStorage.getItem('user');
  
  if (!userString) {
    setErrorMessage('Please log in to save recipes');
    setTimeout(() => setErrorMessage(''), 3000);
    return;
  }
  
  const localUser = JSON.parse(userString);
  console.log("User:", localUser);
  
  try {
    // Check if recipe is valid
    if (!recipe || !recipe.name || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Invalid recipe format');
    }
    
    // Make sure ingredients are in the correct format
    const formattedIngredients = recipe.ingredients.map(ingredient => {
      // If ingredient is a string, convert to object
      if (typeof ingredient === 'string') {
        return {
          ingredient: ingredient,
          amount: "1",
          unit: ""
        };
      }
      return ingredient;
    });
    
    // Ensure recipe has all required fields
    const completeRecipe = {
      name: recipe.name,
      ingredients: formattedIngredients,
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [recipe.instructions],
      nutrition: recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      prepTime: recipe.prepTime || 30,
      cookTime: recipe.cookTime || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || "medium",
      type: "complete"
    };
    
    console.log("Sending recipe to server:", completeRecipe);
    
    // First save the recipe to the database
    const createResponse = await axios.post('/recipes/custom/create', completeRecipe);
    const savedRecipe = createResponse.data;
    console.log("Recipe saved:", savedRecipe);
    
    // Then associate it with the user
    await axios.post(`/users/${localUser.id}/recipes/${savedRecipe._id}`);
    
    setSuccessMessage('Recipe saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (error) {
    console.error('Error saving recipe:', error);
    console.error('Error details:', error.response?.data);
    setErrorMessage(error.response?.data?.error || error.message || 'Failed to save recipe');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial greeting when component mounts
  useEffect(() => {
    addMessage({
      text: 'Hello! I\'m your culinary assistant. What type of cuisine or dish would you like to make today?',
      sender: 'bot'
    });
  }, []);

  useEffect(() => {
    if (user && user.preferences) {
      // Create a temporary variable to store the modified instructions
      const userPreferencesText = `
  
  User Preferences:
  ${user.preferences.allergies?.length ? `Allergies: ${user.preferences.allergies.join(', ')}` : ''}
  ${user.preferences.dietaryRestrictions?.length ? `Dietary Restrictions: ${user.preferences.dietaryRestrictions.join(', ')}` : ''}
  ${user.preferences.favoriteIngredients?.length ? `Favorite Ingredients: ${user.preferences.favoriteIngredients.join(', ')}` : ''}
  ${user.preferences.dislikedIngredients?.length ? `Disliked Ingredients: ${user.preferences.dislikedIngredients.join(', ')}` : ''}`;
  
      // Only modify if we have actual preferences
      if (userPreferencesText.trim() !== 'User Preferences:') {
        // Set the modified system instructions to include preferences
        setSystemInstructions(prevInstructions => prevInstructions + userPreferencesText);
      }
    }
  }, [user]);
  
  // Add a message to the chat
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  // Process and save recipe from bot message
const processAndSaveRecipe = (botMessage) => {
  try {
    console.log("Processing message for recipe:", botMessage);
    
    // Try to extract structured data from the message
    const structuredDataMatch = botMessage.text.match(/STRUCTURED_DATA: ({.*})/s);
    
    let recipe = null;
    
    if (structuredDataMatch) {
      try {
        const dataStr = structuredDataMatch[1];
        console.log("Found structured data:", dataStr);
        
        const structuredData = JSON.parse(dataStr);
        
        if (structuredData.responseType === "recipe" && structuredData.recipe) {
          recipe = structuredData.recipe;
        }
      } catch (error) {
        console.error('Error parsing structured data:', error);
      }
    }
    
    // If structured data doesn't have a recipe, extract it from the message text
    if (!recipe) {
      console.log("Creating recipe from text");
      
      // Extract recipe name
      let name = "Custom Recipe";
      const nameMatch = botMessage.text.match(/(?:Recipe for|Here's a recipe for|Recipe:|Here's how to make) (.*?)[\n\.]/i);
      if (nameMatch) {
        name = nameMatch[1].trim();
      }
      
      // Extract ingredients
      const ingredients = [];
      const ingredientRegex = /Ingredients?:[\s\S]*?((?:- .*\n)+)/i;
      const ingredientMatch = botMessage.text.match(ingredientRegex);
      
      if (ingredientMatch) {
        const ingredientList = ingredientMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
        
        ingredientList.forEach(line => {
          const ingredient = line.trim().substring(1).trim();
          if (ingredient) {
            // Try to parse amount, unit and ingredient
            const match = ingredient.match(/^([\d./]+)?\s*([a-zA-Z]+)?\s+(.+)$/);
            if (match) {
              ingredients.push({
                amount: match[1] || "1",
                unit: match[2] || "",
                ingredient: match[3]
              });
            } else {
              ingredients.push({
                amount: "1",
                unit: "",
                ingredient: ingredient
              });
            }
          }
        });
      }
      
      // Extract instructions
      const instructions = [];
      const instructionRegex = /(?:Instructions?|Directions?|Steps?|Method):[\s\S]*?((?:\d+\..+\n)+)/i;
      const instructionMatch = botMessage.text.match(instructionRegex);
      
      if (instructionMatch) {
        const instructionList = instructionMatch[1].split('\n').filter(line => line.trim().match(/^\d+\./));
        
        instructionList.forEach(line => {
          const instruction = line.trim().replace(/^\d+\.\s*/, '');
          if (instruction) {
            instructions.push(instruction);
          }
        });
      }
      
      // Create recipe object
      recipe = {
        name: name,
        ingredients: ingredients.length > 0 ? ingredients : [{ ingredient: "Main ingredient", amount: "1", unit: "" }],
        instructions: instructions.length > 0 ? instructions : ["Combine all ingredients and cook until done."],
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        prepTime: 30,
        cookTime: 30,
        servings: 4,
        difficulty: "medium",
        type: "complete"
      };
      
      console.log("Created recipe:", recipe);
    }
    
    // Save the recipe
    this.saveRecipe(recipe);
    
  } catch (error) {
    console.error('Error processing recipe:', error);
    setErrorMessage('Failed to process recipe data');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};
  // Process user input using LLM
  const processUserInput = async (text) => {
    // Show thinking indicator
    setIsThinking(true);
    addMessage({
      text: "Thinking...",
      sender: 'bot',
      isThinking: true
    });
    
    try {
      // Create the conversation history
      const conversationHistory = messages
        .filter(msg => !msg.isThinking)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Add system instructions and user's new message
      const fullPrompt = [
        { role: 'system', content: systemInstructions },
        ...conversationHistory,
        { role: 'user', content: text }
      ];
      
      // Use existing service to call Llama
      const response = await axios.post('/test-llama', {
        prompt: JSON.stringify(fullPrompt)
      });
      
      // Remove thinking message
      setMessages(prev => prev.filter(m => !m.isThinking));
      setIsThinking(false);
      
      let botResponse = response.data.response;
      let structuredData = null;
      
      // Extract structured data if present
      const structuredDataMatch = botResponse.match(/STRUCTURED_DATA: ({.*})/s);
      if (structuredDataMatch) {
        try {
          structuredData = JSON.parse(structuredDataMatch[1]);
          // Remove the structured data part from the message
          botResponse = botResponse.replace(/STRUCTURED_DATA: ({.*})/s, '').trim();
        } catch (error) {
          console.error('Error parsing structured data:', error);
        }
      }
      
      // Add the bot's response
      addMessage({
        text: botResponse,
        sender: 'bot'
      });
      
      // Process structured data
      if (structuredData) {
        if (structuredData.responseType === 'options' && structuredData.options) {
          setOptions(structuredData.options);
        } else if (structuredData.responseType === 'recipe' && structuredData.recipe) {
          setCurrentRecipe(structuredData.recipe);
          setOptions([]);
        } else if (structuredData.responseType === 'custom_step' && structuredData.recommendations) {
          setOptions(structuredData.recommendations);
        } else {
          setOptions([]);
        }
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(m => !m.isThinking));
      setIsThinking(false);
      
      addMessage({
        text: "I'm having trouble understanding that. Could you try rephrasing or tell me what kind of dish you'd like to make?",
        sender: 'bot'
      });
    }
  };

  // Send user input to the backend
  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    addMessage({
      text: inputText,
      sender: 'user'
    });
    
    const text = inputText;
    setInputText('');
    
    // Process user input
    await processUserInput(text);
  };

  // Handle option click
  const handleOptionClick = (option) => {
    setInputText(option.name || option);
    handleSend();
  };

  // Add this function to render the recipe
const renderRecipe = () => {
  if (!currentRecipe) return null;
  
  return (
    <RecipeContainer>
      <RecipeHeader>
        <h3>{currentRecipe.name}</h3>
        <SaveRecipeButton 
          onClick={() => saveRecipe(currentRecipe)}
          disabled={!user}
        >
          {user ? 'Save Recipe' : 'Login to Save'}
        </SaveRecipeButton>
      </RecipeHeader>
      
      <RecipeSection>
        <h4>Ingredients</h4>
        <ul>
          {currentRecipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
            </li>
          ))}
        </ul>
      </RecipeSection>
      
      <RecipeSection>
        <h4>Instructions</h4>
        <ol>
          {currentRecipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </RecipeSection>
      
      <RecipeSection>
        <h4>Nutrition Information</h4>
        <NutritionGrid>
          <NutritionItem>
            <span>Calories</span>
            <span>{currentRecipe.nutrition?.calories || 'N/A'}</span>
          </NutritionItem>
          <NutritionItem>
            <span>Protein</span>
            <span>{currentRecipe.nutrition?.protein || 'N/A'}g</span>
          </NutritionItem>
          <NutritionItem>
            <span>Carbs</span>
            <span>{currentRecipe.nutrition?.carbs || 'N/A'}g</span>
          </NutritionItem>
          <NutritionItem>
            <span>Fat</span>
            <span>{currentRecipe.nutrition?.fat || 'N/A'}g</span>
          </NutritionItem>
          <NutritionItem>
            <span>Fiber</span>
            <span>{currentRecipe.nutrition?.fiber || 'N/A'}g</span>
          </NutritionItem>
        </NutritionGrid>
      </RecipeSection>
      
      <RecipeMetadata>
        <span>Prep Time: {currentRecipe.prepTime} min</span>
        <span>Cook Time: {currentRecipe.cookTime} min</span>
        <span>Servings: {currentRecipe.servings}</span>
        <span>Difficulty: {currentRecipe.difficulty}</span>
      </RecipeMetadata>
    </RecipeContainer>
  );
};

  // Render quick reply options
  const renderOptions = () => {
    if (!options || options.length === 0) return null;
    
    return (
      <OptionsContainer>
        {options.map((option, index) => (
          <OptionButton key={index} onClick={() => handleOptionClick(option)}>
            {option.name || option}
          </OptionButton>
        ))}
      </OptionsContainer>
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2>AI Culinary Assistant</h2>
      </ChatHeader>
      <div style={{
    backgroundColor: '#f5f5f5', 
    padding: '10px', 
    borderRadius: '5px',
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'space-between'
  }}>
    <div>
      <button 
        onClick={() => {
          const lastBotMessage = messages
            .filter(msg => msg.sender === 'bot')
            .pop();
            
          if (lastBotMessage) {
            processAndSaveRecipe(lastBotMessage);
          } else {
            setErrorMessage('No recipe to save');
            setTimeout(() => setErrorMessage(''), 3000);
          }
        }}
        style={{
          backgroundColor: '#4a6fa5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Save Last Recipe
      </button>
    </div>
    <div>
      <a 
        href="/preferences"
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          textDecoration: 'none',
          marginRight: '10px'
        }}
      >
        Manage Preferences
      </a>
      <a 
        href="/recipes"
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          textDecoration: 'none'
        }}
      >
        View Saved Recipes
      </a>
    </div>
  </div>
  <ChatBody>
    {messages.map((message, index) => (
      !message.isThinking && (
        <MessageBubble key={index} isUser={message.sender === 'user'}>
          {message.text}
        </MessageBubble>
      )
    ))}
    {isThinking && (
      <MessageBubble isUser={false}>
        Thinking...
      </MessageBubble>
    )}
    {currentRecipe && renderRecipe()}
    {renderOptions()}
    {/* Remove the duplicate action bar that was here */}
    {errorMessage && (
      <ErrorNotification>
        {errorMessage}
      </ErrorNotification>
    )}
    {successMessage && (
      <SuccessNotification>
        {successMessage}
      </SuccessNotification>
    )}
    <div ref={messagesEndRef} />
  </ChatBody>
  
  <ChatFooter>
    <MessageInput
      type="text"
      placeholder="Type your message here..."
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSend();
        }
      }}
    />
    <SendButton onClick={handleSend}>Send</SendButton>
  </ChatFooter>
</ChatContainer>
  );
};

export default CustomChatInterface;
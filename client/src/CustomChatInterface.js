import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Chat states to manage conversation flow
const CHAT_STATES = {
  INITIAL: 'initial',
  CUISINE_SELECTED: 'cuisine_selected',
  DISH_TYPE_SELECTED: 'dish_type_selected',
  RECIPE_SELECTED: 'recipe_selected',
  CUSTOMIZING_RECIPE: 'customizing_recipe',
  CREATING_CUSTOM: 'creating_custom',
  SELECTING_BASE: 'selecting_base',
  SELECTING_PROTEIN: 'selecting_protein',
  SELECTING_VEGETABLES: 'selecting_vegetables',
  SELECTING_SEASONINGS: 'selecting_seasonings',
  SELECTING_COOKING_METHOD: 'selecting_cooking_method',
  RECIPE_COMPLETE: 'recipe_complete'
};

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

const CustomChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatState, setChatState] = useState(CHAT_STATES.INITIAL);
  const [options, setOptions] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [customOptions, setCustomOptions] = useState({
    base: '',
    protein: '',
    vegetables: [],
    seasonings: [],
    cookingMethod: ''
  });
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietaryRestrictions: []
  });
  
  const messagesEndRef = useRef(null);

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

  // Add a message to the chat
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
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
    
    // Process user input based on current state
    processUserInput(text);
  };

  // Process user input based on current chat state
  const processUserInput = async (text) => {
    switch (chatState) {
      case CHAT_STATES.INITIAL:
        // User has entered a cuisine or dish type
        if (text.toLowerCase().includes('create my own')) {
          startCustomRecipeFlow();
        } else {
          processInitialInput(text);
        }
        break;
      case CHAT_STATES.CUISINE_SELECTED:
        // User has selected a dish type
        fetchRecipeOptions(text);
        break;
      case CHAT_STATES.DISH_TYPE_SELECTED:
        // User has selected a specific recipe
        if (text.toLowerCase().includes('create my own')) {
          startCustomRecipeFlow();
        } else {
          fetchRecipeByName(text);
        }
        break;
      case CHAT_STATES.RECIPE_SELECTED:
        // User might be customizing the recipe
        customizeCurrentRecipe(text);
        break;
      case CHAT_STATES.SELECTING_BASE:
        selectBase(text);
        break;
      case CHAT_STATES.SELECTING_PROTEIN:
        selectProtein(text);
        break;
      case CHAT_STATES.SELECTING_VEGETABLES:
        selectVegetables(text);
        break;
      case CHAT_STATES.SELECTING_SEASONINGS:
        selectSeasonings(text);
        break;
      case CHAT_STATES.SELECTING_COOKING_METHOD:
        selectCookingMethod(text);
        break;
      default:
        // Default fallback
        addMessage({
          text: "I'm not sure how to help with that. Can you try a different request?",
          sender: 'bot'
        });
    }
  };

  // Process the initial input (cuisine, dish type, or specific dish)
  const processInitialInput = async (input) => {
    try {
      // Check if input contains both cuisine and dish type
      const hasCuisine = /italian|french|chinese|japanese|mexican|indian|thai|greek|moroccan|american/i.test(input);
      const hasDishType = /appetizer|soup|salad|main course|dessert|breakfast|lunch|dinner|side dish|snack/i.test(input);
      
      if (hasCuisine && hasDishType) {
        // If user specified both cuisine and dish type
        const cuisine = input.match(/italian|french|chinese|japanese|mexican|indian|thai|greek|moroccan|american/i)[0];
        const dishType = input.match(/appetizer|soup|salad|main course|dessert|breakfast|lunch|dinner|side dish|snack/i)[0];
        
        fetchRecipeOptions(dishType, cuisine);
      } else if (hasCuisine) {
        // If user only specified cuisine
        const cuisine = input.match(/italian|french|chinese|japanese|mexican|indian|thai|greek|moroccan|american/i)[0];
        
        addMessage({
          text: `Great! What type of ${cuisine} dish would you like to make? (e.g., appetizer, main course, dessert, etc.)`,
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.CUISINE_SELECTED);
      } else {
        // Treat as a general dish request
        fetchRecipeOptions(input);
      }
    } catch (error) {
      console.error('Error processing initial input:', error);
      addMessage({
        text: `I'm not sure I understood that. Could you specify what cuisine or dish you'd like to make?`,
        sender: 'bot'
      });
    }
  };

  // Fetch recipe options based on cuisine and/or dish type
  const fetchRecipeOptions = async (dishType, cuisine = '') => {
    try {
      const searchText = cuisine 
        ? `${cuisine} ${dishType}` 
        : dishType;
      
      addMessage({
        text: `Looking for ${searchText} recipes...`,
        sender: 'bot'
      });
      
      // Use the test-llama endpoint to get recipe suggestions
      const response = await axios.post('/test-llama', {
        prompt: `List 5 popular ${searchText} recipes. Return ONLY a JSON array in this format: 
        [{"name": "Dish name", "description": "Brief description"}]`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
      const recipeOptions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (recipeOptions.length > 0) {
        setOptions([...recipeOptions, { name: "Create my own recipe", description: "Customize your own dish" }]);
        
        addMessage({
          text: `Here are some ${searchText} recipe options. What would you like to make?`,
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.DISH_TYPE_SELECTED);
      } else {
        addMessage({
          text: `I couldn't find any ${searchText} recipes. Would you like to try something else?`,
          sender: 'bot'
        });
      }
    } catch (error) {
      console.error('Error fetching recipe options:', error);
      addMessage({
        text: `Sorry, I had trouble finding recipe options. Please try again.`,
        sender: 'bot'
      });
    }
  };

  // Fetch recipe by name
  const fetchRecipeByName = async (name) => {
    try {
      addMessage({
        text: `Finding the recipe for ${name}...`,
        sender: 'bot'
      });
      
      // Try to get from database first
      try {
        const dbResponse = await axios.get(`/recipes/${encodeURIComponent(name)}`);
        if (dbResponse.data && !dbResponse.data.error) {
          const recipe = dbResponse.data;
          setCurrentRecipe(recipe);
          
          // Display recipe details
          const recipeText = formatRecipeText(recipe);
          
          addMessage({
            text: recipeText,
            sender: 'bot'
          });
          
          addMessage({
            text: "Would you like to customize this recipe? You can say things like 'make it spicier' or 'add more garlic'.",
            sender: 'bot'
          });
          
          setChatState(CHAT_STATES.RECIPE_SELECTED);
          return;
        }
      } catch (dbError) {
        console.log('Recipe not found in database, generating with Llama');
      }
      
      // If not in database, use test-llama
      const response = await axios.post('/test-llama', {
        prompt: `Give me a detailed recipe for ${name}. Provide the recipe in this JSON format:
        {
          "name": "${name}",
          "ingredients": [{"ingredient": "Ingredient name", "amount": "amount", "unit": "unit"}],
          "instructions": ["Step 1", "Step 2", ...],
          "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
          "prepTime": number,
          "cookTime": number,
          "servings": number,
          "difficulty": "easy/medium/hard"
        }`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/{[\s\S]*?}/);
      const recipeJson = jsonMatch ? jsonMatch[0] : null;
      
      if (recipeJson) {
        const recipe = JSON.parse(recipeJson);
        setCurrentRecipe(recipe);
        
        // Display recipe details
        const recipeText = formatRecipeText(recipe);
        
        addMessage({
          text: recipeText,
          sender: 'bot'
        });
        
        addMessage({
          text: "Would you like to customize this recipe? You can say things like 'make it spicier' or 'add more garlic'.",
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.RECIPE_SELECTED);
      } else {
        throw new Error('Failed to parse recipe');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      addMessage({
        text: `Sorry, I had trouble finding that recipe. Would you like to try a different option?`,
        sender: 'bot'
      });
    }
  };

  // Customize current recipe
  const customizeCurrentRecipe = async (customization) => {
    try {
      if (!currentRecipe) {
        addMessage({
          text: "I don't have a recipe to customize. Let's find a recipe first.",
          sender: 'bot'
        });
        setChatState(CHAT_STATES.INITIAL);
        return;
      }
      
      addMessage({
        text: `Customizing your recipe to ${customization}...`,
        sender: 'bot'
      });
      
      // Try database endpoint first if recipe has an ID
      if (currentRecipe._id) {
        try {
          const dbResponse = await axios.post(`/recipes/customize/${currentRecipe._id}`, {
            customizations: [customization]
          });
          
          if (dbResponse.data && !dbResponse.data.error) {
            const customizedRecipe = dbResponse.data;
            setCurrentRecipe(customizedRecipe);
            
            // Display customized recipe
            const recipeText = formatRecipeText(customizedRecipe);
            
            addMessage({
              text: `Here's your customized recipe:\n\n${recipeText}`,
              sender: 'bot'
            });
            
            addMessage({
              text: "Is there anything else you'd like to customize?",
              sender: 'bot'
            });
            return;
          }
        } catch (dbError) {
          console.log('Customization via API failed, using Llama directly');
        }
      }
      
      // If no ID or API fails, use test-llama directly
      const response = await axios.post('/test-llama', {
        prompt: `Customize this recipe to ${customization}:\n${JSON.stringify(currentRecipe)}\n
        Provide the customized recipe in this JSON format:
        {
          "name": "Recipe Name",
          "ingredients": [{"ingredient": "Ingredient name", "amount": "amount", "unit": "unit"}],
          "instructions": ["Step 1", "Step 2", ...],
          "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
          "prepTime": number,
          "cookTime": number,
          "servings": number,
          "difficulty": "easy/medium/hard"
        }`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/{[\s\S]*?}/);
      const recipeJson = jsonMatch ? jsonMatch[0] : null;
      
      if (recipeJson) {
        const customizedRecipe = JSON.parse(recipeJson);
        setCurrentRecipe(customizedRecipe);
        
        // Display customized recipe
        const recipeText = formatRecipeText(customizedRecipe);
        
        addMessage({
          text: `Here's your customized recipe:\n\n${recipeText}`,
          sender: 'bot'
        });
        
        addMessage({
          text: "Is there anything else you'd like to customize?",
          sender: 'bot'
        });
      } else {
        throw new Error('Failed to parse customized recipe');
      }
    } catch (error) {
      console.error('Error customizing recipe:', error);
      addMessage({
        text: `Sorry, I had trouble customizing the recipe. Would you like to try a different customization?`,
        sender: 'bot'
      });
    }
  };

  // Start custom recipe flow
  const startCustomRecipeFlow = async () => {
    try {
      addMessage({
        text: "Great! Let's create your own custom recipe. First, what main ingredient or base would you like to use for your dish?",
        sender: 'bot'
      });
      
      setChatState(CHAT_STATES.SELECTING_BASE);
    } catch (error) {
      console.error('Error starting custom recipe flow:', error);
      addMessage({
        text: `Sorry, I had trouble starting the custom recipe process. Would you like to try again?`,
        sender: 'bot'
      });
    }
  };

  // Select base ingredient
  const selectBase = async (base) => {
    try {
      setCustomOptions({
        ...customOptions,
        base
      });
      
      addMessage({
        text: `Great choice! ${base} will be the base of your dish. Now, let's add a protein. What protein would you like to include?`,
        sender: 'bot'
      });
      
      // Use Llama to suggest protein options
      const response = await axios.post('/test-llama', {
        prompt: `List 5 protein options that would pair well with ${base} as the main ingredient. Return ONLY a JSON array in this format: 
        [{"name": "Protein name", "description": "Brief description"}]`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
      const proteinOptions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (proteinOptions.length > 0) {
        setOptions(proteinOptions);
      }
      
      setChatState(CHAT_STATES.SELECTING_PROTEIN);
    } catch (error) {
      console.error('Error selecting base:', error);
      addMessage({
        text: `I've noted that you want to use ${base} as your base ingredient. Now, what protein would you like to add?`,
        sender: 'bot'
      });
      setChatState(CHAT_STATES.SELECTING_PROTEIN);
    }
  };

  // Select protein
  const selectProtein = async (protein) => {
    try {
      setCustomOptions({
        ...customOptions,
        protein
      });
      
      addMessage({
        text: `${protein} is a great protein choice! Now, let's add some vegetables. What vegetables would you like to include? You can list multiple vegetables separated by commas.`,
        sender: 'bot'
      });
      
      // Use Llama to suggest vegetable options
      const response = await axios.post('/test-llama', {
        prompt: `List 5 vegetable options that would pair well with ${customOptions.base} and ${protein}. Return ONLY a JSON array in this format: 
        [{"name": "Vegetable name", "description": "Brief description"}]`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
      const vegetableOptions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (vegetableOptions.length > 0) {
        setOptions(vegetableOptions);
      }
      
      setChatState(CHAT_STATES.SELECTING_VEGETABLES);
    } catch (error) {
      console.error('Error selecting protein:', error);
      addMessage({
        text: `I've noted that you want to use ${protein} as your protein. Now, what vegetables would you like to add?`,
        sender: 'bot'
      });
      setChatState(CHAT_STATES.SELECTING_VEGETABLES);
    }
  };

  // Select vegetables
  const selectVegetables = async (vegetablesInput) => {
    try {
      const vegetables = vegetablesInput.split(',').map(v => v.trim());
      
      setCustomOptions({
        ...customOptions,
        vegetables
      });
      
      addMessage({
        text: `Great vegetable choices! Now, let's add some seasonings, herbs, or spices. What would you like to flavor your dish with?`,
        sender: 'bot'
      });
      
      // Use Llama to suggest seasoning options
      const response = await axios.post('/test-llama', {
        prompt: `List 5 seasoning/herb/spice options that would pair well with ${customOptions.base}, ${customOptions.protein}, and ${vegetables.join(', ')}. Return ONLY a JSON array in this format: 
        [{"name": "Seasoning name", "description": "Brief description"}]`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
      const seasoningOptions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (seasoningOptions.length > 0) {
        setOptions(seasoningOptions);
      }
      
      setChatState(CHAT_STATES.SELECTING_SEASONINGS);
    } catch (error) {
      console.error('Error selecting vegetables:', error);
      addMessage({
        text: `I've noted that you want to use ${vegetablesInput} as your vegetables. Now, what seasonings, herbs, or spices would you like to add?`,
        sender: 'bot'
      });
      setChatState(CHAT_STATES.SELECTING_SEASONINGS);
    }
  };
  
  // Select seasonings
  const selectSeasonings = async (seasoningsInput) => {
    try {
      const seasonings = seasoningsInput.split(',').map(s => s.trim());
      
      setCustomOptions({
        ...customOptions,
        seasonings
      });
      
      addMessage({
        text: `Excellent seasoning choices! Finally, how would you like to cook this dish? (e.g., bake, grill, stir-fry, boil, steam, etc.)`,
        sender: 'bot'
      });
      
      // Use Llama to suggest cooking methods
      const response = await axios.post('/test-llama', {
        prompt: `List 3 cooking methods that would work well for a dish with ${customOptions.base}, ${customOptions.protein}, and ${customOptions.vegetables.join(', ')}. Return ONLY a JSON array in this format: 
        [{"name": "Cooking method", "description": "Brief description"}]`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
      const cookingOptions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (cookingOptions.length > 0) {
        setOptions(cookingOptions);
      }
      
      setChatState(CHAT_STATES.SELECTING_COOKING_METHOD);
    } catch (error) {
      console.error('Error selecting seasonings:', error);
      addMessage({
        text: `I've noted that you want to use ${seasoningsInput} for seasoning. Now, how would you like to cook this dish?`,
        sender: 'bot'
      });
      setChatState(CHAT_STATES.SELECTING_COOKING_METHOD);
    }
  };
  
  // Select cooking method
  const selectCookingMethod = async (cookingMethod) => {
    try {
      setCustomOptions({
        ...customOptions,
        cookingMethod
      });
      
      addMessage({
        text: `Creating your custom recipe with ${customOptions.base}, ${customOptions.protein}, ${customOptions.vegetables.join(', ')}, ${customOptions.seasonings.join(', ')}, cooked by ${cookingMethod}...`,
        sender: 'bot'
      });
      
      // Generate custom recipe with Llama
      const response = await axios.post('/test-llama', {
        prompt: `Create a detailed recipe using:
        - Base: ${customOptions.base}
        - Protein: ${customOptions.protein}
        - Vegetables: ${customOptions.vegetables.join(', ')}
        - Seasonings: ${customOptions.seasonings.join(', ')}
        - Cooking Method: ${cookingMethod}
        ${userPreferences.allergies && userPreferences.allergies.length ? `- Avoid these ingredients due to allergies: ${userPreferences.allergies.join(', ')}` : ''}
        
        Provide the recipe in this JSON format:
        {
          "name": "Creative recipe name",
          "ingredients": [{"ingredient": "Ingredient name", "amount": "amount", "unit": "unit"}],
          "instructions": ["Step 1", "Step 2", ...],
          "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
          "prepTime": number,
          "cookTime": number,
          "servings": number,
          "difficulty": "easy/medium/hard"
        }`
      });
      
      // Parse JSON from the response
      const jsonMatch = response.data.response.match(/{[\s\S]*?}/);
      const recipeJson = jsonMatch ? jsonMatch[0] : null;
      
      if (recipeJson) {
        const customRecipe = JSON.parse(recipeJson);
        setCurrentRecipe(customRecipe);
        
        // Display custom recipe
        const recipeText = formatRecipeText(customRecipe);
        
        addMessage({
          text: `Here's your custom recipe:\n\n${recipeText}`,
          sender: 'bot'
        });
        
        addMessage({
          text: "Would you like to save this recipe or make any adjustments?",
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.RECIPE_COMPLETE);
      } else {
        throw new Error('Failed to parse custom recipe');
      }
    } catch (error) {
      console.error('Error creating custom recipe:', error);
      addMessage({
        text: `Sorry, I had trouble creating your custom recipe. Would you like to try again?`,
        sender: 'bot'
      });
    }
  };

  // Format recipe text for display
  const formatRecipeText = (recipe) => {
    if (!recipe) return '';
    
    let text = `${recipe.name}\n\n`;
    
    text += 'Ingredients:\n';
    recipe.ingredients.forEach(ing => {
      text += `- ${ing.amount} ${ing.unit || ''} ${ing.ingredient}\n`;
    });
    
    text += '\nInstructions:\n';
    recipe.instructions.forEach((step, index) => {
      text += `${index + 1}. ${step}\n`;
    });
    
    text += '\nNutrition (per serving):\n';
    text += `- Calories: ${recipe.nutrition.calories}\n`;
    text += `- Protein: ${recipe.nutrition.protein}g\n`;
    text += `- Carbs: ${recipe.nutrition.carbs}g\n`;
    text += `- Fat: ${recipe.nutrition.fat}g\n`;
    text += `- Fiber: ${recipe.nutrition.fiber}g\n`;
    
    text += `\nPrep Time: ${recipe.prepTime} minutes | Cook Time: ${recipe.cookTime} minutes | Servings: ${recipe.servings}`;
    
    return text;
  };

  // Handle option click
  const handleOptionClick = (option) => {
    setInputText(option.name || option);
    handleSend();
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
      
      <ChatBody>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.sender === 'user'}>
            {message.text}
          </MessageBubble>
        ))}
        {renderOptions()}
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
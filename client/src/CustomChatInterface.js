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

  // Process user input based on current chat state
  const processUserInput = async (text) => {
    // Show thinking indicator
    const thinkingMsgId = Date.now();
    addMessage({
      id: thinkingMsgId,
      text: "Thinking...",
      sender: 'bot',
      isThinking: true
    });
    
    try {
      // Parse user intent using Llama
      const intentResponse = await axios.post('/api/parse-intent', { userInput: text });
      const parsedIntent = intentResponse.data;
      
      // Remove thinking indicator
      setMessages(prev => prev.filter(m => !m.isThinking));
      
      console.log('Parsed intent:', parsedIntent);
      
      // Process based on intent
      switch (parsedIntent.intent) {
        case 'search_recipe':
          if (parsedIntent.specificDish) {
            await fetchRecipeByName(parsedIntent.specificDish);
          } else if (parsedIntent.cuisine || parsedIntent.dishType) {
            await fetchRecipeOptions(parsedIntent.dishType, parsedIntent.cuisine);
          } else {
            addMessage({
              text: "What type of cuisine or dish would you like to make today?",
              sender: 'bot'
            });
          }
          break;
        
        case 'customize_recipe':
          if (currentRecipe) {
            await customizeCurrentRecipe(parsedIntent.customization || text);
          } else {
            addMessage({
              text: "I don't have a recipe to customize yet. Let's find a recipe first. What would you like to make?",
              sender: 'bot'
            });
          }
          break;
        
        case 'create_custom':
          await startCustomRecipeFlow();
          break;
        
        case 'general_question':
          // Handle general cooking questions
          const response = await axios.post('/test-llama', { 
            prompt: `User asked: "${text}"\n\nProvide a helpful response about cooking or food.` 
          });
          
          addMessage({
            text: response.data.response,
            sender: 'bot'
          });
          break;
          
        default:
          // If we're in a specific state in the flow, continue that flow
          switch (chatState) {
            case CHAT_STATES.SELECTING_BASE:
              await selectBase(text);
              break;
            case CHAT_STATES.SELECTING_PROTEIN:
              await selectProtein(text);
              break;
            case CHAT_STATES.SELECTING_VEGETABLES:
              await selectVegetables(text);
              break;
            case CHAT_STATES.SELECTING_SEASONINGS:
              await selectSeasonings(text);
              break;
            case CHAT_STATES.SELECTING_COOKING_METHOD:
              await selectCookingMethod(text);
              break;
            case CHAT_STATES.RECIPE_SELECTED:
              // Assume it's a customization if we have a recipe selected
              await customizeCurrentRecipe(text);
              break;
            default:
              // Fallback to initial query processing
              await processInitialInput(text);
          }
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      
      // Remove thinking indicator
      setMessages(prev => prev.filter(m => !m.isThinking));
      
      addMessage({
        text: "I'm having trouble understanding that. Could you try rephrasing or tell me what kind of dish you'd like to make?",
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
      addMessage({
        text: cuisine 
          ? `Looking for ${cuisine} ${dishType || 'recipes'}...` 
          : `Looking for ${dishType || 'delicious recipes'}...`,
        sender: 'bot'
      });
      
      // Use the intent-based endpoint
      const intent = {
        dishType: dishType,
        cuisine: cuisine
      };
      
      const response = await axios.post('/api/recipe-suggestions', { intent });
      const recipeOptions = response.data;
      
      if (recipeOptions.length > 0) {
        setOptions([...recipeOptions, { name: "Create my own recipe", description: "Customize your own dish" }]);
        
        const message = cuisine 
          ? `Here are some ${cuisine} ${dishType || 'dishes'} you might enjoy. Which one would you like to make?` 
          : `Here are some ${dishType || 'recipes'} you might enjoy. Which one would you like to make?`;
        
        addMessage({
          text: message,
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.DISH_TYPE_SELECTED);
      } else {
        addMessage({
          text: cuisine 
            ? `I couldn't find any ${cuisine} ${dishType || 'recipes'}. Would you like to try something else?`
            : `I couldn't find any ${dishType || 'recipes'}. Would you like to try something else?`,
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
      
      // If not in database, use the new API endpoint
      const response = await axios.post('/api/recipe-details', {
        dish: name,
        cuisine: 'any'
      });
      
      if (response.data && !response.data.error) {
        const recipe = response.data;
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
        throw new Error('Failed to generate recipe');
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
      
      // Use the new API endpoint
      const response = await axios.post('/api/recipe-details', {
        dish: currentRecipe.name,
        options: {
          customizations: [customization]
        }
      });
      
      if (response.data && !response.data.error) {
        const customizedRecipe = response.data;
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
        throw new Error('Failed to customize recipe');
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
      
      // Get protein recommendations
      const response = await axios.post('/api/ingredient-recommendations', {
        currentSelections: { base },
        categoryToRecommend: 'protein'
      });
      
      const proteinOptions = response.data;
      
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
      
      // Get vegetable recommendations
      const response = await axios.post('/api/ingredient-recommendations', {
        currentSelections: { 
          base: customOptions.base,
          protein
        },
        categoryToRecommend: 'vegetable'
      });
      
      const vegetableOptions = response.data;
      
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
      
      // Get seasoning recommendations
      const response = await axios.post('/api/ingredient-recommendations', {
        currentSelections: { 
          base: customOptions.base,
          protein: customOptions.protein,
          vegetables
        },
        categoryToRecommend: 'seasoning'
      });
      
      const seasoningOptions = response.data;
      
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
      
      // Get cooking method recommendations
      const response = await axios.post('/api/ingredient-recommendations', {
        currentSelections: { 
          base: customOptions.base,
          protein: customOptions.protein,
          vegetables: customOptions.vegetables,
          seasonings
        },
        categoryToRecommend: 'cooking method'
      });
      
      const cookingOptions = response.data;
      
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
      
      // Generate custom recipe with API
      const response = await axios.post('/api/recipe-details', {
        dish: 'custom',
        options: {
          customOptions: {
            ...customOptions,
            cookingMethod
          },
          allergies: userPreferences.allergies
        }
      });
      
      if (response.data && !response.data.error) {
        const customRecipe = response.data;
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
        throw new Error('Failed to create custom recipe');
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
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Chat states to manage conversation flow
const CHAT_STATES = {
  INITIAL: 'initial',
  CUISINE_SELECTED: 'cuisine_selected',
  PASTA_SELECTED: 'pasta_selected',
  CUSTOMIZING_RECIPE: 'customizing_recipe',
  CREATING_CUSTOM: 'creating_custom',
  SELECTING_PASTA_TYPE: 'selecting_pasta_type',
  SELECTING_SAUCE: 'selecting_sauce',
  SELECTING_PROTEIN: 'selecting_protein',
  SELECTING_VEGETABLES: 'selecting_vegetables',
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
    pastaType: '',
    sauce: '',
    protein: '',
    vegetables: []
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
      text: 'Hello! I\'m your culinary assistant. What type of cuisine would you like to make today?',
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
        // User has entered a cuisine type
        fetchPastaOptions(text);
        break;
      case CHAT_STATES.CUISINE_SELECTED:
        // User has selected a pasta type or "Create my own"
        if (text.toLowerCase().includes('create my own')) {
          startCustomRecipeFlow();
        } else {
          fetchRecipeByName(text);
        }
        break;
      case CHAT_STATES.PASTA_SELECTED:
        // User might be customizing the recipe
        customizeCurrentRecipe(text);
        break;
      case CHAT_STATES.SELECTING_PASTA_TYPE:
        selectPastaType(text);
        break;
      case CHAT_STATES.SELECTING_SAUCE:
        selectSauce(text);
        break;
      case CHAT_STATES.SELECTING_PROTEIN:
        selectProtein(text);
        break;
      case CHAT_STATES.SELECTING_VEGETABLES:
        selectVegetables(text);
        break;
      default:
        // Default fallback
        addMessage({
          text: "I'm not sure how to help with that. Can you try a different request?",
          sender: 'bot'
        });
    }
  };

  // Fetch pasta options based on cuisine
  const fetchPastaOptions = async (cuisine) => {
    try {
      addMessage({
        text: `Looking for ${cuisine} pasta options...`,
        sender: 'bot'
      });
      
      const response = await axios.get(`/recipes/options/${cuisine}`);
      const pastaOptions = response.data;
      
      if (pastaOptions.length > 0) {
        setOptions(pastaOptions);
        
        addMessage({
          text: `Here are some ${cuisine} pasta options. What would you like to make?`,
          sender: 'bot'
        });
        
        setChatState(CHAT_STATES.CUISINE_SELECTED);
      } else {
        addMessage({
          text: `I couldn't find any pasta options for ${cuisine}. Would you like to try a different cuisine?`,
          sender: 'bot'
        });
      }
    } catch (error) {
      console.error('Error fetching pasta options:', error);
      addMessage({
        text: `Sorry, I had trouble finding pasta options. Please try again.`,
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
      
      const response = await axios.get(`/recipes/${encodeURIComponent(name)}`);
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
      
      setChatState(CHAT_STATES.PASTA_SELECTED);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      addMessage({
        text: `Sorry, I had trouble finding that recipe. Would you like to try a different pasta option?`,
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
      
      const response = await axios.post(`/recipes/customize/${currentRecipe._id}`, {
        customizations: [customization]
      });
      
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
        text: "Great! Let's create your own pasta dish. First, let's choose the type of pasta you want to use.",
        sender: 'bot'
      });
      
      const response = await axios.get('/recipes/custom/pasta-types');
      const pastaTypes = response.data;
      
      setOptions(pastaTypes);
      setChatState(CHAT_STATES.SELECTING_PASTA_TYPE);
    } catch (error) {
      console.error('Error starting custom recipe flow:', error);
      addMessage({
        text: `Sorry, I had trouble starting the custom recipe process. Would you like to try again?`,
        sender: 'bot'
      });
    }
  };

  // Select pasta type
  const selectPastaType = async (pastaType) => {
    try {
      setCustomOptions({
        ...customOptions,
        pastaType
      });
      
      addMessage({
        text: `You've selected ${pastaType}. Now, let's choose a sauce to go with it.`,
        sender: 'bot'
      });
      
      const response = await axios.get(`/recipes/custom/sauces/${encodeURIComponent(pastaType)}`);
      const sauceOptions = response.data;
      
      setOptions(sauceOptions);
      setChatState(CHAT_STATES.SELECTING_SAUCE);
    } catch (error) {
      console.error('Error selecting pasta type:', error);
      addMessage({
        text: `Sorry, I had trouble processing your selection. Would you like to try a different pasta type?`,
        sender: 'bot'
      });
    }
  };

  // Select sauce
  const selectSauce = async (sauce) => {
    try {
      setCustomOptions({
        ...customOptions,
        sauce
      });
      
      addMessage({
        text: `${sauce} sauce is a great choice with ${customOptions.pastaType}! Now, let's add a protein.`,
        sender: 'bot'
      });
      
      const response = await axios.get(`/recipes/custom/proteins/${encodeURIComponent(customOptions.pastaType)}/${encodeURIComponent(sauce)}`);
      const proteinOptions = response.data;
      
      setOptions(proteinOptions);
      setChatState(CHAT_STATES.SELECTING_PROTEIN);
    } catch (error) {
      console.error('Error selecting sauce:', error);
      addMessage({
        text: `Sorry, I had trouble processing your selection. Would you like to try a different sauce?`,
        sender: 'bot'
      });
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
        text: `${protein} will go wonderfully with ${customOptions.pastaType} and ${customOptions.sauce}! Now, let's add some vegetables. You can list multiple vegetables separated by commas.`,
        sender: 'bot'
      });
      
      const response = await axios.get(`/recipes/custom/vegetables/${encodeURIComponent(customOptions.pastaType)}/${encodeURIComponent(customOptions.sauce)}/${encodeURIComponent(protein)}`);
      const vegetableOptions = response.data;
      
      setOptions(vegetableOptions);
      setChatState(CHAT_STATES.SELECTING_VEGETABLES);
    } catch (error) {
      console.error('Error selecting protein:', error);
      addMessage({
        text: `Sorry, I had trouble processing your selection. Would you like to try a different protein?`,
        sender: 'bot'
      });
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
        text: `Creating your custom pasta recipe with ${customOptions.pastaType}, ${customOptions.sauce}, ${customOptions.protein}, and ${vegetables.join(', ')}...`,
        sender: 'bot'
      });
      
      const response = await axios.post('/recipes/custom/create', {
        pastaType: customOptions.pastaType,
        sauce: customOptions.sauce,
        protein: customOptions.protein,
        vegetables,
        allergies: userPreferences.allergies
      });
      
      const customRecipe = response.data;
      setCurrentRecipe(customRecipe);
      
      // Display custom recipe
      const recipeText = formatRecipeText(customRecipe);
      
      addMessage({
        text: `Here's your custom pasta recipe:\n\n${recipeText}`,
        sender: 'bot'
      });
      
      addMessage({
        text: "Would you like to save this recipe or make any adjustments?",
        sender: 'bot'
      });
      
      setChatState(CHAT_STATES.RECIPE_COMPLETE);
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
        <h2>Pasta Culinary Assistant</h2>
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
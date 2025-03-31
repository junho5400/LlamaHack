import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components with improved design
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 85vh;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  background-color: #f9f9f9;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #4a6fa5;
  color: white;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 5px 0 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: white;
  scroll-behavior: smooth;
  
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

const ChatFooter = styled.div`
  display: flex;
  padding: 16px 24px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #4a6fa5;
    box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
  }
`;

const SendButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  margin-left: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3a5a8f;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    margin-left: 8px;
  }
`;

const MessageWrapper = styled(motion.div)`
  display: flex;
  margin-bottom: 20px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  
  background-color: ${props => props.isUser ? '#4a6fa5' : '#5e9b8b'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 16px 20px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  position: relative;
  
  ${props => props.isUser ? `
    background-color: #e1f0ff;
    border-bottom-right-radius: 4px;
    text-align: right;
  ` : `
    background-color: #f0f0f0;
    border-bottom-left-radius: 4px;
    text-align: left;
  `}
`;

const ThinkingBubble = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: #f0f0f0;
  border-radius: 18px;
  font-size: 16px;
  max-width: 70%;
  margin-left: 52px;
  border-bottom-left-radius: 4px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: #777;
  border-radius: 50%;
  animation: bounce 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay};

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const ActionsBar = styled.div`
  display: flex;
  padding: 12px 24px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #3a5a8f;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  margin-left: 52px;
`;

const OptionButton = styled(motion.button)`
  background-color: #e1f5fe;
  border: 1px solid #81d4fa;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #b3e5fc;
    transform: translateY(-2px);
  }
`;

const NotificationContainer = styled(motion.div)`
  padding: 12px 18px;
  border-radius: 8px;
  margin: 16px auto;
  max-width: 80%;
  text-align: center;
  font-weight: 500;
  
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
`;

const PreferencesTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #e0f7fa;
  border-radius: 16px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  
  span {
    margin-left: 6px;
    color: #4a6fa5;
    font-weight: 600;
  }
`;

// Recipe card styles
const RecipeContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin: 24px 0;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  
  h3 {
    margin: 0;
    color: #4a6fa5;
    font-size: 22px;
  }
`;

const SaveRecipeButton = styled.button`
  background-color: ${props => props.disabled ? '#cccccc' : '#4a6fa5'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  font-weight: 500;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#3a5a8f'};
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 24px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #4a6fa5;
    font-size: 18px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
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
    margin-bottom: 12px;
    line-height: 1.6;
    position: relative;
    padding-left: 8px;
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

// Icons
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IngredientsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InstructionsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NutritionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.1818 20.1818C19.5495 20.7879 18.7838 21.1906 17.966 21.3502C17.1481 21.5099 16.3141 21.4201 15.5491 21.0908C14.7842 20.7615 14.1253 20.2091 13.6593 19.5008C13.1933 18.7925 12.9404 17.9628 12.9327 17.1164C12.9255 16.2778 12.6524 15.4658 12.1598 14.7769C11.6672 14.088 10.9814 13.558 10.1909 13.2553C9.40043 12.9527 8.537 12.8922 7.71143 13.0819C6.88586 13.2717 6.13663 13.7026 5.56727 14.3164L3.81818 16M20.1818 20.1818H17.4545M20.1818 20.1818V17.4545M3.81818 3.81818C4.4505 3.2121 5.21617 2.80937 6.03404 2.64975C6.85191 2.49013 7.68589 2.57988 8.45086 2.90918C9.21584 3.23848 9.87472 3.79088 10.3407 4.49918C10.8067 5.20748 11.0596 6.03718 11.0673 6.88364C11.0744 7.7222 11.3476 8.53416 11.8402 9.22306C12.3328 9.91195 13.0186 10.442 13.8091 10.7447C14.5996 11.0474 15.463 11.1078 16.2886 10.9181C17.1141 10.7283 17.8634 10.2974 18.4327 9.68364L20.1818 8M3.81818 3.81818H6.54545M3.81818 3.81818V6.54545" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ServingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DifficultyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const optionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Main component
const EnhancedChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [options, setOptions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
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

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial greeting when component mounts
  useEffect(() => {
    let initialMessage = 'Hello! I\'m your culinary assistant. What type of cuisine or dish would you like to make today?';
    
    if (user && user.preferences) {
      const hasPreferences = (
        (user.preferences.allergies && user.preferences.allergies.length > 0) ||
        (user.preferences.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0) ||
        (user.preferences.favoriteIngredients && user.preferences.favoriteIngredients.length > 0) ||
        (user.preferences.dislikedIngredients && user.preferences.dislikedIngredients.length > 0)
      );
      
      if (hasPreferences) {
        initialMessage = `Hello! I'm your culinary assistant. I've loaded your dietary preferences and will take them into account when suggesting recipes. What type of cuisine or dish would you like to make today?`;
      }
    }
    
    addMessage({
      text: initialMessage,
      sender: 'bot'
    });
  }, []);

  // Add user preferences to system instructions
  useEffect(() => {
    if (user && user.preferences) {
      // Create a more structured format for the AI to understand
      const userPreferencesText = `
    
  User Preferences:
  ${user.preferences.allergies?.length ? `- ALLERGIES: ${user.preferences.allergies.join(', ')}. The AI MUST avoid suggesting recipes with these ingredients.` : ''}
  ${user.preferences.dietaryRestrictions?.length ? `- DIETARY RESTRICTIONS: ${user.preferences.dietaryRestrictions.join(', ')}. The AI MUST respect these restrictions in recommendations.` : ''}
  ${user.preferences.favoriteIngredients?.length ? `- FAVORITE INGREDIENTS: ${user.preferences.favoriteIngredients.join(', ')}. The AI SHOULD prioritize recipes with these ingredients when possible.` : ''}
  ${user.preferences.dislikedIngredients?.length ? `- DISLIKED INGREDIENTS: ${user.preferences.dislikedIngredients.join(', ')}. The AI SHOULD avoid recipes with these ingredients unless specifically requested.` : ''}
  
  IMPORTANT: When making recipe suggestions, ALWAYS take these preferences into account. Explicitly mention when a recipe suggestion aligns with user's favorite ingredients or avoids their allergies/restrictions.`;
    
      // Only modify if we have actual preferences
      if (userPreferencesText.trim() !== 'User Preferences:') {
        // Set the modified system instructions to include preferences
        setSystemInstructions(prevInstructions => {
          return prevInstructions + userPreferencesText;
        });
        
        console.log("Updated system instructions with user preferences");
      }
    }
  }, [user]);
  
  // Save recipe to user's saved recipes
  const saveRecipe = async (recipe) => {
    if (!user) {
      setErrorMessage('Please log in to save recipes');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
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
      
      // First save the recipe to the database
      const createResponse = await axios.post('/recipes/custom/create', completeRecipe);
      const savedRecipe = createResponse.data;
      
      // Then associate it with the user
      await axios.post(`/users/${user.id}/recipes/${savedRecipe._id}`);
      
      setSuccessMessage('Recipe saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setErrorMessage(error.response?.data?.error || error.message || 'Failed to save recipe');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Process and save recipe from bot message
  const processAndSaveRecipe = (botMessage) => {
    try {
      // Try to extract structured data from the message
      const structuredDataMatch = botMessage.text.match(/STRUCTURED_DATA: ({.*})/s);
      
      let recipe = null;
      
      if (structuredDataMatch) {
        try {
          const dataStr = structuredDataMatch[1];
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
        
        // If no ingredients were found, add a default one
        if (ingredients.length === 0) {
          ingredients.push({
            amount: "1",
            unit: "serving",
            ingredient: "Main ingredient"
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
        
        // If no instructions were found, add a default one
        if (instructions.length === 0) {
          instructions.push("Combine all ingredients and cook until done.");
        }
        
        // Create recipe object
        recipe = {
          name: name,
          ingredients: ingredients,
          instructions: instructions,
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
      }
      
      // Save the recipe
      saveRecipe(recipe);
    } catch (error) {
      console.error('Error processing recipe:', error);
      setErrorMessage('Failed to process recipe data');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  // Add a message to the chat
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  
  // Process user input using LLM
  const processUserInput = async (text) => {
    // Show thinking indicator
    setIsThinking(true);
    
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
      const response = await axios.post('/api/chat', {
        message: text,
        conversationHistory: conversationHistory
      });
      
      // Remove thinking message
      setIsThinking(false);
      
      let botResponse = response.data.message;
      let structuredData = response.data.structuredData;
      
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
      } else {
        // Extract structured data if present in the message
        const structuredDataMatch = botResponse.match(/STRUCTURED_DATA: ({.*})/s);
        if (structuredDataMatch) {
          try {
            const parsedData = JSON.parse(structuredDataMatch[1]);
            
            if (parsedData.responseType === 'options' && parsedData.options) {
              setOptions(parsedData.options);
            } else if (parsedData.responseType === 'recipe' && parsedData.recipe) {
              setCurrentRecipe(parsedData.recipe);
              setOptions([]);
            } else if (parsedData.responseType === 'custom_step' && parsedData.recommendations) {
              setOptions(parsedData.recommendations);
            }
          } catch (error) {
            console.error('Error parsing structured data in message:', error);
            setOptions([]);
          }
        } else {
          setOptions([]);
        }
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      
      // Remove thinking message
      setIsThinking(false);
      
      addMessage({
        text: "I'm having trouble connecting to the culinary service. Could you try again in a moment?",
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

  // Render the recipe
  const renderRecipe = () => {
    if (!currentRecipe) return null;
    
    return (
      <RecipeContainer>
        <RecipeHeader>
          <h3>{currentRecipe.name}</h3>
          <SaveRecipeButton onClick={() => saveRecipe(currentRecipe)} disabled={!user}>
            <SaveIcon />
            {user ? 'Save Recipe' : 'Login to Save'}
          </SaveRecipeButton>
        </RecipeHeader>
        
        <RecipeSection>
          <h4><IngredientsIcon />Ingredients</h4>
          <IngredientList>
            {currentRecipe.ingredients.map((ingredient, index) => (
              <IngredientItem key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
              </IngredientItem>
            ))}
          </IngredientList>
        </RecipeSection>
        
        <RecipeSection>
          <h4><InstructionsIcon />Instructions</h4>
          <InstructionList>
            {currentRecipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </InstructionList>
        </RecipeSection>
        
        <RecipeSection>
          <h4><NutritionIcon />Nutrition Information</h4>
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
          <div>
            <ClockIcon />
            <span>Prep: {currentRecipe.prepTime} min</span>
          </div>
          <div>
            <ClockIcon />
            <span>Cook: {currentRecipe.cookTime} min</span>
          </div>
          <div>
            <ServingsIcon />
            <span>Servings: {currentRecipe.servings}</span>
          </div>
          <div>
            <DifficultyIcon />
            <span>Difficulty: {currentRecipe.difficulty}</span>
          </div>
        </RecipeMetadata>
      </RecipeContainer>
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>
          <h2>AI Culinary Assistant</h2>
          <p>Your personal chef powered by AI</p>
        </HeaderTitle>
      </ChatHeader>
      
      <ActionsBar>
        <div>
          <ActionButton 
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
          >
            Save Last Recipe
          </ActionButton>
        </div>
        <div>
          <ActionButton
            as="a"
            href="/preferences"
            style={{ marginRight: '10px', textDecoration: 'none' }}
          >
            Manage Preferences
          </ActionButton>
          <ActionButton
            as="a"
            href="/recipes"
            style={{ textDecoration: 'none' }}
          >
            View Saved Recipes
          </ActionButton>
        </div>
      </ActionsBar>
      
      <ChatBody>
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageWrapper 
              key={index} 
              isUser={message.sender === 'user'}
              initial="hidden"
              animate="visible"
              variants={messageVariants}
            >
              <Avatar isUser={message.sender === 'user'}>
                {message.sender === 'user' ? 'U' : 'AI'}
              </Avatar>
              <MessageBubble isUser={message.sender === 'user'}>
                {message.text.replace(/STRUCTURED_DATA:[\s\S]*$/, '')}
              </MessageBubble>
            </MessageWrapper>
          ))}
          
          {isThinking && (
            <ThinkingBubble>
              <Dot delay="0s" />
              <Dot delay="0.2s" />
              <Dot delay="0.4s" />
            </ThinkingBubble>
          )}
          
          {currentRecipe && renderRecipe()}
          
          <AnimatePresence>
            {options.length > 0 && (
              <OptionsContainer>
                {options.map((option, index) => (
                  <OptionButton
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    variants={optionVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    {option.name || option}
                  </OptionButton>
                ))}
              </OptionsContainer>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {errorMessage && (
              <NotificationContainer 
                type="error"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={notificationVariants}
              >
                {errorMessage}
              </NotificationContainer>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {successMessage && (
              <NotificationContainer 
                type="success"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={notificationVariants}
              >
                {successMessage}
              </NotificationContainer>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </ChatBody>
      
      <ChatFooter>
        <MessageInput
          type="text"
          placeholder="Tell me what you'd like to cook today..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <SendButton onClick={handleSend}>
          Send
          <SendIcon />
        </SendButton>
      </ChatFooter>
    </ChatContainer>
  );
};

export default EnhancedChatInterface;
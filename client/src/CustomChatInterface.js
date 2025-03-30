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

const CustomChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [options, setOptions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietaryRestrictions: []
  });
  
  const messagesEndRef = useRef(null);

  // System instructions for the LLM
  const systemInstructions = `
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
  `;

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
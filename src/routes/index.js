const express = require('express');
const router = express.Router();
const { 
  generateWithLlama, 
  parseUserIntent, 
  generateRecipeSuggestions, 
  generateRecipe, 
  getIngredientRecommendations,
  processCulinaryChat // New conversation-based function
} = require('../services/llamaService');

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Culinary Assistant API is running' });
});

// NEW ENDPOINT: Process chat messages with conversation history
router.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Process the chat with our new function
    const response = await processCulinaryChat(message, conversationHistory);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints (kept for backward compatibility)

// Parse user intent
router.post('/api/parse-intent', async (req, res) => {
  try {
    const { userInput } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }
    
    const intent = await parseUserIntent(userInput);
    res.json(intent);
  } catch (error) {
    console.error('Error parsing intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recipe suggestions
router.post('/api/recipe-suggestions', async (req, res) => {
  try {
    const { intent } = req.body;
    if (!intent) {
      return res.status(400).json({ error: 'Intent is required' });
    }
    
    const suggestions = await generateRecipeSuggestions(intent);
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recipe details
router.post('/api/recipe-details', async (req, res) => {
  try {
    const { cuisine, dish, options } = req.body;
    
    const recipe = await generateRecipe(cuisine || 'any', dish, options || {});
    res.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ingredient recommendations
router.post('/api/ingredient-recommendations', async (req, res) => {
  try {
    const { currentSelections, categoryToRecommend } = req.body;
    
    const recommendations = await getIngredientRecommendations(
      currentSelections,
      categoryToRecommend
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting ingredient recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// For backward compatibility
router.post('/test-llama', async (req, res) => {
  try {
    // Check if the request is in conversation format
    if (req.body.messages && Array.isArray(req.body.messages)) {
      // Process as a conversation
      const response = await processChat(req.body.messages);
      res.json(response);
    } else {
      // Legacy format - single prompt
      const prompt = req.body.prompt || 'Give me a simple pasta recipe';
      const response = await generateWithLlama(prompt);
      res.json({ response });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import other routes
router.use('/recipes', require('./recipeRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/auth', require('./authRoutes'));

module.exports = router;
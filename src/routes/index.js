const express = require('express');
const router = express.Router();
const { generateWithLlama } = require('../services/llamaService');

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Culinary Assistant API is running' });
});

// Test Llama integration
router.post('/test-llama', async (req, res) => {
  try {
    const prompt = req.body.prompt || 'Give me a simple pasta recipe';
    const response = await generateWithLlama(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import other routes
router.use('/recipes', require('./recipeRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
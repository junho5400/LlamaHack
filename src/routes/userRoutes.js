const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Save recipe to user's saved list
router.post('/:userId/recipes/:recipeId', userController.saveRecipe);

// Get user's saved recipes
router.get('/:userId/recipes', userController.getSavedRecipes);

// Update user preferences
router.put('/:userId/preferences', userController.updatePreferences);

module.exports = router;
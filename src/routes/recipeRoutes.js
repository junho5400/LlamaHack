const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Get recipe options by cuisine and/or dish type
router.get('/options/:cuisine?/:dishType?', recipeController.getRecipeOptions);

// Get recipe by name
router.get('/:name', recipeController.getRecipeByName);

// Customize existing recipe
router.post('/customize/:recipeId', recipeController.customizeRecipe);

// Get ingredient options by category
router.get('/ingredients/:category', recipeController.getIngredientOptions);

// Get ingredient recommendations
router.get('/recommendations/:category/:base/:currentIngredients', recipeController.getIngredientRecommendations);

// Create custom recipe
router.post('/custom/create', recipeController.createCustomRecipe);

module.exports = router;
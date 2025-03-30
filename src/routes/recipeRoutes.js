const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Get pasta options by cuisine
router.get('/options/:cuisine', recipeController.getPastaOptions);

// Get recipe by name
router.get('/:name', recipeController.getRecipeByName);

// Customize existing recipe
router.post('/customize/:recipeId', recipeController.customizeRecipe);

// Custom recipe workflow
router.get('/custom/pasta-types', recipeController.getPastaTypes);
router.get('/custom/sauces/:pastaType', recipeController.getSauceOptions);
router.get('/custom/proteins/:pastaType/:sauce', recipeController.getProteinRecommendations);
router.get('/custom/vegetables/:pastaType/:sauce/:protein', recipeController.getVegetableRecommendations);
router.post('/custom/create', recipeController.createCustomRecipe);

module.exports = router;
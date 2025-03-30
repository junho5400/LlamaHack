const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Save recipe to user's saved list
exports.saveRecipe = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    
    // Find the user and recipe
    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Check if recipe is already saved
    if (user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ error: 'Recipe already saved' });
    }
    
    // Add recipe to user's saved recipes
    user.savedRecipes.push(recipeId);
    await user.save();
    
    return res.status(200).json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return res.status(500).json({ error: 'Failed to save recipe' });
  }
};

// Get user's saved recipes
exports.getSavedRecipes = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user and populate saved recipes
    const user = await User.findById(userId).populate('savedRecipes');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user.savedRecipes);
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    return res.status(500).json({ error: 'Failed to get saved recipes' });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { allergies, dietaryRestrictions, favoriteIngredients, dislikedIngredients } = req.body;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update preferences
    if (allergies) user.preferences.allergies = allergies;
    if (dietaryRestrictions) user.preferences.dietaryRestrictions = dietaryRestrictions;
    if (favoriteIngredients) user.preferences.favoriteIngredients = favoriteIngredients;
    if (dislikedIngredients) user.preferences.dislikedIngredients = dislikedIngredients;
    
    await user.save();
    
    return res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
};
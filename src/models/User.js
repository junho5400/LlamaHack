const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  preferences: {
    allergies: [String],
    dietaryRestrictions: [String],
    favoriteIngredients: [String],
    dislikedIngredients: [String]
  },
  savedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  customRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
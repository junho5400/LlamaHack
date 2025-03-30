const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['appetizer', 'main', 'side', 'dessert', 'breakfast', 'lunch', 'dinner', 'snack', 'drink', 'complete'],
    default: 'complete'
  },
  cuisine: {
    type: String,
    required: false,
    trim: true
  },
  ingredients: [{
    ingredient: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: false
    }
  }],
  instructions: [{
    type: String,
    required: true
  }],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
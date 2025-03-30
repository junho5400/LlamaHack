const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: [
      'base', 'protein', 'vegetable', 'fruit', 
      'grain', 'dairy', 'herb', 'spice', 
      'condiment', 'oil', 'sauce', 'pasta',
      'legume', 'nut', 'seed', 'sweetener', 'other'
    ],
    required: true
  },
  nutritionPer100g: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  commonAllergies: [String],
  substituteIngredients: [String],
  tags: [String]
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
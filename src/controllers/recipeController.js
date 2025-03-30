const { generateWithLlama } = require('../services/llamaService');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const { generateRecipe } = require('../services/llamaService');

// Get pasta options based on cuisine
exports.getPastaOptions = async (req, res) => {
  try {
    const { cuisine } = req.params;
    
    // Get pasta options from database or generate with Llama
    const pastaOptions = await Recipe.find({ 
      type: 'complete', 
      tags: { $in: [cuisine.toLowerCase(), 'pasta'] } 
    }).select('name nutrition prepTime difficulty');
    
    if (pastaOptions.length > 0) {
      return res.status(200).json(pastaOptions);
    }
    
    // If no options in database, generate with Llama
    const prompt = `List 5 popular pasta dishes for ${cuisine} cuisine. Return ONLY a JSON array in this format: 
    [{"name": "Dish name", "description": "Brief description"}]`;
    
    const response = await generateWithLlama(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const options = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json([...options, { name: "Create my own pasta", description: "Customize your own pasta dish" }]);
  } catch (error) {
    console.error('Error getting pasta options:', error);
    return res.status(500).json({ error: 'Failed to get pasta options' });
  }
};

// Get recipe by name
exports.getRecipeByName = async (req, res) => {
  try {
    const { name } = req.params;
    const recipe = await Recipe.findOne({ 
      name: { $regex: new RegExp(name, 'i') } 
    });
    
    if (recipe) {
      return res.status(200).json(recipe);
    }
    
    // Generate recipe with Llama if not in database
    const generatedRecipe = await generateRecipe('pasta', name);
    
    // Save generated recipe to database
    const newRecipe = new Recipe(generatedRecipe);
    await newRecipe.save();
    
    return res.status(200).json(newRecipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    return res.status(500).json({ error: 'Failed to get recipe' });
  }
};

// Customize existing recipe
exports.customizeRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { customizations } = req.body;
    
    if (!customizations || !customizations.length) {
      return res.status(400).json({ error: 'Customizations are required' });
    }
    
    // Get original recipe
    const originalRecipe = await Recipe.findById(recipeId);
    if (!originalRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Generate customized recipe with Llama
    const customizedRecipe = await generateRecipe('pasta', originalRecipe.name, {
      customizations
    });
    
    return res.status(200).json(customizedRecipe);
  } catch (error) {
    console.error('Error customizing recipe:', error);
    return res.status(500).json({ error: 'Failed to customize recipe' });
  }
};

// Get pasta types for custom recipe
exports.getPastaTypes = async (req, res) => {
  try {
    const pastaTypes = await Ingredient.find({ category: 'pasta' })
      .select('name');
    
    if (pastaTypes.length > 0) {
      return res.status(200).json(pastaTypes);
    }
    
    // Generate pasta types with Llama if not in database
    const prompt = `List 10 common types of pasta. Return ONLY a JSON array in this format: 
    [{"name": "Pasta name", "description": "Brief description"}]`;
    
    const response = await generateWithLlama(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const options = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json(options);
  } catch (error) {
    console.error('Error getting pasta types:', error);
    return res.status(500).json({ error: 'Failed to get pasta types' });
  }
};

// Get sauce options
exports.getSauceOptions = async (req, res) => {
  try {
    const { pastaType } = req.params;
    
    const sauceOptions = await Ingredient.find({ category: 'sauce' })
      .select('name');
    
    if (sauceOptions.length > 0) {
      return res.status(200).json(sauceOptions);
    }
    
    // Generate sauce options with Llama if not in database
    const prompt = `List 8 common pasta sauces that go well with ${pastaType}. Return ONLY a JSON array in this format: 
    [{"name": "Sauce name", "description": "Brief description"}]`;
    
    const response = await generateWithLlama(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const options = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json(options);
  } catch (error) {
    console.error('Error getting sauce options:', error);
    return res.status(500).json({ error: 'Failed to get sauce options' });
  }
};

// Get protein recommendations
exports.getProteinRecommendations = async (req, res) => {
  try {
    const { pastaType, sauce } = req.params;
    
    // Generate protein recommendations with Llama
    const prompt = `Recommend 5 protein options that go well with ${pastaType} pasta and ${sauce} sauce. Return ONLY a JSON array in this format: 
    [{"name": "Protein name", "description": "Why it's a good match"}]`;
    
    const response = await generateWithLlama(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const options = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json(options);
  } catch (error) {
    console.error('Error getting protein recommendations:', error);
    return res.status(500).json({ error: 'Failed to get protein recommendations' });
  }
};

// Get vegetable recommendations
exports.getVegetableRecommendations = async (req, res) => {
  try {
    const { pastaType, sauce, protein } = req.params;
    
    // Generate vegetable recommendations with Llama
    const prompt = `Recommend 5 vegetable options that go well with ${pastaType} pasta, ${sauce} sauce, and ${protein}. Return ONLY a JSON array in this format: 
    [{"name": "Vegetable name", "description": "Why it's a good match"}]`;
    
    const response = await generateWithLlama(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const options = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json(options);
  } catch (error) {
    console.error('Error getting vegetable recommendations:', error);
    return res.status(500).json({ error: 'Failed to get vegetable recommendations' });
  }
};

// Create custom recipe
exports.createCustomRecipe = async (req, res) => {
  try {
    const { 
      pastaType, 
      sauce, 
      protein, 
      vegetables, 
      nutritionalTargets, 
      allergies 
    } = req.body;
    
    // Generate custom recipe with Llama
    const customRecipePrompt = `
    Create a detailed pasta recipe using:
    - Pasta: ${pastaType}
    - Sauce: ${sauce}
    - Protein: ${protein}
    - Vegetables: ${vegetables.join(', ')}
    ${nutritionalTargets ? `- Nutritional targets: ${JSON.stringify(nutritionalTargets)}` : ''}
    ${allergies && allergies.length ? `- Avoid these ingredients: ${allergies.join(', ')}` : ''}
    
    Provide the recipe in this JSON format:
    {
      "name": "Recipe Name",
      "ingredients": [{"ingredient": "Ingredient name", "amount": "amount", "unit": "unit"}],
      "instructions": ["Step 1", "Step 2", ...],
      "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
      "prepTime": number,
      "cookTime": number,
      "servings": number,
      "difficulty": "easy/medium/hard"
    }`;
    
    const customRecipe = await generateRecipe('custom', 'custom', {
      customOptions: {
        pastaType,
        sauce,
        protein,
        vegetables
      },
      nutritionalTargets,
      allergies
    });
    
    // Save the custom recipe to database
    const newRecipe = new Recipe({
      ...customRecipe,
      type: 'complete',
      tags: ['custom', 'pasta', pastaType, sauce, protein, ...vegetables]
    });
    await newRecipe.save();
    
    return res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating custom recipe:', error);
    return res.status(500).json({ error: 'Failed to create custom recipe' });
  }
};
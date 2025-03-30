const axios = require('axios');
require('dotenv').config();

// Configure Together.ai API credentials
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/v1';
const LLAMA_MODEL = 'meta-llama/Llama-3-70b-chat'; // You can choose the appropriate model size

/**
 * Generate text using Together.ai API
 * @param {string} prompt - The prompt to send to Llama
 * @param {Object} options - Additional options for generation
 * @returns {Promise<string>} - The generated text
 */
async function generateWithLlama(prompt, options = {}) {
  try {
    const response = await axios.post(`${TOGETHER_API_URL}/completions`, {
      model: options.model || LLAMA_MODEL,
      prompt: formatPrompt(prompt),
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      stop: options.stop || ["\n\nHuman:", "\n\nAssistant:"]
    }, {
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating with Together.ai:', error);
    throw error;
  }
}

/**
 * Format prompt for Together.ai chat models
 * @param {string} prompt - The raw prompt
 * @returns {string} - Formatted prompt for Together.ai
 */
function formatPrompt(prompt) {
  return `<|im_start|>system
You are a helpful culinary assistant that helps users find recipes, customize them, and create their own recipes.
<|im_end|>
<|im_start|>user
${prompt}
<|im_end|>
<|im_start|>assistant
`;
}

/**
 * Parse intent from user input
 * @param {string} userInput - Raw user input
 * @returns {Promise<Object>} - Structured intent data
 */
async function parseUserIntent(userInput) {
  const prompt = `
I need you to parse the following user input for a cooking assistant and extract the key information.

User input: "${userInput}"

Please return a JSON object with the following structure:
{
  "intent": "search_recipe" or "customize_recipe" or "create_custom" or "general_question",
  "cuisine": "italian" or other cuisine type (if specified),
  "dishType": "pasta" or other dish type (if specified),
  "specificDish": specific dish name (if specified),
  "customization": customization request (if any),
  "ingredients": [any ingredients mentioned],
  "preferences": any dietary preferences mentioned
}

Only include fields that are clearly mentioned or implied in the user input.
`;
  
  const response = await generateWithLlama(prompt, {
    temperature: 0.3, // Lower temperature for more predictable JSON parsing
    max_tokens: 500
  });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/{[\s\S]*?}/);
    const parsedIntent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    if (!parsedIntent) {
      throw new Error('Failed to parse intent from response');
    }
    
    return parsedIntent;
  } catch (error) {
    console.error('Error parsing intent:', error);
    // Fallback to basic intent detection
    return {
      intent: 'search_recipe',
      specificDish: userInput
    };
  }
}

/**
 * Generate recipe suggestions based on user intent
 * @param {Object} intent - Parsed user intent
 * @returns {Promise<Array>} - List of recipe suggestions
 */
async function generateRecipeSuggestions(intent) {
  let prompt = 'List 5 delicious ';
  
  if (intent.cuisine) {
    prompt += `${intent.cuisine} `;
  }
  
  if (intent.dishType) {
    prompt += `${intent.dishType} `;
  } else {
    prompt += 'recipes ';
  }
  
  if (intent.ingredients && intent.ingredients.length > 0) {
    prompt += `using ${intent.ingredients.join(', ')} `;
  }
  
  if (intent.preferences) {
    prompt += `that are ${intent.preferences} `;
  }
  
  prompt += `
Return ONLY a JSON array in this format:
[
  {
    "name": "Recipe name",
    "description": "Brief description of the dish",
    "difficultyLevel": "easy|medium|hard",
    "prepTime": "time in minutes"
  }
]
`;
  
  const response = await generateWithLlama(prompt, {
    temperature: 0.7,
    max_tokens: 1000
  });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return suggestions;
  } catch (error) {
    console.error('Error parsing recipe suggestions:', error);
    return [];
  }
}

/**
 * Generate a recipe based on user inputs
 * @param {string} cuisine - Type of cuisine
 * @param {string} dish - Specific dish or "custom"
 * @param {Object} options - Additional options (customizations, nutritional targets)
 * @returns {Promise<Object>} - The generated recipe
 */
async function generateRecipe(cuisine, dish, options = {}) {
  let prompt = '';
  
  if (dish === 'custom') {
    prompt = `Create a custom recipe with the following requirements:\n`;
    
    if (options.customOptions) {
      const { base, protein, vegetables, seasonings, cookingMethod } = options.customOptions;
      
      prompt += `
- Base: ${base || 'any suitable base'}
- Protein: ${protein || 'any suitable protein'}
- Vegetables: ${vegetables ? vegetables.join(', ') : 'any suitable vegetables'}
- Seasonings: ${seasonings ? seasonings.join(', ') : 'any suitable seasonings'}
- Cooking Method: ${cookingMethod || 'any suitable cooking method'}
`;
    }
  } else {
    prompt = `Create a detailed recipe for ${dish}${cuisine !== 'any' ? ` in ${cuisine} cuisine` : ''}.\n`;
  }
  
  // Add customization options if provided
  if (options.customizations && options.customizations.length > 0) {
    prompt += `\nCustomizations: ${options.customizations.join(', ')}\n`;
  }
    
  // Add nutritional targets if provided
  if (options.nutritionalTargets) {
    prompt += `\nNutritional targets: ${JSON.stringify(options.nutritionalTargets)}\n`;
  }
  
  // Add allergies if provided
  if (options.allergies && options.allergies.length > 0) {
    prompt += `\nAvoid these ingredients due to allergies: ${options.allergies.join(', ')}\n`;
  }
  
  prompt += `\nProvide the recipe in this JSON format:
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
  
  const response = await generateWithLlama(prompt, {
    temperature: 0.7,
    max_tokens: 2000 // Recipes can be lengthy
  });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/{[\s\S]*?}/);
    const recipeJson = jsonMatch ? jsonMatch[0] : null;
    
    if (!recipeJson) {
      throw new Error('Failed to extract recipe JSON from response');
    }
    
    return JSON.parse(recipeJson);
  } catch (error) {
    console.error('Error parsing recipe response:', error);
    return { error: 'Failed to parse recipe', rawResponse: response };
  }
}

/**
 * Get ingredient recommendations based on current selections
 * @param {Object} currentSelections - Current ingredient selections
 * @param {string} categoryToRecommend - Category to get recommendations for
 * @returns {Promise<Array>} - List of recommended ingredients
 */
async function getIngredientRecommendations(currentSelections, categoryToRecommend) {
  const prompt = `
Based on these selected ingredients:
${Object.entries(currentSelections)
  .filter(([key, value]) => value && value.length > 0)
  .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
  .join('\n')}

Recommend 5 ${categoryToRecommend} options that would pair well with these ingredients.
Return ONLY a JSON array in this format:
[
  {
    "name": "${categoryToRecommend} name",
    "description": "Why it's a good match with the current ingredients"
  }
]
`;

  const response = await generateWithLlama(prompt, {
    temperature: 0.7,
    max_tokens: 1000
  });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return recommendations;
  } catch (error) {
    console.error('Error parsing ingredient recommendations:', error);
    return [];
  }
}

module.exports = {
  generateWithLlama,
  parseUserIntent,
  generateRecipeSuggestions,
  generateRecipe,
  getIngredientRecommendations
};
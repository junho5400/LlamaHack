const axios = require('axios');
require('dotenv').config();

// Configure Together.ai API credentials
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
// Using a model with higher rate limits
const LLAMA_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

// Rate limiter with queue implementation
const rateLimiter = {
  lastRequestTime: 0,
  queue: [],
  requestsPerMinute: 5, // Stay below the 6 per minute limit
  processingQueue: false,
  
  async scheduleRequest(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.processingQueue) {
        this.processingQueue = true;
        this.processQueue();
      }
    });
  },
  
  async processQueue() {
    if (this.queue.length === 0) {
      this.processingQueue = false;
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.requestsPerMinute;
    
    if (timeSinceLastRequest < minInterval) {
      // Wait before processing next request
      const waitTime = minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      setTimeout(() => this.processQueue(), waitTime);
      return;
    }
    
    const { fn, resolve, reject } = this.queue.shift();
    this.lastRequestTime = Date.now();
    
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
    
    // Process next request in queue
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 0);
    } else {
      this.processingQueue = false;
    }
  }
};

// Simple cache implementation
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Generate text using Together.ai API with rate limiting and retries
 * @param {string} prompt - The prompt to send to Llama
 * @param {Object} options - Additional options for generation
 * @returns {Promise<string>} - The generated text
 */
async function generateWithLlama(prompt, options = {}) {
  // Create a cache key from the prompt and relevant options
  const cacheKey = JSON.stringify({
    prompt: prompt.substring(0, 100), // Use a prefix of the prompt to avoid overly long keys
    model: options.model || LLAMA_MODEL,
    temperature: options.temperature || 0.7,
  });
  
  // Check if we have a cached response
  if (cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey);
    if (Date.now() - cachedItem.timestamp < CACHE_TTL) {
      console.log('Using cached response for prompt:', prompt.substring(0, 50) + '...');
      return cachedItem.response;
    } else {
      // Cache expired, remove it
      cache.delete(cacheKey);
    }
  }
  
  return rateLimiter.scheduleRequest(async () => {
    const maxRetries = 3;
    let retries = 0;
    let lastError = null;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Calling Together AI API with prompt: ${prompt.substring(0, 100)}...`);
        
        // Format messages in the ChatML format
        const messages = [
          {
            role: "system",
            content: "You are a helpful culinary assistant that helps users find recipes, customize them, and create their own recipes."
          },
          {
            role: "user",
            content: prompt
          }
        ];
        
        const response = await axios.post(TOGETHER_API_URL, {
          model: options.model || LLAMA_MODEL,
          messages: messages,
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9
        }, {
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Extract the assistant's response from the choices
        if (response.data && 
            response.data.choices && 
            response.data.choices.length > 0 && 
            response.data.choices[0].message) {
          const result = response.data.choices[0].message.content.trim();
          
          // Cache successful response
          cache.set(cacheKey, {
            response: result,
            timestamp: Date.now()
          });
          
          return result;
        } else {
          console.error('Unexpected API response format:', JSON.stringify(response.data));
          throw new Error('Unexpected API response format');
        }
      } catch (error) {
        lastError = error;
        
        if (error.response && error.response.status === 429) {
          // Rate limit hit, get retry-after header or use exponential backoff
          retries++;
          if (retries > maxRetries) {
            console.error(`Max retries (${maxRetries}) reached for rate limit. Giving up.`);
            break;
          }
          
          const retryAfter = error.response.headers['retry-after'] 
            ? parseInt(error.response.headers['retry-after']) * 1000 
            : Math.pow(2, retries) * 1000;
          
          console.log(`Rate limited. Retry ${retries}/${maxRetries} in ${retryAfter/1000} seconds...`);
          
          // Wait for the retry-after period
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else {
          // For non-rate-limit errors, don't retry
          console.error('Error generating with Together.ai:', error.message);
          if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', error.response.data);
          }
          break;
        }
      }
    }
    
    // If we got here, all retries failed or we had a non-retryable error
    console.log('Falling back to rule-based response due to API failure');
    
    // Implement fallback logic based on prompt content
    return generateFallbackResponse(prompt);
  });
}

/**
 * Generate a fallback response when API calls fail
 * @param {string} prompt - The original prompt
 * @returns {string} - A basic fallback response
 */
function generateFallbackResponse(prompt) {
  // Extract the essence of what's being asked
  const promptLower = prompt.toLowerCase();
  
  // Check for common recipe-related queries
  if (promptLower.includes('recipe') && promptLower.includes('json')) {
    // If requesting a recipe in JSON format
    const dishMatch = prompt.match(/recipe for ([^.?!]+)/i);
    const dish = dishMatch ? dishMatch[1].trim() : 'a basic dish';
    
    // Generate a simple recipe JSON
    return JSON.stringify({
      name: `Simple ${dish.charAt(0).toUpperCase() + dish.slice(1)}`,
      ingredients: [
        { ingredient: "Main ingredient", amount: "500", unit: "g" },
        { ingredient: "Secondary ingredient", amount: "200", unit: "g" },
        { ingredient: "Seasoning", amount: "2", unit: "tsp" }
      ],
      instructions: [
        "Prepare ingredients by washing and chopping them.",
        "Cook main ingredients until done.",
        "Add seasonings and serve."
      ],
      nutrition: {
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        fiber: 5
      },
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: "medium"
    }, null, 2);
  }
  
  // For parsing intents
  if (promptLower.includes('parse') && promptLower.includes('user input')) {
    const userInputMatch = prompt.match(/User input:\s*"([^"]*)"/);
    if (userInputMatch && userInputMatch[1]) {
      const userInput = userInputMatch[1].toLowerCase();
      
      // Basic intent detection
      let intent = "search_recipe";
      if (userInput.includes('make') || userInput.includes('how')) {
        intent = "search_recipe";
      } else if (userInput.includes('spicy') || userInput.includes('less') || userInput.includes('more')) {
        intent = "customize_recipe";
      }
      
      // Extract ingredients
      const ingredients = [];
      if (userInput.includes('chicken')) ingredients.push('chicken');
      if (userInput.includes('beef')) ingredients.push('beef');
      if (userInput.includes('pasta')) ingredients.push('pasta');
      
      return JSON.stringify({
        intent: intent,
        specificDish: userInput,
        ingredients: ingredients
      }, null, 2);
    }
  }
  
  // Generic fallback
  return "I'm currently experiencing connectivity issues with my knowledge service. I've saved your request and will process it as soon as possible. In the meantime, could you try a more specific query or try again in a few minutes?";
}

/**
 * Parse intent from user input
 * @param {string} userInput - Raw user input
 * @returns {Promise<Object>} - Structured intent data
 */
async function parseUserIntent(userInput) {
  try {
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
  
    try {
      const response = await generateWithLlama(prompt, {
        temperature: 0.3,
        max_tokens: 500
      });
      
      // Extract JSON from response
      const jsonMatch = response.match(/{[\s\S]*?}/);
      const parsedIntent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (parsedIntent) {
        return parsedIntent;
      }
    } catch (apiError) {
      console.error('API call failed:', apiError);
      // Fall through to the fallback
    }
    
    // Fallback logic - simple rule-based intent detection
    console.log('Using fallback intent parsing for input:', userInput);
    
    const lowerInput = userInput.toLowerCase();
    
    // Basic ingredient detection
    const ingredients = [];
    if (lowerInput.includes('chicken')) ingredients.push('chicken');
    if (lowerInput.includes('beef')) ingredients.push('beef');
    if (lowerInput.includes('pork')) ingredients.push('pork');
    if (lowerInput.includes('fish')) ingredients.push('fish');
    if (lowerInput.includes('pasta')) ingredients.push('pasta');
    if (lowerInput.includes('rice')) ingredients.push('rice');
    
    // Basic cuisine detection
    let cuisine = null;
    if (lowerInput.includes('italian')) cuisine = 'italian';
    if (lowerInput.includes('chinese')) cuisine = 'chinese';
    if (lowerInput.includes('mexican')) cuisine = 'mexican';
    if (lowerInput.includes('indian')) cuisine = 'indian';
    if (lowerInput.includes('french')) cuisine = 'french';
    
    return {
      intent: 'search_recipe',
      specificDish: userInput,
      ingredients: ingredients,
      cuisine: cuisine
    };
  } catch (error) {
    console.error('Error in intent parsing:', error);
    // Ultimate fallback
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
  
  try {
    const response = await generateWithLlama(prompt, {
      temperature: 0.7,
      max_tokens: 1000
    });
    
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
  try {
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
      // Extract JSON from response - look for patterns that would indicate JSON content
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      
      // If no match found, try to extract from code blocks
      if (!jsonMatch) {
        jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})```/);
        if (jsonMatch) {
          jsonMatch = [jsonMatch[1]]; // Get the content inside the code block
        }
      }
      
      const recipeJson = jsonMatch ? jsonMatch[0] : null;
      
      if (!recipeJson) {
        console.error('Failed to extract recipe JSON from response:', response);
        return createFallbackRecipe(dish, cuisine);
      }
      
      // Try to clean and parse the JSON
      let cleanedJson = recipeJson;
      
      // Fix common JSON formatting issues
      cleanedJson = cleanedJson.replace(/(\r\n|\n|\r)/gm, " "); // Replace newlines with spaces
      cleanedJson = cleanedJson.replace(/,\s*]/g, "]"); // Remove trailing commas in arrays
      cleanedJson = cleanedJson.replace(/,\s*}/g, "}"); // Remove trailing commas in objects
      
      try {
        const parsedRecipe = JSON.parse(cleanedJson);
        
        // Validate and fix ingredients
        if (parsedRecipe.ingredients && Array.isArray(parsedRecipe.ingredients)) {
          parsedRecipe.ingredients = parsedRecipe.ingredients.map(ing => ({
            ingredient: ing.ingredient || "Unknown ingredient",
            amount: ing.amount || "1", // Default to 1 if amount is missing
            unit: ing.unit || ""  // Empty string for unit if missing
          }));
        } else {
          parsedRecipe.ingredients = [
            { ingredient: "Main ingredient", amount: "1", unit: "serving" }
          ];
        }
        
        // Validate that required fields exist
        if (!parsedRecipe.name) {
          parsedRecipe.name = `${cuisine !== 'any' ? cuisine + ' ' : ''}${dish}`.trim();
        }
        
        if (!parsedRecipe.instructions || !Array.isArray(parsedRecipe.instructions) || parsedRecipe.instructions.length === 0) {
          parsedRecipe.instructions = ["Combine all ingredients and cook until done."];
        }
        
        // Ensure nutrition object exists
        if (!parsedRecipe.nutrition) {
          parsedRecipe.nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          };
        }
        
        // Set default values for missing fields
        parsedRecipe.prepTime = parsedRecipe.prepTime || 15;
        parsedRecipe.cookTime = parsedRecipe.cookTime || 30;
        parsedRecipe.servings = parsedRecipe.servings || 4;
        parsedRecipe.difficulty = parsedRecipe.difficulty || "medium";
        
        console.log('Successfully parsed recipe:', parsedRecipe.name);
        return parsedRecipe;
      } catch (parseError) {
        console.error('Error parsing recipe response:', parseError);
        console.error('Problematic JSON:', cleanedJson);
        return createFallbackRecipe(dish, cuisine);
      }
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      return createFallbackRecipe(dish, cuisine);
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    return createFallbackRecipe(dish, cuisine);
  }
}

/**
 * Create a fallback recipe when API or parsing fails
 * @param {string} dish - The dish name
 * @param {string} cuisine - The cuisine type
 * @returns {Object} - A basic recipe object
 */
function createFallbackRecipe(dish, cuisine) {
  const capitalizedDish = dish.charAt(0).toUpperCase() + dish.slice(1);
  const recipeName = cuisine !== 'any' ? `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} ${capitalizedDish}` : capitalizedDish;
  
  const commonIngredients = [];
  
  // Add basic ingredients based on the dish name
  if (dish.toLowerCase().includes('chicken')) {
    commonIngredients.push(
      { ingredient: "Chicken", amount: "500", unit: "g" },
      { ingredient: "Salt", amount: "1", unit: "tsp" },
      { ingredient: "Pepper", amount: "1/2", unit: "tsp" }
    );
  } else if (dish.toLowerCase().includes('pasta')) {
    commonIngredients.push(
      { ingredient: "Pasta", amount: "250", unit: "g" },
      { ingredient: "Olive oil", amount: "2", unit: "tbsp" },
      { ingredient: "Garlic", amount: "2", unit: "cloves" }
    );
  } else if (dish.toLowerCase().includes('soup')) {
    commonIngredients.push(
      { ingredient: "Broth", amount: "1", unit: "liter" },
      { ingredient: "Onion", amount: "1", unit: "medium" },
      { ingredient: "Carrot", amount: "2", unit: "medium" }
    );
  } else {
    commonIngredients.push(
      { ingredient: "Main ingredient", amount: "500", unit: "g" },
      { ingredient: "Salt", amount: "1", unit: "tsp" },
      { ingredient: "Pepper", amount: "1/2", unit: "tsp" },
      { ingredient: "Olive oil", amount: "2", unit: "tbsp" }
    );
  }
  
  return {
    name: recipeName,
    ingredients: commonIngredients,
    instructions: [
      "Prepare all ingredients by washing and chopping as needed.",
      "Cook the main ingredients using your preferred method.",
      "Add seasonings to taste.",
      "Serve hot and enjoy!"
    ],
    nutrition: {
      calories: 350,
      protein: 25,
      carbs: 30,
      fat: 15,
      fiber: 5
    },
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "medium"
  };
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

  try {
    const response = await generateWithLlama(prompt, {
      temperature: 0.7,
      max_tokens: 1000
    });
    
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
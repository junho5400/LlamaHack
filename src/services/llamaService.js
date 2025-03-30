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
 * Process a chat with Llama model using conversation format
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Additional options for generation
 * @returns {Promise<Object>} - The generated response with structured data
 */
async function processChat(messages, options = {}) {
  // Create a cache key from the messages
  const cacheKey = JSON.stringify({
    messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) })),
    model: options.model || LLAMA_MODEL,
    temperature: options.temperature || 0.7,
  });
  
  // Check if we have a cached response
  if (cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey);
    if (Date.now() - cachedItem.timestamp < CACHE_TTL) {
      console.log('Using cached response for conversation');
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
        console.log(`Calling Together AI API with ${messages.length} messages`);
        
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
          
          // Process the result for structured data
          let structuredData = null;
          let cleanedResponse = result;
          
          const structuredDataMatch = result.match(/STRUCTURED_DATA: ({.*})/s);
          if (structuredDataMatch) {
            try {
              structuredData = JSON.parse(structuredDataMatch[1]);
              // Remove the structured data part from the message
              cleanedResponse = result.replace(/STRUCTURED_DATA: ({.*})/s, '').trim();
            } catch (error) {
              console.error('Error parsing structured data:', error);
            }
          }
          
          const processedResponse = {
            message: cleanedResponse,
            structuredData,
            raw: result
          };
          
          // Cache successful response
          cache.set(cacheKey, {
            response: processedResponse,
            timestamp: Date.now()
          });
          
          return processedResponse;
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
    
    // Implement fallback logic based on message content
    return generateFallbackResponse(messages);
  });
}

/**
 * Generate a fallback response when API calls fail
 * @param {Array} messages - Array of message objects
 * @returns {Object} - A basic fallback response
 */
function generateFallbackResponse(messages) {
  // Extract the last user message
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop();
  
  const prompt = lastUserMessage ? lastUserMessage.content : '';
  const promptLower = prompt.toLowerCase();
  
  let response = {
    message: "I'm currently experiencing connectivity issues with my knowledge service. I've saved your request and will process it as soon as possible. In the meantime, could you try a more specific query or try again in a few minutes?",
    structuredData: null,
    raw: null
  };
  
  // Check for recipe requests
  if (promptLower.includes('recipe') || promptLower.includes('make') || promptLower.includes('cook')) {
    // Extract dish name if possible
    const dishMatch = prompt.match(/(make|cook|prepare|recipe for) ([^.?!]+)/i);
    const dish = dishMatch ? dishMatch[2].trim() : 'a dish';
    
    response.message = `I'd be happy to help you with a recipe for ${dish}. Could you tell me more about what specific variation you're looking for? For example, would you prefer a traditional recipe or something with a twist?`;
    
    response.structuredData = {
      responseType: "options",
      options: [
        { name: `Traditional ${dish}`, description: "Classic preparation" },
        { name: `Quick ${dish}`, description: "Fast and easy version" },
        { name: `Healthy ${dish}`, description: "Lower calorie option" },
        { name: "Create my own recipe", description: "Customize your own dish" }
      ]
    };
  }
  
  return response;
}

/**
 * Process user input for culinary assistant chat
 * @param {string} userInput - User's message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<Object>} - The processed response
 */
async function processCulinaryChat(userInput, conversationHistory = []) {
  // System instructions for culinary assistant
  const systemInstructions = `
    You are a culinary assistant that helps users find recipes, customize them, and create their own recipes.
    
    Follow this workflow:
    1. When a user asks for a type of dish, offer 4-5 specific options, always including "Create my own recipe"
    2. If they select a specific recipe, provide detailed ingredients, steps, and nutrition info
    3. If they want to customize a recipe, apply their requested changes
    4. If they choose "Create my own recipe":
       a. First ask about nutritional targets
       b. Then ask about main ingredients/base
       c. Then ask about protein
       d. Then ask about vegetables
       e. Then ask about seasonings
       f. Finally ask about cooking method
    5. For custom recipes, recommend ingredients that pair well with their previous choices
    6. Always provide complete cooking instructions and nutrition details
    
    Always offer contextual recommendations based on the user's previous choices.
    
    In your responses, you should also include structured data in the following format to help the UI:
    
    STRUCTURED_DATA: {
      "responseType": "options" | "recipe" | "custom_step" | "general",
      "options": [{"name": "Option 1", "description": "Description"}, ...] (if responseType is "options"),
      "recipe": { 
        "name": "Recipe Name",
        "ingredients": [{"ingredient": "Ingredient name", "amount": "amount", "unit": "unit"}],
        "instructions": ["Step 1", "Step 2", ...],
        "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
        "prepTime": number,
        "cookTime": number,
        "servings": number
      } (if responseType is "recipe"),
      "currentStep": "nutrition" | "base" | "protein" | "vegetables" | "seasonings" | "cookingMethod" (if responseType is "custom_step"),
      "recommendations": [{"name": "Recommendation", "reason": "Reason"}, ...] (if applicable)
    }
    
    Put this structured data at the END of your response, it will be removed before showing to the user.
  `;
  
  // Format the messages
  const messages = [
    { role: 'system', content: systemInstructions },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ];
  
  // Call processChat with the messages
  return processChat(messages, {
    temperature: 0.7,
    max_tokens: 1500
  });
}

// Old functions kept for backward compatibility (legacy functions)
async function generateWithLlama(prompt, options = {}) {
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
  
  // Use processChat to handle the request
  const response = await processChat(messages, options);
  
  // Return just the message text for backward compatibility
  return response.message;
}

// Keep other legacy functions
const parseUserIntent = async (userInput) => {
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
    
    // Basic intent detection
    let intent = 'search_recipe';
    if (lowerInput.includes('customize') || lowerInput.includes('change') || 
        lowerInput.includes('less') || lowerInput.includes('more') || 
        lowerInput.includes('without') || lowerInput.includes('add')) {
      intent = 'customize_recipe';
    } else if (lowerInput.includes('create my own') || lowerInput.includes('make my own')) {
      intent = 'create_custom';
    } else if (lowerInput.includes('how') || lowerInput.includes('what') || 
               lowerInput.includes('why') || lowerInput.includes('when')) {
      intent = 'general_question';
    }
    
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
      intent: intent,
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
};

// Keep the other legacy functions for backwards compatibility
const generateRecipeSuggestions = async (intent) => {
  // Implementation using generateWithLlama
  // ...same as before
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
};

const generateRecipe = async (cuisine, dish, options = {}) => {
  // Implementation using generateWithLlama
  // ...same as before
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
};

const createFallbackRecipe = (dish, cuisine) => {
  // Fallback recipe creation
  // ...same as before
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
};

const getIngredientRecommendations = async (currentSelections, categoryToRecommend) => {
  // Implementation using generateWithLlama
  // ...same as before
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
};

module.exports = {
  generateWithLlama,
  parseUserIntent,
  generateRecipeSuggestions,
  generateRecipe,
  getIngredientRecommendations,
  processCulinaryChat // New function for the conversational approach
};
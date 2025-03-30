const axios = require('axios');
require('dotenv').config();

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

/**
 * Generate text using Llama 3.2 model
 * @param {string} prompt - The prompt to send to Llama
 * @param {Object} options - Additional options for generation
 * @returns {Promise<string>} - The generated text
 */
async function generateWithLlama(prompt, options = {}) {
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: 'llama3.2',
      prompt,
      stream: false,
      ...options
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error generating with Llama:', error);
    throw error;
  }
}

function extractJsonFromLlamaResponse(response) {
  try {
    // Try various patterns to extract JSON
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                     response.match(/```\n([\s\S]*?)\n```/) ||
                     response.match(/{[\s\S]*?}/);
                     
    const jsonString = jsonMatch ? jsonMatch[0] : response;
    const cleanedJsonString = jsonString.replace(/```json\n|```\n|```/g, '');
    
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error('Error parsing Llama response:', error);
    throw new Error('Failed to parse recipe response from Llama');
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
  const isCustom = dish === 'custom';
  
  let prompt = isCustom 
    ? `Create a custom ${cuisine} recipe with the following requirements:\n` 
    : `Give me a detailed recipe for ${dish} in ${cuisine} cuisine.\n`;
    
  // Add nutritional targets if provided
  if (options.nutritionalTargets) {
    prompt += `Nutritional targets: ${JSON.stringify(options.nutritionalTargets)}\n`;
  }
  
  // Add customizations if provided
  if (options.customizations && options.customizations.length > 0) {
    prompt += `Customizations: ${options.customizations.join(', ')}\n`;
  }
  
  // Add allergies if provided
  if (options.allergies && options.allergies.length > 0) {
    prompt += `Avoid these ingredients due to allergies: ${options.allergies.join(', ')}\n`;
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
  
  const response = await generateWithLlama(prompt);
  
  try {
    return extractJsonFromLlamaResponse(response);
  } catch (error) {
    console.error('Error parsing Llama response:', error);
    return { error: 'Failed to parse recipe', rawResponse: response };
  }
}

module.exports = {
  generateWithLlama,
  generateRecipe,
  extractJsonFromLlamaResponse
};
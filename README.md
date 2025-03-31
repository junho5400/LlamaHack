AI Culinary Assistant

A smart, conversational culinary assistant that helps users discover recipes, customize them to their preferences, and create custom recipes with personalized guidance.
Project Overview
AI Culinary Assistant is a web application that uses Llama 3 to provide intelligent recipe recommendations and interactive cooking guidance. This project was developed for the Meta Hackathon @ WashU 2025.
Key Features

Recipe Discovery: Find recipes based on specific cuisines, ingredients, or dietary preferences
Recipe Customization: Modify existing recipes based on your preferences (spicier, less salt, etc.)
Custom Recipe Creation: Create entirely new recipes with step-by-step guidance
Smart Recommendations: Get ingredient recommendations that complement your existing choices
User Preferences: Save your dietary restrictions, allergies, and ingredient preferences
Recipe Management: Save and organize your favorite recipes

Tech Stack

Frontend: React, Styled Components, Framer Motion
Backend: Node.js, Express
Database: MongoDB
AI Model: Llama 3 via Together.ai API
Authentication: JWT

Getting Started
Prerequisites

Node.js (v16+ recommended)
MongoDB (local or cloud instance)
Together.ai API key (for Llama 3 access)

Installation

Clone the repository:
Copygit clone https://github.com/brian5400/LlamaHack.git
cd LlamaHack

Install backend dependencies:
npm install

Install frontend dependencies:
cd client
npm install
cd ..

Set up environment variables:
Create a .env file in the root directory with the following variables:
CopyPORT=3000
MONGODB_URI=mongodb://localhost:27017/culinary-assistant
JWT_SECRET=your_jwt_secret
TOGETHER_API_KEY=your_together_ai_api_key

Start the development server:
Copy# Start both frontend and backend concurrently
npm run dev


Workflow

Recipe Discovery:

User specifies the type of dish they want to make
System presents multiple options, including "Create my own recipe"
User selects a specific recipe or the custom option


Recipe Details:

For existing recipes, system provides ingredients, instructions, and nutrition information
User can customize the recipe with natural language requests


Custom Recipe Creation:

System guides user through a step-by-step process:

Nutritional targets
Base/main ingredients
Proteins
Vegetables
Seasonings
Cooking method


At each step, system offers intelligent recommendations based on previous choices


Recipe Management:

User can save recipes to their personal collection
User can view and manage saved recipes


User Preferences:

User can set dietary preferences and allergies
System respects these preferences when making recommendations



API Endpoints
Authentication

POST /auth/register - Register a new user
POST /auth/login - Log in a user
GET /auth/me - Get current user profile

Recipes

GET /recipes/options/:cuisine?/:dishType? - Get recipe options by cuisine and/or dish type
GET /recipes/:name - Get recipe by name
POST /recipes/customize/:recipeId - Customize existing recipe
GET /recipes/ingredients/:category - Get ingredient options by category
GET /recipes/recommendations/:category/:base/:currentIngredients - Get ingredient recommendations
POST /recipes/custom/create - Create custom recipe

User

POST /users/:userId/recipes/:recipeId - Save recipe to user's saved list
GET /users/:userId/recipes - Get user's saved recipes
PUT /users/:userId/preferences - Update user preferences

Chat

POST /api/chat - Process conversation with the AI culinary assistant

Deployment

Build the React frontend:
Copycd client
npm run build
cd ..

Deploy to your preferred hosting platform (Heroku, Vercel, AWS, etc.)
Set environment variables on your hosting platform

Future Enhancements

Additional cuisine types and recipe categories
Recipe sharing features
Weekly meal planning
Shopping list generation
Voice interface
Mobile app version

Contributors

Brian Hong
Tony Park

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Thanks to Meta for organizing the Hackathon
Together.ai for providing access to Llama 3
McKelvey Build Fellowship for hosting
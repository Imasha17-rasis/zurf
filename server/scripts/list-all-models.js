require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key set:', !!apiKey);
console.log('');

const genAI = new GoogleGenerativeAI(apiKey);

// Check what methods are available
console.log('genAI object methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
console.log('');

// Try different approaches to get models
async function listModels() {
  try {
    console.log('=== Attempting to list models ===\n');

    // Approach 1: Direct API call
    try {
      console.log('Approach 1: Using fetch to call API directly...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const data = await response.json();
      
      console.log('Available Models:');
      if (data.models) {
        data.models.forEach(model => {
          console.log(`\n- ${model.name}`);
          console.log(`  DisplayName: ${model.displayName}`);
          console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        });
      } else {
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } catch (e1) {
      console.log('❌ Approach 1 failed:', e1.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();

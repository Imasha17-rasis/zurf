require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.5-flash-latest'
  ];

  const prompt = 'Hello! Can you say hi back to me?';

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n=== Testing model: ${modelName} ===`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      console.log(`✅ ${modelName} WORKS!`);
      console.log(`Response: ${response.substring(0, 100)}`);
    } catch (error) {
      console.log(`❌ ${modelName} FAILED`);
      console.log(`Error: ${error.message.substring(0, 150)}`);
    }
  }
}

testModels();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Test different model names
const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro-002',
  'gemini-1.0-pro',
  'gemini-1.0-pro-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-latest',
  'gemini-2.0-flash-001'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    const response = result.response.text();
    console.log(`✅ ${modelName} WORKS!`);
    return true;
  } catch (error) {
    const errorMsg = error.message.substring(0, 80);
    console.log(`❌ ${modelName}: ${errorMsg}`);
    return false;
  }
}

async function findWorkingModel() {
  console.log('Testing Gemini models...\n');
  let found = false;
  
  for (const model of modelsToTest) {
    const works = await testModel(model);
    if (works) {
      found = true;
      console.log(`\n✅ USE THIS MODEL: ${model}\n`);
      return model;
    }
  }
  
  if (!found) {
    console.log('\n❌ No working models found!');
  }
}

findWorkingModel();

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIKey() {
  console.log('🧪 Testing Google Gemini API Key...\n');

  const apiKey = process.env.GOOGLE_GEMINI_KEY;
  
  if (!apiKey) {
    console.log('❌ ERROR: API key not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...\n');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized\n');

    // Test with gemini-2.5-flash
    console.log('Testing gemini-2.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const response = await model.generateContent('Hello, respond with "API Key is working!"');
    const text = response.response.text();
    
    console.log('✅ SUCCESS! API Key is WORKING\n');
    console.log('📝 Response from API:', text);
    console.log('\n✨ Your API key is valid and functional!');

  } catch (error) {
    console.log('❌ ERROR: API Key Test Failed\n');
    console.log('Error Message:', error.message);
    
    // Provide helpful diagnostics
    if (error.message.includes('429')) {
      console.log('\n📌 Issue: Rate limit exceeded or quota exceeded');
      console.log('💡 Solution: Wait a few minutes and try again');
    } else if (error.message.includes('503')) {
      console.log('\n📌 Issue: Google Gemini service temporarily unavailable');
      console.log('💡 Solution: Try again in a few moments');
    } else if (error.message.includes('404')) {
      console.log('\n📌 Issue: Model not found or API not enabled');
      console.log('💡 Solution: Check your Google AI Studio settings');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n📌 Issue: Invalid or unauthorized API key');
      console.log('💡 Solution: Generate a new API key from Google AI Studio');
    } else {
      console.log('\n📌 Issue:', error.message);
    }
  }
}

testAPIKey();

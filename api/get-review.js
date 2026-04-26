import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const dotenv = require('dotenv');
dotenv.config({ path: './backEnd/.env' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert code reviewer. Analyze the following code and provide a comprehensive review in this exact format:

❌ Bad Code:
\`\`\`
[quote the problematic parts of the code]
\`\`\`

🔍 Issues:
- [List specific issues with bullet points]

✅ Recommended Fix:
\`\`\`
[provide corrected code with improvements]
\`\`\`

💡 Improvements:
- [List additional improvements or best practices]

Code to review:
${code}

Ensure all sections are present and properly formatted. Be thorough but constructive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text();

    res.status(200).json({ review });

  } catch (error) {
    console.error('API Error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a bit and try again.'
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: 'Invalid API key or request'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
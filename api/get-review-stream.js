import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).end('Code is required');
      return;
    }

    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
      res.status(500).end('API key not configured');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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

    // Send the review in chunks to simulate streaming
    const chunks = review.split(' ');
    let sent = 0;

    const sendChunk = () => {
      if (sent < chunks.length) {
        const chunk = chunks.slice(sent, sent + 10).join(' ') + ' ';
        res.write(chunk);
        sent += 10;

        setTimeout(sendChunk, 100); // Small delay between chunks
      } else {
        res.end();
      }
    };

    sendChunk();

  } catch (error) {
    console.error('Streaming API Error:', error);

    if (error.status === 429) {
      res.status(429).end('Too many requests. Please wait a bit and try again.');
      return;
    }

    if (error.status === 400) {
      res.status(400).end('Invalid API key or request');
      return;
    }

    res.status(500).end('Internal server error');
  }
}
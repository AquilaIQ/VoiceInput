import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// xAI client for Grok
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.XAI_API_URL,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    
    const completion = await xai.chat.completions.create({
      model: "grok-2-latest",
      messages: [{ role: "user", content: message }],
    });

    if (!completion.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: 'No response received from Grok' });
    }

    res.json({ response: completion.choices[0].message.content });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get chat response',
      details: error.message || 'Unknown error'
    });
  }
} 
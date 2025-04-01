import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { Readable } from 'stream';

// OpenAI client for Whisper transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert base64 to readable stream
const base64ToStream = (base64String: string) => {
  // Remove the data URL prefix if present
  const base64Data = base64String.split(',')[1] || base64String;
  const buffer = Buffer.from(base64Data, 'base64');
  return Readable.from(buffer);
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    // Convert base64 to stream
    const audioStream = base64ToStream(audioData);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
    });

    if (!transcription.text) {
      return res.status(500).json({ error: 'No transcription received' });
    }

    res.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message || 'Unknown error'
    });
  }
} 
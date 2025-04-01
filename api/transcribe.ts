import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { File } from '@web-std/file';

// OpenAI client for Whisper transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert Buffer to File object
const bufferToFile = (buffer: Buffer, filename: string): File => {
  return new File([buffer], filename, { type: 'audio/wav' });
};

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
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(audioData.split(',')[1], 'base64');
    
    // Create a File object from the buffer
    const audioFile = bufferToFile(buffer, 'audio.wav');
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
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
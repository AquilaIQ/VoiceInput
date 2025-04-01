import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// OpenAI client for Whisper transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    
    // Remove the data URL prefix if present
    const base64Data = audioData.split(',')[1] || audioData;
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Create a temporary file path
    const tempFilePath = `/tmp/audio-${Date.now()}.wav`;
    require('fs').writeFileSync(tempFilePath, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // Clean up the temporary file
    require('fs').unlinkSync(tempFilePath);

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
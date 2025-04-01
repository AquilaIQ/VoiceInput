import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory (two levels up from src)
const rootDir = path.join(__dirname, '../..');

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment variables');
  process.exit(1);
}

if (!process.env.XAI_API_KEY) {
  console.error('Missing XAI_API_KEY in environment variables');
  process.exit(1);
}

if (!process.env.XAI_API_URL) {
  console.error('Missing XAI_API_URL in environment variables');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from any origin during development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Allow only GET and POST requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow credentials
}));

app.use(express.json({ limit: '50mb' }));

// Log the build directory path
console.log('Build directory path:', path.join(rootDir, 'build'));

// Serve static files from the React build directory
app.use(express.static(path.join(rootDir, 'build')));

// OpenAI client for Whisper transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// xAI client for Grok
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.XAI_API_URL,
});

console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('xAI API Key:', process.env.XAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('xAI API URL:', process.env.XAI_API_URL ? '✓ Set' : '✗ Missing');

// Convert Buffer to File object
const bufferToFile = (buffer: Buffer, filename: string): File => {
  return new File([buffer], filename, { type: 'audio/wav' });
};

app.post('/api/transcribe', async (req, res) => {
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
});

app.post('/api/chat', async (req, res) => {
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
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
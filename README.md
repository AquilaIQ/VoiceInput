# Voice Input App

A React application that uses OpenAI's Whisper for speech-to-text transcription and xAI's Grok for chat interactions.

## Features

- Voice recording and transcription using OpenAI's Whisper API
- Chat interactions using xAI's Grok API
- Modern UI with Material-UI components
- TypeScript support
- Express.js backend

## Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- OpenAI API key
- xAI API key

## Environment Setup

1. Create a `.env` file in the `server` directory with the following variables:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key
XAI_API_URL=https://api.x.ai/v1
```

## Installation

1. Install dependencies:
```bash
pnpm install
```

## Development

1. Start the frontend development server:
```bash
pnpm start
```

2. Start the backend development server:
```bash
cd server && pnpm dev
```

## Production Deployment

1. Build the frontend:
```bash
pnpm build
```

2. Build the backend:
```bash
cd server && pnpm build
```

3. Start the production server:
```bash
cd server && pnpm start
```

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Express.js server
- `/public` - Static assets

## API Endpoints

- `POST /api/transcribe` - Transcribe audio using Whisper
- `POST /api/chat` - Chat with Grok

## Technologies Used

- React
- TypeScript
- Express.js
- Material-UI
- OpenAI Whisper API
- xAI Grok API
- pnpm (Package Manager)

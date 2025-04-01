import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button, Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [transcription, setTranscription] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('Current API_URL:', API_URL);
    console.log('Environment variable:', process.env.REACT_APP_API_URL);
  }, []);

  const { status, startRecording, stopRecording, mediaBlobUrl: _mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      setIsLoading(true);
      setError('');
      try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          try {
            // Send to backend for transcription
            const transcribeResponse = await axios.post(`${API_URL}/api/transcribe`, {
              audioData: base64Audio
            });
            
            setTranscription(transcribeResponse.data.text);
            
            // Get chat response
            const chatResponse = await axios.post(`${API_URL}/api/chat`, {
              message: transcribeResponse.data.text
            });
            
            setResponse(chatResponse.data.response);
          } catch (error: any) {
            console.error('API error:', error);
            setError(error.response?.data?.error || error.message || 'An error occurred');
          }
        };
      } catch (error: any) {
        console.error('Error processing audio:', error);
        setError('Error processing audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Voice Input App
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={startRecording}
              disabled={status === 'recording' || isLoading}
            >
              Start Recording
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={stopRecording}
              disabled={status !== 'recording' || isLoading}
            >
              Stop Recording
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box sx={{ mb: 3 }}>
              <Typography color="error" gutterBottom>
                Error: {error}
              </Typography>
            </Box>
          )}

          {transcription && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transcription:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>{transcription}</Typography>
              </Paper>
            </Box>
          )}

          {response && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Response:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>{response}</Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default App;

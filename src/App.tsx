import React, { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button, Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { axiosInstance } from './config';
import './App.css';
import config from './config';

function App() {
  const [transcription, setTranscription] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
          
          // Send to backend for transcription
          const transcribeResponse = await axiosInstance.post('/api/transcribe', {
            audioData: base64Audio
          });
          
          setTranscription(transcribeResponse.data.text);
          
          // Get chat response
          const chatResponse = await axiosInstance.post('/api/chat', {
            message: transcribeResponse.data.text
          });
          
          setResponse(chatResponse.data.response);
        };
      } catch (error: any) {
        console.error('Error processing audio:', error);
        setError(error.message || 'Error processing audio. Please try again.');
        setTranscription('');
        setResponse('');
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
        
        {config.isDevelopment && (
          <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'info.main', color: 'white' }}>
            <Typography>
              Development Mode - API Base: {config.apiBase}
            </Typography>
          </Paper>
        )}
        
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
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography>{error}</Typography>
              </Paper>
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

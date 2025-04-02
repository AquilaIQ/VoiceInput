import axios from 'axios';

interface Config {
  apiBase: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

const config: Config = {
  apiBase: process.env.REACT_APP_API_BASE || '',
  isProduction: process.env.REACT_APP_ENV === 'production',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || '',
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use((config) => {
  if (process.env.REACT_APP_ENV === 'development') {
    // Add any development-specific headers or configurations
    config.timeout = 10000; // longer timeout for development
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add better error handling
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default config; 
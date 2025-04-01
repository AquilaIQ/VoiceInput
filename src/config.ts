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

export default config; 
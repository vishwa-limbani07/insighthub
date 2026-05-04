import dotenv from 'dotenv';
dotenv.config();

// For production, use Vercel URL; for development, use localhost
const defaultClientUrl = process.env.NODE_ENV === 'production' 
  ? (process.env.CLIENT_URL || 'https://insighthub-cyan.vercel.app/')
  : 'http://localhost:4200';

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || defaultClientUrl,
};
require('dotenv').config();
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), override: true });

// Fallback: load dari env_config.js jika ada (untuk environment yang tidak bisa pakai .env)
try {
  const envConfig = require('./env_config');
  if (envConfig.API_KEY && !process.env.API_KEY) process.env.API_KEY = envConfig.API_KEY;
  if (envConfig.PORT && !process.env.PORT) process.env.PORT = String(envConfig.PORT);
  if (envConfig.NODE_ENV && !process.env.NODE_ENV) process.env.NODE_ENV = envConfig.NODE_ENV;
} catch (e) {
  // env_config.js tidak ada, lanjutkan
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  apiKey: process.env.API_KEY || '',
  apiBaseUrl: 'https://api.jasaotp.id/v1/',
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 15000,
  retryMaxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY_MS, 10) || 1000,
};

module.exports = config;

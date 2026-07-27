const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Validasi API Key
if (!config.apiKey) {
  logger.error('API_KEY tidak ditemukan di file .env. Silakan isi API_KEY terlebih dahulu.');
  process.exit(1);
}

const app = express();

// Trust proxy untuk rate limiter jika di belakang reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      'HTTP Request'
    );
  });
  next();
});

// Static files - serve client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        JasaOTP Premium Dashboard v1.0           ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Server   : http://localhost:${config.port}            ║`);
  console.log(`║  Env      : ${config.nodeEnv.padEnd(36)}║`);
  console.log(`║  API      : ${config.apiBaseUrl.padEnd(36)}║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  logger.info(`Server berjalan di http://localhost:${config.port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Server dimatikan');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Server dimatikan (SIGTERM)');
  process.exit(0);
});

// Unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled Rejection');
});

module.exports = app;

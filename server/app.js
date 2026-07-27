const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

/**
 * Express app factory
 * Digunakan oleh:
 *  - server/index.js (local development)
 *  - api/index.js (Vercel serverless)
 */
function createApp() {
  const app = express();

  // Trust proxy untuk rate limiter (Vercel, reverse proxy)
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
  const clientPath = path.join(__dirname, '..', 'client');
  app.use(express.static(clientPath));

  // API Routes
  app.use('/api', apiRoutes);

  // Untuk SPA: semua route non-API dan non-static mengarah ke index.html
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientPath, 'index.html'));
    } else {
      next();
    }
  });

  // 404 handler (hanya untuk /api/* yang tidak dikenal)
  app.use('/api/*', notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

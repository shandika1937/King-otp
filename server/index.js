const config = require('./config');
const logger = require('./logger');
const { createApp } = require('./app');

// Validasi API Key
if (!config.apiKey) {
  logger.error('API_KEY tidak ditemukan. Silakan isi API_KEY di file .env atau environment variables.');
  process.exit(1);
}

const app = createApp();

// Start server
const server = app.listen(config.port, () => {
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
  logger.info('Server dimatikan (SIGINT)');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.info('Server dimatikan (SIGTERM)');
  server.close(() => process.exit(0));
});

// Unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled Rejection');
});

module.exports = app;

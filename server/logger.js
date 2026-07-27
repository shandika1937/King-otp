const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');

/**
 * Logger untuk JasaOTP Dashboard
 * - Local development: console + file logging
 * - Vercel/Serverless: console-only (tidak ada filesystem persistent)
 */

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let logger;

if (isServerless) {
  // Mode serverless: console-only
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'body.api_key'],
      censor: '[REDACTED]',
    },
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: false,
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  });
} else {
  // Mode local: console + file
  const logsDir = path.join(__dirname, '..', 'logs');

  try {
    fs.ensureDirSync(logsDir);
  } catch (e) {
    // Fallback jika tidak bisa buat direktori logs
  }

  const transport = pino.transport({
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: path.join(logsDir, 'app.log'),
          mkdir: true,
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: path.join(logsDir, 'error.log'),
          mkdir: true,
          level: 'error',
        },
      },
    ],
  });

  logger = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'body.api_key'],
        censor: '[REDACTED]',
      },
    },
    transport
  );
}

module.exports = logger;

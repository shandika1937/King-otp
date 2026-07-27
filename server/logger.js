const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');

const logsDir = path.join(__dirname, '..', 'logs');
fs.ensureDirSync(logsDir);

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

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'body.api_key'],
      censor: '[REDACTED]',
    },
  },
  transport
);

module.exports = logger;

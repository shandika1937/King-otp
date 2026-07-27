const logger = require('../logger');

/**
 * Global error handler middleware
 * Menangani semua error tanpa membocorkan informasi sensitif
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== false;

  // Log error detail untuk debugging
  logger.error(
    {
      err,
      url: req.originalUrl,
      method: req.method,
      statusCode,
      isOperational,
    },
    'Error Handler'
  );

  // Jangan bocorkan stack trace di production
  const response = {
    status: false,
    msg: isOperational ? err.message : 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  };

  res.status(statusCode).json(response);
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    status: false,
    msg: 'Endpoint tidak ditemukan',
  });
}

module.exports = { errorHandler, notFoundHandler };

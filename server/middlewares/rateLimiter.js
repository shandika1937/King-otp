const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter untuk mencegah abuse
 * Membatasi jumlah request per IP dalam window waktu tertentu
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    msg: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  },
});

/**
 * Rate limiter lebih ketat untuk endpoint order
 */
const orderLimiter = rateLimit({
  windowMs: 60000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    msg: 'Terlalu banyak permintaan order. Silakan tunggu 1 menit.',
  },
});

module.exports = { apiLimiter, orderLimiter };

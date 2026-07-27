const express = require('express');
const router = express.Router();

const { getBalance } = require('../controllers/balanceController');
const { getCountries } = require('../controllers/countryController');
const { getOperators } = require('../controllers/operatorController');
const { getServices } = require('../controllers/serviceController');
const { createOrder, getOTP, cancelOrder } = require('../controllers/orderController');

const { apiLimiter, orderLimiter } = require('../middlewares/rateLimiter');

// Semua routes menggunakan rate limiter
router.use(apiLimiter);

// GET /api/balance - Mendapatkan saldo
router.get('/balance', getBalance);

// GET /api/countries - Mendapatkan daftar negara
router.get('/countries', getCountries);

// GET /api/operators?country=xx - Mendapatkan operator berdasarkan negara
router.get('/operators', getOperators);

// GET /api/services?country=xx - Mendapatkan layanan berdasarkan negara
router.get('/services', getServices);

// POST /api/order - Membuat order baru (rate limit lebih ketat)
router.post('/order', orderLimiter, createOrder);

// GET /api/order/:orderId/otp - Mendapatkan OTP
router.get('/order/:orderId/otp', getOTP);

// DELETE /api/order/:orderId - Membatalkan order
router.delete('/order/:orderId', cancelOrder);

module.exports = router;

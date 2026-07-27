const axios = require('axios');
const config = require('../config');
const logger = require('../logger');

/**
 * JasaOTP API Service
 * Wrapper untuk semua endpoint API JasaOTP
 * Semua error ditangani tanpa membocorkan API key
 */

const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeout,
  params: {
    api_key: config.apiKey,
  },
});

// Interceptor untuk logging request
client.interceptors.request.use(
  (req) => {
    logger.info({ url: req.url, method: req.method }, 'API Request');
    return req;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk logging response
client.interceptors.response.use(
  (res) => {
    logger.info({ url: res.config.url, status: res.status }, 'API Response');
    return res;
  },
  (error) => Promise.reject(error)
);

/**
 * Retry mechanism untuk menangani timeout / network error
 */
async function withRetry(fn, context) {
  let lastError;

  for (let attempt = 1; attempt <= config.retryMaxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.code === 'ECONNRESET') {
        logger.warn({ attempt, context }, 'Request timeout/network error, retrying...');
        if (attempt < config.retryMaxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, config.retryDelay * attempt));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Parse response dari API JasaOTP
 * Format response biasanya: { status: true, data: {...} } atau { status: false, msg: "..." }
 */
function parseResponse(response) {
  const data = response.data;

  if (data === null || data === undefined) {
    throw new Error('Server tidak memberikan respons');
  }

  // Jika response adalah string (kadang API return plain text)
  if (typeof data === 'string') {
    return { status: true, data: data.trim() };
  }

  // Jika response object dengan status
  if (typeof data === 'object') {
    if (data.status === false) {
      const msg = data.msg || data.message || 'Terjadi kesalahan dari server';
      throw new Error(msg);
    }
    return data;
  }

  return data;
}

/**
 * GET /balance.php
 * Mendapatkan saldo API key
 */
async function getBalance() {
  return withRetry(async () => {
    const response = await client.get('/balance.php');
    return parseResponse(response);
  }, 'getBalance');
}

/**
 * GET /negara.php
 * Mendapatkan daftar negara yang tersedia
 */
async function getCountries() {
  return withRetry(async () => {
    const response = await client.get('/negara.php');
    return parseResponse(response);
  }, 'getCountries');
}

/**
 * GET /operator.php
 * Mendapatkan daftar operator berdasarkan negara
 * @param {string} country - Kode negara
 */
async function getOperators(country) {
  if (!country) {
    throw new Error('Parameter negara harus diisi');
  }

  return withRetry(async () => {
    const response = await client.get('/operator.php', {
      params: { negara: country },
    });
    return parseResponse(response);
  }, `getOperators(${country})`);
}

/**
 * GET /layanan.php
 * Mendapatkan daftar layanan berdasarkan negara
 * @param {string} country - Kode negara
 */
async function getServices(country) {
  if (!country) {
    throw new Error('Parameter negara harus diisi');
  }

  return withRetry(async () => {
    const response = await client.get('/layanan.php', {
      params: { negara: country },
    });
    return parseResponse(response);
  }, `getServices(${country})`);
}

/**
 * GET /order.php
 * Membuat order nomor virtual baru
 * @param {string} country - Kode negara
 * @param {string} service - Kode layanan
 * @param {string} operator - Kode operator
 */
async function createOrder(country, service, operator) {
  if (!country || !service || !operator) {
    throw new Error('Parameter negara, layanan, dan operator harus diisi');
  }

  return withRetry(async () => {
    const response = await client.get('/order.php', {
      params: { negara: country, layanan: service, operator: operator },
    });
    return parseResponse(response);
  }, `createOrder(${country}, ${service}, ${operator})`);
}

/**
 * GET /sms.php
 * Mendapatkan OTP dari order tertentu
 * @param {string} orderId - ID order
 */
async function getOTP(orderId) {
  if (!orderId) {
    throw new Error('Parameter order_id harus diisi');
  }

  return withRetry(async () => {
    const response = await client.get('/sms.php', {
      params: { id: orderId },
    });
    return parseResponse(response);
  }, `getOTP(${orderId})`);
}

/**
 * GET /cancel.php
 * Membatalkan order
 * @param {string} orderId - ID order
 */
async function cancelOrder(orderId) {
  if (!orderId) {
    throw new Error('Parameter order_id harus diisi');
  }

  return withRetry(async () => {
    const response = await client.get('/cancel.php', {
      params: { id: orderId },
    });
    return parseResponse(response);
  }, `cancelOrder(${orderId})`);
}

module.exports = {
  getBalance,
  getCountries,
  getOperators,
  getServices,
  createOrder,
  getOTP,
  cancelOrder,
};

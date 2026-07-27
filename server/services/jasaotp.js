const axios = require('axios');
const config = require('../config');
const logger = require('../logger');

const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeout,
  params: { api_key: config.apiKey },
});

client.interceptors.request.use(r => { logger.info({url:r.url,method:r.method},'API Request'); return r; }, e => Promise.reject(e));
client.interceptors.response.use(r => { logger.info({url:r.config.url,status:r.status},'API Response'); return r; }, e => Promise.reject(e));

async function withRetry(fn, ctx) {
  let lastErr;
  for (let a = 1; a <= config.retryMaxAttempts; a++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      if (['ECONNABORTED','ERR_NETWORK','ECONNRESET'].includes(e.code)) {
        logger.warn({attempt:a,ctx},'Retry...');
        if (a < config.retryMaxAttempts) { await new Promise(r => setTimeout(r, config.retryDelay * a)); continue; }
      }
      throw e;
    }
  }
  throw lastErr;
}

// Parse response: handle { success: true/false, data: ... } format
function parseResponse(response) {
  const data = response.data;
  if (data === null || data === undefined) throw new Error('Server tidak memberikan respons');
  if (typeof data === 'string') return { success: true, data: data.trim() };
  if (typeof data === 'object') {
    if (data.success === false || data.code >= 400) throw new Error(data.message || data.msg || 'Error dari server');
    return data;
  }
  return { success: true, data: data };
}

// GET /balance.php
async function getBalance() {
  return withRetry(async () => {
    const r = await client.get('/balance.php');
    const parsed = parseResponse(r);
    // Response: { data: { saldo: 10000 } }
    return parsed;
  }, 'getBalance');
}

// GET /negara.php
async function getCountries() {
  return withRetry(async () => {
    const r = await client.get('/negara.php');
    const parsed = parseResponse(r);
    // Response: { data: [{id_negara: 0, nama_negara: "rusia"}, ...] }
    return parsed;
  }, 'getCountries');
}

// GET /operator.php?negara=ID (integer)
async function getOperators(country) {
  if (country === undefined || country === null || country === '') throw new Error('Parameter negara harus diisi');
  const countryId = parseInt(country, 10);
  if (isNaN(countryId)) throw new Error('ID negara harus berupa angka');
  return withRetry(async () => {
    const r = await client.get('/operator.php', { params: { negara: countryId } });
    const parsed = parseResponse(r);
    // Response: { data: { "6": ["any", "indosat", ...] } }
    return parsed;
  }, `getOperators(${countryId})`);
}

// GET /layanan.php?negara=ID (integer)
async function getServices(country) {
  if (country === undefined || country === null || country === '') throw new Error('Parameter negara harus diisi');
  const countryId = parseInt(country, 10);
  if (isNaN(countryId)) throw new Error('ID negara harus berupa angka');
  return withRetry(async () => {
    const r = await client.get('/layanan.php', { params: { negara: countryId } });
    const parsed = parseResponse(r);
    // Response: { "6": { "wa": {harga: 3000, stok: 999, layanan: "whatsapp"}, ... } }
    return parsed;
  }, `getServices(${countryId})`);
}

// GET /order.php
async function createOrder(country, service, operator) {
  if (country === undefined || country === null || country === '') throw new Error('Parameter negara harus diisi');
  if (!service) throw new Error('Parameter layanan harus diisi');
  if (!operator) throw new Error('Parameter operator harus diisi');
  const countryId = parseInt(country, 10);
  if (isNaN(countryId)) throw new Error('ID negara harus berupa angka');
  return withRetry(async () => {
    const r = await client.get('/order.php', { params: { negara: countryId, layanan: service, operator: operator } });
    const parsed = parseResponse(r);
    // Response: { data: { order_id: 1728868, number: "+6282272111384" } }
    return parsed;
  }, `createOrder(${countryId},${service},${operator})`);
}

// GET /sms.php?id=ORDER_ID
async function getOTP(orderId) {
  if (!orderId && orderId !== 0) throw new Error('Parameter order_id harus diisi');
  return withRetry(async () => {
    const r = await client.get('/sms.php', { params: { id: orderId } });
    const parsed = parseResponse(r);
    // Response: { data: { otp: "123456" } }
    return parsed;
  }, `getOTP(${orderId})`);
}

// GET /cancel.php?id=ORDER_ID
async function cancelOrder(orderId) {
  if (!orderId && orderId !== 0) throw new Error('Parameter order_id harus diisi');
  return withRetry(async () => {
    const r = await client.get('/cancel.php', { params: { id: orderId } });
    const parsed = parseResponse(r);
    // Response: { data: { order_id: 1728868, refunded_amount: 3000 } }
    return parsed;
  }, `cancel(${orderId})`);
}

module.exports = { getBalance, getCountries, getOperators, getServices, createOrder, getOTP, cancelOrder };

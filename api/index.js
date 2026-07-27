/**
 * Vercel Serverless Entry Point
 * File ini digunakan oleh Vercel untuk menjalankan Express app sebagai serverless function
 * 
 * Cara setting API_KEY di Vercel:
 * 1. Buka https://vercel.com/ [project]/settings/environment-variables
 * 2. Tambah variable: API_KEY = [isi dengan API key JasaOTP]
 * 3. Deploy ulang
 */

const { createApp } = require('../server/app');

const app = createApp();

module.exports = app;

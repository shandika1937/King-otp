/**
 * JasaOTP API Client
 * Layer komunikasi dengan backend Express
 * Semua request melalui server, tidak langsung ke API JasaOTP
 */

const API = {
  baseURL: '/api',

  /**
   * Generic request handler
   */
  async request(method, path, data = null, params = null) {
    const url = new URL(`${this.baseURL}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }

    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const controller = new AbortController();
    options.signal = controller.signal;

    // Timeout 30 detik
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url.toString(), options);
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || `HTTP ${response.status}`);
      }

      if (result.status === false) {
        throw new Error(result.msg || 'Server mengembalikan error');
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Koneksi timeout. Silakan coba lagi.');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        throw new Error('Koneksi ke server terputus. Periksa koneksi internet Anda.');
      }
      throw error;
    }
  },

  // ==================== Balance ====================

  async getBalance() {
    return this.request('GET', '/balance');
  },

  // ==================== Countries ====================

  async getCountries() {
    return this.request('GET', '/countries');
  },

  // ==================== Operators ====================

  async getOperators(country) {
    return this.request('GET', '/operators', null, { country });
  },

  // ==================== Services ====================

  async getServices(country) {
    return this.request('GET', '/services', null, { country });
  },

  // ==================== Order ====================

  async createOrder(country, service, operator) {
    return this.request('POST', '/order', { country, service, operator });
  },

  async getOTP(orderId) {
    return this.request('GET', `/order/${orderId}/otp`);
  },

  async cancelOrder(orderId) {
    return this.request('DELETE', `/order/${orderId}`);
  },
};

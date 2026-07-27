/**
 * Utility Functions
 */

const Utils = {
  // ==================== Formatting ====================

  formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Rp 0';
    return 'Rp ' + num.toLocaleString('id-ID');
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  },

  formatPhoneNumber(number) {
    if (!number) return '-';
    const cleaned = String(number).replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('0')) {
      return '+62' + cleaned.slice(1);
    }
    return cleaned;
  },

  truncate(str, len = 30) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
  },

  // ==================== Storage ====================

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`jasaotp_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`jasaotp_${key}`, JSON.stringify(value));
    } catch {
      // Storage penuh atau tidak tersedia
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`jasaotp_${key}`);
    } catch {
      // Ignore
    }
  },

  // ==================== Theme ====================

  getTheme() {
    return this.get('theme', 'light');
  },

  setTheme(theme) {
    this.set('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  // ==================== Copy to Clipboard ====================

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  // ==================== Debounce ====================

  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // ==================== Random ID ====================

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // ==================== Status Helpers ====================

  getStatusLabel(status) {
    const map = {
      'success': 'Berhasil',
      'pending': 'Menunggu',
      'waiting': 'Menunggu OTP',
      'active': 'Aktif',
      'canceled': 'Dibatalkan',
      'cancelled': 'Dibatalkan',
      'error': 'Gagal',
      'expired': 'Kadaluarsa',
      'timeout': 'Timeout',
    };
    return map[String(status).toLowerCase()] || status;
  },

  getStatusBadgeClass(status) {
    const map = {
      'success': 'badge-success',
      'active': 'badge-success',
      'pending': 'badge-warning',
      'waiting': 'badge-warning',
      'canceled': 'badge-danger',
      'cancelled': 'badge-danger',
      'error': 'badge-danger',
      'expired': 'badge-neutral',
      'timeout': 'badge-neutral',
    };
    return map[String(status).toLowerCase()] || 'badge-neutral';
  },

  getStatusIcon(status) {
    const map = {
      'success': 'check-circle-2',
      'active': 'check-circle-2',
      'pending': 'hourglass',
      'waiting': 'clock',
      'canceled': 'x-circle',
      'cancelled': 'x-circle',
      'error': 'alert-circle',
      'expired': 'alert-triangle',
    };
    return map[String(status).toLowerCase()] || 'help-circle';
  },

  // ==================== Filter Helpers ====================

  filterData(data, query, fields = ['name', 'id']) {
    if (!query || !data) return data;
    const q = query.toLowerCase();
    return data.filter((item) =>
      fields.some((field) => {
        const val = String(item[field] || '').toLowerCase();
        return val.includes(q);
      })
    );
  },

  paginate(data, page, perPage = 10) {
    if (!data) return { items: [], total: 0, pages: 0 };
    const total = data.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const items = data.slice(start, start + perPage);
    return { items, total, pages, page };
  },
};

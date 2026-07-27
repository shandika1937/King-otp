/**
 * OTP Aktif Page
 * Menampilkan order aktif dengan auto-check OTP setiap 5 detik
 * Fitur: Salin nomor, Salin OTP, Batalkan order
 */

const OTPPage = {
  refreshInterval: null,
  activeOrders: [],

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-enter">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">OTP Aktif</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Order yang sedang menunggu OTP</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
            Auto-check setiap <span id="otp-interval-display">5</span> detik
          </div>
        </div>

        <div class="dashboard-card">
          <div id="otp-table-wrapper">
            ${Components.loadingOverlay('Memuat OTP aktif...')}
          </div>
        </div>
      </div>
    `;

    this.loadOrders();
    this.startAutoRefresh();
  },

  loadOrders() {
    const wrapper = document.getElementById('otp-table-wrapper');
    if (!wrapper) return;

    const allOrders = Utils.get('orders', []);
    // Filter: order yang masih menunggu OTP (belum sukses, belum dibatalkan)
    this.activeOrders = allOrders.filter(o =>
      o.status === 'waiting' || o.status === 'pending' || o.status === 'Menunggu OTP'
    );

    if (this.activeOrders.length === 0) {
      wrapper.innerHTML = Components.emptyState(
        'inbox',
        'Tidak Ada OTP Aktif',
        'Belum ada order yang menunggu OTP. Buat order baru di menu "Beli Nokos".'
      );
      lucide.createIcons({ scope: wrapper });
      return;
    }

    wrapper.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Nomor</th>
              <th>Operator</th>
              <th>Layanan</th>
              <th>Status</th>
              <th>Kode OTP</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody id="otp-table-body">
            ${this.activeOrders.map((o, idx) => this.renderRow(o, idx)).join('')}
          </tbody>
        </table>
      </div>
    `;
    lucide.createIcons({ scope: wrapper });
  },

  renderRow(order, idx) {
    const otp = order.otp || 'Belum ada';
    const isWaiting = otp === 'Belum ada' || otp === '-' || !otp;
    const number = order.number || order.nomor || '-';

    return `
      <tr>
        <td class="font-mono text-xs">${order.orderId || order.id || '-'}</td>
        <td class="font-medium">
          <span class="text-sm">${Utils.formatPhoneNumber(number)}</span>
        </td>
        <td>${order.operator || '-'}</td>
        <td class="max-w-[120px] truncate" title="${order.service || ''}">${order.service || '-'}</td>
        <td>
          <span class="${isWaiting ? 'badge-warning' : 'badge-success'}">
            ${isWaiting ? '⏳ Menunggu' : '✅ Diterima'}
          </span>
        </td>
        <td>
          ${isWaiting
            ? `<span class="text-gray-400 text-sm">${Components.spinner('sm')} Menunggu...</span>`
            : `<span class="text-lg font-bold tracking-wider text-emerald-600 dark:text-emerald-400">${otp}</span>`
          }
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="OTPPage.copyNumber('${idx}')" class="btn-ghost p-2" title="Salin Nomor">
              <i data-lucide="copy" class="w-4 h-4"></i>
            </button>
            ${!isWaiting ? `
            <button onclick="OTPPage.copyOTP('${idx}')" class="btn-ghost p-2 text-emerald-600 dark:text-emerald-400" title="Salin OTP">
              <i data-lucide="clipboard-check" class="w-4 h-4"></i>
            </button>
            ` : ''}
            <button onclick="OTPPage.confirmCancel('${idx}')" class="btn-ghost p-2 text-red-500 hover:text-red-600" title="Batalkan Order">
              <i data-lucide="x-circle" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  async copyNumber(idx) {
    const order = this.activeOrders[idx];
    if (!order) return;

    const number = Utils.formatPhoneNumber(order.number || order.nomor || '');
    await Utils.copyToClipboard(number);
    Components.toast('Nomor disalin ke clipboard!', 'success');
  },

  async copyOTP(idx) {
    const order = this.activeOrders[idx];
    if (!order) return;

    const otp = order.otp || '';
    await Utils.copyToClipboard(otp);

    // Tandai sebagai sudah disalin
    Components.toast('OTP disalin ke clipboard!', 'success');
  },

  confirmCancel(idx) {
    const order = this.activeOrders[idx];
    if (!order) return;

    Components.confirmModal(
      'Batalkan Order?',
      `Yakin ingin membatalkan order ${order.orderId || order.id || ''}?`,
      () => OTPPage.cancelOrderAction(idx),
      'Ya, Batalkan',
      'Tidak',
      true
    );
  },

  async cancelOrderAction(idx) {
    const order = this.activeOrders[idx];
    if (!order) return;

    try {
      const orderId = order.orderId || order.id || '';
      const result = await API.cancelOrder(orderId);

      // Update status di localStorage
      const orders = Utils.get('orders', []);
      const updatedOrders = orders.map(o => {
        if ((o.orderId === orderId || o.id === orderId)) {
          return { ...o, status: 'canceled' };
        }
        return o;
      });
      Utils.set('orders', updatedOrders);

      Components.toast('Order berhasil dibatalkan', 'success');
      this.loadOrders();

    } catch (error) {
      Components.toast('Gagal membatalkan order: ' + error.message, 'error');
    }
  },

  async checkOTP() {
    if (this.activeOrders.length === 0) return;

    for (let i = 0; i < this.activeOrders.length; i++) {
      const order = this.activeOrders[i];
      const otp = order.otp || '';
      if (otp !== 'Belum ada' && otp !== '-' && otp !== '') continue;

      try {
        const orderId = order.orderId || order.id || '';
        const result = await API.getOTP(orderId);

        // Parse OTP dari response
        let otpCode = '';
        const data = result.data || result;
        if (data && data.data) {
          otpCode = data.data.sms || data.data.otp || data.data.kode || data.data.code || '';
        } else if (typeof data === 'object') {
          otpCode = data.sms || data.otp || data.kode || data.code || data.pesan || data.msg || '';
        } else if (typeof data === 'string') {
          otpCode = data;
        }

        if (otpCode && otpCode !== '' && otpCode !== 'Belum ada') {
          // Update localStorage
          const orders = Utils.get('orders', []);
          const updatedOrders = orders.map(o => {
            if ((o.orderId === orderId || o.id === orderId)) {
              return { ...o, otp: otpCode, status: 'success' };
            }
            return o;
          });
          Utils.set('orders', updatedOrders);

          Components.toast(`✅ OTP diterima untuk order ${orderId}: ${otpCode}`, 'success');
        }
      } catch (error) {
        // Jangan tampilkan error untuk pengecekan OTP rutin
        if (error.message && !error.message.includes('Belum ada') && !error.message.includes('belum tersedia')) {
          console.warn('OTP check error:', error.message.slice(0, 50));
        }
      }
    }

    // Reload orders
    this.loadOrders();
  },

  startAutoRefresh() {
    this.stopAutoRefresh();
    const interval = Math.max(Utils.get('otpCheckInterval', 5), 3) * 1000;
    this.refreshInterval = setInterval(() => this.checkOTP(), interval);

    // Update display
    const display = document.getElementById('otp-interval-display');
    if (display) display.textContent = Math.max(Utils.get('otpCheckInterval', 5), 3);
  },

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  destroy() {
    this.stopAutoRefresh();
  },
};

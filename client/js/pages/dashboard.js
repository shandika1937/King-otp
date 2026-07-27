/**
 * Dashboard Page
 * Menampilkan ringkasan saldo, statistik, dan aktivitas order
 */

const DashboardPage = {
  refreshInterval: null,

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-enter">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Ringkasan aktivitas akun JasaOTP Anda</p>

        <!-- Stat Cards -->
        <div id="stat-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          ${Components.skeletonCard()}
          ${Components.skeletonCard()}
          ${Components.skeletonCard()}
          ${Components.skeletonCard()}
          ${Components.skeletonCard()}
        </div>

        <!-- Charts & Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chart -->
          <div class="lg:col-span-2 dashboard-card">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aktivitas Order</h3>
              <div class="flex gap-2">
                <button data-chart="7" class="chart-period-btn px-3 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">7 Hari</button>
                <button data-chart="30" class="chart-period-btn px-3 py-1 text-xs font-medium rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">30 Hari</button>
              </div>
            </div>
            <div id="chart-container" class="relative h-64 flex items-center justify-center text-gray-400">
              <div class="text-center">
                ${Components.spinner('lg')}
                <p class="text-sm mt-3">Memuat data...</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Terbaru</h3>
            <div id="recent-orders" class="space-y-3">
              <div class="text-center py-8 text-gray-400 text-sm">Memuat data...</div>
            </div>
          </div>
        </div>

        <!-- Order Stats Table -->
        <div class="dashboard-card mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Order Hari Ini</h3>
          <div id="order-summary" class="text-center py-8 text-gray-400 text-sm">Memuat data...</div>
        </div>
      </div>
    `;

    await this.loadData();
    this.startAutoRefresh();
  },

  async loadData() {
    try {
      const orderHistory = Utils.get('orders', []);
      const today = new Date().toDateString();
      const todayOrders = orderHistory.filter(o => {
        const d = o.date ? new Date(o.date).toDateString() : '';
        return d === today;
      });

      // Hitung statistik
      const totalToday = todayOrders.length;
      const successOTP = todayOrders.filter(o =>
        o.status === 'success' || (o.otp && o.otp !== '-' && o.otp !== 'Belum ada')
      ).length;
      const waitingOTP = todayOrders.filter(o =>
        o.status === 'waiting' || o.status === 'pending' || o.status === 'Menunggu OTP'
      ).length;
      const canceledOrders = todayOrders.filter(o =>
        o.status === 'canceled' || o.status === 'cancelled' || o.status === 'Dibatalkan'
      ).length;

      // Ambil saldo
      let balance = 0;
      try {
        const balResult = await API.getBalance();
        if (balResult.data && balResult.data.data !== undefined) {
          balance = parseFloat(balResult.data.data) || 0;
        }
      } catch (e) {
        console.warn('Gagal ambil saldo:', e.message);
      }

      // Render stat cards
      const statCards = document.getElementById('stat-cards');
      if (statCards) {
        statCards.innerHTML = `
          <div class="stat-card">
            <div class="stat-icon bg-emerald-100 dark:bg-emerald-900/30">
              <i data-lucide="wallet" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo API</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${Utils.formatCurrency(balance)}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-blue-100 dark:bg-blue-900/30">
              <i data-lucide="shopping-cart" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Hari Ini</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalToday}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-green-100 dark:bg-green-900/30">
              <i data-lucide="check-circle-2" class="w-6 h-6 text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">OTP Berhasil</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${successOTP}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-amber-100 dark:bg-amber-900/30">
              <i data-lucide="clock" class="w-6 h-6 text-amber-600 dark:text-amber-400"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Menunggu OTP</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${waitingOTP}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-red-100 dark:bg-red-900/30">
              <i data-lucide="x-circle" class="w-6 h-6 text-red-600 dark:text-red-400"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dibatalkan</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${canceledOrders}</p>
            </div>
          </div>
        `;
        lucide.createIcons({ scope: statCards });
      }

      // Render chart
      this.renderChart(orderHistory);

      // Render recent orders
      const recentOrdersEl = document.getElementById('recent-orders');
      if (recentOrdersEl) {
        const recent = [...orderHistory].reverse().slice(0, 10);
        if (recent.length === 0) {
          recentOrdersEl.innerHTML = `
            <div class="text-center py-8">
              <i data-lucide="inbox" class="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2"></i>
              <p class="text-sm text-gray-400">Belum ada order</p>
            </div>
          `;
        } else {
          recentOrdersEl.innerHTML = recent.map(o => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${o.number || '-'}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${o.service || ''} · ${Utils.getStatusLabel(o.status)}</p>
              </div>
              <span class="${Utils.getStatusBadgeClass(o.status)} shrink-0 ml-2">${Utils.getStatusLabel(o.status)}</span>
            </div>
          `).join('');
        }
        lucide.createIcons({ scope: recentOrdersEl });
      }

      // Render order summary
      const summaryEl = document.getElementById('order-summary');
      if (summaryEl) {
        if (todayOrders.length === 0) {
          summaryEl.innerHTML = `
            <div class="text-center py-6">
              <i data-lucide="calendar" class="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2"></i>
              <p class="text-sm text-gray-400">Belum ada order hari ini</p>
            </div>
          `;
        } else {
          const grouped = {};
          todayOrders.forEach(o => {
            const key = o.service || 'Lainnya';
            if (!grouped[key]) grouped[key] = 0;
            grouped[key]++;
          });

          summaryEl.innerHTML = `
            <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Layanan</th>
                    <th class="text-right">Jumlah</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(grouped).map(([service, count]) => `
                    <tr>
                      <td class="font-medium">${service}</td>
                      <td class="text-right">${count}</td>
                      <td class="text-right font-medium">${Utils.formatCurrency(todayOrders.filter(o => (o.service || 'Lainnya') === service).reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0))}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
        lucide.createIcons({ scope: summaryEl });
      }

      // Update balance badge
      const balanceDisplay = document.getElementById('balance-display');
      if (balanceDisplay) {
        balanceDisplay.textContent = Utils.formatCurrency(balance);
      }

    } catch (error) {
      console.error('Dashboard load error:', error);
      // Don't show error for stats - they work offline from localStorage
    }
  },

  renderChart(orders) {
    const container = document.getElementById('chart-container');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i data-lucide="bar-chart-3" class="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3"></i>
          <p class="text-sm text-gray-400">Belum ada data order untuk ditampilkan</p>
        </div>
      `;
      lucide.createIcons({ scope: container });
      return;
    }

    // Group orders by date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toDateString());
    }

    const chartData = last7Days.map(dateStr => {
      const count = orders.filter(o => {
        const od = o.date ? new Date(o.date).toDateString() : '';
        return od === dateStr;
      }).length;
      const shortDate = new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      return { label: shortDate, value: count };
    });

    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    const barHeight = 200;

    container.innerHTML = `
      <div style="height: ${barHeight}px; width: 100%; display: flex; align-items: flex-end; gap: 8px; padding: 0 8px;">
        ${chartData.map(d => {
          const height = Math.max((d.value / maxVal) * barHeight, d.value > 0 ? 20 : 0);
          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end;">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">${d.value}</span>
              <div style="width: 100%; height: ${height}px; background: linear-gradient(to top, #6366f1, #8b5cf6); border-radius: 6px 6px 2px 2px; transition: height 0.3s ease; min-height: ${d.value > 0 ? '4px' : '0'}; opacity: ${d.value > 0 ? '1' : '0.3'};"
                   title="${d.label}: ${d.value} order"></div>
              <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">${d.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
    lucide.createIcons({ scope: container });
  },

  startAutoRefresh() {
    this.stopAutoRefresh();
    const interval = Utils.get('refreshInterval', 30) * 1000;
    this.refreshInterval = setInterval(() => this.loadData(), interval);
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

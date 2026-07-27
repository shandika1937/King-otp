/**
 * Pengaturan Page
 * Konfigurasi aplikasi: tema, interval refresh, informasi website
 */

const SettingsPage = {
  async render() {
    const content = document.getElementById('page-content');
    const theme = Utils.getTheme();
    const refreshInterval = Utils.get('otpCheckInterval', 5);
    const dashboardRefresh = Utils.get('refreshInterval', 30);

    content.innerHTML = `
      <div class="page-enter">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Pengaturan</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Konfigurasi tampilan dan preferensi aplikasi</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tampilan -->
          <div class="dashboard-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <i data-lucide="palette" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tampilan</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Atur tema tampilan dashboard</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Dark Mode Toggle -->
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Mode Gelap</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gunakan tema gelap untuk kenyamanan mata</p>
                </div>
                <button id="dark-mode-toggle" class="toggle-switch ${theme === 'dark' ? 'active' : ''}" onclick="SettingsPage.toggleDarkMode()">
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <!-- Theme Preview -->
              <div class="grid grid-cols-2 gap-3 mt-4">
                <button onclick="SettingsPage.setTheme('light')" class="p-4 rounded-xl border-2 transition-all duration-200 ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}">
                  <div class="w-full h-16 rounded-lg bg-white border border-gray-200 mb-2 flex items-center justify-center">
                    <i data-lucide="sun" class="w-5 h-5 text-amber-500"></i>
                  </div>
                  <p class="text-xs font-medium text-center text-gray-700 dark:text-gray-300">Terang</p>
                </button>
                <button onclick="SettingsPage.setTheme('dark')" class="p-4 rounded-xl border-2 transition-all duration-200 ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}">
                  <div class="w-full h-16 rounded-lg bg-gray-900 border border-gray-700 mb-2 flex items-center justify-center">
                    <i data-lucide="moon" class="w-5 h-5 text-indigo-400"></i>
                  </div>
                  <p class="text-xs font-medium text-center text-gray-700 dark:text-gray-300">Gelap</p>
                </button>
              </div>
            </div>
          </div>

          <!-- Interval Refresh -->
          <div class="dashboard-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i data-lucide="refresh-cw" class="w-5 h-5 text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Refresh OTP</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Atur interval pengecekan OTP otomatis</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- OTP Check Interval -->
              <div>
                <label class="form-label">Interval Cek OTP (detik)</label>
                <div class="flex items-center gap-3">
                  <input type="range" id="otp-interval-slider" min="3" max="30" value="${Math.max(refreshInterval, 3)}" class="flex-1 accent-indigo-600" oninput="SettingsPage.updateOtpInterval(this.value)">
                  <span id="otp-interval-value" class="text-lg font-bold text-indigo-600 dark:text-indigo-400 min-w-[3rem] text-center">${Math.max(refreshInterval, 3)}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Setiap ${Math.max(refreshInterval, 3)} detik sistem akan mengecek OTP baru</p>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label class="form-label">Interval Refresh Dashboard (detik)</label>
                <div class="flex items-center gap-3">
                  <input type="range" id="dash-interval-slider" min="10" max="120" value="${dashboardRefresh}" class="flex-1 accent-indigo-600" oninput="SettingsPage.updateDashInterval(this.value)">
                  <span id="dash-interval-value" class="text-lg font-bold text-indigo-600 dark:text-indigo-400 min-w-[3rem] text-center">${dashboardRefresh}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Setiap ${dashboardRefresh} detik dashboard akan memperbarui data</p>
              </div>
            </div>
          </div>

          <!-- Info Website -->
          <div class="dashboard-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i data-lucide="info" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Informasi</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Detail aplikasi dan API</p>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Aplikasi</span>
                <span class="font-medium text-gray-900 dark:text-white">JasaOTP Dashboard</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Versi</span>
                <span class="font-medium text-gray-900 dark:text-white">v1.0.0</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">API Provider</span>
                <span class="font-medium text-gray-900 dark:text-white">JasaOTP</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Backend</span>
                <span class="font-medium text-gray-900 dark:text-white">Node.js + Express</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Frontend</span>
                <span class="font-medium text-gray-900 dark:text-white">Tailwind CSS</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-500 dark:text-gray-400">Total Order Tersimpan</span>
                <span id="total-order-count" class="font-medium text-gray-900 dark:text-white">0</span>
              </div>
            </div>
          </div>

          <!-- Data Management -->
          <div class="dashboard-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i data-lucide="database" class="w-5 h-5 text-red-600 dark:text-red-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Data</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Kelola data lokal</p>
              </div>
            </div>

            <div class="space-y-3">
              <button onclick="SettingsPage.exportAllData()" class="btn-secondary w-full justify-start">
                <i data-lucide="download" class="w-4 h-4"></i>
                Export Semua Data (JSON)
              </button>
              <button onclick="SettingsPage.confirmClearData()" class="btn-danger w-full justify-start">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
                Hapus Semua Data Lokal
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons({ scope: content });

    // Update total order count
    const countEl = document.getElementById('total-order-count');
    if (countEl) {
      countEl.textContent = Utils.get('orders', []).length;
    }
  },

  toggleDarkMode() {
    const newTheme = Utils.toggleTheme();
    this.updateThemeUI(newTheme);

    // Update toggle
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.classList.toggle('active', newTheme === 'dark');

    // Update navbar icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
      lucide.createIcons();
    }
  },

  setTheme(theme) {
    const isDark = theme === 'dark';
    Utils.setTheme(theme);
    this.updateThemeUI(theme);

    // Update toggle
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.classList.toggle('active', isDark);
  },

  updateThemeUI(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);

    // Update navbar icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    }

    // Update modal close button visibility
    lucide.createIcons();
  },

  updateOtpInterval(value) {
    const val = Math.max(3, parseInt(value) || 3);
    document.getElementById('otp-interval-value').textContent = val;
    Utils.set('otpCheckInterval', val);
    Components.toast(`Interval cek OTP diubah menjadi ${val} detik`, 'success');
  },

  updateDashInterval(value) {
    const val = parseInt(value) || 30;
    document.getElementById('dash-interval-value').textContent = val;
    Utils.set('refreshInterval', val);
    Components.toast(`Interval refresh dashboard diubah menjadi ${val} detik`, 'success');
  },

  exportAllData() {
    const orders = Utils.get('orders', []);
    if (orders.length === 0) {
      Components.toast('Tidak ada data untuk diexport', 'warning');
      return;
    }
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'JasaOTP Dashboard',
      version: '1.0.0',
      totalOrders: orders.length,
      orders: orders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jasaotp-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Components.toast('Data berhasil diexport', 'success');
  },

  confirmClearData() {
    Components.confirmModal(
      'Hapus Semua Data?',
      'Semua data order lokal akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
      () => SettingsPage.clearAllData(),
      'Ya, Hapus Semua',
      'Batal',
      true
    );
  },

  clearAllData() {
    Utils.remove('orders');
    Components.toast('Semua data lokal berhasil dihapus', 'success');

    const countEl = document.getElementById('total-order-count');
    if (countEl) countEl.textContent = '0';
  },

  destroy() {
    // Cleanup
  },
};

/**
 * JasaOTP Dashboard - Main Application
 * Router & initialization
 */

const App = {
  currentPage: null,
  currentPageName: '',

  pages: {
    dashboard: { title: 'Dashboard', instance: DashboardPage },
    buy: { title: 'Beli Nokos', instance: BuyPage },
    otp: { title: 'OTP Aktif', instance: OTPPage },
    history: { title: 'Riwayat Order', instance: HistoryPage },
    settings: { title: 'Pengaturan', instance: SettingsPage },
  },

  /**
   * Init aplikasi
   */
  async init() {
    // Setup theme
    const theme = Utils.getTheme();
    Utils.setTheme(theme);

    // Setup icons
    lucide.createIcons();

    // Setup sidebar
    this.setupSidebar();

    // Load initial page
    const page = this.getPageFromHash() || 'dashboard';
    await this.navigate(page);

    // Hide loading screen
    setTimeout(() => {
      const loading = document.getElementById('loading-screen');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 500);
      }
    }, 600);

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const page = this.getPageFromHash() || 'dashboard';
      this.navigate(page);
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      Components.toast('Koneksi internet tersambung kembali', 'success');
    });

    window.addEventListener('offline', () => {
      Components.toast('Koneksi internet terputus', 'error');
    });
  },

  /**
   * Get page name from hash
   */
  getPageFromHash() {
    const hash = window.location.hash.slice(1);
    return hash || null;
  },

  /**
   * Navigasi ke halaman
   */
  async navigate(pageName) {
    // Destroy current page
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    const pageConfig = this.pages[pageName];
    if (!pageConfig) {
      window.location.hash = '#dashboard';
      return;
    }

    this.currentPageName = pageName;
    this.currentPage = pageConfig.instance;

    // Update title
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = pageConfig.title;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });

    // Render page
    await this.currentPage.render();

    // Update hash
    if (window.location.hash !== `#${pageName}`) {
      window.location.hash = pageName;
    }

    // Refresh balance
    this.updateBalance();

    // Scroll to top
    document.getElementById('main-content')?.scrollTo(0, 0);
  },

  /**
   * Setup sidebar click handlers
   */
  setupSidebar() {
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigate(page);
        // Close sidebar on mobile
        this.closeSidebar();
      });
    });
  },

  /**
   * Update saldo di navbar
   */
  async updateBalance() {
    try {
      const result = await API.getBalance();
      let balance = 0;
      if (result.data && result.data.data !== undefined) {
        balance = parseFloat(result.data.data) || 0;
      }

      const display = document.getElementById('balance-display');
      if (display) display.textContent = Utils.formatCurrency(balance);

    } catch (error) {
      // Silent fail untuk update balance
    }
  },

  /**
   * Refresh current page
   */
  async refresh() {
    const icon = document.getElementById('refresh-icon');
    if (icon) icon.classList.add('animate-spin');

    if (this.currentPage && this.currentPage.render) {
      await this.currentPage.render();
    }

    if (icon) {
      setTimeout(() => icon.classList.remove('animate-spin'), 500);
    }
    Components.toast('Halaman diperbarui', 'success');
  },

  /**
   * Toggle sidebar (mobile)
   */
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    const isOpen = !sidebar.classList.contains('-translate-x-full') || sidebar.classList.contains('translate-x-0');
    if (isOpen) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      if (overlay) overlay.classList.add('hidden');
    } else {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      if (overlay) overlay.classList.remove('hidden');
    }
  },

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    if (window.innerWidth < 1024) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      if (overlay) overlay.classList.add('hidden');
    }
  },
};

// ==================== Global Functions ====================

function toggleSidebar() {
  App.toggleSidebar();
}

function toggleDarkMode() {
  const newTheme = Utils.toggleTheme();

  // Update all UI
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }

  // Update settings page if active
  if (SettingsPage && App.currentPageName === 'settings') {
    // Update toggle in settings
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.classList.toggle('active', newTheme === 'dark');
  }

  Components.toast(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
}

// Init app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

/**
 * Riwayat Order Page
 * Menampilkan semua riwayat order dengan:
 * - Search
 * - Filter by status
 * - Pagination
 * - Export CSV & JSON
 */

const HistoryPage = {
  allOrders: [],
  filteredOrders: [],
  currentPage: 1,
  perPage: 10,
  currentFilter: 'all',
  searchQuery: '',

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-enter">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Order</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Semua order yang pernah dibuat</p>
          </div>
          <div class="flex gap-2">
            <button onclick="HistoryPage.exportCSV()" class="btn-secondary text-sm">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              CSV
            </button>
            <button onclick="HistoryPage.exportJSON()" class="btn-secondary text-sm">
              <i data-lucide="code" class="w-4 h-4"></i>
              JSON
            </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="search-wrapper flex-1">
            <i data-lucide="search" class="w-4 h-4"></i>
            <input type="text" id="history-search" class="form-input pl-10" placeholder="Cari order ID, nomor, layanan..." oninput="HistoryPage.onSearch(this.value)">
          </div>
          <select id="history-filter" class="form-select w-full sm:w-40" onchange="HistoryPage.onFilterChange(this.value)">
            <option value="all">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="waiting">Menunggu</option>
            <option value="pending">Pending</option>
            <option value="canceled">Dibatalkan</option>
          </select>
        </div>

        <!-- Table -->
        <div class="dashboard-card p-0 overflow-hidden">
          <div id="history-table-wrapper" class="p-1">
            ${Components.loadingOverlay('Memuat riwayat...')}
          </div>
        </div>

        <!-- Pagination -->
        <div id="history-pagination" class="mt-4"></div>
      </div>
    `;

    this.loadOrders();
  },

  loadOrders() {
    this.allOrders = Utils.get('orders', []);
    // Sort: newest first
    this.allOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    this.applyFilters();
  },

  applyFilters() {
    // Apply status filter
    let filtered = [...this.allOrders];

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(o =>
        o.status === this.currentFilter ||
        Utils.getStatusLabel(o.status).toLowerCase() === this.currentFilter
      );
    }

    // Apply search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        (o.orderId || o.id || '').toLowerCase().includes(q) ||
        (o.number || o.nomor || '').toLowerCase().includes(q) ||
        (o.service || '').toLowerCase().includes(q) ||
        (o.operator || '').toLowerCase().includes(q) ||
        (o.otp || o.sms || '').toLowerCase().includes(q)
      );
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.renderTable();
  },

  onSearch(query) {
    this.searchQuery = query;
    this.applyFilters();
  },

  onFilterChange(filter) {
    this.currentFilter = filter;
    this.applyFilters();
  },

  renderTable() {
    const wrapper = document.getElementById('history-table-wrapper');
    const paginationEl = document.getElementById('history-pagination');
    if (!wrapper) return;

    if (this.filteredOrders.length === 0) {
      wrapper.innerHTML = Components.emptyState(
        'inbox',
        'Tidak Ada Riwayat',
        'Belum ada riwayat order. Buat order baru di menu "Beli Nokos".'
      );
      lucide.createIcons({ scope: wrapper });
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const { items, total, pages, page } = Utils.paginate(this.filteredOrders, this.currentPage, this.perPage);

    wrapper.innerHTML = `
      <div class="table-wrapper border-0 rounded-none">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Order ID</th>
              <th>Nomor</th>
              <th>Negara</th>
              <th>Operator</th>
              <th>Layanan</th>
              <th>Harga</th>
              <th>OTP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(o => `
              <tr>
                <td class="text-xs text-gray-500">${Utils.formatDate(o.date)}</td>
                <td class="font-mono text-xs">${o.orderId || o.id || '-'}</td>
                <td class="font-medium text-sm">${Utils.formatPhoneNumber(o.number || o.nomor || '')}</td>
                <td>${o.country || '-'}</td>
                <td>${o.operator || '-'}</td>
                <td class="max-w-[120px] truncate" title="${o.service || ''}">${o.service || '-'}</td>
                <td class="font-medium">${Utils.formatCurrency(o.price || 0)}</td>
                <td class="font-mono text-sm font-medium ${(o.otp && o.otp !== 'Belum ada' && o.otp !== '-') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}">
                  ${(o.otp && o.otp !== 'Belum ada' && o.otp !== '-') ? o.otp : '-'}
                </td>
                <td>${Components.statusBadge(o.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    lucide.createIcons({ scope: wrapper });

    // Pagination
    if (paginationEl) {
      paginationEl.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan ${((page - 1) * this.perPage) + 1}-${Math.min(page * this.perPage, total)} dari ${total}
          </span>
          ${Components.pagination(page, pages, 'HistoryPage.goToPage')}
        </div>
      `;
    }
  },

  goToPage(page) {
    this.currentPage = page;
    this.renderTable();
  },

  // ==================== Export Functions ====================

  exportCSV() {
    if (this.allOrders.length === 0) {
      Components.toast('Tidak ada data untuk diexport', 'warning');
      return;
    }

    const headers = ['Tanggal', 'Order ID', 'Nomor', 'Negara', 'Operator', 'Layanan', 'Harga', 'OTP', 'Status'];
    const rows = this.allOrders.map(o => [
      o.date || '',
      o.orderId || o.id || '',
      o.number || o.nomor || '',
      o.country || '',
      o.operator || '',
      o.service || '',
      o.price || 0,
      o.otp || '',
      Utils.getStatusLabel(o.status),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    this.downloadFile(csvContent, 'riwayat-order.csv', 'text/csv');
    Components.toast('File CSV berhasil diunduh', 'success');
  },

  exportJSON() {
    if (this.allOrders.length === 0) {
      Components.toast('Tidak ada data untuk diexport', 'warning');
      return;
    }

    const jsonContent = JSON.stringify(this.allOrders, null, 2);
    this.downloadFile(jsonContent, 'riwayat-order.json', 'application/json');
    Components.toast('File JSON berhasil diunduh', 'success');
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  destroy() {
    // Cleanup
  },
};

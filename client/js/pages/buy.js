/**
 * Beli Nokos Page
 * Form untuk membeli nomor virtual baru
 * Pilih Negara -> Operator -> Layanan -> Beli
 */

const BuyPage = {
  selectedCountry: '',
  selectedOperator: '',
  selectedService: null,
  countries: [],
  operators: [],
  services: [],

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-enter">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Beli Nokos</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Beli nomor virtual untuk menerima OTP</p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form -->
          <div class="lg:col-span-2">
            <div class="dashboard-card">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Form Pemesanan</h3>

              <!-- Pilih Negara -->
              <div class="mb-5">
                <label class="form-label" for="country-select">Pilih Negara</label>
                <div class="search-wrapper">
                  <i data-lucide="search" class="w-4 h-4"></i>
                  <input type="text" id="country-search" class="form-input pl-10" placeholder="Cari negara..." oninput="BuyPage.filterCountries(this.value)">
                </div>
                <select id="country-select" class="form-select mt-2" onchange="BuyPage.onCountryChange(this.value)">
                  <option value="">-- Pilih Negara --</option>
                </select>
              </div>

              <!-- Pilih Operator -->
              <div class="mb-5">
                <label class="form-label" for="operator-select">Pilih Operator</label>
                <div class="search-wrapper">
                  <i data-lucide="search" class="w-4 h-4"></i>
                  <input type="text" id="operator-search" class="form-input pl-10" placeholder="Cari operator..." oninput="BuyPage.filterOperators(this.value)" disabled>
                </div>
                <select id="operator-select" class="form-select mt-2" onchange="BuyPage.onOperatorChange(this.value)" disabled>
                  <option value="">-- Pilih Operator --</option>
                </select>
              </div>

              <!-- Pilih Layanan -->
              <div class="mb-6">
                <label class="form-label" for="service-select">Pilih Layanan</label>
                <div class="search-wrapper">
                  <i data-lucide="search" class="w-4 h-4"></i>
                  <input type="text" id="service-search" class="form-input pl-10" placeholder="Cari layanan..." oninput="BuyPage.filterServices(this.value)" disabled>
                </div>
                <div id="service-list" class="mt-2 space-y-1 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                  <div class="text-center py-8 text-sm text-gray-400">Pilih negara dan operator terlebih dahulu</div>
                </div>
              </div>

              <button id="buy-btn" class="btn-primary w-full" onclick="BuyPage.submitOrder()" disabled>
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                Beli Nomor
              </button>
            </div>
          </div>

          <!-- Info Panel -->
          <div class="lg:col-span-1">
            <div class="dashboard-card sticky top-24">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi</h3>
              <div id="info-content" class="text-sm text-gray-500 dark:text-gray-400 space-y-4">
                <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-400">
                  <i data-lucide="info" class="w-5 h-5 shrink-0"></i>
                  <span>Pilih negara, operator, dan layanan untuk melihat harga dan stok.</span>
                </div>
              </div>

              <!-- Service Detail -->
              <div id="service-detail" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Detail Layanan</h4>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Nama</span>
                  <span id="detail-name" class="font-medium text-gray-900 dark:text-white text-right">-</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Harga</span>
                  <span id="detail-price" class="font-medium text-emerald-600 dark:text-emerald-400">-</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Stok</span>
                  <span id="detail-stock" class="font-medium text-gray-900 dark:text-white">-</span>
                </div>
              </div>

              <!-- Hasil Order -->
              <div id="order-result" class="hidden mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadCountries();
  },

  async loadCountries() {
    try {
      const result = await API.getCountries();
      let countriesData = result.data;

      // Handle nested data format
      if (countriesData && countriesData.data) {
        countriesData = countriesData.data;
      }

      // Convert object to array if needed
      if (typeof countriesData === 'object' && !Array.isArray(countriesData)) {
        countriesData = Object.entries(countriesData).map(([k, v]) => ({
          kode: k,
          nama: typeof v === 'string' ? v : (v.nama || v.name || k),
        }));
      }

      this.countries = countriesData || [];

      const select = document.getElementById('country-select');
      const searchInput = document.getElementById('country-search');

      if (select) {
        select.innerHTML = '<option value="">-- Pilih Negara --</option>';
        this.countries.forEach(c => {
          const code = c.kode || c.code || c.id || '';
          const name = c.nama || c.name || c.country || code;
          select.innerHTML += `<option value="${code}">${name}</option>`;
        });
      }

      if (searchInput) searchInput.disabled = false;

    } catch (error) {
      Components.toast('Gagal memuat daftar negara: ' + error.message, 'error');
    }
  },

  filterCountries(query) {
    const select = document.getElementById('country-select');
    if (!select) return;

    const options = select.options;
    const q = query.toLowerCase();
    for (let i = 0; i < options.length; i++) {
      const text = options[i].text.toLowerCase();
      options[i].style.display = text.includes(q) ? '' : 'none';
    }
  },

  async onCountryChange(country) {
    this.selectedCountry = country;
    this.selectedOperator = '';
    this.selectedService = null;

    // Reset operator
    const opSelect = document.getElementById('operator-select');
    const opSearch = document.getElementById('operator-search');
    const svSearch = document.getElementById('service-search');
    const svList = document.getElementById('service-list');
    const buyBtn = document.getElementById('buy-btn');
    const detailEl = document.getElementById('service-detail');
    const orderResult = document.getElementById('order-result');

    if (opSelect) {
      opSelect.innerHTML = '<option value="">-- Pilih Operator --</option>';
      opSelect.disabled = true;
    }
    if (opSearch) opSearch.disabled = true;
    if (svSearch) svSearch.disabled = true;
    if (svList) svList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Pilih operator terlebih dahulu</div>';
    if (buyBtn) buyBtn.disabled = true;
    if (detailEl) detailEl.classList.add('hidden');
    if (orderResult) orderResult.classList.add('hidden');

    if (!country) return;

    try {
      const [opResult, svResult] = await Promise.all([
        API.getOperators(country),
        API.getServices(country),
      ]);

      // Parse operators
      let opData = opResult.data;
      if (opData && opData.data) opData = opData.data;
      if (typeof opData === 'object' && !Array.isArray(opData)) {
        opData = Object.entries(opData).map(([k, v]) => ({
          kode: k,
          nama: typeof v === 'string' ? v : (v.nama || v.name || k),
        }));
      }
      this.operators = opData || [];

      // Parse services
      let svData = svResult.data;
      if (svData && svData.data) svData = svData.data;
      if (typeof svData === 'object' && !Array.isArray(svData)) {
        svData = Object.entries(svData).map(([k, v]) => ({
          kode: k,
          nama: typeof v === 'string' ? v : (v.nama || v.name || v.service || k),
          harga: v.harga || v.price || v.harga || 0,
          stok: v.stok || v.stock || v.stok || 0,
        }));
      }
      this.services = svData || [];

      // Populate operator select
      if (opSelect) {
        opSelect.innerHTML = '<option value="">-- Pilih Operator --</option>';
        this.operators.forEach(op => {
          const code = op.kode || op.code || op.id || '';
          const name = op.nama || op.name || op.operator || code;
          opSelect.innerHTML += `<option value="${code}">${name}</option>`;
        });
        opSelect.disabled = false;
      }
      if (opSearch) opSearch.disabled = false;

    } catch (error) {
      Components.toast('Gagal memuat data: ' + error.message, 'error');
    }
  },

  filterOperators(query) {
    const select = document.getElementById('operator-select');
    if (!select) return;
    const options = select.options;
    const q = query.toLowerCase();
    for (let i = 0; i < options.length; i++) {
      const text = options[i].text.toLowerCase();
      options[i].style.display = text.includes(q) ? '' : 'none';
    }
  },

  async onOperatorChange(operator) {
    this.selectedOperator = operator;
    this.selectedService = null;

    const svSearch = document.getElementById('service-search');
    const svList = document.getElementById('service-list');
    const buyBtn = document.getElementById('buy-btn');
    const detailEl = document.getElementById('service-detail');
    const orderResult = document.getElementById('order-result');

    if (buyBtn) buyBtn.disabled = true;
    if (detailEl) detailEl.classList.add('hidden');
    if (orderResult) orderResult.classList.add('hidden');

    if (!operator || this.services.length === 0) {
      if (svSearch) svSearch.disabled = true;
      if (svList) svList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Pilih operator terlebih dahulu</div>';
      return;
    }

    if (svSearch) svSearch.disabled = false;
    this.renderServices(this.services);
  },

  renderServices(services) {
    const svList = document.getElementById('service-list');
    if (!svList) return;

    if (!services || services.length === 0) {
      svList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Tidak ada layanan tersedia</div>';
      return;
    }

    svList.innerHTML = services.map((sv, idx) => {
      const code = sv.kode || sv.code || sv.id || sv.service || '';
      const name = sv.nama || sv.name || sv.service || code;
      const price = parseFloat(sv.harga || sv.price || 0);
      const stock = parseInt(sv.stok || sv.stock || 0);
      const isSelected = this.selectedService && (this.selectedService.kode === code || this.selectedService.service === code);

      return `<div class="service-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}"
                   onclick="BuyPage.selectService(${idx})" data-idx="${idx}">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${name}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stok: ${stock}</p>
        </div>
        <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">${Utils.formatCurrency(price)}</span>
      </div>`;
    }).join('');
  },

  filterServices(query) {
    const q = query.toLowerCase();
    const filtered = this.services.filter(sv => {
      const name = sv.nama || sv.name || sv.service || '';
      return name.toLowerCase().includes(q);
    });
    this.renderServices(filtered);
  },

  selectService(idx) {
    const allItems = document.querySelectorAll('.service-item');
    allItems.forEach(el => el.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20'));
    allItems.forEach(el => el.classList.add('border-transparent'));

    if (allItems[idx]) {
      allItems[idx].classList.remove('border-transparent');
      allItems[idx].classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
    }

    const services = document.getElementById('service-list');
    const visibleItems = services ? services.querySelectorAll('.service-item') : [];
    const actualIdx = Array.from(visibleItems).indexOf(allItems[idx]);

    const sv = this.services[actualIdx >= 0 ? actualIdx : idx];
    this.selectedService = sv;

    // Hitung harga total
    const price = parseFloat(sv.harga || sv.price || 0);
    const stock = parseInt(sv.stok || sv.stock || 0);

    // Update detail
    const detailEl = document.getElementById('service-detail');
    const buyBtn = document.getElementById('buy-btn');

    if (detailEl) {
      detailEl.classList.remove('hidden');
      document.getElementById('detail-name').textContent = sv.nama || sv.name || sv.service || '-';
      document.getElementById('detail-price').textContent = Utils.formatCurrency(price);
      document.getElementById('detail-stock').textContent = stock > 0 ? `${stock} tersedia` : 'Habis';
    }

    if (buyBtn) {
      buyBtn.disabled = false;
    }
  },

  async submitOrder() {
    if (!this.selectedCountry || !this.selectedOperator || !this.selectedService) {
      Components.toast('Lengkapi semua pilihan terlebih dahulu', 'warning');
      return;
    }

    const buyBtn = document.getElementById('buy-btn');
    if (buyBtn) {
      buyBtn.disabled = true;
      buyBtn.innerHTML = `${Components.spinner('sm')} Memproses...`;
    }

    try {
      const serviceCode = this.selectedService.kode || this.selectedService.code || this.selectedService.id || this.selectedService.service || '';
      const result = await API.createOrder(this.selectedCountry, serviceCode, this.selectedOperator);

      // Simpan order ke localStorage
      const orderData = result.data || result;
      const orderId = orderData.data ? orderData.data.id || orderData.data.order_id || orderData.data.orderId || '' : (orderData.id || orderData.order_id || orderData.orderId || '');
      const number = orderData.data ? orderData.data.nomor || orderData.data.number || orderData.data.no || '' : (orderData.nomor || orderData.number || orderData.no || '');

      const order = {
        id: orderId,
        orderId: orderId,
        number: number,
        country: this.selectedCountry,
        operator: this.selectedOperator,
        service: this.selectedService.nama || this.selectedService.name || this.selectedService.service || serviceCode,
        price: this.selectedService.harga || this.selectedService.price || 0,
        status: 'waiting',
        otp: 'Belum ada',
        date: new Date().toISOString(),
      };

      const orders = Utils.get('orders', []);
      orders.push(order);
      Utils.set('orders', orders);

      // Tampilkan hasil order
      this.showOrderResult(order);
      Components.toast('Order berhasil dibuat!', 'success');

    } catch (error) {
      Components.toast(error.message, 'error');
    } finally {
      if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.innerHTML = '<i data-lucide="shopping-cart" class="w-5 h-5"></i> Beli Nomor';
        lucide.createIcons({ scope: buyBtn });
      }
    }
  },

  showOrderResult(order) {
    const container = document.getElementById('order-result');
    if (!container) return;

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="order-result-card mt-4">
        <div class="divider -mx-6"></div>
        <div class="text-center mb-4">
          <div class="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <i data-lucide="check-circle-2" class="w-7 h-7 text-emerald-600 dark:text-emerald-400"></i>
          </div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Order Berhasil</h4>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">Nomor</span>
            <span class="font-medium text-gray-900 dark:text-white" id="result-number">${order.number || '-'}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">Order ID</span>
            <span class="font-medium text-gray-900 dark:text-white">${order.orderId || '-'}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">Status</span>
            <span class="badge-warning">Menunggu OTP</span>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn-primary flex-1" onclick="Utils.copyToClipboard(document.getElementById('result-number').textContent); Components.toast('Nomor disalin!', 'success')">
            <i data-lucide="copy" class="w-4 h-4"></i> Salin Nomor
          </button>
        </div>
      </div>
    `;
    lucide.createIcons({ scope: container });
  },

  destroy() {
    // Cleanup jika diperlukan
  },
};

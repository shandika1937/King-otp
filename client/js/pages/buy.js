/**
 * Beli Nokos Page
 * Form untuk membeli nomor virtual OTP
 */

const BuyPage = {
  selectedCountryId: null,
  selectedCountryName: '',
  selectedOperator: '',
  selectedService: null,
  countries: [],
  operators: [],
  services: [],

  async render() {
    document.getElementById('page-content').innerHTML = `
      <div class="page-enter">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Beli Nokos</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pilih negara, operator, dan layanan untuk membeli nomor virtual</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Form Section -->
          <div class="lg:col-span-2">
            <div class="dashboard-card">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i data-lucide="shopping-cart" class="w-5 h-5 text-indigo-500"></i>
                Form Pemesanan
              </h3>

              <!-- Country Select -->
              <div class="mb-5">
                <label class="form-label">Pilih Negara</label>
                <select id="country-select" class="form-select" onchange="BuyPage.onCountryChange(this.value)">
                  <option value="">-- Pilih Negara --</option>
                </select>
              </div>

              <!-- Operator Select -->
              <div class="mb-5">
                <label class="form-label">Pilih Operator</label>
                <select id="operator-select" class="form-select" onchange="BuyPage.onOperatorChange(this.value)" disabled>
                  <option value="">-- Pilih Operator --</option>
                </select>
              </div>

              <!-- Service List -->
              <div class="mb-6">
                <label class="form-label">Pilih Layanan</label>
                <div id="service-list" class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                  <div class="text-center py-8 text-sm text-gray-400">Pilih negara & operator terlebih dahulu</div>
                </div>
              </div>

              <!-- Submit Button -->
              <button id="buy-btn" class="btn-primary w-full" onclick="BuyPage.submitOrder()" disabled>
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                Beli Nomor
              </button>
            </div>
          </div>

          <!-- Detail Panel -->
          <div class="lg:col-span-1">
            <div class="dashboard-card sticky top-24">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i data-lucide="info" class="w-5 h-5 text-blue-500"></i>
                Detail Layanan
              </h3>

              <div id="service-detail" class="hidden space-y-3">
                <div class="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 text-sm">
                  <span class="text-gray-500">Nama</span>
                  <span id="detail-name" class="font-medium text-right">-</span>
                </div>
                <div class="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 text-sm">
                  <span class="text-gray-500">Harga</span>
                  <span id="detail-price" class="font-semibold text-emerald-600 dark:text-emerald-400">-</span>
                </div>
                <div class="flex justify-between py-2.5 text-sm">
                  <span class="text-gray-500">Stok</span>
                  <span id="detail-stock" class="font-medium">-</span>
                </div>
              </div>

              <div id="order-result" class="hidden mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    await this.loadCountries();
  },

  // ==================== Load Countries ====================

  async loadCountries() {
    try {
      const response = await API.getCountries();
      const data = response.data || response;

      // Handle berbagai format respons
      if (Array.isArray(data)) {
        this.countries = data;
      } else if (data && Array.isArray(data.data)) {
        this.countries = data.data;
      } else if (data && typeof data === 'object') {
        // Coba cari array di dalam object
        const found = Object.values(data).find(v => Array.isArray(v));
        this.countries = found || [];
      } else {
        this.countries = [];
      }

      const select = document.getElementById('country-select');
      select.innerHTML = '<option value="">-- Pilih Negara --</option>';

      this.countries.forEach(country => {
        const id = country.id_negara;
        const name = country.nama_negara || country.name || '';
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        select.innerHTML += `<option value="${id}">${displayName}</option>`;
      });

      Components.toast(`${this.countries.length} negara tersedia`, 'success');
    } catch (error) {
      Components.toast('Gagal memuat daftar negara: ' + error.message, 'error');
    }
  },

  // ==================== Country Change ====================

  async onCountryChange(countryId) {
    this.selectedCountryId = countryId ? parseInt(countryId, 10) : null;
    this.selectedOperator = '';
    this.selectedService = null;

    // Find country name
    const country = this.countries.find(c => c.id_negara == countryId);
    this.selectedCountryName = country ? (country.nama_negara || country.name || '') : '';

    // Reset UI
    const operatorSelect = document.getElementById('operator-select');
    const serviceList = document.getElementById('service-list');
    const detail = document.getElementById('service-detail');
    const buyBtn = document.getElementById('buy-btn');
    const orderResult = document.getElementById('order-result');

    operatorSelect.innerHTML = '<option value="">-- Pilih Operator --</option>';
    operatorSelect.disabled = true;
    serviceList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Pilih operator terlebih dahulu</div>';
    detail.classList.add('hidden');
    buyBtn.disabled = true;
    if (orderResult) orderResult.classList.add('hidden');

    if (!this.selectedCountryId) return;

    // Load operators and services in parallel
    try {
      const [operatorResponse, serviceResponse] = await Promise.all([
        API.getOperators(countryId),
        API.getServices(countryId)
      ]);

      // Parse operators
      const opData = operatorResponse.data || operatorResponse;
      let operators = [];
      if (opData && opData[String(countryId)]) {
        operators = opData[String(countryId)];
      }
      this.operators = operators;

      operatorSelect.innerHTML = `<option value="">-- Pilih Operator (${operators.length} tersedia) --</option>`;
      operators.forEach(op => {
        const displayName = op.charAt(0).toUpperCase() + op.slice(1);
        operatorSelect.innerHTML += `<option value="${op}">${displayName}</option>`;
      });
      operatorSelect.disabled = false;

      // Parse services
      const svData = serviceResponse.data || serviceResponse;
      let services = {};
      if (svData && svData[String(countryId)]) {
        services = svData[String(countryId)];
      }

      this.services = [];
      Object.entries(services).forEach(([code, info]) => {
        this.services.push({
          code: code,
          nama: info.layanan || code,
          harga: parseInt(info.harga) || 0,
          stok: parseInt(info.stok) || 0
        });
      });

      if (this.services.length > 0) {
        this.renderServices(this.services);
      } else {
        serviceList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Tidak ada layanan tersedia</div>';
      }
    } catch (error) {
      Components.toast('Gagal memuat data: ' + error.message, 'error');
    }
  },

  // ==================== Render Services ====================

  renderServices(services) {
    const list = document.getElementById('service-list');
    if (!services || services.length === 0) {
      list.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Tidak ada layanan tersedia</div>';
      return;
    }

    list.innerHTML = services
      .map((sv, index) => {
        const priceFormatted = 'Rp ' + (sv.harga || 0).toLocaleString('id-ID');
        return `
          <div class="service-item flex items-center justify-between p-3 rounded-xl cursor-pointer border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
               onclick="BuyPage.selectService(${index})">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${sv.nama || sv.code}</p>
              <p class="text-xs text-gray-500 mt-0.5">Stok: ${sv.stok || 0} tersedia</p>
            </div>
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">${priceFormatted}</span>
          </div>
        `;
      })
      .join('');
  },

  // ==================== Operator Change ====================

  onOperatorChange(operator) {
    this.selectedOperator = operator;
    this.selectedService = null;

    const serviceList = document.getElementById('service-list');
    const detail = document.getElementById('service-detail');
    const buyBtn = document.getElementById('buy-btn');

    detail.classList.add('hidden');
    buyBtn.disabled = true;

    if (!operator || this.services.length === 0) {
      serviceList.innerHTML = '<div class="text-center py-8 text-sm text-gray-400">Pilih operator terlebih dahulu</div>';
      return;
    }

    this.renderServices(this.services);
  },

  // ==================== Select Service ====================

  selectService(index) {
    const items = document.querySelectorAll('.service-item');
    items.forEach(el => {
      el.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
      el.classList.add('border-transparent');
    });

    if (items[index]) {
      items[index].classList.remove('border-transparent');
      items[index].classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
    }

    const service = this.services[index];
    if (!service) return;

    this.selectedService = service;

    const detail = document.getElementById('service-detail');
    detail.classList.remove('hidden');
    document.getElementById('detail-name').textContent = service.nama || service.code;
    document.getElementById('detail-price').textContent = 'Rp ' + (service.harga || 0).toLocaleString('id-ID');
    document.getElementById('detail-stock').textContent = (service.stok || 0) + ' tersedia';

    const buyBtn = document.getElementById('buy-btn');
    buyBtn.disabled = false;
  },

  // ==================== Submit Order ====================

  async submitOrder() {
    if (!this.selectedCountryId || !this.selectedOperator || !this.selectedService) {
      Components.toast('Lengkapi semua pilihan terlebih dahulu', 'warning');
      return;
    }

    const btn = document.getElementById('buy-btn');
    btn.disabled = true;
    btn.innerHTML = Components.spinner('sm') + ' Memproses...';

    try {
      const response = await API.createOrder(
        this.selectedCountryId,
        this.selectedService.code,
        this.selectedOperator
      );

      const result = response.data || response;
      const orderId = result.order_id || '';
      const number = result.number || '';

      // Simpan order ke localStorage
      const order = {
        id: orderId,
        orderId: orderId,
        number: number,
        countryId: this.selectedCountryId,
        countryName: this.selectedCountryName,
        operator: this.selectedOperator,
        service: this.selectedService.nama || this.selectedService.code,
        serviceCode: this.selectedService.code,
        price: this.selectedService.harga,
        status: 'waiting',
        otp: 'Belum ada',
        date: new Date().toISOString()
      };

      const orders = Utils.get('orders', []);
      orders.push(order);
      Utils.set('orders', orders);

      // Tampilkan hasil order
      const resultContainer = document.getElementById('order-result');
      resultContainer.classList.remove('hidden');
      resultContainer.innerHTML = `
        <div class="order-result-card">
          <div class="text-center mb-4">
            <div class="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <i data-lucide="check-circle-2" class="w-7 h-7 text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Order Berhasil!</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Nomor virtual siap digunakan</p>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800">
              <span class="text-gray-500 dark:text-gray-400">Nomor</span>
              <span id="result-number" class="font-mono font-semibold text-gray-900 dark:text-white">${number}</span>
            </div>
            <div class="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800">
              <span class="text-gray-500 dark:text-gray-400">Order ID</span>
              <span class="font-mono font-semibold text-gray-900 dark:text-white">${orderId}</span>
            </div>
            <div class="flex justify-between py-2.5">
              <span class="text-gray-500 dark:text-gray-400">Status</span>
              <span class="badge-warning">Menunggu OTP</span>
            </div>
          </div>

          <button class="btn-primary w-full mt-4 text-sm"
                  onclick="Utils.copyToClipboard(document.getElementById('result-number').textContent); Components.toast('Nomor berhasil disalin!', 'success')">
            <i data-lucide="copy" class="w-4 h-4"></i>
            Salin Nomor
          </button>
        </div>
      `;

      lucide.createIcons();
      Components.toast('Order berhasil! Nomor: ' + number, 'success');
    } catch (error) {
      Components.toast(error.message || 'Gagal membuat order', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="shopping-cart" class="w-5 h-5"></i> Beli Nomor';
      lucide.createIcons({ scope: btn });
    }
  },

  destroy() {
    // Cleanup
  }
};

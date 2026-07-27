/**
 * UI Components
 * Kumpulan fungsi untuk membuat komponen UI reusable
 */

const Components = {
  // ==================== Toast ====================

  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: 'check-circle-2',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info',
    };

    const colors = {
      success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    };

    const id = 'toast-' + Utils.generateId();
    const icon = icons[type] || icons.info;

    const el = document.createElement('div');
    el.id = id;
    el.className = `toast-enter pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border ${colors[type] || colors.info} shadow-lg`;
    el.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5 shrink-0 mt-0.5"></i>
      <span class="text-sm font-medium flex-1">${message}</span>
      <button onclick="Components.removeToast('${id}')" class="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(el);
    lucide.createIcons({ scope: el });

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  },

  removeToast(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = el.className.replace('toast-enter', 'toast-exit');
    setTimeout(() => el.remove(), 300);
  },

  // ==================== Modal ====================

  showModal(content) {
    const container = document.getElementById('modal-container');
    const contentEl = document.getElementById('modal-content');
    if (!container || !contentEl) return;

    contentEl.innerHTML = content;
    container.classList.remove('hidden');
    lucide.createIcons({ scope: contentEl });
  },

  hideModal() {
    const container = document.getElementById('modal-container');
    if (container) container.classList.add('hidden');
  },

  confirmModal(title, message, onConfirm, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', danger = false) {
    this.showModal(`
      <div class="text-center">
        <div class="mx-auto w-14 h-14 rounded-full ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'} flex items-center justify-center mb-4">
          <i data-lucide="${danger ? 'alert-triangle' : 'help-circle'}" class="w-7 h-7 ${danger ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${title}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${message}</p>
        <div class="flex gap-3 justify-center">
          <button onclick="Components.hideModal()" class="btn-secondary">${cancelText}</button>
          <button onclick="Components.hideModal(); (${onConfirm.toString()})()" class="${danger ? 'btn-danger' : 'btn-primary'}">${confirmText}</button>
        </div>
      </div>
    `);
  },

  // ==================== Skeleton ====================

  skeletonCard() {
    return `
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div class="flex items-start gap-4">
          <div class="skeleton w-12 h-12 rounded-2xl"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-24"></div>
            <div class="skeleton h-8 w-32"></div>
          </div>
        </div>
      </div>
    `;
  },

  skeletonTable(rows = 5) {
    let html = '<div class="space-y-3">';
    for (let i = 0; i < rows; i++) {
      html += `
        <div class="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="skeleton h-4 w-16"></div>
          <div class="skeleton h-4 w-32 flex-1"></div>
          <div class="skeleton h-4 w-24"></div>
          <div class="skeleton h-4 w-20"></div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  },

  skeletonForm() {
    return `
      <div class="space-y-4">
        <div class="skeleton h-5 w-32 mb-2"></div>
        <div class="skeleton h-10 w-full rounded-xl"></div>
        <div class="skeleton h-5 w-32 mb-2 mt-4"></div>
        <div class="skeleton h-10 w-full rounded-xl"></div>
        <div class="skeleton h-5 w-32 mb-2 mt-4"></div>
        <div class="skeleton h-10 w-full rounded-xl"></div>
        <div class="skeleton h-10 w-40 rounded-xl mt-6"></div>
      </div>
    `;
  },

  // ==================== Empty State ====================

  emptyState(icon, title, description) {
    return `
      <div class="empty-state">
        <i data-lucide="${icon}" class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${title}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">${description}</p>
      </div>
    `;
  },

  // ==================== Spinner ====================

  spinner(size = 'md') {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return `<div class="spinner ${sizes[size] || sizes.md}"></div>`;
  },

  loadingOverlay(text = 'Memproses...') {
    return `
      <div class="flex flex-col items-center justify-center py-12">
        ${this.spinner('lg')}
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">${text}</p>
      </div>
    `;
  },

  // ==================== Badge ====================

  statusBadge(status) {
    const label = Utils.getStatusLabel(status);
    const cls = Utils.getStatusBadgeClass(status);
    return `<span class="${cls}">${label}</span>`;
  },

  // ==================== Pagination ====================

  pagination(currentPage, totalPages, callback) {
    if (totalPages <= 1) return '';

    let html = '<div class="flex items-center justify-center gap-1.5 mt-6">';

    // Previous
    html += `<button onclick="${callback}(${currentPage - 1})" class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''}>
      <i data-lucide="chevron-left" class="w-4 h-4"></i>
    </button>`;

    // Pages
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
      html += `<button onclick="${callback}(1)" class="pagination-btn">1</button>`;
      if (start > 2) html += `<span class="px-2 text-gray-400">...</span>`;
    }

    for (let i = start; i <= end; i++) {
      html += `<button onclick="${callback}(${i})" class="pagination-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span class="px-2 text-gray-400">...</span>`;
      html += `<button onclick="${callback}(${totalPages})" class="pagination-btn">${totalPages}</button>`;
    }

    // Next
    html += `<button onclick="${callback}(${currentPage + 1})" class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''}>
      <i data-lucide="chevron-right" class="w-4 h-4"></i>
    </button>`;

    html += '</div>';
    return html;
  },
};

// Modal close on overlay click
document.addEventListener('click', (e) => {
  const container = document.getElementById('modal-container');
  if (container && e.target === container) {
    Components.hideModal();
  }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') Components.hideModal();
});

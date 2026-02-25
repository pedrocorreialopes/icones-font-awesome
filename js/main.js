/**
 * Font Awesome Icon Search - Main JavaScript
 * Versão simplificada e confiável
 */

class FontAwesomeSearch {
  constructor() {
    this.icons = [];
    this.filteredIcons = [];
    this.searchTerm = '';
    this.currentView = 'grid';
    this.currentSort = 'name';
    
    this.init();
  }

  async init() {
    try {
      this.showLoading(true);
      await this.loadIcons();
      this.setupEventListeners();
      this.loadTheme();
      this.render();
      this.updateStats();
      this.showLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar:', error);
      this.showLoading(false);
    }
  }

  async loadIcons() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (window.fontAwesomeIcons) {
          this.icons = [...window.fontAwesomeIcons];
          this.filteredIcons = [...this.icons];
          resolve();
        }
      }, 300);
    });
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const sortSelect = document.getElementById('sortSelect');
    const themeToggle = document.getElementById('themeToggle');
    const iconsGrid = document.getElementById('iconsGrid');

    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    if (clearSearch) {
      clearSearch.addEventListener('click', () => this.clearSearch());
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.sortIcons();
        this.render();
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    if (iconsGrid) {
      iconsGrid.addEventListener('click', (e) => this.handleIconClick(e));
    }

    // View toggle buttons
    document.querySelectorAll('.view-toggle__btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentView = e.target.closest('.view-toggle__btn').dataset.view;
        this.updateViewButtons();
        this.render();
      });
    });
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase().trim();
    
    // Toggle clear button
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) {
      clearBtn.style.display = this.searchTerm ? 'flex' : 'none';
    }

    // Filter icons
    if (!this.searchTerm) {
      this.filteredIcons = [...this.icons];
    } else {
      this.filteredIcons = this.icons.filter(icon => {
        return icon.name.toLowerCase().includes(this.searchTerm) ||
               icon.category.toLowerCase().includes(this.searchTerm) ||
               icon.class.toLowerCase().includes(this.searchTerm);
      });
    }

    this.sortIcons();
    this.render();
    this.updateResultsInfo();
  }

  sortIcons() {
    switch (this.currentSort) {
      case 'name':
        this.filteredIcons.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        this.filteredIcons.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        break;
      case 'popularity':
        this.filteredIcons.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
        break;
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
      this.handleSearch('');
      searchInput.focus();
    }
  }

  handleIconClick(event) {
    const iconCard = event.target.closest('.icon-card');
    if (!iconCard) return;

    const iconName = iconCard.getAttribute('data-icon-name');
    const iconClass = iconCard.getAttribute('data-icon-class');
    const htmlCode = `<i class="${iconClass}" aria-hidden="true"></i>`;

    this.copyToClipboard(htmlCode, iconName);
  }

  async copyToClipboard(text, iconName) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(`Código do ícone "${iconName}" copiado!`, 'success');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast(`Código do ícone "${iconName}" copiado!`, 'success');
    }
  }

  render() {
    const iconsGrid = document.getElementById('iconsGrid');
    const noResults = document.getElementById('noResults');

    if (!iconsGrid) return;

    // Clear grid
    iconsGrid.innerHTML = '';

    if (this.filteredIcons.length === 0) {
      if (noResults) noResults.style.display = 'block';
      iconsGrid.style.display = 'none';
      return;
    }

    if (noResults) noResults.style.display = 'none';
    iconsGrid.style.display = 'grid';

    // Toggle list view
    iconsGrid.classList.toggle('list-view', this.currentView === 'list');

    // Render icons
    this.filteredIcons.forEach((icon, index) => {
      const iconCard = this.createIconCard(icon);
      iconsGrid.appendChild(iconCard);
      
      // Stagger animation
      setTimeout(() => {
        iconCard.style.opacity = '1';
        iconCard.style.transform = 'translateY(0)';
      }, index * 30);
    });
  }

  createIconCard(icon) {
    const card = document.createElement('div');
    card.className = 'icon-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease-out';
    card.setAttribute('data-icon-name', icon.name);
    card.setAttribute('data-icon-class', icon.class);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Ícone ${icon.name}`);

    const htmlCode = `<i class="${icon.class}" aria-hidden="true"></i>`;

    card.innerHTML = `
      <div class="icon-card__icon">
        ${htmlCode}
      </div>
      <div class="icon-card__name">${icon.name}</div>
      <div class="icon-card__code">${htmlCode}</div>
    `;

    return card;
  }

  updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    if (!resultsInfo) return;

    const total = this.filteredIcons.length;
    const message = this.searchTerm 
      ? `${total} resultado${total !== 1 ? 's' : ''} para "${this.searchTerm}"`
      : `Exibindo ${total} de ${this.icons.length} ícones`;

    resultsInfo.textContent = message;
  }

  updateStats() {
    const totalIcons = document.getElementById('totalIcons');
    const categoriesCount = document.getElementById('categoriesCount');

    if (window.iconsStats) {
      if (totalIcons) totalIcons.textContent = window.iconsStats.total;
      if (categoriesCount) categoriesCount.textContent = window.iconsStats.categories;
    }
  }

  updateViewButtons() {
    document.querySelectorAll('.view-toggle__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.currentView);
    });
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    const iconsGrid = document.getElementById('iconsGrid');

    if (loading) loading.style.display = show ? 'flex' : 'none';
    if (iconsGrid) iconsGrid.style.display = show ? 'none' : 'grid';
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = toast.querySelector('.toast__icon');
    const messageEl = toast.querySelector('.toast__message');

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    if (icon) icon.className = `toast__icon ${icons[type]}`;
    if (messageEl) messageEl.textContent = message;

    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  if (window.fontAwesomeIcons) {
    new FontAwesomeSearch();
  } else {
    console.error('Font Awesome Icons não carregados');
  }
});
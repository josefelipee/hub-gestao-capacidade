/**
 * Hub de Painéis Globo - Power BI
 * MVP com busca, filtro por categoria, favoritos, modo escuro e embed via iframe.
 */

(function () {
  'use strict';

  // Estado da aplicação
  const state = {
    panels: [],
    filteredPanels: [],
    activeCategory: 'Todas',
    searchQuery: '',
    favorites: new Set(),
    showFavoritesOnly: false,
  };

  // Elementos do DOM
  const els = {
    grid: document.getElementById('panels-grid'),
    searchInput: document.getElementById('search-input'),
    categoryFilters: document.getElementById('category-filters'),
    statusMessage: document.getElementById('status-message'),
    btnTheme: document.getElementById('btn-theme'),
    btnFavorites: document.getElementById('btn-favorites'),
    modal: document.getElementById('embed-modal'),
    modalContent: document.getElementById('modal-content'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalTitle: document.getElementById('modal-title'),
    modalCategory: document.getElementById('modal-category'),
    modalClose: document.getElementById('modal-close'),
    modalFullscreen: document.getElementById('modal-fullscreen'),
    iframe: document.getElementById('embed-iframe'),
  };

  // Ícones SVG
  const icons = {
    'chart-bar': '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />',
    'chart-pie': '<path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />',
    'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />',
    'chart-area': '<path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />',
    'briefcase': '<path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />',
    'truck': '<path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />',
    'users': '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
    'folder': '<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />',
    'star': '<path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />',
    'eye': '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />',
    'external-link': '<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />',
  };

  function getIcon(name) {
    return icons[name] || icons['chart-bar'];
  }

  // Tenant padrão da empresa (usado quando o link original não traz ctid na query string)
  const DEFAULT_CTID = 'a7cdc447-3b29-4b41-b73e-8a2cb54b06c6';

  // Extrair reportId do link original do Power BI
  function extractReportId(url) {
    if (!url) return null;
    const match = url.match(/\/reports\/([a-f0-9\-]{36})/i);
    return match ? match[1] : null;
  }

  // Extrair ctid do link original, ou retornar o padrão
  function extractCtid(url) {
    if (!url) return DEFAULT_CTID;
    const match = url.match(/[?&]ctid=([a-f0-9\-]{36})/i);
    return match ? match[1] : DEFAULT_CTID;
  }

  // Montar URL de embed a partir do link original
  function buildEmbedUrl(panel) {
    const reportId = extractReportId(panel.originalUrl);
    const ctid = extractCtid(panel.originalUrl);
    if (!reportId || !ctid) return null;
    return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&autoAuth=true&ctid=${ctid}`;
  }

  // Inicialização
  async function init() {
    loadTheme();
    loadFavorites();
    setupEventListeners();
    await loadPanels();
  }

  // Carregar painéis do JSON
  async function loadPanels() {
    try {
      const response = await fetch('data/panels.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.panels = await response.json();
      state.filteredPanels = [...state.panels];
      renderPanels();
      showStatus(`${state.panels.length} painéis carregados com sucesso.`, 'success');
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      els.grid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Não foi possível carregar os painéis</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Verifique se o arquivo <code class="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">data/panels.json</code> existe e está correto.</p>
          <p class="text-xs text-slate-400 mt-2">${error.message}</p>
        </div>
      `;
    }
  }

  // Renderizar painéis
  function renderPanels() {
    const filtered = applyFilters();

    if (filtered.length === 0) {
      els.grid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Nenhum painel encontrado</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Tente ajustar a busca ou o filtro de categoria.</p>
        </div>
      `;
      return;
    }

    els.grid.innerHTML = filtered.map((panel, index) => createCard(panel, index)).join('');

    // Reatachar eventos nos cards
    document.querySelectorAll('.btn-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.id);
      });
    });

    document.querySelectorAll('.btn-open-panel').forEach(btn => {
      btn.addEventListener('click', () => openPanel(btn.dataset.id));
    });
  }

  // Criar HTML do card
  function createCard(panel, index) {
    const isFavorite = state.favorites.has(panel.id);
    const embedUrl = buildEmbedUrl(panel);
    const reportId = extractReportId(panel.originalUrl);
    const hasEmbed = !!embedUrl;
    const hasOriginalUrl = panel.originalUrl && panel.originalUrl.trim() !== '';
    const delay = Math.min(index * 50, 500);

    const originalLinkClass = hasOriginalUrl
      ? 'btn-original-link w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-globo-300 dark:hover:border-globo-600 transition mt-2'
      : 'w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed mt-2';

    const embedButton = hasEmbed
      ? `<button class="btn-open-panel btn-primary w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" data-id="${panel.id}">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons.eye}</svg>
           Visualizar painel
         </button>`
      : `<button disabled class="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons.eye}</svg>
           Embed indisponível
         </button>`;

    return `
      <article class="panel-card flex flex-col p-6" style="animation-delay: ${delay}ms">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-globo-500 to-globo-700 flex items-center justify-center text-white shadow-md">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              ${getIcon(panel.icon)}
            </svg>
          </div>
          <button class="btn-favorite p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${isFavorite ? 'active' : ''}" data-id="${panel.id}" aria-label="Favoritar">
            <svg class="w-6 h-6 ${isFavorite ? 'fill-current' : ''}" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              ${icons.star}
            </svg>
          </button>
        </div>
        <div class="flex-1">
          <span class="category-badge mb-2">${escapeHtml(panel.category)}</span>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">${escapeHtml(panel.title)}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">${escapeHtml(panel.description)}</p>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          ${embedButton}
          ${hasOriginalUrl
            ? `<a href="${escapeHtml(panel.originalUrl)}" target="_blank" rel="noopener noreferrer" class="${originalLinkClass}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons['external-link']}</svg>
                Abrir no Power BI
               </a>`
            : `<button disabled class="${originalLinkClass}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons['external-link']}</svg>
                Link não configurado
               </button>`
          }
          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center truncate" title="${embedUrl || ''}">ID: ${reportId || 'não identificado'}</p>
        </div>
      </article>
    `;
  }

  // Aplicar filtros
  function applyFilters() {
    return state.panels.filter(panel => {
      const matchesCategory = state.activeCategory === 'Todas' || panel.category === state.activeCategory;
      const matchesSearch = panel.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                            panel.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesFavorites = !state.showFavoritesOnly || state.favorites.has(panel.id);
      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }

  // Alternar favorito
  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    saveFavorites();
    renderPanels();
    updateFavoritesButton();
  }

  // Carregar/salvar favoritos
  function loadFavorites() {
    try {
      const stored = localStorage.getItem('globo-hub-favorites');
      if (stored) {
        state.favorites = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Não foi possível carregar favoritos:', e);
    }
    updateFavoritesButton();
  }

  function saveFavorites() {
    try {
      localStorage.setItem('globo-hub-favorites', JSON.stringify([...state.favorites]));
    } catch (e) {
      console.warn('Não foi possível salvar favoritos:', e);
    }
  }

  function updateFavoritesButton() {
    const count = state.favorites.size;
    const span = els.btnFavorites.querySelector('span');
    span.textContent = state.showFavoritesOnly ? `Favoritos (${count})` : `Favoritos ${count > 0 ? `(${count})` : ''}`;
    els.btnFavorites.classList.toggle('bg-globo-100', state.showFavoritesOnly);
    els.btnFavorites.classList.toggle('text-globo-700', state.showFavoritesOnly);
    els.btnFavorites.classList.toggle('dark:bg-globo-900/40', state.showFavoritesOnly);
    els.btnFavorites.classList.toggle('dark:text-globo-300', state.showFavoritesOnly);
  }

  // Abrir painel no modal
  function openPanel(id) {
    const panel = state.panels.find(p => p.id === id);
    if (!panel) return;

    const embedUrl = buildEmbedUrl(panel);
    if (!embedUrl) {
      showStatus('Não foi possível gerar o embed deste painel. Verifique o link original no JSON.', 'error');
      return;
    }

    els.modalTitle.textContent = panel.title;
    els.modalCategory.textContent = panel.category;
    els.iframe.src = embedUrl;
    els.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Animar entrada
    requestAnimationFrame(() => {
      els.modalContent.classList.add('open');
    });
  }

  // Fechar modal
  function closeModal() {
    els.modalContent.classList.remove('open');
    setTimeout(() => {
      els.modal.classList.add('hidden');
      els.iframe.src = '';
      document.body.style.overflow = '';
    }, 200);
  }

  // Tela cheia
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      els.modal.requestFullscreen?.().catch(err => console.warn('Fullscreen não permitido:', err));
    } else {
      document.exitFullscreen?.();
    }
  }

  // Tema escuro
  function loadTheme() {
    const stored = localStorage.getItem('globo-hub-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setTheme(isDark);
  }

  function setTheme(isDark) {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    localStorage.setItem('globo-hub-theme', isDark ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(!isDark);
  }

  // Event listeners
  function setupEventListeners() {
    // Busca
    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderPanels();
    });

    // Filtros de categoria
    els.categoryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;

      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      renderPanels();
    });

    // Favoritos
    els.btnFavorites.addEventListener('click', () => {
      state.showFavoritesOnly = !state.showFavoritesOnly;
      updateFavoritesButton();
      renderPanels();
    });

    // Tema
    els.btnTheme.addEventListener('click', toggleTheme);

    // Modal
    els.modalClose.addEventListener('click', closeModal);
    els.modalFullscreen.addEventListener('click', toggleFullscreen);
    els.modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !els.modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // Mostrar mensagem de status
  function showStatus(message, type) {
    els.statusMessage.textContent = message;
    els.statusMessage.className = 'mb-6 p-4 rounded-xl text-sm transition-colors';

    if (type === 'error') {
      els.statusMessage.classList.add('bg-red-50', 'text-red-700', 'dark:bg-red-900/30', 'dark:text-red-300');
    } else if (type === 'success') {
      els.statusMessage.classList.add('bg-green-50', 'text-green-700', 'dark:bg-green-900/30', 'dark:text-green-300');
    } else {
      els.statusMessage.classList.add('bg-globo-50', 'text-globo-800', 'dark:bg-globo-900/30', 'dark:text-globo-200');
    }

    setTimeout(() => {
      els.statusMessage.classList.add('hidden');
    }, 5000);
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Iniciar app
  init();
})();

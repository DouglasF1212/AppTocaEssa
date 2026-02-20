// Dashboard Interface - For the artist performing

let artist = null;
let requests = [];
let tips = [];
let autoRefresh = true;
let userNotifications = [];

// Send session_id cookie + header on every request (same setup as manage.js)
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function(config) {
  const sid = localStorage.getItem('session_id');
  if (sid) config.headers['X-Session-ID'] = sid;
  return config;
});

// ========================
// NOTIFICATIONS SYSTEM
// ========================
async function loadUserNotifications() {
  try {
    const res = await axios.get('/api/notifications');
    userNotifications = res.data;
    updateNotifBadge();
  } catch(e) { /* ignore */ }
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const unread = userNotifications.filter(n => !n.read_at).length;
  if (unread > 0) {
    badge.textContent = unread > 9 ? '9+' : unread;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function showNotificationsPanel() {
  const existing = document.getElementById('notifPanel');
  if (existing) { existing.remove(); return; }

  const typeIcon = { info: 'fas fa-info-circle text-blue-400', warning: 'fas fa-exclamation-triangle text-yellow-400', success: 'fas fa-check-circle text-green-400', error: 'fas fa-times-circle text-red-400' };
  const typeBg   = { info: 'border-blue-600/40', warning: 'border-yellow-600/40', success: 'border-green-600/40', error: 'border-red-600/40' };

  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.className = 'fixed top-16 right-4 w-80 max-w-[95vw] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[70vh] flex flex-col';
  panel.innerHTML = `
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
      <h3 class="font-bold text-lg"><i class="fas fa-bell mr-2 text-purple-400"></i>Notificações</h3>
      <div class="flex gap-2">
        ${userNotifications.some(n => !n.read_at) ? `
          <button onclick="markAllNotifRead()" class="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition">Marcar lidas</button>
        ` : ''}
        <button onclick="document.getElementById('notifPanel').remove()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="overflow-y-auto flex-1">
      ${userNotifications.length === 0 ? `
        <div class="text-center py-12 text-gray-400 px-4">
          <i class="fas fa-bell-slash text-4xl mb-3 block opacity-30"></i>
          <p>Nenhuma notificação</p>
        </div>
      ` : userNotifications.map(n => `
        <div class="px-5 py-4 border-b border-gray-700/50 border-l-4 ${typeBg[n.type] || typeBg.info} ${n.read_at ? 'opacity-60' : 'bg-gray-700/30'} cursor-pointer hover:bg-gray-700/50 transition"
          onclick="markNotifRead(${n.id}, this)">
          <div class="flex items-start gap-3">
            <i class="${typeIcon[n.type] || typeIcon.info} mt-0.5 flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="font-semibold text-sm truncate">${n.title}</p>
                ${!n.read_at ? '<span class="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>' : ''}
              </div>
              <p class="text-gray-300 text-xs mt-1 leading-relaxed">${n.message}</p>
              ${n.link ? `<a href="${n.link}" class="text-purple-400 hover:text-purple-300 text-xs mt-1 inline-flex items-center gap-1"><i class="fas fa-arrow-right"></i> Ver detalhes</a>` : ''}
              <p class="text-gray-500 text-xs mt-1">${new Date(n.created_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(panel);

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closePanel(e) {
      if (!panel.contains(e.target) && !document.getElementById('notifBell')?.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', closePanel);
      }
    });
  }, 100);
}

async function markNotifRead(id, el) {
  try {
    await axios.put(`/api/notifications/${id}/read`);
    const n = userNotifications.find(n => n.id === id);
    if (n) n.read_at = new Date().toISOString();
    updateNotifBadge();
    if (el) el.classList.add('opacity-60');
  } catch(e) {}
}

async function markAllNotifRead() {
  try {
    await axios.put('/api/notifications/read-all');
    userNotifications.forEach(n => n.read_at = new Date().toISOString());
    updateNotifBadge();
    const panel = document.getElementById('notifPanel');
    if (panel) { panel.remove(); showNotificationsPanel(); }
  } catch(e) {}
}

// Initialize
async function init() {
  try {
    await loadArtist();
    await loadRequests();
    await loadTips();
    renderPage();
    // Update dynamic elements that depend on the rendered DOM
    updateRequestsStatusBadge();
    // Load notifications after page render so badge DOM exists
    loadUserNotifications();
    
    // Auto-refresh every 5 seconds
    setInterval(() => {
      if (autoRefresh) {
        loadArtist();   // refresh today_requests_count
        loadRequests();
        loadTips();
      }
    }, 5000);
    // Refresh notifications every 30 seconds
    setInterval(loadUserNotifications, 30000);
  } catch (error) {
    showError('Erro ao carregar dados');
  }
}

// Load artist data
async function loadArtist() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}`);
  artist = response.data;
  updateRequestsStatusBadge();
}

// Load requests
async function loadRequests() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}/requests`);
  requests = response.data;
  updateRequestsDisplay();
}

// Load tips
async function loadTips() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}/tips`);
  tips = response.data.tips;
  updateTipsDisplay();
}

// Render the page
function renderPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-900">
      <!-- Header -->
      <div class="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold">
                <span class="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">TOCA ESSA</span>
                <span class="mx-2">•</span>
                <span>${artist.name}</span>
              </h1>
              <p class="text-sm text-gray-400">Dashboard de Gerenciamento em Tempo Real</p>
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" id="autoRefreshToggle" ${autoRefresh ? 'checked' : ''} onchange="toggleAutoRefresh()" class="mr-2">
                <span class="text-sm">Auto-atualizar</span>
              </label>
              <button onclick="showNotificationsPanel()" id="notifBell"
                class="relative bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition" title="Notificações">
                <i class="fas fa-bell text-lg"></i>
                <span id="notifBadge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
              </button>
              <button onclick="window.open('/${ARTIST_SLUG}', '_blank')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                <i class="fas fa-external-link-alt mr-2"></i>
                Ver Página Pública
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="container mx-auto px-4 py-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
            <div class="text-3xl font-bold" id="statPending">0</div>
            <div class="text-sm text-purple-200">Pedidos Pendentes</div>
          </div>
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
            <div class="text-3xl font-bold" id="statAccepted">0</div>
            <div class="text-sm text-blue-200">Aceitos</div>
          </div>
          <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
            <div class="text-3xl font-bold" id="statPlayed">0</div>
            <div class="text-sm text-green-200">Já Tocadas</div>
          </div>
          <div class="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6">
            <div class="text-3xl font-bold" id="statTips">R$ 0</div>
            <div class="text-sm text-yellow-200">Total em Gorjetas</div>
          </div>
        </div>

        <!-- Requests Status Bar -->
        <div id="requestsStatusBar" class="rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <!-- dynamically updated -->
        </div>
        
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Requests Column -->
          <div class="lg:col-span-2">
            <div class="bg-gray-800 rounded-xl p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">
                  <i class="fas fa-list mr-2"></i>
                  Pedidos de Músicas
                </h2>
                <div class="flex gap-2">
                  <button onclick="filterRequests('all')" id="filterAll" class="filter-btn active px-3 py-1 rounded text-sm">
                    Todos
                  </button>
                  <button onclick="filterRequests('pending')" id="filterPending" class="filter-btn px-3 py-1 rounded text-sm">
                    Pendentes
                  </button>
                  <button onclick="filterRequests('accepted')" id="filterAccepted" class="filter-btn px-3 py-1 rounded text-sm">
                    Aceitos
                  </button>
                </div>
              </div>
              
              <div id="requestsContainer" class="space-y-3 max-h-[600px] overflow-y-auto">
                <!-- Requests will be inserted here -->
              </div>
            </div>
          </div>
          
          <!-- Tips Column -->
          <div class="lg:col-span-1">
            <div class="bg-gray-800 rounded-xl p-6">
              <h2 class="text-xl font-bold mb-4">
                <i class="fas fa-gift mr-2"></i>
                Gorjetas Recentes
              </h2>
              
              <div id="tipsContainer" class="space-y-3 max-h-[600px] overflow-y-auto">
                <!-- Tips will be inserted here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .filter-btn {
        background: #374151;
        transition: all 0.3s;
      }
      .filter-btn:hover {
        background: #4b5563;
      }
      .filter-btn.active {
        background: #7c3aed;
      }
    </style>
  `;
}

// Update requests display
function updateRequestsDisplay() {
  const container = document.getElementById('requestsContainer');
  
  if (!container) return;
  
  // Update stats
  const pending = requests.filter(r => r.status === 'pending').length;
  const accepted = requests.filter(r => r.status === 'accepted').length;
  const played = requests.filter(r => r.status === 'played').length;
  
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statAccepted').textContent = accepted;
  document.getElementById('statPlayed').textContent = played;

  // Also update the status bar
  updateRequestsStatusBadge();
  
  if (requests.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhum pedido ainda</p>';
    return;
  }
  
  // Apply filter
  const activeFilter = document.querySelector('.filter-btn.active').id.replace('filter', '').toLowerCase();
  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);
  
  container.innerHTML = filteredRequests.map(request => {
    const statusColors = {
      pending: 'bg-yellow-600',
      accepted: 'bg-blue-600',
      played: 'bg-green-600',
      rejected: 'bg-red-600'
    };
    
    const statusLabels = {
      pending: 'Pendente',
      accepted: 'Aceito',
      played: 'Tocada',
      rejected: 'Recusado'
    };
    
    return `
      <div class="bg-gray-700 rounded-lg p-4 border-l-4 ${statusColors[request.status]} ${request.tip_amount > 0 ? 'ring-2 ring-yellow-500 bg-gradient-to-r from-yellow-900/20 to-gray-700' : ''}">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-lg">${request.song_title}</h4>
              ${request.tip_amount > 0 ? `
                <span class="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                  <i class="fas fa-star"></i>
                  R$ ${parseFloat(request.tip_amount).toFixed(2)}
                </span>
              ` : ''}
            </div>
            <p class="text-sm text-gray-300">${request.song_artist}</p>
            ${request.song_genre ? `<span class="inline-block bg-purple-600 text-xs px-2 py-1 rounded mt-1">${request.song_genre}</span>` : ''}
          </div>
          <span class="text-xs ${statusColors[request.status]} px-2 py-1 rounded font-semibold">
            ${statusLabels[request.status]}
          </span>
        </div>
        
        ${request.tip_amount > 0 ? `
          <div class="bg-yellow-900/30 border border-yellow-600 rounded p-2 mb-2 text-xs text-yellow-200">
            <i class="fas fa-gift mr-1"></i>
            <strong>Gorjeta:</strong> R$ ${parseFloat(request.tip_amount).toFixed(2)} 
            ${request.tip_message ? `- ${request.tip_message}` : ''}
          </div>
        ` : ''}
        
        <div class="text-sm text-gray-400 mb-2">
          <i class="fas fa-user mr-1"></i>
          ${request.requester_name || 'Anônimo'}
          <span class="mx-2">•</span>
          <i class="fas fa-clock mr-1"></i>
          ${formatTime(request.created_at)}
        </div>
        
        ${request.requester_message ? `
          <div class="text-sm bg-gray-800 rounded p-2 mb-3 italic">
            "${request.requester_message}"
          </div>
        ` : ''}
        
        <div class="flex gap-2">
          ${request.status === 'pending' ? `
            <button onclick="updateRequestStatus(${request.id}, 'accepted')" class="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-check mr-1"></i> Aceitar
            </button>
            <button onclick="updateRequestStatus(${request.id}, 'played')" class="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-music mr-1"></i> Já Tocamos
            </button>
            <button onclick="updateRequestStatus(${request.id}, 'rejected')" class="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-times mr-1"></i> Recusar
            </button>
          ` : ''}
          
          ${request.status === 'accepted' ? `
            <button onclick="updateRequestStatus(${request.id}, 'played')" class="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-music mr-1"></i> Já Tocamos
            </button>
          ` : ''}
          
          ${request.status === 'played' ? `
            <div class="flex-1 text-center text-green-400 text-sm font-semibold py-2">
              <i class="fas fa-check-circle mr-1"></i> Já Foi Tocada
            </div>
          ` : ''}
          
          ${request.status === 'rejected' ? `
            <div class="flex-1 text-center text-red-400 text-sm font-semibold py-2">
              <i class="fas fa-times-circle mr-1"></i> Recusado
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Update tips display
function updateTipsDisplay() {
  const container = document.getElementById('tipsContainer');
  
  if (!container) return;
  
  // Calculate total
  const total = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
  document.getElementById('statTips').textContent = `R$ ${total.toFixed(2)}`;
  
  if (tips.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhuma gorjeta ainda</p>';
    return;
  }
  
  container.innerHTML = tips.map(tip => `
    <div class="bg-gradient-to-br from-green-700 to-green-900 rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <div class="text-2xl font-bold text-green-300">
          R$ ${parseFloat(tip.amount).toFixed(2)}
        </div>
        <i class="fas fa-gift text-2xl text-green-300"></i>
      </div>
      
      <div class="text-sm text-green-200">
        <i class="fas fa-user mr-1"></i>
        ${tip.sender_name || 'Anônimo'}
      </div>
      
      ${tip.message ? `
        <div class="text-sm mt-2 bg-black/20 rounded p-2 italic">
          "${tip.message}"
        </div>
      ` : ''}
      
      <div class="text-xs text-green-300 mt-2">
        <i class="fas fa-clock mr-1"></i>
        ${formatTime(tip.created_at)}
      </div>
    </div>
  `).join('');
}

// Update request status
async function updateRequestStatus(requestId, status) {
  try {
    await axios.patch(`/api/requests/${requestId}`, { status });
    
    // Update local state
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
    }
    
    updateRequestsDisplay();
    showSuccess(`Status atualizado para: ${status}`);
  } catch (error) {
    showError('Erro ao atualizar status');
  }
}

// Filter requests
function filterRequests(filter) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
  
  updateRequestsDisplay();
}

// Toggle auto refresh
function toggleAutoRefresh() {
  autoRefresh = document.getElementById('autoRefreshToggle').checked;
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Show error message
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// Requests open/close status bar
// ============================================================
function updateRequestsStatusBadge() {
  const bar = document.getElementById('requestsStatusBar');
  if (!bar || !artist) return;

  const isOpen = artist.requests_open !== 0;
  const maxReq = artist.max_requests || 0;
  const todayCount = artist.today_requests_count || 0;
  const limitActive = maxReq > 0;
  const limitReached = limitActive && todayCount >= maxReq;
  const effectivelyClosed = !isOpen || limitReached;

  const pct = limitActive ? Math.min(100, Math.round((todayCount / maxReq) * 100)) : 0;
  const barColor = limitReached ? 'bg-red-500' : pct > 75 ? 'bg-yellow-500' : 'bg-green-500';

  bar.className = `rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${effectivelyClosed ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`;

  bar.innerHTML = `
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <span class="text-2xl">${effectivelyClosed ? '🔴' : '🟢'}</span>
      <div class="flex-1 min-w-0">
        <div class="font-bold ${effectivelyClosed ? 'text-red-300' : 'text-green-300'}">
          ${!isOpen ? 'Pedidos Fechados' : limitReached ? 'Limite Atingido!' : 'Aceitando Pedidos'}
        </div>
        <div class="text-sm text-gray-400">
          ${limitActive
            ? `${todayCount} de ${maxReq} pedidos usados hoje`
            : 'Sem limite definido'}
        </div>
        ${limitActive ? `
          <div class="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div class="h-2 rounded-full transition-all ${barColor}" style="width:${pct}%"></div>
          </div>
        ` : ''}
      </div>
    </div>
    <div class="flex gap-2 flex-shrink-0">
      <button
        onclick="toggleRequestsOpenDashboard()"
        class="${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-4 py-2 rounded-lg font-bold text-sm transition text-white"
      >
        ${isOpen ? '🔴 Fechar Pedidos' : '🟢 Abrir Pedidos'}
      </button>
      <a
        href="/manage#show"
        class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-semibold transition text-white"
      >
        <i class="fas fa-cog mr-1"></i> Configurar
      </a>
    </div>
  `;
}

async function toggleRequestsOpenDashboard() {
  if (!artist) return;
  const newState = artist.requests_open ? 0 : 1;
  try {
    await axios.put(`/api/artists/${ARTIST_SLUG}/show-settings`, {
      max_requests: artist.max_requests || 0,
      requests_open: newState
    });
    artist.requests_open = newState;
    updateRequestsStatusBadge();
    showSuccess(newState ? '🟢 Pedidos abertos!' : '🔴 Pedidos fechados!');
  } catch (e) {
    showError('Erro ao atualizar configurações');
  }
}

// Note: init() is called from the HTML page via <script>init()</script>

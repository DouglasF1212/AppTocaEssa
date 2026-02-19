// Dashboard Interface - For the artist performing

let artist = null;
let requests = [];
let tips = [];
let autoRefresh = true;

// Initialize
async function init() {
  try {
    await loadArtist();
    await loadRequests();
    await loadTips();
    renderPage();
    
    // Auto-refresh every 5 seconds
    setInterval(() => {
      if (autoRefresh) {
        loadRequests();
        loadTips();
      }
    }, 5000);
  } catch (error) {
    showError('Erro ao carregar dados');
  }
}

// Load artist data
async function loadArtist() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}`);
  artist = response.data;
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
        <div class="grid md:grid-cols-4 gap-4 mb-6">
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
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initialize on page load
init();

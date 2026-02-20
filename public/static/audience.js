// Audience Interface - For people watching the show

let artist = null;
let songs = [];
let selectedSong = null;
let myRequests = []; // Track user's requests
let statusCheckInterval = null;

// Initialize
async function init() {
  try {
    await loadArtist();

    // If already blocked on load, show blocked page immediately — don't load songs
    if (isRequestsBlocked()) {
      renderBlockedPage();
    } else {
      await loadSongs();
      renderPage();
      // Load user's requests from localStorage
      loadMyRequests();
      // Render "my requests" section immediately
      renderMyRequestsSection();
    }

    // Poll artist status every 10 seconds — re-render immediately if blocked
    setInterval(async () => {
      const wasBlocked = !document.getElementById('requestModal');
      await loadArtist();
      if (isRequestsBlocked()) {
        renderBlockedPage();
        return;
      }
      // If we were on the blocked page and it just reopened, show normal page
      if (wasBlocked) {
        await loadSongs();
        renderPage();
        loadMyRequests();
        renderMyRequestsSection();
        return;
      }
      // Normal refresh: update songs in background
      await loadSongs();
    }, 10000);

    // Check for request status updates every 8 seconds
    statusCheckInterval = setInterval(checkRequestStatusUpdates, 8000);

    // First check right away (after 2s to let page settle)
    setTimeout(checkRequestStatusUpdates, 2000);
  } catch (error) {
    showError('Erro ao carregar dados');
  }
}

// Load user's requests from localStorage
function loadMyRequests() {
  const stored = localStorage.getItem(`my_requests_${ARTIST_SLUG}`);
  if (stored) {
    try {
      myRequests = JSON.parse(stored);
    } catch (e) {
      myRequests = [];
    }
  }
  // Remove requests older than 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  myRequests = myRequests.filter(r => new Date(r.created_at).getTime() > oneDayAgo);
  saveMyRequests();
}

// Save user's requests to localStorage
function saveMyRequests() {
  localStorage.setItem(`my_requests_${ARTIST_SLUG}`, JSON.stringify(myRequests));
}

// Check for status updates on user's requests (individual polling)
async function checkRequestStatusUpdates() {
  const active = myRequests.filter(r => r.status === 'pending' || r.status === 'accepted');
  if (active.length === 0) return;

  for (const myRequest of active) {
    try {
      const response = await axios.get(`/api/requests/${myRequest.id}`);
      const serverRequest = response.data;

      if (serverRequest && serverRequest.status !== myRequest.status) {
        const oldStatus = myRequest.status;
        myRequest.status = serverRequest.status;
        myRequest.updated_at = serverRequest.updated_at;

        // Show status change notification modal
        showStatusChangeModal(myRequest, oldStatus);
      }
    } catch (e) {
      // Silently ignore network errors
    }
  }

  saveMyRequests();
  renderMyRequestsSection();
}

// =========================================
// STATUS CHANGE MODAL — full screen overlay
// =========================================
function showStatusChangeModal(request, oldStatus) {
  // Remove any existing modal
  const existing = document.getElementById('statusModal');
  if (existing) existing.remove();

  const configs = {
    accepted: {
      icon: '✅',
      title: 'Pedido Aceito!',
      message: `O artista aceitou seu pedido de <strong>"${request.song_title}"</strong>!<br><span class="text-blue-200">Em breve ela será tocada. Fique ligado! 🎸</span>`,
      bg: 'from-blue-600 to-blue-800',
      border: 'border-blue-400',
      btn: 'bg-blue-500 hover:bg-blue-400',
      sound: true
    },
    played: {
      icon: '🎵',
      title: 'Música Tocada!',
      message: `<strong>"${request.song_title}"</strong> já foi tocada!<br><span class="text-green-200">Quer pedir outra música? 🎶</span>`,
      bg: 'from-green-600 to-green-800',
      border: 'border-green-400',
      btn: 'bg-green-500 hover:bg-green-400',
      sound: true,
      showNewRequest: true
    },
    rejected: {
      icon: '😔',
      title: 'Pedido Recusado',
      message: `O artista não vai tocar <strong>"${request.song_title}"</strong> agora.<br><span class="text-red-200">Que tal pedir outra música? 🎵</span>`,
      bg: 'from-red-700 to-red-900',
      border: 'border-red-400',
      btn: 'bg-red-500 hover:bg-red-400',
      sound: false,
      showNewRequest: true
    }
  };

  const cfg = configs[request.status];
  if (!cfg) return;

  // Play notification sound
  if (cfg.sound) playNotificationSound();

  const modal = document.createElement('div');
  modal.id = 'statusModal';
  modal.className = 'fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in';
  modal.innerHTML = `
    <div class="bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border} rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-bounce-in">
      <!-- Big icon -->
      <div class="text-7xl mb-4 animate-pop">${cfg.icon}</div>

      <!-- Title -->
      <h2 class="text-3xl font-black mb-3 text-white">${cfg.title}</h2>

      <!-- Message -->
      <p class="text-lg text-white/90 mb-6 leading-relaxed">${cfg.message}</p>

      <!-- Song info box -->
      <div class="bg-black/30 rounded-2xl px-5 py-3 mb-6 text-left">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🎸</span>
          <div>
            <div class="font-bold text-white text-base">${request.song_title}</div>
            <div class="text-white/70 text-sm">${request.song_artist || ''}</div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col gap-3">
        ${cfg.showNewRequest ? `
          <button
            onclick="closeStatusModal(); showRequestModal();"
            class="${cfg.btn} text-white font-bold px-6 py-3 rounded-xl text-lg transition shadow-lg"
          >
            <i class="fas fa-guitar mr-2"></i>
            Pedir Outra Música
          </button>
        ` : ''}
        <button
          onclick="closeStatusModal()"
          class="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          OK, entendi!
        </button>
      </div>
    </div>

    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes bounceIn {
        0%   { transform: scale(0.5); opacity: 0; }
        60%  { transform: scale(1.08); opacity: 1; }
        80%  { transform: scale(0.96); }
        100% { transform: scale(1); }
      }
      @keyframes pop {
        0%   { transform: scale(0); }
        70%  { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .animate-fade-in  { animation: fadeIn 0.25s ease; }
      .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(.36,.07,.19,.97); }
      .animate-pop { display: inline-block; animation: pop 0.5s 0.2s both; }
    </style>
  `;

  document.body.appendChild(modal);

  // Auto-close after 12 seconds (except for 'played' + new request prompt)
  if (!cfg.showNewRequest) {
    setTimeout(closeStatusModal, 12000);
  }
}

function closeStatusModal() {
  const modal = document.getElementById('statusModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s';
    setTimeout(() => modal.remove(), 300);
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784]; // C5, E5, G5 — cheerful chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  } catch (e) {}
}

// =========================================
// MY REQUESTS SECTION
// =========================================
function renderMyRequestsSection() {
  const container = document.getElementById('myRequestsSection');
  if (!container) return;

  if (myRequests.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  const statusConfig = {
    pending: {
      label: 'Aguardando',
      icon: '⏳',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      text: 'text-yellow-300',
      badge: 'bg-yellow-600'
    },
    accepted: {
      label: 'Aceito! Em breve será tocada',
      icon: '✅',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500',
      text: 'text-blue-300',
      badge: 'bg-blue-600'
    },
    played: {
      label: 'Tocada! 🎵',
      icon: '🎵',
      bg: 'bg-green-500/20',
      border: 'border-green-500',
      text: 'text-green-300',
      badge: 'bg-green-600'
    },
    rejected: {
      label: 'Recusado',
      icon: '❌',
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      text: 'text-red-300',
      badge: 'bg-red-600'
    }
  };

  const items = [...myRequests].reverse().map(req => {
    const cfg = statusConfig[req.status] || statusConfig.pending;
    return `
      <div class="flex items-center gap-3 ${cfg.bg} border ${cfg.border} rounded-xl px-4 py-3">
        <span class="text-2xl">${cfg.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white truncate">${req.song_title}</div>
          <div class="${cfg.text} text-sm font-semibold">${cfg.label}</div>
        </div>
        ${req.status === 'played' || req.status === 'rejected' ? `
          <button
            onclick="showRequestModal()"
            class="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <i class="fas fa-guitar mr-1"></i>Pedir outra
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-lg font-bold text-white">
        <i class="fas fa-receipt mr-2 text-purple-400"></i>
        Meus Pedidos
      </h3>
      <button onclick="clearMyRequests()" class="text-xs text-gray-400 hover:text-gray-300 transition">
        <i class="fas fa-trash mr-1"></i>Limpar
      </button>
    </div>
    <div class="space-y-2">${items}</div>
  `;
  container.classList.remove('hidden');
}

function clearMyRequests() {
  if (!confirm('Limpar histórico de pedidos?')) return;
  myRequests = [];
  saveMyRequests();
  renderMyRequestsSection();
}

// Load artist data
async function loadArtist() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}`);
  artist = response.data;
}

// Check if requests are blocked (closed or limit reached)
function isRequestsBlocked() {
  if (!artist) return false;
  // requests_open: 1 = open, 0 = closed, null/undefined = treat as open (columns may not exist on old DB)
  // Use != 1 to catch both 0 and any falsy value that isn't the explicit "open" state
  const isOpen = artist.requests_open == null ? true : artist.requests_open == 1;
  if (!isOpen) return true;
  // Limit reached
  if (artist.max_requests > 0 && artist.today_requests_count >= artist.max_requests) return true;
  return false;
}

// Get block reason message
function getBlockMessage() {
  if (!artist) return null;
  const isOpen = artist.requests_open == null ? true : artist.requests_open == 1;
  if (!isOpen) {
    return {
      icon: '🎤',
      title: 'Pedidos Encerrados',
      subtitle: 'O artista encerrou os pedidos de música por hoje.',
      detail: 'Obrigado por participar! Até a próxima! 🎶'
    };
  }
  if (artist.max_requests > 0 && artist.today_requests_count >= artist.max_requests) {
    return {
      icon: '🎵',
      title: 'Limite de Pedidos Atingido',
      subtitle: `${artist.name} já recebeu ${artist.max_requests} pedidos hoje — limite máximo do show!`,
      detail: 'Não é possível enviar mais pedidos hoje. Obrigado por participar! 🙏'
    };
  }
  return null;
}

// Load songs
async function loadSongs() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}/songs`);
  songs = response.data;
  if (songs.length > 0 && selectedSong) {
    const songCards = document.querySelectorAll('.song-card');
    songCards.forEach(card => {
      const songId = parseInt(card.dataset.songId);
      if (songId === selectedSong.id) {
        card.classList.add('ring-4', 'ring-yellow-400');
      } else {
        card.classList.remove('ring-4', 'ring-yellow-400');
      }
    });
  }
}

// Render the page
function renderPage() {
  // If requests are blocked, show special full-screen message
  if (isRequestsBlocked()) {
    renderBlockedPage();
    return;
  }
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <h1 class="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            TOCA ESSA
          </h1>
        </div>
        <div class="flex flex-col items-center justify-center mb-4">
          ${artist.photo_url ? `
            <img
              src="${artist.photo_url}"
              alt="${artist.name}"
              class="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-xl mb-4"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center hidden mb-4" style="display: none;">
              <i class="fas fa-user text-5xl"></i>
            </div>
          ` : `
            <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-user text-5xl"></i>
            </div>
          `}
          <h2 class="text-3xl font-bold">${artist.name}</h2>
        </div>
        <p class="text-gray-300">${artist.bio || 'Show ao vivo'}</p>
      </div>

      <!-- Action Button -->
      <div class="grid md:grid-cols-1 gap-4 mb-6">
        <button onclick="showRequestModal()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg">
          <i class="fas fa-guitar mr-2"></i>
          Pedir Música
        </button>
      </div>

      <!-- My Requests Section (shown after first request) -->
      <div id="myRequestsSection" class="hidden bg-white/10 backdrop-blur-lg rounded-2xl p-5 mb-6"></div>

      <!-- Repertoire -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-list-music mr-2"></i>
          Repertório (${songs.length} músicas)
        </h2>

        <div class="mb-4">
          <input
            type="text"
            id="searchInput"
            placeholder="Buscar música..."
            class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-300"
            oninput="filterSongs()"
          >
        </div>

        <div id="songsContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          ${renderSongs()}
        </div>
      </div>

      <!-- Request Modal -->
      <div id="requestModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h3 class="text-2xl font-bold mb-4">Pedir Música</h3>
          <div id="requestContent"></div>
        </div>
      </div>
    </div>
  `;
}

// Render songs list
function renderSongs() {
  if (songs.length === 0) {
    return '<p class="col-span-full text-center text-gray-400 py-8">Nenhuma música no repertório</p>';
  }

  return songs.map(song => `
    <div class="song-card bg-white/10 hover:bg-white/20 rounded-lg p-4 cursor-pointer transition border-2 border-transparent hover:border-purple-500"
         data-song-id="${song.id}"
         onclick="selectSong(${song.id})">
      <h4 class="font-bold text-lg mb-1">${song.title}</h4>
      <p class="text-sm text-gray-300">${song.artist_name}</p>
      ${song.genre ? `<span class="inline-block bg-purple-600 text-xs px-2 py-1 rounded mt-2">${song.genre}</span>` : ''}
    </div>
  `).join('');
}

// Filter songs by search
function filterSongs() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const songCards = document.querySelectorAll('.song-card');
  songCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(search) ? 'block' : 'none';
  });
}

// Select a song
async function selectSong(songId) {
  // Check if requests are still open before allowing selection
  await loadArtist();
  if (isRequestsBlocked()) {
    renderBlockedPage();
    return;
  }

  selectedSong = songs.find(s => s.id === songId);

  const songCards = document.querySelectorAll('.song-card');
  songCards.forEach(card => {
    const cardSongId = parseInt(card.dataset.songId);
    if (cardSongId === songId) {
      card.classList.add('ring-4', 'ring-yellow-400');
    } else {
      card.classList.remove('ring-4', 'ring-yellow-400');
    }
  });

  const modal = document.getElementById('requestModal');
  if (!modal.classList.contains('hidden')) {
    showRequestModal();
  }
}

// Render full page when requests are blocked — shows tip-only form
function renderBlockedPage() {
  const app = document.getElementById('app');
  const msg = getBlockMessage();
  if (!msg) { renderPage(); return; }

  app.innerHTML = `
    <div class="min-h-screen bg-gray-900 text-white">
      <!-- TOCA ESSA header -->
      <div class="text-center pt-8 pb-4 px-4">
        <h1 class="text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
          TOCA ESSA
        </h1>
      </div>

      <div class="container mx-auto px-4 pb-12 max-w-md">

        <!-- Artist identity -->
        <div class="flex flex-col items-center text-center mb-6">
          ${artist.photo_url ? `
            <img src="${artist.photo_url}" alt="${artist.name}"
              class="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-xl mb-4"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mb-4" style="display:none;">
              <i class="fas fa-user text-5xl"></i>
            </div>
          ` : `
            <div class="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-user text-5xl"></i>
            </div>
          `}
          <h2 class="text-2xl font-bold">${artist.name}</h2>
          ${artist.bio ? `<p class="text-gray-400 text-sm mt-1">${artist.bio}</p>` : ''}
        </div>

        <!-- Status notice banner -->
        <div class="bg-gray-800 border border-gray-600 rounded-2xl p-5 mb-6 text-center">
          <div class="text-5xl mb-3">${msg.icon}</div>
          <h3 class="text-xl font-black text-white mb-2">${artist.name} não está aceitando pedidos no momento</h3>
          <p class="text-gray-400 text-sm leading-relaxed">${msg.subtitle}</p>
        </div>

        <!-- Tip invitation -->
        <div class="bg-gradient-to-br from-yellow-900/40 to-orange-900/30 border border-yellow-600/60 rounded-2xl p-5 mb-6 text-center">
          <div class="text-3xl mb-2">💛</div>
          <p class="text-yellow-200 font-semibold text-base">
            Fique à vontade para deixar uma gorjeta mesmo assim!
          </p>
          <p class="text-yellow-300/70 text-xs mt-1">Seu apoio faz a diferença para o artista 🎶</p>
        </div>

        <!-- Tip Form -->
        <div class="bg-gray-800 rounded-2xl p-6" id="tipFormSection">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <i class="fas fa-hand-holding-heart text-yellow-400"></i>
            Enviar Gorjeta para ${artist.name}
          </h3>

          <form id="tipOnlyForm" onsubmit="submitTipOnly(event)" class="space-y-4">
            <!-- Amount presets -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Escolha um valor</label>
              <div class="grid grid-cols-4 gap-2 mb-3">
                <button type="button" onclick="setBlockedTip(5)"  class="tip-preset bg-gray-700 hover:bg-yellow-600 px-3 py-3 rounded-xl font-bold transition text-sm">R$ 5</button>
                <button type="button" onclick="setBlockedTip(10)" class="tip-preset bg-gray-700 hover:bg-yellow-600 px-3 py-3 rounded-xl font-bold transition text-sm">R$ 10</button>
                <button type="button" onclick="setBlockedTip(20)" class="tip-preset bg-gray-700 hover:bg-yellow-600 px-3 py-3 rounded-xl font-bold transition text-sm">R$ 20</button>
                <button type="button" onclick="setBlockedTip(50)" class="tip-preset bg-gray-700 hover:bg-yellow-600 px-3 py-3 rounded-xl font-bold transition text-sm">R$ 50</button>
              </div>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">R$</span>
                <input
                  type="number"
                  id="blockedTipAmount"
                  class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-lg font-bold"
                  placeholder="Ou digite o valor"
                  min="1"
                  step="1"
                >
              </div>
            </div>

            <!-- Sender name -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Seu nome (opcional)</label>
              <input
                type="text"
                id="blockedTipName"
                class="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                placeholder="Anônimo"
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Mensagem (opcional)</label>
              <textarea
                id="blockedTipMessage"
                class="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white resize-none"
                rows="2"
                placeholder="Deixe um recado para o artista..."
              ></textarea>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 py-4 rounded-xl font-black text-lg transition shadow-lg text-gray-900"
            >
              <i class="fas fa-heart mr-2"></i>
              Enviar Gorjeta via PIX
            </button>
          </form>
        </div>

        <!-- Success tip state (hidden by default) -->
        <div id="tipSuccessSection" class="hidden bg-gray-800 rounded-2xl p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-2xl font-black text-white mb-2">Gorjeta enviada!</h3>
          <p class="text-gray-400 mb-6">Obrigado pelo seu apoio a <strong>${artist.name}</strong>!</p>
          <button onclick="resetTipForm()" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold transition">
            <i class="fas fa-redo mr-2"></i>Enviar outra gorjeta
          </button>
        </div>

      </div>
    </div>

    <!-- PIX payment overlay (injected dynamically) -->
    <div id="pixOverlay" class="hidden fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center">
        <div id="pixOverlayContent"></div>
      </div>
    </div>
  `;
}

// Set tip amount on blocked page preset buttons
function setBlockedTip(amount) {
  const input = document.getElementById('blockedTipAmount');
  if (input) {
    input.value = amount;
    // Highlight selected button
    document.querySelectorAll('.tip-preset').forEach(btn => {
      btn.classList.remove('bg-yellow-600');
      btn.classList.add('bg-gray-700');
    });
    event.target.classList.remove('bg-gray-700');
    event.target.classList.add('bg-yellow-600');
  }
}

// Submit standalone tip (on blocked page)
async function submitTipOnly(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('blockedTipAmount').value);
  const name   = document.getElementById('blockedTipName').value.trim() || 'Anônimo';
  const msg    = document.getElementById('blockedTipMessage').value.trim();

  if (!amount || amount < 1) {
    showBlockedError('Por favor, informe um valor para a gorjeta.');
    return;
  }

  const btn = event.target.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';

  try {
    const response = await axios.post(\`/api/artists/\${ARTIST_SLUG}/tips\`, {
      amount,
      sender_name: name,
      message: msg || \`Gorjeta para \${artist.name}\`,
      payment_method: 'pix'
    });

    const pixData = response.data.pix_data;
    const tipId   = response.data.id;

    if (!pixData || !pixData.key) {
      showBlockedError('Artista ainda não configurou dados bancários para receber gorjetas.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-heart mr-2"></i>Enviar Gorjeta via PIX';
      return;
    }

    // Redirect to payment page just like normal flow
    window.location.href = response.data.payment_url;

  } catch (e) {
    const errMsg = e.response?.data?.error || 'Erro ao processar gorjeta. Tente novamente.';
    showBlockedError(errMsg);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-heart mr-2"></i>Enviar Gorjeta via PIX';
  }
}

// Reset tip form to initial state
function resetTipForm() {
  document.getElementById('tipSuccessSection').classList.add('hidden');
  document.getElementById('tipFormSection').classList.remove('hidden');
  const form = document.getElementById('tipOnlyForm');
  if (form) form.reset();
}

// Show error on blocked page
function showBlockedError(message) {
  const existing = document.getElementById('blockedErrorMsg');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'blockedErrorMsg';
  el.className = 'bg-red-900/60 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-sm mt-3';
  el.innerHTML = \`<i class="fas fa-exclamation-circle mr-2"></i>\${message}\`;

  const form = document.getElementById('tipOnlyForm');
  if (form) form.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// Show request modal
async function showRequestModal() {
  // Always re-check artist status before opening the modal
  await loadArtist();
  if (isRequestsBlocked()) {
    renderBlockedPage();
    return;
  }

  const modal = document.getElementById('requestModal');
  const content = document.getElementById('requestContent');

  if (!selectedSong) {
    content.innerHTML = `
      <p class="text-gray-300 mb-4">Selecione uma música do repertório primeiro!</p>
      <button onclick="closeModal('requestModal')" class="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition">
        Fechar
      </button>
    `;
  } else {
    content.innerHTML = `
      <div class="mb-4 p-4 bg-purple-600/30 rounded-lg">
        <p class="font-bold">${selectedSong.title}</p>
        <p class="text-sm text-gray-300">${selectedSong.artist_name}</p>
      </div>

      <form id="requestForm" onsubmit="submitRequest(event)">
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Seu nome (opcional)</label>
          <input
            type="text"
            id="requesterName"
            class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            placeholder="Anônimo"
          >
        </div>

        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Mensagem (opcional)</label>
          <textarea
            id="requesterMessage"
            class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            rows="2"
            placeholder="Deixe uma mensagem..."
          ></textarea>
        </div>

        <!-- Tip Section -->
        <div class="mb-4 border-t border-gray-600 pt-4">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-semibold">Enviar Gorjeta (opcional)</label>
            <div class="bg-yellow-600/20 border border-yellow-500 px-3 py-1 rounded-full">
              <i class="fas fa-star text-yellow-400 text-xs mr-1"></i>
              <span class="text-xs text-yellow-300 font-semibold">Vai para o topo da fila!</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2 mb-3">
            <button type="button" onclick="setTipAmount(5)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">R$ 5</button>
            <button type="button" onclick="setTipAmount(10)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">R$ 10</button>
            <button type="button" onclick="setTipAmount(20)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">R$ 20</button>
            <button type="button" onclick="setTipAmount(50)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">R$ 50</button>
          </div>

          <div class="flex gap-2">
            <div class="flex-1">
              <input
                type="number"
                id="tipAmount"
                class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                placeholder="Ou digite o valor"
                min="0"
                step="0.01"
              >
            </div>
            <button type="button" onclick="clearTip()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <p class="text-xs text-gray-400 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            Pedidos com gorjeta aparecem primeiro na fila do artista
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button type="button" onclick="closeModal('requestModal')" class="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition">
            Cancelar
          </button>
          <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-paper-plane mr-2"></i>
            Enviar
          </button>
        </div>
      </form>
    `;
  }

  modal.classList.remove('hidden');
}

// Set tip amount
function setTipAmount(amount) {
  document.getElementById('tipAmount').value = amount;
}

// Clear tip
function clearTip() {
  document.getElementById('tipAmount').value = '';
}

// Submit request
async function submitRequest(event) {
  event.preventDefault();

  const name = document.getElementById('requesterName').value;
  const message = document.getElementById('requesterMessage').value;
  const tipAmount = parseFloat(document.getElementById('tipAmount').value) || 0;

  try {
    // If there's a tip, redirect to payment page
    if (tipAmount > 0) {
      closeModal('requestModal');
      showSuccess('Processando pedido com gorjeta...');

      const tipResponse = await axios.post(`/api/artists/${ARTIST_SLUG}/tips`, {
        amount: tipAmount,
        sender_name: name || 'Anônimo',
        message: `Gorjeta de R$ ${tipAmount.toFixed(2)} junto com pedido: ${selectedSong.title}`,
        payment_method: 'pix'
      });

      const pixInfo = tipResponse.data.pix_data;
      if (!pixInfo || !pixInfo.key) {
        showError('Artista ainda não configurou dados bancários');
        return;
      }

      localStorage.setItem('pending_song_id', selectedSong.id);
      localStorage.setItem('pending_song_title', selectedSong.title);
      localStorage.setItem('pending_requester_name', name || 'Anônimo');
      localStorage.setItem('pending_requester_message', message || '');

      window.location.href = tipResponse.data.payment_url;
      return;
    }

    // No tip — create request directly
    const response = await axios.post(`/api/artists/${ARTIST_SLUG}/requests`, {
      song_id: selectedSong.id,
      requester_name: name || 'Anônimo',
      requester_message: message,
      tip_amount: 0,
      tip_message: null
    });

    // Save request to track status updates
    myRequests.push({
      id: response.data.id,
      song_title: selectedSong.title,
      song_artist: selectedSong.artist_name,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    saveMyRequests();
    renderMyRequestsSection();

    showSuccess('✅ Pedido realizado! Você será notificado quando o artista responder.');

    closeModal('requestModal');
    selectedSong = null;

    document.querySelectorAll('.song-card').forEach(card => {
      card.classList.remove('ring-4', 'ring-yellow-400');
    });
  } catch (error) {
    const errData = error.response?.data;
    // If server says limit reached or closed, reload artist and show blocked page
    if (errData?.limit_reached || errData?.closed) {
      closeModal('requestModal');
      // Reload artist data to get updated counts
      await loadArtist();
      renderBlockedPage();
    } else {
      showError(errData?.error || 'Erro ao enviar pedido');
    }
  }
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce';
  toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Show error message
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize on page load
init();

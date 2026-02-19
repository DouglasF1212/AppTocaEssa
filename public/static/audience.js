// Audience Interface - For people watching the show

let artist = null;
let songs = [];
let selectedSong = null;
let myRequests = []; // Track user's requests

// Initialize
async function init() {
  try {
    await loadArtist();
    await loadSongs();
    renderPage();
    
    // Load user's requests from localStorage
    loadMyRequests();
    
    // Poll for updates every 30 seconds
    setInterval(loadSongs, 30000);
    
    // Check for request status updates every 10 seconds
    setInterval(checkRequestStatusUpdates, 10000);
  } catch (error) {
    showError('Erro ao carregar dados');
  }
}

// Load user's requests from localStorage
function loadMyRequests() {
  const stored = localStorage.getItem(`my_requests_${ARTIST_SLUG}`);
  if (stored) {
    myRequests = JSON.parse(stored);
  }
}

// Save user's requests to localStorage
function saveMyRequests() {
  localStorage.setItem(`my_requests_${ARTIST_SLUG}`, JSON.stringify(myRequests));
}

// Check for status updates on user's requests
async function checkRequestStatusUpdates() {
  if (myRequests.length === 0) return;
  
  try {
    // Get current requests from server
    const response = await axios.get(`/api/artists/${ARTIST_SLUG}/requests`);
    const serverRequests = response.data;
    
    // Check each of user's requests for status changes
    myRequests.forEach(myRequest => {
      const serverRequest = serverRequests.find(r => r.id === myRequest.id);
      
      if (serverRequest && serverRequest.status !== myRequest.status) {
        // Status changed! Show notification
        showRequestStatusNotification(serverRequest);
        
        // Update local status
        myRequest.status = serverRequest.status;
      }
    });
    
    // Remove old requests (older than 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    myRequests = myRequests.filter(r => new Date(r.created_at).getTime() > oneDayAgo);
    
    saveMyRequests();
  } catch (error) {
    console.log('Error checking request updates:', error);
  }
}

// Show notification when request status changes
function showRequestStatusNotification(request) {
  let message = '';
  let icon = '';
  let color = '';
  
  switch (request.status) {
    case 'accepted':
      message = `✅ Seu pedido "${request.song_title}" foi ACEITO!`;
      icon = 'fa-check-circle';
      color = 'bg-blue-600';
      break;
    case 'played':
      message = `🎵 Sua música "${request.song_title}" JÁ FOI TOCADA!`;
      icon = 'fa-music';
      color = 'bg-green-600';
      break;
    case 'rejected':
      message = `❌ Seu pedido "${request.song_title}" foi RECUSADO.`;
      icon = 'fa-times-circle';
      color = 'bg-red-600';
      break;
    default:
      return;
  }
  
  // Show custom notification
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${color} text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md animate-slide-in`;
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas ${icon} text-2xl"></i>
      <div>
        <div class="font-bold">${message}</div>
        <div class="text-sm opacity-90">Artista: ${artist.name}</div>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Play notification sound (optional)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuJzvDejkMKFF++7+qnVRQJRp/j8r5sIQUricy8');
    audio.volume = 0.3;
    audio.play();
  } catch (e) {}
  
  setTimeout(() => {
    notification.remove();
  }, 8000);
}


// Load artist data
async function loadArtist() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}`);
  artist = response.data;
}

// Load songs
async function loadSongs() {
  const response = await axios.get(`/api/artists/${ARTIST_SLUG}/songs`);
  songs = response.data;
  if (songs.length > 0 && selectedSong) {
    // Refresh selected song if page is already rendered
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
      
      <!-- Action Buttons -->
      <div class="grid md:grid-cols-1 gap-4 mb-8">
        <button onclick="showRequestModal()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg">
          <i class="fas fa-guitar mr-2"></i>
          Pedir Música
        </button>
      </div>
      
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
      
      <!-- Modals -->
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
function selectSong(songId) {
  selectedSong = songs.find(s => s.id === songId);
  
  // Update visual selection
  const songCards = document.querySelectorAll('.song-card');
  songCards.forEach(card => {
    const cardSongId = parseInt(card.dataset.songId);
    if (cardSongId === songId) {
      card.classList.add('ring-4', 'ring-yellow-400');
    } else {
      card.classList.remove('ring-4', 'ring-yellow-400');
    }
  });
  
  // If request modal is open, update it
  const modal = document.getElementById('requestModal');
  if (!modal.classList.contains('hidden')) {
    showRequestModal();
  }
}

// Show request modal
function showRequestModal() {
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
            <button type="button" onclick="setTipAmount(5)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">
              R$ 5
            </button>
            <button type="button" onclick="setTipAmount(10)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">
              R$ 10
            </button>
            <button type="button" onclick="setTipAmount(20)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">
              R$ 20
            </button>
            <button type="button" onclick="setTipAmount(50)" class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg font-semibold transition text-sm">
              R$ 50
            </button>
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
      // Close modal first
      closeModal('requestModal');
      
      // Show loading message
      showSuccess('Processando pedido com gorjeta...');
      
      // Create tip
      const tipResponse = await axios.post(`/api/artists/${ARTIST_SLUG}/tips`, {
        amount: tipAmount,
        sender_name: name || 'Anônimo',
        message: `Gorjeta de R$ ${tipAmount.toFixed(2)} junto com pedido: ${selectedSong.title}`,
        payment_method: 'pix'
      });
      
      // Get PIX data
      const pixInfo = tipResponse.data.pix_data;
      
      if (!pixInfo || !pixInfo.key) {
        showError('Artista ainda não configurou dados bancários');
        return;
      }
      
      // Store song info for creating request after payment
      localStorage.setItem('pending_song_id', selectedSong.id);
      localStorage.setItem('pending_song_title', selectedSong.title);
      localStorage.setItem('pending_requester_name', name || 'Anônimo');
      localStorage.setItem('pending_requester_message', message || '');
      
      // Redirect to payment page
      window.location.href = tipResponse.data.payment_url;
      return;
    }
    
    // If no tip, just create the request normally
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
      status: 'pending',
      created_at: new Date().toISOString()
    });
    saveMyRequests();
    
    showSuccess('✅ Pedido realizado com sucesso!');
    
    closeModal('requestModal');
    selectedSong = null;
    
    // Remove selection visual
    document.querySelectorAll('.song-card').forEach(card => {
      card.classList.remove('ring-4', 'ring-yellow-400');
    });
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao enviar pedido');
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
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
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

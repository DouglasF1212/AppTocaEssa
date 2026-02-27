// Artist Management Page - Repertoire & Bank Account

let user = null;
let artist = null;
let songs = [];
let bankAccount = null;
let currentTab = 'profile';
let showSettings = { requests_open: 1, max_requests: 0 };
let userNotifications = [];

// Configure axios: send cookies + interceptor that reads session_id fresh on every request
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
    await checkAuthentication();
    await loadData();
    renderPage();
    loadUserNotifications();
    // Refresh notifications every 30 seconds
    setInterval(loadUserNotifications, 30000);
  } catch (error) {
    console.error('Init error:', error);
    // Só redireciona para login em erro de autenticação (401), não em erros de rede
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    } else if (!error.response) {
      // Erro de rede — tenta recarregar
      setTimeout(() => window.location.reload(), 2000);
    } else {
      window.location.href = '/login';
    }
  }
}

// Check authentication
async function checkAuthentication() {
  const response = await axios.get('/api/auth/me');
  user = response.data.user;
  artist = response.data.artist;
  
  // Admin não precisa de licença aprovada
  if (user.role === 'admin') return;

  // Artista sem licença aprovada vai para pagamento
  if (user.license_status !== 'approved') {
    window.location.href = '/license-payment';
    return;
  }
  
  if (!artist) {
    throw { response: { status: 401 } };
  }
}

// Load all data
async function loadData() {
  await Promise.all([
    loadSongs(),
    loadBankAccount(),
    loadShowSettings()
  ]);
}

// Load show settings (requests_open, max_requests)
async function loadShowSettings() {
  try {
    const response = await axios.get(`/api/artists/${artist.slug}`);
    showSettings = {
      requests_open: response.data.requests_open ?? 1,
      max_requests: response.data.max_requests ?? 0
    };
    // keep artist object in sync
    artist.requests_open = showSettings.requests_open;
    artist.max_requests = showSettings.max_requests;
    artist.today_requests_count = response.data.today_requests_count ?? 0;
  } catch (error) {
    showSettings = { requests_open: 1, max_requests: 0 };
  }
}

// Load songs
async function loadSongs() {
  const response = await axios.get(`/api/artists/${artist.slug}/songs`);
  songs = response.data;
}

// Load bank account
async function loadBankAccount() {
  try {
    const response = await axios.get(`/api/artists/${artist.slug}/bank-account`);
    bankAccount = response.data;
  } catch (error) {
    bankAccount = null;
  }
}

// Render page
function renderPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-900">
      <!-- Header -->
      <div class="bg-gray-800 border-b border-gray-700">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold">
                <span class="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  TOCA ESSA
                </span>
              </h1>
              <p class="text-sm text-gray-400">Olá, ${user.full_name}</p>
            </div>
            <div class="flex items-center gap-4">
              <button onclick="showNotificationsPanel()" id="notifBell"
                class="relative bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition" title="Notificações">
                <i class="fas fa-bell text-lg"></i>
                <span id="notifBadge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
              </button>
              <a href="/dashboard/${artist.slug}" target="_blank" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                <i class="fas fa-external-link-alt mr-2"></i>
                Ver Dashboard
              </a>
              <button onclick="handleLogout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                <i class="fas fa-sign-out-alt mr-2"></i>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Artist Info -->
      <div class="bg-gradient-to-r from-purple-900 to-indigo-900 py-8">
        <div class="container mx-auto px-4">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-user text-4xl"></i>
            </div>
            <div class="flex-1">
              <h2 class="text-3xl font-bold mb-2">${artist.name}</h2>
              <p class="text-gray-300">${artist.bio || 'Sem bio'}</p>
              <p class="text-sm text-gray-400 mt-2">
                <i class="fas fa-link mr-2"></i>
                Sua página: <a href="/${artist.slug}" target="_blank" class="text-blue-400 hover:underline">/${artist.slug}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="bg-gray-800 border-b border-gray-700">
        <div class="container mx-auto px-4">
          <div class="flex gap-1 overflow-x-auto">
            <button 
              onclick="switchTab('profile')" 
              id="tab-profile"
              class="px-6 py-3 font-semibold transition whitespace-nowrap ${currentTab === 'profile' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}"
            >
              <i class="fas fa-user mr-2"></i>
              Perfil
            </button>
            <button 
              onclick="switchTab('repertoire')" 
              id="tab-repertoire"
              class="px-6 py-3 font-semibold transition whitespace-nowrap ${currentTab === 'repertoire' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}"
            >
              <i class="fas fa-music mr-2"></i>
              Repertório
            </button>
            <button 
              onclick="switchTab('bank')" 
              id="tab-bank"
              class="px-6 py-3 font-semibold transition whitespace-nowrap ${currentTab === 'bank' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}"
            >
              <i class="fas fa-university mr-2"></i>
              Dados Bancários
            </button>
            <button 
              onclick="switchTab('qrcode')" 
              id="tab-qrcode"
              class="px-6 py-3 font-semibold transition whitespace-nowrap ${currentTab === 'qrcode' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}"
            >
              <i class="fas fa-qrcode mr-2"></i>
              Meu QR Code
            </button>
            <button 
              onclick="switchTab('show')" 
              id="tab-show"
              class="px-6 py-3 font-semibold transition whitespace-nowrap ${currentTab === 'show' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}"
            >
              <i class="fas fa-sliders-h mr-2"></i>
              Controle do Show
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="container mx-auto px-4 py-8">
        <div id="tabContent"></div>
      </div>
    </div>
  `;
  
  // Check URL hash to auto-activate tab (e.g. /manage#show)
  const hash = window.location.hash.replace('#', '');
  const validTabs = ['profile', 'repertoire', 'bank', 'qrcode', 'show'];
  if (hash && validTabs.includes(hash)) {
    currentTab = hash;
  }

  renderTabContent();
}

// Switch tab
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('[id^="tab-"]').forEach(btn => {
    if (btn.id === `tab-${tab}`) {
      btn.className = 'px-6 py-3 font-semibold transition bg-gray-900 text-white whitespace-nowrap';
    } else {
      btn.className = 'px-6 py-3 font-semibold transition text-gray-400 hover:text-white whitespace-nowrap';
    }
  });
  
  // Refresh show settings when entering the show tab
  if (tab === 'show') {
    loadShowSettings().then(() => renderTabContent());
    return;
  }

  renderTabContent();
}

// Render tab content
function renderTabContent() {
  const content = document.getElementById('tabContent');
  
  if (currentTab === 'profile') {
    content.innerHTML = renderProfileTab();
  } else if (currentTab === 'repertoire') {
    content.innerHTML = renderRepertoireTab();
  } else if (currentTab === 'bank') {
    content.innerHTML = renderBankTab();
    // Após renderizar, sincroniza o campo pixKey com accountHolderDocument
    const pixKeyInput = document.getElementById('pixKey');
    const docInput = document.getElementById('accountHolderDocument');
    if (pixKeyInput && docInput) {
      // Se pixKey estiver vazio mas houver CPF no titular, copia para pixKey
      if (!pixKeyInput.value && docInput.value) {
        pixKeyInput.value = docInput.value;
      }
      // Aplica máscara
      if (pixKeyInput.value) formatCPF(pixKeyInput);
      if (docInput.value) formatCPF(docInput);
    } else if (pixKeyInput && pixKeyInput.value) {
      formatCPF(pixKeyInput);
    }
  } else if (currentTab === 'show') {
    content.innerHTML = renderShowTab();
  } else if (currentTab === 'qrcode') {
    content.innerHTML = renderQRCodeTab();
  }
}

// ======================
// Profile Tab
// ======================

function renderProfileTab() {
  return `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">
        <i class="fas fa-user-circle mr-2"></i>
        Meu Perfil
      </h2>
      
      <div class="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <form onsubmit="handleSaveProfile(event)" class="space-y-6">
          <!-- Photo Section -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 relative group cursor-pointer" onclick="document.getElementById('photoInput').click()">
                <img 
                  id="profilePhotoPreview" 
                  src="${artist.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name) + '&size=128&background=6366f1&color=fff'}" 
                  alt="${artist.name}"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i class="fas fa-camera text-white text-2xl"></i>
                </div>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-semibold mb-2">
                <i class="fas fa-image mr-2"></i>
                Foto de Perfil
              </label>
              <input 
                type="file"
                id="photoInput"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                class="hidden"
                onchange="handlePhotoSelect(event)"
              />
              <button
                type="button"
                onclick="document.getElementById('photoInput').click()"
                class="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-left transition flex items-center justify-between"
              >
                <span id="photoFileName" class="text-gray-300">
                  ${artist.photo_url ? 'Foto atual' : 'Escolher foto da galeria'}
                </span>
                <i class="fas fa-upload text-gray-400"></i>
              </button>
              <p class="text-sm text-gray-400 mt-2">
                <i class="fas fa-info-circle mr-1"></i>
                Formatos aceitos: JPG, PNG, GIF, WebP | Tamanho máximo: 10MB
              </p>
              ${artist.photo_url ? `
                <button
                  type="button"
                  onclick="removePhoto()"
                  class="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Remover foto
                </button>
              ` : ''}
            </div>
          </div>
          
          <hr class="border-gray-700">
          
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-music mr-2"></i>
              Nome Artístico
            </label>
            <input 
              type="text"
              id="artistName"
              value="${artist.name}"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <!-- Bio -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-align-left mr-2"></i>
              Biografia
            </label>
            <textarea 
              id="artistBio"
              rows="4"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Conte um pouco sobre você e sua música..."
            >${artist.bio || ''}</textarea>
            <p class="text-sm text-gray-400 mt-2">
              Esta biografia será exibida na sua página pública para o público.
            </p>
          </div>
          
          <!-- Save Button -->
          <div class="flex gap-4">
            <button 
              type="submit"
              class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              <i class="fas fa-save mr-2"></i>
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
      
      <!-- Change Password Section -->
      <div class="bg-gray-800 rounded-xl p-8 border border-gray-700 mt-6">
        <h3 class="text-xl font-bold mb-6">
          <i class="fas fa-key mr-2"></i>
          Alterar Senha
        </h3>
        
        <form onsubmit="handleChangePassword(event)" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-lock mr-2"></i>
              Senha Atual
            </label>
            <input 
              type="password"
              id="currentPassword"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite sua senha atual"
            />
          </div>
          
          <!-- New Password -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-lock mr-2"></i>
              Nova Senha
            </label>
            <input 
              type="password"
              id="newPassword"
              required
              minlength="6"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite sua nova senha (mínimo 6 caracteres)"
            />
          </div>
          
          <!-- Confirm New Password -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-lock mr-2"></i>
              Confirmar Nova Senha
            </label>
            <input 
              type="password"
              id="confirmPassword"
              required
              minlength="6"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite novamente sua nova senha"
            />
          </div>
          
          <!-- Change Password Button -->
          <div class="flex gap-4">
            <button 
              type="submit"
              class="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              <i class="fas fa-key mr-2"></i>
              Alterar Senha
            </button>
          </div>
          
          <p class="text-sm text-gray-400">
            <i class="fas fa-info-circle mr-1"></i>
            Por segurança, você será desconectado após alterar a senha e precisará fazer login novamente.
          </p>
        </form>
      </div>
    </div>
  `;
}

// Global variable to store selected photo file
let selectedPhotoFile = null;

// Resize image to max dimensions using canvas (client-side compression)
function resizeImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const resized = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(resized);
      }, 'image/jpeg', quality || 0.82);
    };
    img.src = url;
  });
}

// Handle photo file selection (com recorte ajustável)
function handlePhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (10MB raw)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showError('Arquivo muito grande! Máximo: 10MB');
    event.target.value = '';
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showError('Tipo de arquivo não permitido! Use: JPG, PNG, GIF ou WebP');
    event.target.value = '';
    return;
  }

  // Abre o recorte (crop) antes de otimizar
  openPhotoCropper(file);
}

// ======================
// Cropper (recorte ajustável) - Avatar quadrado
// ======================
let cropperState = null;

function openPhotoCropper(file) {
  const existing = document.getElementById('photoCropperModal');
  if (existing) existing.remove();

  let cropperState = null;

function openPhotoCropper(file, inputIdToReset) {
  const existing = document.getElementById('photoCropperModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'photoCropperModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-6 w-full max-w-xl border border-gray-700 relative">
      <button id="closeCropperBtn" class="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">
        <i class="fas fa-times"></i>
      </button>

      <h3 class="text-xl font-bold mb-4">
        <i class="fas fa-crop-alt mr-2 text-yellow-400"></i>
        Ajustar foto (arraste e dê zoom)
      </h3>

      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <div id="cropViewport"
            class="relative w-full aspect-square bg-black rounded-xl overflow-hidden border border-gray-700 select-none touch-none">
            <img id="cropImage" class="absolute top-1/2 left-1/2 will-change-transform" alt="Prévia" />
            <div class="absolute inset-0 pointer-events-none border-2 border-white/70 rounded-xl"></div>
          </div>

          <div class="mt-4">
            <label class="text-sm text-gray-300">Zoom</label>
            <input id="cropZoom" type="range" min="1" max="3" step="0.01" class="w-full mt-2" value="1.2">
          </div>

          <p class="text-xs text-gray-400 mt-3">Dica: arraste para centralizar o rosto.</p>
        </div>

        <div class="w-full md:w-48">
          <p class="text-sm font-semibold mb-2 text-gray-200">Prévia</p>
          <div class="w-40 h-40 mx-auto rounded-full overflow-hidden border border-gray-700 bg-black relative">
            <canvas id="cropPreview" width="160" height="160" class="w-full h-full"></canvas>
          </div>

          <button id="applyCropBtn"
            class="w-full mt-6 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-check mr-2"></i>Usar esta foto
          </button>

          <button id="cancelCropBtn"
            class="w-full mt-3 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const imgEl = modal.querySelector('#cropImage');
  const viewport = modal.querySelector('#cropViewport');
  const zoomEl = modal.querySelector('#cropZoom');
  const previewCanvas = modal.querySelector('#cropPreview');
  const previewCtx = previewCanvas.getContext('2d');

  const url = URL.createObjectURL(file);
  imgEl.onload = () => {
    cropperState = {
      file, url, imgEl, viewport,
      zoom: parseFloat(zoomEl.value) || 1.2,
      dx: 0, dy: 0,
      dragging: false,
      lastX: 0, lastY: 0,
      previewCtx,
      inputIdToReset
    };

    cropperState.zoom = Math.max(1.2, cropperState.zoom);
    zoomEl.value = String(cropperState.zoom);
    applyCropTransform();
    exportCroppedToCanvas(previewCanvas, 160, 160);
  };
  imgEl.src = url;

  const close = (resetInput) => closePhotoCropper(resetInput);

  modal.querySelector('#closeCropperBtn').addEventListener('click', () => close(true));
  modal.querySelector('#cancelCropBtn').addEventListener('click', () => close(true));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(true); });

  zoomEl.addEventListener('input', () => {
    if (!cropperState) return;
    cropperState.zoom = parseFloat(zoomEl.value);
    applyCropTransform();
    exportCroppedToCanvas(previewCanvas, 160, 160);
  });

  // Drag mouse/touch
  const startDrag = (x, y) => {
    if (!cropperState) return;
    cropperState.dragging = true;
    cropperState.lastX = x;
    cropperState.lastY = y;
  };

  const moveDrag = (x, y) => {
    if (!cropperState || !cropperState.dragging) return;
    const ddx = x - cropperState.lastX;
    const ddy = y - cropperState.lastY;
    cropperState.lastX = x;
    cropperState.lastY = y;
    cropperState.dx += ddx;
    cropperState.dy += ddy;
    applyCropTransform();
    exportCroppedToCanvas(previewCanvas, 160, 160);
  };

  const endDrag = () => { if (cropperState) cropperState.dragging = false; };

  viewport.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches?.[0]) startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches?.[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchend', endDrag);

  modal.querySelector('#applyCropBtn').addEventListener('click', async () => {
    try {
      const croppedFile = await exportCroppedPhoto(800, 800, 0.86);
      selectedPhotoFile = croppedFile; // mantém seu fluxo atual

      // Atualiza preview existente
      const prev = document.getElementById('profilePhotoPreview');
      if (prev) prev.src = URL.createObjectURL(croppedFile);

      const nameEl = document.getElementById('photoFileName');
      if (nameEl) nameEl.textContent = file.name + ' (ajustada)';

      close(false);
      showSuccess('Foto ajustada! Agora clique em "Salvar Alterações".');
    } catch (err) {
      console.error(err);
      showError('Não foi possível recortar a foto.');
    }
  });
}

function closePhotoCropper(resetInput) {
  const modal = document.getElementById('photoCropperModal');
  if (modal) modal.remove();
  if (cropperState?.url) URL.revokeObjectURL(cropperState.url);

  if (resetInput && cropperState?.inputIdToReset) {
    const inp = document.getElementById(cropperState.inputIdToReset);
    if (inp) inp.value = '';
  }

  cropperState = null;
}

function applyCropTransform() {
  if (!cropperState) return;
  const { imgEl, viewport, zoom, dx, dy } = cropperState;
  const rect = viewport.getBoundingClientRect();

  imgEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${zoom})`;
  imgEl.style.maxWidth = 'none';
  imgEl.style.maxHeight = 'none';
  imgEl.style.width = `${rect.width}px`;
  imgEl.style.height = 'auto';
}

async function exportCroppedPhoto(outW, outH, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  await exportCroppedToCanvas(canvas, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('toBlob failed'));
      resolve(new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', quality ?? 0.86);
  });
}

async function exportCroppedToCanvas(canvas, outW, outH) {
  if (!cropperState) throw new Error('no cropper');

  const { imgEl, viewport, zoom, dx, dy } = cropperState;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, outW, outH);

  const natW = imgEl.naturalWidth;
  const natH = imgEl.naturalHeight;

  const vpRect = viewport.getBoundingClientRect();
  const vpW = vpRect.width;
  const vpH = vpRect.height;

  // base: imagem com width = vpW (antes do zoom)
  const drawnBaseH = vpW * (natH / natW);

  const pxPerVpX = natW / vpW;
  const pxPerVpY = natH / drawnBaseH;

  const pxPerVpXZoom = pxPerVpX / zoom;
  const pxPerVpYZoom = pxPerVpY / zoom;

  const srcW = vpW * pxPerVpXZoom;
  const srcH = vpH * pxPerVpYZoom;

  const srcX = (natW / 2) - (srcW / 2) - (dx * pxPerVpXZoom);
  const srcY = (natH / 2) - (srcH / 2) - (dy * pxPerVpYZoom);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const sx = clamp(srcX, 0, natW - srcW);
  const sy = clamp(srcY, 0, natH - srcH);

  ctx.drawImage(imgEl, sx, sy, srcW, srcH, 0, 0, outW, outH);
}

  const modal = document.createElement('div');
  modal.id = 'photoCropperModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-6 w-full max-w-xl border border-gray-700 relative">
      <button id="closeCropperBtn" class="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">
        <i class="fas fa-times"></i>
      </button>

      <h3 class="text-xl font-bold mb-4">
        <i class="fas fa-crop-alt mr-2 text-yellow-400"></i>
        Ajustar foto (arraste e dê zoom)
      </h3>

      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <div
            id="cropViewport"
            class="relative w-full aspect-square bg-black rounded-xl overflow-hidden border border-gray-700 select-none touch-none"
          >
            <img id="cropImage" class="absolute top-1/2 left-1/2 will-change-transform" alt="Prévia" />
            <!-- Moldura do recorte -->
            <div class="absolute inset-0 pointer-events-none border-2 border-white/70 rounded-xl"></div>
          </div>

          <div class="mt-4">
            <label class="text-sm text-gray-300">Zoom</label>
            <input id="cropZoom" type="range" min="1" max="3" step="0.01"
              class="w-full mt-2" value="1.2">
          </div>

          <p class="text-xs text-gray-400 mt-3">
            Dica: arraste a imagem para centralizar o rosto.
          </p>
        </div>

        <div class="w-full md:w-48">
          <p class="text-sm font-semibold mb-2 text-gray-200">Prévia</p>
          <div class="w-40 h-40 mx-auto rounded-full overflow-hidden border border-gray-700 bg-black relative">
            <canvas id="cropPreview" width="160" height="160" class="w-full h-full"></canvas>
          </div>

          <button id="applyCropBtn"
            class="w-full mt-6 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-check mr-2"></i>Usar esta foto
          </button>

          <button id="cancelCropBtn"
            class="w-full mt-3 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const imgEl = modal.querySelector('#cropImage');
  const viewport = modal.querySelector('#cropViewport');
  const zoomEl = modal.querySelector('#cropZoom');
  const previewCanvas = modal.querySelector('#cropPreview');
  const previewCtx = previewCanvas.getContext('2d');

  const url = URL.createObjectURL(file);
  imgEl.onload = () => {
    // estado inicial
    cropperState = {
      file,
      url,
      imgEl,
      viewport,
      zoom: parseFloat(zoomEl.value),
      // deslocamento em px relativo ao centro do viewport
      dx: 0,
      dy: 0,
      dragging: false,
      lastX: 0,
      lastY: 0,
      previewCtx
    };

    // Centraliza e dá um zoom inicial legal
    cropperState.zoom = Math.max(1.2, cropperState.zoom);
    zoomEl.value = String(cropperState.zoom);
    applyCropTransform();
    drawCropPreview();
  };
  imgEl.src = url;

  // Eventos
  const close = () => closePhotoCropper(true);

  modal.querySelector('#closeCropperBtn').addEventListener('click', close);
  modal.querySelector('#cancelCropBtn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  zoomEl.addEventListener('input', () => {
    if (!cropperState) return;
    cropperState.zoom = parseFloat(zoomEl.value);
    applyCropTransform();
    drawCropPreview();
  });

  // Drag mouse/touch
  const startDrag = (clientX, clientY) => {
    if (!cropperState) return;
    cropperState.dragging = true;
    cropperState.lastX = clientX;
    cropperState.lastY = clientY;
  };

  const moveDrag = (clientX, clientY) => {
    if (!cropperState || !cropperState.dragging) return;
    const dx = clientX - cropperState.lastX;
    const dy = clientY - cropperState.lastY;
    cropperState.lastX = clientX;
    cropperState.lastY = clientY;
    cropperState.dx += dx;
    cropperState.dy += dy;
    applyCropTransform();
    drawCropPreview();
  };

  const endDrag = () => {
    if (!cropperState) return;
    cropperState.dragging = false;
  };

  viewport.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches?.[0]) startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches?.[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchend', endDrag);

  modal.querySelector('#applyCropBtn').addEventListener('click', async () => {
    try {
      const croppedFile = await exportCroppedPhoto(800, 800, 0.86); // avatar 800x800
      selectedPhotoFile = croppedFile;

      // Atualiza preview do perfil
      const reader = new FileReader();
      reader.onload = (e) => {
        const prev = document.getElementById('profilePhotoPreview');
        if (prev) prev.src = e.target.result;
      };
      reader.readAsDataURL(croppedFile);

      const nameEl = document.getElementById('photoFileName');
      if (nameEl) nameEl.textContent = file.name + ' (recortada)';

      closePhotoCropper(false);
      showSuccess('Foto ajustada! Agora clique em "Salvar Alterações".');
    } catch (err) {
      console.error(err);
      showError('Não foi possível recortar a foto.');
    }
  });
}

function closePhotoCropper(resetInput) {
  const modal = document.getElementById('photoCropperModal');
  if (modal) modal.remove();
  if (cropperState?.url) URL.revokeObjectURL(cropperState.url);
  cropperState = null;

  // Se cancelou, limpa o input file pra poder selecionar a mesma foto de novo
  if (resetInput) {
    const fileInput = document.getElementById('profilePhotoInput');
    if (fileInput) fileInput.value = '';
  }
}

function applyCropTransform() {
  if (!cropperState) return;

  const { imgEl, viewport, zoom, dx, dy } = cropperState;
  const rect = viewport.getBoundingClientRect();

  // Coloca a imagem no centro (50/50) e aplica translate/scale
  // translate(-50%, -50%) é base; depois adicionamos dx/dy em px
  imgEl.style.transform =
    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${zoom})`;

  // Mantém a imagem com "contain" visualmente grande
  imgEl.style.maxWidth = 'none';
  imgEl.style.maxHeight = 'none';

  // Base: dimensiona para cobrir o viewport (com zoom)
  // (fazemos via width/height auto; o scale faz o resto)
  imgEl.style.width = `${rect.width}px`;
  imgEl.style.height = 'auto';
}

function drawCropPreview() {
  if (!cropperState) return;
  const canvas = document.getElementById('cropPreview');
  if (!canvas) return;
  const ctx = cropperState.previewCtx;
  if (!ctx) return;

  // Preview em 160x160
  exportCroppedToCanvas(canvas, 160, 160).catch(() => {});
}

async function exportCroppedPhoto(outW, outH, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  await exportCroppedToCanvas(canvas, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('toBlob failed'));
      const file = new File([blob], `profile_${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg', quality ?? 0.86);
  });
}

async function exportCroppedToCanvas(canvas, outW, outH) {
  if (!cropperState) throw new Error('no cropper state');

  const { imgEl, viewport, zoom, dx, dy } = cropperState;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, outW, outH);

  // viewport quadrado
  const vpRect = viewport.getBoundingClientRect();

  // Precisamos mapear o recorte (viewport) para coordenadas reais da imagem
  // A imagem é desenhada como: centro do viewport + (dx,dy) e scale(zoom) com base no viewport width.
  const img = imgEl;

  // Dimensões naturais da imagem
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  // A base visual: definimos imgEl.style.width = viewportWidth.
  // Então, 1 "unidade" no viewport equivale a (natW / viewportWidth) na imagem (antes do zoom).
  const viewportW = vpRect.width;
  const viewportH = vpRect.height;

  const baseScaleX = natW / viewportW;
  const baseScaleY = natH / (viewportW * (natH / natW)); // proporcional, mas vamos calcular pela altura real desenhada

  // Melhor: calcule a altura desenhada no DOM (sem o scale do CSS)
  // Como colocamos width = viewportW e height = auto, a altura base desenhada:
  const drawnBaseH = viewportW * (natH / natW);

  // Fator pixels imagem por pixel viewport na base
  const pxPerVpX = natW / viewportW;
  const pxPerVpY = natH / drawnBaseH;

  // Com zoom: cada pixel no viewport corresponde a menos pixels da imagem
  const pxPerVpXZoom = pxPerVpX / zoom;
  const pxPerVpYZoom = pxPerVpY / zoom;

  // O viewport recorta um quadrado. A origem do recorte na imagem depende do deslocamento dx/dy.
  // dx/dy deslocam a imagem no viewport; se dx é positivo, a imagem foi movida p/ direita,
  // então o recorte pega uma área mais à esquerda na imagem.
  const cropVpX = (viewportW / 2) - (viewportW / 2) - dx; // simplifica: -dx
  const cropVpY = (viewportH / 2) - (viewportH / 2) - dy; // -dy

  // O centro do recorte no viewport é o centro do viewport.
  // A posição do recorte na imagem (top-left) em pixels imagem:
  const srcW = viewportW * pxPerVpXZoom;
  const srcH = viewportH * pxPerVpYZoom;

  // A imagem está centrada no viewport; então o recorte está centrado no centro da imagem (em viewport coords),
  // ajustado por dx/dy.
  // Top-left do recorte em coords da imagem:
  const srcX = (natW / 2) - (srcW / 2) - (dx * pxPerVpXZoom);
  const srcY = (natH / 2) - (srcH / 2) - (dy * pxPerVpYZoom);

  // Clamp pra não estourar
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const sx = clamp(srcX, 0, natW - srcW);
  const sy = clamp(srcY, 0, natH - srcH);

  ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, outW, outH);
}
  
  // Resize image before storing (max 800x800, JPEG 82% quality ≈ keeps it under 400KB)
  resizeImage(file, 800, 800, 0.82).then((resized) => {
    selectedPhotoFile = resized;
    document.getElementById('photoFileName').textContent = file.name + ' (otimizada)';
    // Show preview from resized
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('profilePhotoPreview').src = e.target.result;
    };
    reader.readAsDataURL(resized);
  });

// Remove photo
async function removePhoto() {
  if (!confirm('Deseja remover sua foto de perfil?')) {
    return;
  }
  
  try {
    await axios.patch(`/api/artists/${artist.slug}`, {
      name: artist.name,
      bio: artist.bio,
      photo_url: null
    });
    
    artist.photo_url = null;
    selectedPhotoFile = null;
    
    showSuccess('Foto removida com sucesso!');
    renderPage();
  } catch (error) {
    showError('Erro ao remover foto');
  }
}

// Handle save profile
async function handleSaveProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById('artistName').value;
  const bio = document.getElementById('artistBio').value;
  
  try {
    let photo_url = artist.photo_url;
    let photoUpdatedByUpload = false;
    
    // If a new photo was selected, upload it first
    if (selectedPhotoFile) {
      const formData = new FormData();
      formData.append('photo', selectedPhotoFile);
      
      showSuccess('Fazendo upload da foto...');
      
      const uploadResponse = await axios.post(`/api/artists/${artist.slug}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      photo_url = uploadResponse.data.photo_url;
      photoUpdatedByUpload = true; // photo_url already saved by upload route
      selectedPhotoFile = null;
    }
    
    // Update profile data (name + bio only if photo was already saved by upload)
    const patchPayload = { name, bio };
    if (!photoUpdatedByUpload) {
      // Only include photo_url if it wasn't just uploaded (avoids re-sending large base64)
      patchPayload.photo_url = photo_url;
    }
    
    await axios.patch(`/api/artists/${artist.slug}`, patchPayload);
    
    // Update local data
    artist.name = name;
    artist.bio = bio;
    artist.photo_url = photo_url;
    
    showSuccess('Perfil atualizado com sucesso!');
    renderPage(); // Re-render to update header
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao atualizar perfil');
    console.error(error);
  }
}

// ======================
// Repertoire Tab
// ======================

// Render Repertoire Tab
function renderRepertoireTab() {
  return `
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          <i class="fas fa-list-music mr-2"></i>
          Meu Repertório (${songs.length} músicas)
        </h2>
        <button onclick="showAddSongModal()" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition">
          <i class="fas fa-plus mr-2"></i>
          Adicionar Música
        </button>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${songs.length === 0 ? `
          <div class="col-span-full text-center py-12 bg-gray-800 rounded-xl">
            <i class="fas fa-music text-4xl text-gray-600 mb-4"></i>
            <p class="text-gray-400 text-lg mb-4">Seu repertório está vazio</p>
            <button onclick="showAddSongModal()" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition">
              <i class="fas fa-plus mr-2"></i>
              Adicionar Primeira Música
            </button>
          </div>
        ` : songs.map(song => `
          <div class="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg truncate">${song.title}</h3>
                <p class="text-sm text-gray-400 truncate">${song.artist_name}</p>
              </div>
              <button onclick="deleteSong(${song.id})" class="text-red-500 hover:text-red-400 ml-2">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            ${song.genre ? `<span class="inline-block bg-purple-600 text-xs px-2 py-1 rounded">${song.genre}</span>` : ''}
            ${song.duration ? `<p class="text-xs text-gray-500 mt-2">${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Add Song Modal -->
    <div id="addSongModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">Adicionar Música</h3>
        
        <form id="addSongForm" onsubmit="handleAddSong(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Título da Música *</label>
            <input 
              type="text" 
              id="songTitle" 
              required
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Evidências"
            >
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2">Artista Original *</label>
            <input 
              type="text" 
              id="songArtist" 
              required
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Chitãozinho & Xororó"
            >
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2">Gênero</label>
            <input 
              type="text" 
              id="songGenre" 
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Sertanejo, MPB, Rock..."
            >
          </div>
          
          <div class="flex gap-3 mt-6">
            <button type="button" onclick="closeAddSongModal()" class="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ======================
// Show Tab — Controle do Show
// ======================

function renderShowTab() {
  const isOpen = showSettings.requests_open;
  const maxReq = showSettings.max_requests || 0;
  const todayCount = artist.today_requests_count || 0;
  const limitActive = maxReq > 0;
  const limitReached = limitActive && todayCount >= maxReq;

  return `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">
        <i class="fas fa-sliders-h mr-2"></i>
        Controle do Show
      </h2>

      <!-- Status Banner -->
      <div class="rounded-xl p-5 mb-6 flex items-center gap-4 ${isOpen ? 'bg-green-900/40 border border-green-600' : 'bg-red-900/40 border border-red-600'}">
        <div class="text-4xl">${isOpen ? '🟢' : '🔴'}</div>
        <div class="flex-1">
          <div class="font-bold text-lg ${isOpen ? 'text-green-300' : 'text-red-300'}">
            ${isOpen ? 'Aceitando pedidos' : 'Pedidos fechados'}
          </div>
          <div class="text-sm text-gray-400">
            ${isOpen
              ? (limitActive
                  ? `${todayCount} de ${maxReq} pedidos usados hoje`
                  : 'Sem limite de pedidos')
              : 'O QR Code mostrará mensagem de encerramento'}
          </div>
        </div>
        <button
          onclick="toggleRequestsOpen()"
          class="${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-5 py-2 rounded-lg font-bold transition text-white"
        >
          ${isOpen ? '🔴 Fechar Pedidos' : '🟢 Abrir Pedidos'}
        </button>
      </div>

      <!-- Progress Bar (only when limit is set) -->
      ${limitActive ? `
      <div class="bg-gray-800 rounded-xl p-5 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-300">
            <i class="fas fa-chart-bar mr-2 text-purple-400"></i>
            Pedidos hoje
          </span>
          <span class="font-bold text-lg ${limitReached ? 'text-red-400' : 'text-white'}">
            ${todayCount} / ${maxReq}
          </span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-4">
          <div
            class="h-4 rounded-full transition-all duration-500 ${limitReached ? 'bg-red-500' : todayCount / maxReq > 0.75 ? 'bg-yellow-500' : 'bg-green-500'}"
            style="width: ${Math.min(100, maxReq > 0 ? Math.round((todayCount / maxReq) * 100) : 0)}%"
          ></div>
        </div>
        ${limitReached ? `
        <p class="text-red-400 text-sm mt-2 font-semibold">
          <i class="fas fa-lock mr-1"></i>
          Limite atingido! Novos pedidos estão bloqueados automaticamente.
        </p>` : ''}
      </div>
      ` : ''}

      <!-- Settings Form -->
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-lg font-bold mb-4">
          <i class="fas fa-cog mr-2 text-purple-400"></i>
          Configurar Limite de Pedidos
        </h3>

        <form onsubmit="handleSaveShowSettings(event)" class="space-y-5">
          <div>
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <div class="relative">
                <input
                  type="checkbox"
                  id="limitToggle"
                  class="sr-only"
                  ${limitActive ? 'checked' : ''}
                  onchange="toggleLimitInput(this)"
                >
                <div id="limitToggleTrack" class="w-12 h-6 rounded-full transition ${limitActive ? 'bg-purple-600' : 'bg-gray-600'}"></div>
                <div id="limitToggleThumb" class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${limitActive ? 'translate-x-6' : ''}"></div>
              </div>
              <span class="font-semibold">Ativar limite de pedidos</span>
            </label>
            <p class="text-xs text-gray-400">
              Quando ativado, o artista pode definir quantos pedidos aceitar no show. Ao atingir o limite, o QR Code mostrará mensagem de encerramento.
            </p>
          </div>

          <div id="maxRequestsInput" style="display: ${limitActive ? 'block' : 'none'}">
            <label class="block text-sm font-semibold mb-2">
              <i class="fas fa-list-ol mr-1 text-purple-400"></i>
              Número máximo de pedidos no show de hoje
            </label>
            <div class="flex items-center gap-3">
              <button type="button" onclick="adjustMax(-5)" class="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-lg font-bold text-lg transition">−</button>
              <input
                type="number"
                id="maxRequestsValue"
                value="${maxReq || 20}"
                min="1"
                max="999"
                class="flex-1 text-center px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl font-bold"
              >
              <button type="button" onclick="adjustMax(5)" class="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-lg font-bold text-lg transition">+</button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Sugestão: 20–50 pedidos por show</p>
          </div>

          <button
            type="submit"
            class="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            <i class="fas fa-save mr-2"></i>
            Salvar Configurações
          </button>
        </form>
      </div>

      <!-- Info Card -->
      <div class="bg-blue-900/30 border border-blue-700 rounded-xl p-4 mt-6">
        <p class="text-blue-200 text-sm">
          <i class="fas fa-info-circle mr-2 text-blue-400"></i>
          <strong>Como funciona:</strong> Quando o cliente escanear o QR Code e o limite estiver atingido (ou os pedidos fechados), ele verá uma tela informando que o artista não está aceitando mais pedidos hoje. Você pode reabrir a qualquer momento clicando em <strong>"Abrir Pedidos"</strong>.
        </p>
      </div>
    </div>
  `;
}

// Toggle +/- max requests
function adjustMax(delta) {
  const input = document.getElementById('maxRequestsValue');
  if (!input) return;
  const current = parseInt(input.value) || 20;
  input.value = Math.max(1, current + delta);
}

// Toggle visibility of limit input
function toggleLimitInput(checkbox) {
  const container = document.getElementById('maxRequestsInput');
  const track = document.getElementById('limitToggleTrack');
  const thumb = document.getElementById('limitToggleThumb');
  if (!container) return;
  if (checkbox.checked) {
    container.style.display = 'block';
    if (track) { track.classList.remove('bg-gray-600'); track.classList.add('bg-purple-600'); }
    if (thumb) thumb.classList.add('translate-x-6');
  } else {
    container.style.display = 'none';
    if (track) { track.classList.remove('bg-purple-600'); track.classList.add('bg-gray-600'); }
    if (thumb) thumb.classList.remove('translate-x-6');
  }
}

// Toggle open/close requests
async function toggleRequestsOpen() {
  const newState = showSettings.requests_open ? 0 : 1;
  try {
    await axios.put(`/api/artists/${artist.slug}/show-settings`, {
      max_requests: showSettings.max_requests,
      requests_open: newState
    });
    showSettings.requests_open = newState;
    artist.requests_open = newState;
    showSuccess(newState ? '🟢 Pedidos abertos!' : '🔴 Pedidos fechados!');
    renderTabContent();
  } catch (e) {
    showError('Erro ao atualizar configurações');
  }
}

// Save show settings
async function handleSaveShowSettings(event) {
  event.preventDefault();
  const limitEnabled = document.getElementById('limitToggle').checked;
  const maxVal = limitEnabled ? (parseInt(document.getElementById('maxRequestsValue').value) || 20) : 0;

  try {
    await axios.put(`/api/artists/${artist.slug}/show-settings`, {
      max_requests: maxVal,
      requests_open: showSettings.requests_open
    });
    showSettings.max_requests = maxVal;
    artist.max_requests = maxVal;
    showSuccess('✅ Configurações salvas!');
    renderTabContent();
  } catch (e) {
    showError('Erro ao salvar configurações');
  }
}

// Render Bank Tab
function renderBankTab() {
  // Determina qual tipo está ativo com base nos dados salvos
  const isPix = !bankAccount || bankAccount.account_type === 'pix' || bankAccount.account_type === null;
  const isBankAccount = bankAccount && bankAccount.account_type === 'bank_account';

  return `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">
        <i class="fas fa-university mr-2"></i>
        Dados para Recebimento de Gorjetas
      </h2>
      
      <div class="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 mb-6">
        <i class="fas fa-info-circle mr-2 text-yellow-400"></i>
        <span class="text-yellow-200">Configure seus dados bancários para receber as gorjetas diretamente</span>
      </div>
      
      <form id="bankForm" onsubmit="handleSaveBankAccount(event)" class="bg-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Tipo de Conta *</label>
          <select 
            id="accountType" 
            required
            onchange="toggleBankFields()"
            class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="pix" ${!isBankAccount ? 'selected' : ''}>PIX</option>
            <option value="bank_account" ${isBankAccount ? 'selected' : ''}>Conta Bancária</option>
          </select>
        </div>
        
        <div id="pixFields" style="display: ${isBankAccount ? 'none' : 'block'}">
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-2">Tipo de Chave PIX *</label>
            <input 
              type="text" 
              value="CPF (somente do titular da conta)" 
              class="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-600 text-gray-400"
              disabled
            >
            <input type="hidden" id="pixKeyType" value="cpf">
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2">Chave PIX (CPF) *</label>
            <input 
              type="text" 
              id="pixKey" 
              value="${bankAccount?.pix_key || bankAccount?.account_holder_document || ''}"
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="000.000.000-00"
              maxlength="14"
              oninput="formatCPF(this)"
              readonly
            >
            <p class="text-xs text-gray-400 mt-1">
              <i class="fas fa-info-circle mr-1"></i>
              Preenchido automaticamente com o CPF do titular acima
            </p>
          </div>
        </div>
        
        <div id="bankFields" class="space-y-4" style="display: ${isBankAccount ? 'block' : 'none'}">
          <div>
            <label class="block text-sm font-semibold mb-2">Banco *</label>
            <input 
              type="text" 
              id="bankName" 
              value="${bankAccount?.bank_name || ''}"
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Banco do Brasil"
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Código do Banco</label>
              <input 
                type="text" 
                id="bankCode" 
                value="${bankAccount?.bank_code || ''}"
                class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 001"
              >
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-2">Agência</label>
              <input 
                type="text" 
                id="agency" 
                value="${bankAccount?.agency || ''}"
                class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 1234-5"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2">Número da Conta</label>
            <input 
              type="text" 
              id="accountNumber" 
              value="${bankAccount?.account_number || ''}"
              class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: 12345-6"
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2">Nome do Titular *</label>
          <input 
            type="text" 
            id="accountHolderName" 
            required
            value="${bankAccount?.account_holder_name || user.full_name}"
            class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome completo"
          >
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2">CPF/CNPJ do Titular *</label>
          <input 
            type="text" 
            id="accountHolderDocument" 
            required
            value="${bankAccount?.account_holder_document || ''}"
            oninput="syncPixKeyWithDocument(this)"
            class="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="000.000.000-00"
            maxlength="14"
          >
          <p class="text-xs text-gray-400 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            Digite os 11 dígitos do CPF — será usado como chave PIX automaticamente
          </p>
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition mt-6"
        >
          <i class="fas fa-save mr-2"></i>
          Salvar Dados Bancários
        </button>
      </form>
    </div>
  `;
}

// Toggle bank fields based on account type
function toggleBankFields() {
  const accountType = document.getElementById('accountType').value;
  const pixFields = document.getElementById('pixFields');
  const bankFields = document.getElementById('bankFields');
  
  if (!pixFields || !bankFields) return;

  if (accountType === 'pix') {
    pixFields.style.display = 'block';
    bankFields.style.display = 'none';
  } else {
    pixFields.style.display = 'none';
    bankFields.style.display = 'block';
  }
}

// Show add song modal
function showAddSongModal() {
  document.getElementById('addSongModal').classList.remove('hidden');
}

// Close add song modal
function closeAddSongModal() {
  document.getElementById('addSongModal').classList.add('hidden');
  document.getElementById('addSongForm').reset();
}

// Handle add song
async function handleAddSong(event) {
  event.preventDefault();
  
  const title = document.getElementById('songTitle').value;
  const artist_name = document.getElementById('songArtist').value;
  const genre = document.getElementById('songGenre').value;
  
  try {
    await axios.post(`/api/artists/${artist.slug}/songs`, {
      title,
      artist_name,
      genre: genre || null
    });
    
    showSuccess('Música adicionada com sucesso!');
    await loadSongs();
    renderTabContent();
    closeAddSongModal();
  } catch (error) {
    showError('Erro ao adicionar música');
  }
}

// Delete song
async function deleteSong(songId) {
  if (!confirm('Tem certeza que deseja remover esta música?')) {
    return;
  }
  
  try {
    await axios.delete(`/api/songs/${songId}`);
    showSuccess('Música removida com sucesso!');
    await loadSongs();
    renderTabContent();
  } catch (error) {
    showError('Erro ao remover música');
  }
}

// Handle save bank account
async function handleSaveBankAccount(event) {
  event.preventDefault();
  
  const accountType = document.getElementById('accountType').value;
  
  const data = {
    account_type: accountType,
    account_holder_name: document.getElementById('accountHolderName').value,
    account_holder_document: document.getElementById('accountHolderDocument').value
  };
  
  if (accountType === 'pix') {
    // pixKey é readonly e espelha accountHolderDocument; usa o documento como fonte primária
    const docValue = document.getElementById('accountHolderDocument').value.trim();
    const pixKeyEl = document.getElementById('pixKey');
    const pixKeyValue = (pixKeyEl ? pixKeyEl.value.trim() : '') || docValue;
    
    // Validar CPF (somente números, 11 dígitos)
    const cpfClean = pixKeyValue.replace(/\D/g, '');
    
    if (cpfClean.length !== 11) {
      showError(`CPF deve ter exatamente 11 dígitos (você digitou ${cpfClean.length})`);
      return;
    }
    
    if (!/^\d+$/.test(cpfClean)) {
      showError('CPF deve conter apenas números');
      return;
    }
    
    data.pix_key = cpfClean;
    data.pix_key_type = 'cpf';  // Fixo como CPF
  } else {
    data.bank_name = document.getElementById('bankName').value;
    data.bank_code = document.getElementById('bankCode').value;
    data.agency = document.getElementById('agency').value;
    data.account_number = document.getElementById('accountNumber').value;
  }
  
  try {
    await axios.post(`/api/artists/${artist.slug}/bank-account`, data);
    showSuccess('Dados bancários salvos com sucesso!');
    await loadBankAccount();
  } catch (error) {
    showError('Erro ao salvar dados bancários');
  }
}

// Handle logout
async function handleLogout() {
  try {
    await axios.post('/api/auth/logout');
    window.location.href = '/';
  } catch (error) {
    window.location.href = '/';
  }
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
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
  }, 4000);
}

// ======================
// QR Code Tab
// ======================

function renderQRCodeTab() {
  return `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">
        <i class="fas fa-qrcode mr-2"></i>
        Meu QR Code Personalizado
      </h2>
      
      <div class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-xl border border-white/20">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- QR Code Display -->
          <div class="flex flex-col items-center justify-center bg-white p-8 rounded-xl">
            <div id="qrCodeContainer" class="mb-4">
              <div class="animate-pulse bg-gray-200 w-64 h-64 rounded-lg"></div>
            </div>
            <button onclick="downloadQRCode()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-white transition mb-2">
              <i class="fas fa-download mr-2"></i>
              Baixar QR Code
            </button>
            <button onclick="regenerateQRCode()" class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold text-white transition text-sm">
              <i class="fas fa-sync mr-2"></i>
              Gerar Novo
            </button>
          </div>
          
          <!-- Instructions -->
          <div class="space-y-4">
            <div class="bg-white/10 p-6 rounded-xl border border-white/20">
              <h3 class="text-xl font-bold mb-4 text-yellow-300">
                <i class="fas fa-lightbulb mr-2"></i>
                Como Usar
              </h3>
              <ol class="space-y-3 text-gray-200">
                <li class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">1</span>
                  <span>Baixe o QR Code clicando no botão acima</span>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">2</span>
                  <span>Imprima em tamanho A4 ou maior</span>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">3</span>
                  <span>Coloque nas mesas do bar/restaurante</span>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">4</span>
                  <span>Clientes escaneiam e vão direto para sua página!</span>
                </li>
              </ol>
            </div>
            
            <div class="bg-green-500/20 p-6 rounded-xl border border-green-400/30">
              <h3 class="text-lg font-bold mb-2 text-green-300">
                <i class="fas fa-check-circle mr-2"></i>
                Vantagens
              </h3>
              <ul class="space-y-2 text-sm text-gray-200">
                <li><i class="fas fa-star text-yellow-400 mr-2"></i>Clientes acessam sem precisar escolher artista</li>
                <li><i class="fas fa-star text-yellow-400 mr-2"></i>Mais rápido e direto</li>
                <li><i class="fas fa-star text-yellow-400 mr-2"></i>Aumenta pedidos de músicas</li>
                <li><i class="fas fa-star text-yellow-400 mr-2"></i>Mais gorjetas para você</li>
              </ul>
            </div>
            
            <div class="text-sm text-gray-400 bg-white/5 p-4 rounded-lg">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>Link direto:</strong><br>
              <code id="artistLink" class="text-blue-300 break-all"></code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadQRCode() {
  try {
    const response = await axios.get(`/api/artists/${artist.slug}/qrcode`);
    const data = response.data;
    
    // Update QR Code image
    document.getElementById('qrCodeContainer').innerHTML = `
      <img src="${data.qr_code_url}" alt="QR Code" class="w-64 h-64 rounded-lg shadow-lg" id="qrCodeImage">
    `;
    
    // Update link
    document.getElementById('artistLink').textContent = data.qr_code_data;
    
    // Store QR code URL globally for download
    window.currentQRCodeUrl = data.qr_code_url;
    window.currentQRCodeData = data.qr_code_data;
  } catch (error) {
    showError('Erro ao carregar QR Code: ' + (error.response?.data?.error || error.message));
  }
}

async function regenerateQRCode() {
  if (!confirm('Deseja gerar um novo QR Code? O antigo deixará de funcionar.')) {
    return;
  }
  
  try {
    const response = await axios.post(`/api/artists/${artist.slug}/qrcode/regenerate`);
    const data = response.data;
    
    showSuccess('QR Code regenerado com sucesso!');
    loadQRCode();
  } catch (error) {
    showError('Erro ao regenerar QR Code: ' + (error.response?.data?.error || error.message));
  }
}

function downloadQRCode() {
  if (!window.currentQRCodeUrl) {
    showError('QR Code não carregado');
    return;
  }
  
  // Create a temporary link to download the image
  const link = document.createElement('a');
  link.href = window.currentQRCodeUrl;
  link.download = `qrcode-${artist.slug}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showSuccess('QR Code baixado com sucesso!');
}

// Handle change password
async function handleChangePassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validar se as senhas novas coincidem
  if (newPassword !== confirmPassword) {
    showError('As senhas novas não coincidem');
    return;
  }
  
  // Validar tamanho mínimo
  if (newPassword.length < 6) {
    showError('A nova senha deve ter no mínimo 6 caracteres');
    return;
  }
  
  try {
    console.log('🔑 Alterando senha...');
    
    const response = await axios.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    if (response.data.success) {
      showSuccess('Senha alterada com sucesso! Redirecionando para o login...');
      
      // Limpar campos
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      
      // Fazer logout após 2 segundos
      setTimeout(async () => {
        await axios.post('/api/auth/logout');
        window.location.href = '/login';
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    showError(error.response?.data?.error || 'Erro ao alterar senha');
  }
}

// Format CPF input (add mask 000.000.000-00)
function formatCPF(input) {
  // Remove tudo que não é número
  let value = input.value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  value = value.substring(0, 11);
  
  // Aplica a máscara
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  input.value = value;
}

// Sincroniza o campo CPF/CNPJ do titular com a chave PIX (quando tipo é PIX)
function syncPixKeyWithDocument(input) {
  // Aplica máscara ao campo de documento
  formatCPF(input);
  
  // Se o tipo de conta for PIX, sincroniza com o campo pixKey
  const accountType = document.getElementById('accountType');
  if (accountType && accountType.value === 'pix') {
    const pixKeyInput = document.getElementById('pixKey');
    if (pixKeyInput) {
      pixKeyInput.value = input.value;
    }
  }
}

// Load QR Code when tab is opened
const originalRenderTabContent = renderTabContent;
renderTabContent = function() {
  originalRenderTabContent();
  if (currentTab === 'qrcode') {
    loadQRCode();
  }
};

// Note: init() is called from the HTML page via <script>init()</script>

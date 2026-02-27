// Admin Panel - Manage Users and System

let currentPage = 'dashboard';
let users = [];
let stats = {};
let pendingLicenses = [];
let systemConfig = {};
let artistsList = [];
let notifications = [];
let layoutSettings = {};

// Configure axios with credentials + localStorage session fallback (interceptor reads fresh on every request)
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function(config) {
  const sid = localStorage.getItem('admin_session_id')
           || localStorage.getItem('session_id')
           || sessionStorage.getItem('session_id');
  if (sid) config.headers['X-Session-ID'] = sid;
  return config;
});

// Initialize
async function init() {
  try {
    await axios.get('/api/admin/stats');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      window.location.href = '/admin/login';
      return;
    }
  }

  await Promise.allSettled([
    loadStats(),
    loadUsers(),
    loadPendingLicenses(),
    loadSystemConfig(),
    loadLayoutSettings(),
    loadArtistsList()
  ]);

  renderNavigation();
  renderPage();

  // Auto-refresh dashboard data every 30 seconds
  setInterval(async () => {
    await loadStats();
    await loadUsers();
    await loadPendingLicenses();
    // Re-render only if on dashboard page
    if (currentPage === 'dashboard') renderPage();
  }, 30000);
}

// Load statistics
async function loadStats() {
  try {
    const response = await axios.get('/api/admin/stats');
    stats = response.data;
  } catch (error) {
    stats = { total_users: 0, total_artists: 0, total_songs: 0, total_requests: 0 };
  }
}

// Load users
async function loadUsers() {
  try {
    const response = await axios.get('/api/admin/users');
    users = response.data;
  } catch (error) {
    users = [];
  }
}

// Load pending licenses
async function loadPendingLicenses() {
  try {
    const response = await axios.get('/api/admin/licenses/pending');
    pendingLicenses = response.data;
  } catch (error) {
    pendingLicenses = [];
  }
}

// Load artists list (detailed, from /api/admin/artists)
async function loadArtistsList() {
  try {
    const response = await axios.get('/api/admin/artists');
    artistsList = response.data;
  } catch (error) {
    artistsList = [];
  }
}

// Load system config
async function loadSystemConfig() {
  try {
    const response = await axios.get('/api/admin/system-config');
    systemConfig = response.data;
  } catch (error) {
    systemConfig = {};
  }
}

async function loadNotifications() {
  try {
    const response = await axios.get('/api/admin/notifications');
    notifications = response.data;
  } catch (error) {
    notifications = [];
  }
}

async function loadLayoutSettings() {
  try {
    const response = await axios.get('/api/admin/settings');
    const map = {};
    (response.data || []).forEach((item) => {
      map[item.setting_key] = item.setting_value;
    });
    layoutSettings = map;
  } catch (error) {
    layoutSettings = {};
  }
}

// Render navigation
function renderNavigation() {
  const nav = document.getElementById('admin-nav');
  const navItems = [
    { id: 'dashboard',      icon: 'fas fa-chart-line',  label: 'Dashboard' },
    { id: 'licenses',       icon: 'fas fa-id-card',     label: 'Licenças', badge: pendingLicenses.length },
    { id: 'users',          icon: 'fas fa-users',        label: 'Usuários' },
    { id: 'artists',        icon: 'fas fa-guitar',       label: 'Artistas', badge: stats.total_artists || null },
    { id: 'notifications',  icon: 'fas fa-bell',         label: 'Notificações' },
    { id: 'settings',       icon: 'fas fa-cog',          label: 'Configurações' }
  ];

  nav.innerHTML = navItems.map(item => {
    const isActive = currentPage === item.id;
    const btnStyle = `width:100%;text-align:left;padding:10px 14px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;background:${isActive ? '#7c3aed' : 'transparent'};color:${isActive ? '#fff' : '#d1d5db'};font-size:0.95rem;`;
    return `
    <button onclick="navigateTo('${item.id}')" style="${btnStyle}">
      <span><i class="${item.icon}" style="margin-right:10px;"></i>${item.label}</span>
      ${item.badge ? `<span style="background:#ef4444;color:#fff;font-size:0.7rem;padding:2px 7px;border-radius:9999px;">${item.badge}</span>` : ''}
    </button>
  `}).join('');
}

// Navigate to page
async function navigateTo(page) {
  // Close mobile sidebar when navigating
  if (typeof closeSidebar === 'function') closeSidebar();
  currentPage = page;
  renderNavigation();
  try {
    if (page === 'users')           await loadUsers();
    else if (page === 'dashboard')  await loadStats();
    else if (page === 'licenses')   await loadPendingLicenses();
    else if (page === 'settings') { await loadSystemConfig(); await loadLayoutSettings(); }
    else if (page === 'artists')    await loadArtistsList();
    else if (page === 'notifications') await loadNotifications();
  } catch(e) {}
  renderPage();
}

// Render main content
function renderPage() {
  const content = document.getElementById('admin-content');
  if      (currentPage === 'dashboard')     content.innerHTML = renderDashboard();
  else if (currentPage === 'licenses')      content.innerHTML = renderLicenses();
  else if (currentPage === 'users')         content.innerHTML = renderUsers();
  else if (currentPage === 'artists')       content.innerHTML = renderArtists();
  else if (currentPage === 'notifications') content.innerHTML = renderNotifications();
  else if (currentPage === 'settings')      content.innerHTML = renderSettings();
}

// =====================
// DASHBOARD
// =====================
function renderDashboard() {
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8"><i class="fas fa-chart-line mr-3"></i>Dashboard</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 border border-blue-500">
          <div class="flex items-center justify-between">
            <div class="bg-white/20 rounded-lg p-3"><i class="fas fa-users text-3xl"></i></div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_users || 0}</p>
              <p class="text-sm text-blue-200">Total Usuários</p>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 border border-purple-500">
          <div class="flex items-center justify-between">
            <div class="bg-white/20 rounded-lg p-3"><i class="fas fa-guitar text-3xl"></i></div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_artists || 0}</p>
              <p class="text-sm text-purple-200">Artistas Ativos</p>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 border border-green-500">
          <div class="flex items-center justify-between">
            <div class="bg-white/20 rounded-lg p-3"><i class="fas fa-music text-3xl"></i></div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_songs || 0}</p>
              <p class="text-sm text-green-200">Músicas</p>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-yellow-600 to-orange-800 rounded-xl p-6 border border-yellow-500">
          <div class="flex items-center justify-between">
            <div class="bg-white/20 rounded-lg p-3"><i class="fas fa-list text-3xl"></i></div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_requests || 0}</p>
              <p class="text-sm text-yellow-200">Pedidos</p>
            </div>
          </div>
        </div>
      </div>
      ${pendingLicenses.length > 0 ? `
        <div class="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6">
          <h3 class="text-xl font-bold text-yellow-300 mb-2">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            ${pendingLicenses.length} licença(s) aguardando aprovação
          </h3>
          <button onclick="navigateTo('licenses')" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition font-semibold mt-2">
            Ver Licenças <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      ` : `
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p class="text-gray-400"><i class="fas fa-check-circle text-green-400 mr-2"></i>Nenhuma licença pendente. Sistema funcionando normalmente.</p>
        </div>
      `}
    </div>
  `;
}

// =====================
// LICENÇAS
// =====================
function renderLicenses() {
  if (pendingLicenses.length === 0) {
    return `
      <div>
        <h2 class="text-3xl font-bold mb-8"><i class="fas fa-id-card mr-3"></i>Aprovação de Licenças</h2>
        <div class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <i class="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">Nenhuma licença pendente</h3>
          <p class="text-gray-400">Todas as licenças foram processadas!</p>
        </div>
      </div>
    `;
  }

  return `
    <div>
      <h2 class="text-3xl font-bold mb-8">
        <i class="fas fa-id-card mr-3"></i>Aprovação de Licenças
        <span class="bg-red-500 text-sm px-3 py-1 rounded-full ml-3">${pendingLicenses.length}</span>
      </h2>
      <div class="space-y-4">
        ${pendingLicenses.map(license => `
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    ${(license.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">${license.full_name || 'Sem nome'}</h3>
                    <p class="text-sm text-gray-400">${license.email || ''}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-400">Nome Artístico:</span>
                    <p class="font-semibold">${license.artist_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Valor:</span>
                    <p class="font-semibold text-green-400">R$ ${license.amount ? Number(license.amount).toFixed(2) : '199.00'}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Status:</span>
                    <p class="font-semibold">
                      ${license.license_status === 'paid'
                        ? '<span class="text-yellow-400"><i class="fas fa-clock mr-1"></i>Comprovante Enviado</span>'
                        : '<span class="text-orange-400"><i class="fas fa-hourglass-half mr-1"></i>Aguardando Pagamento</span>'}
                    </p>
                  </div>
                  <div>
                    <span class="text-gray-400">Data Pagamento:</span>
                    <p class="font-semibold">${license.payment_date ? new Date(license.payment_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <!-- Ações - sempre visíveis para aprovar/rejeitar qualquer status -->
              <div class="flex flex-col gap-2 flex-shrink-0">
                <button
                  onclick="approveLicense(${license.user_id})"
                  class="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition flex items-center gap-2 font-semibold"
                >
                  <i class="fas fa-check"></i> Aprovar
                </button>
                <button
                  onclick="rejectLicense(${license.user_id})"
                  class="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition flex items-center gap-2 font-semibold"
                >
                  <i class="fas fa-times"></i> Rejeitar
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// =====================
// USUÁRIOS
// =====================
function renderUsers() {
  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold"><i class="fas fa-users mr-3"></i>Usuários (${users.length})</h2>
      </div>
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Licença</th>
                <th class="px-6 py-4 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${users.map(user => `
                <tr class="hover:bg-gray-700/50 transition">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        ${(user.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p class="font-semibold">${user.full_name}</p>
                        ${user.artist_name ? `<p class="text-xs text-gray-400">${user.artist_name}</p>` : ''}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">${user.email}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-600/20 text-red-400 border border-red-600' : 'bg-blue-600/20 text-blue-400 border border-blue-600'}">
                      ${user.role === 'admin' ? '👑 Admin' : '🎤 Artista'}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-semibold
                      ${user.license_status === 'approved' ? 'bg-green-600/20 text-green-400' :
                        user.trial_active                 ? 'bg-blue-600/20 text-blue-400' :
                        user.license_status === 'paid'     ? 'bg-yellow-600/20 text-yellow-400' :
                        user.license_status === 'rejected' ? 'bg-red-600/20 text-red-400' :
                                                             'bg-gray-600/20 text-gray-400'}">
                      ${user.license_status === 'approved' ? '✅ Aprovada' :
                        user.trial_active                 ? `🧪 Teste grátis (${user.trial_days_left ?? 0}d)` :
                        user.license_status === 'paid'     ? '⏳ Aguard. Aprovação' :
                        user.license_status === 'rejected' ? '❌ Rejeitada' : '🕐 Pendente'}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2 flex-wrap">
                      ${user.artist_slug ? `
                        <a href="/${user.artist_slug}" target="_blank"
                          class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition inline-flex items-center gap-1" title="Ver perfil como cliente">
                          <i class="fas fa-eye"></i>
                        </a>
                      ` : ''}
                      <button onclick="showSendNotificationModal(${user.id}, '${user.full_name.replace(/'/g,"\\'")}')"
                        class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition" title="Enviar notificação">
                        <i class="fas fa-bell"></i>
                      </button>
                      <button onclick="showChangePasswordModal(${user.id}, '${user.full_name.replace(/'/g,"\\'")}')"
                        class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition" title="Alterar Senha">
                        <i class="fas fa-key"></i>
                      </button>
                      ${user.role !== 'admin' ? `
                        ${user.trial_active ? `
                          <button onclick="simulateTrialExpired(${user.id}, '${user.full_name.replace(/'/g,"\\'")}')"
                            class="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition" title="Simular fim do teste">
                            <i class="fas fa-flask"></i>
                          </button>
                        ` : ''}
                        <button onclick="confirmDeleteUser(${user.id}, '${user.full_name.replace(/'/g,"\\'")}')"
                          class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition" title="Excluir">
                          <i class="fas fa-trash"></i>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =====================
// ARTISTAS
// =====================
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch(e) { return '-'; }
}


function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderArtists() {
  const list = artistsList.length > 0 ? artistsList : users.filter(u => u.role === 'artist').map(u => ({
    name: u.full_name,
    slug: u.artist_slug || '-',
    license_status: u.license_status,
    license_paid_date: u.license_paid_date || u.license_paid_at || null,
    song_count: '-',
    request_count: '-',
    email: u.email,
    created_at: u.created_at
  }));

  const rows = list.map(a => {
    const statusLabel = a.license_status === 'approved' ? '✅ Aprovado'
      : a.trial_active              ? `🧪 Teste grátis (${a.trial_days_left ?? 0}d)`
      : a.license_status === 'paid' ? '⏳ Pago'
      : a.license_status === 'pending'  ? '🕐 Pendente'
      : '🔴 ' + (a.license_status || 'N/A');
    const statusClass = a.license_status === 'approved' ? 'bg-green-600/20 text-green-400'
      : a.trial_active           ? 'bg-blue-600/20 text-blue-400'
      : a.license_status === 'paid'    ? 'bg-yellow-600/20 text-yellow-400'
      : 'bg-gray-600/20 text-gray-400';
    const slug = a.slug || '-';
    const licenseDate = formatDate(a.license_paid_date || a.license_approved_date);
    const songs = a.song_count !== undefined ? a.song_count : '-';
    const reqs  = a.request_count !== undefined ? a.request_count : '-';
    return `
      <tr class="hover:bg-gray-700/50 transition">
        <td class="px-4 py-3 font-semibold">${a.name || a.full_name || '-'}</td>
        <td class="px-4 py-3 text-sm text-gray-300 font-mono">${slug}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded text-xs font-semibold ${statusClass}">${statusLabel}</span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-300">${licenseDate}</td>
        <td class="px-4 py-3 text-center text-sm">
          <span class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded font-semibold">${songs}</span>
        </td>
        <td class="px-4 py-3 text-center text-sm">
          <span class="bg-purple-900/40 text-purple-300 px-2 py-1 rounded font-semibold">${reqs}</span>
        </td>
        <td class="px-4 py-3 text-xs text-gray-400">${formatDate(a.created_at)}</td>
        <td class="px-4 py-3">
          ${slug !== '-' ? `<button onclick="showArtistQrCode('${escapeHtml(slug)}', '${escapeHtml(a.name || a.full_name || 'Artista')}')" class="text-green-400 hover:text-green-300 text-xs mr-2"><i class="fas fa-qrcode"></i> QR Code</button>` : ''}
          ${slug !== '-' ? `<a href="/dashboard/${slug}" target="_blank" class="text-purple-400 hover:text-purple-300 text-xs mr-2"><i class="fas fa-external-link-alt"></i> Dashboard</a>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold"><i class="fas fa-guitar mr-3"></i>Artistas (${list.length})</h2>
        <a href="/admin/artists" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition font-semibold text-sm">
          <i class="fas fa-expand-alt mr-2"></i>Página Completa
        </a>
      </div>
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Nome</th>
                <th class="px-4 py-3 text-left font-semibold">Slug</th>
                <th class="px-4 py-3 text-left font-semibold">Status</th>
                <th class="px-4 py-3 text-left font-semibold">Dt. Pagamento</th>
                <th class="px-4 py-3 text-center font-semibold">Músicas</th>
                <th class="px-4 py-3 text-center font-semibold">Pedidos</th>
                <th class="px-4 py-3 text-left font-semibold">Cadastro</th>
                <th class="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${rows || '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">Nenhum artista encontrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =====================
// NOTIFICAÇÕES
// =====================
function renderNotifications() {
  const typeLabels = { info: '💬 Info', warning: '⚠️ Aviso', success: '✅ Sucesso', error: '🔴 Urgente' };
  const typeBadge  = { info: 'bg-blue-600/20 text-blue-300 border-blue-600', warning: 'bg-yellow-600/20 text-yellow-300 border-yellow-600', success: 'bg-green-600/20 text-green-300 border-green-600', error: 'bg-red-600/20 text-red-300 border-red-600' };
  return `
    <div>
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 class="text-3xl font-bold"><i class="fas fa-bell mr-3"></i>Notificações</h2>
        <div class="flex gap-3 flex-wrap">
          <button onclick="showSendNotificationModal(null, null)"
            class="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg transition font-semibold flex items-center gap-2">
            <i class="fas fa-broadcast-tower"></i> Enviar para Todos
          </button>
          <button onclick="deleteAllNotifications()"
            class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2">
            <i class="fas fa-trash"></i> Limpar Tudo
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <p class="text-3xl font-black text-purple-400">${notifications.length}</p>
          <p class="text-gray-400 text-sm mt-1">Total Enviadas</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <p class="text-3xl font-black text-yellow-400">${notifications.filter(n => !n.read_at).length}</p>
          <p class="text-gray-400 text-sm mt-1">Não Lidas</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <p class="text-3xl font-black text-green-400">${notifications.filter(n => n.read_at).length}</p>
          <p class="text-gray-400 text-sm mt-1">Lidas</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <p class="text-3xl font-black text-blue-400">${notifications.filter(n => !n.user_id).length}</p>
          <p class="text-gray-400 text-sm mt-1">Broadcasts</p>
        </div>
      </div>

      <!-- Notifications table -->
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        ${notifications.length === 0 ? `
          <div class="text-center py-16 text-gray-400">
            <i class="fas fa-bell-slash text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg">Nenhuma notificação enviada ainda.</p>
            <button onclick="showSendNotificationModal(null,null)" class="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition font-semibold">
              <i class="fas fa-paper-plane mr-2"></i>Enviar primeira notificação
            </button>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-900">
                <tr>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Destinatário</th>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Título</th>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Mensagem</th>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Tipo</th>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Status</th>
                  <th class="px-5 py-4 text-left text-sm font-semibold">Data</th>
                  <th class="px-5 py-4 text-center text-sm font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${notifications.map(n => `
                  <tr class="hover:bg-gray-700/50 transition">
                    <td class="px-5 py-3 text-sm">
                      ${n.user_id
                        ? `<span class="flex items-center gap-1"><i class="fas fa-user text-purple-400"></i> ${n.user_name || '#'+n.user_id}<br><span class="text-xs text-gray-400">${n.user_email || ''}</span></span>`
                        : `<span class="flex items-center gap-1 text-yellow-300"><i class="fas fa-broadcast-tower"></i> Todos</span>`}
                    </td>
                    <td class="px-5 py-3 font-semibold text-sm max-w-[150px] truncate">${n.title}</td>
                    <td class="px-5 py-3 text-sm text-gray-300 max-w-[200px] truncate" title="${n.message.replace(/"/g,'&quot;')}">${n.message}</td>
                    <td class="px-5 py-3">
                      <span class="px-2 py-1 rounded text-xs font-semibold border ${typeBadge[n.type] || typeBadge.info}">
                        ${typeLabels[n.type] || n.type}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      ${n.read_at
                        ? `<span class="text-green-400 text-xs"><i class="fas fa-check-double mr-1"></i>Lida</span>`
                        : `<span class="text-yellow-400 text-xs"><i class="fas fa-clock mr-1"></i>Não lida</span>`}
                    </td>
                    <td class="px-5 py-3 text-xs text-gray-400">${new Date(n.created_at).toLocaleString('pt-BR')}</td>
                    <td class="px-5 py-3 text-center">
                      <button onclick="deleteNotification(${n.id})"
                        class="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm transition" title="Excluir">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function showSendNotificationModal(userId, userName) {
  const isAll = !userId;
  const modal = document.createElement('div');
  modal.id = 'notificationModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold">
          <i class="fas fa-bell mr-2 text-purple-400"></i>
          ${isAll ? 'Enviar para Todos os Usuários' : `Notificar ${userName}`}
        </h3>
        <button onclick="closeModal('notificationModal')" class="text-gray-400 hover:text-white text-xl"><i class="fas fa-times"></i></button>
      </div>
      ${isAll ? `
        <div class="bg-yellow-900/40 border border-yellow-600/50 rounded-xl p-4 mb-5 text-sm text-yellow-200">
          <i class="fas fa-broadcast-tower mr-2"></i>
          Esta notificação será enviada para <strong>todos os artistas cadastrados</strong>.
        </div>
      ` : ''}
      <form onsubmit="sendNotification(event, ${userId || 'null'})" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Tipo</label>
          <select id="notifType" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="info">💬 Informação</option>
            <option value="success">✅ Sucesso / Novidade</option>
            <option value="warning">⚠️ Aviso</option>
            <option value="error">🔴 Urgente</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Título <span class="text-red-400">*</span></label>
          <input type="text" id="notifTitle" required maxlength="80"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Nova funcionalidade disponível">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Mensagem <span class="text-red-400">*</span></label>
          <textarea id="notifMessage" required rows="4" maxlength="500"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Escreva a mensagem completa aqui..."></textarea>
          <p class="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Link (opcional)</label>
          <input type="text" id="notifLink"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: /manage#show ou https://...">
        </div>
        <div class="flex gap-4 mt-6">
          <button type="button" onclick="closeModal('notificationModal')"
            class="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition">Cancelar</button>
          <button type="submit" id="notifSubmitBtn"
            class="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition font-semibold">
            <i class="fas fa-paper-plane mr-2"></i>${isAll ? 'Enviar para Todos' : 'Enviar Notificação'}
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

async function sendNotification(event, userId) {
  event.preventDefault();
  const btn = document.getElementById('notifSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
  try {
    const payload = {
      title:   document.getElementById('notifTitle').value.trim(),
      message: document.getElementById('notifMessage').value.trim(),
      type:    document.getElementById('notifType').value,
      link:    document.getElementById('notifLink').value.trim() || null,
    };
    if (userId) payload.user_id = userId;
    const res = await axios.post('/api/admin/notifications', payload);
    closeModal('notificationModal');
    if (res.data.sent_to === 'all') {
      showSuccess(`✅ Notificação enviada para ${res.data.count} usuários!`);
    } else {
      showSuccess('✅ Notificação enviada com sucesso!');
    }
    await loadNotifications();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao enviar notificação');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar';
  }
}

async function deleteNotification(id) {
  if (!confirm('Excluir esta notificação?')) return;
  try {
    await axios.delete(`/api/admin/notifications/${id}`);
    showSuccess('Notificação excluída.');
    await loadNotifications();
    renderPage();
  } catch(e) {
    showError('Erro ao excluir notificação');
  }
}

async function deleteAllNotifications() {
  if (!confirm('Limpar TODAS as notificações? Esta ação não pode ser desfeita.')) return;
  try {
    await axios.delete('/api/admin/notifications');
    showSuccess('Todas as notificações foram removidas.');
    await loadNotifications();
    renderPage();
  } catch(e) {
    showError('Erro ao limpar notificações');
  }
}

// =====================
// CONFIGURAÇÕES
// =====================
function renderSettings() {
  const cfg = systemConfig;
  const layout = layoutSettings;
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8"><i class="fas fa-cog mr-3"></i>Configurações do Sistema</h2>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 class="text-xl font-bold mb-5 text-purple-400">
          <i class="fas fa-palette mr-2"></i>Layout do App (logo, imagens e textos)
        </h3>
        <form onsubmit="saveLayoutConfig(event)" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Nome do App</label>
              <input id="layout_app_name" type="text" value="${escapeHtml(layout.app_name || 'TOCA ESSA')}" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="TOCA ESSA">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">URL da Logo</label>
              <input id="layout_logo_url" type="url" value="${escapeHtml(layout.logo_url || '')}" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://.../logo.png">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Cor Primária</label>
              <input id="layout_primary_color" type="color" value="${escapeHtml(layout.primary_color || '#3B82F6')}" class="w-full h-12 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Cor Secundária</label>
              <input id="layout_secondary_color" type="color" value="${escapeHtml(layout.secondary_color || '#10B981')}" class="w-full h-12 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-300">Mensagem de Boas-vindas</label>
            <input id="layout_welcome_message" type="text" value="${escapeHtml(layout.welcome_message || '')}" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Texto exibido na home">
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-300">Texto do Rodapé</label>
            <input id="layout_footer_text" type="text" value="${escapeHtml(layout.footer_text || '')}" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="© 2026 Sua marca">
          </div>

          <button type="submit" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition font-semibold">
            <i class="fas fa-save mr-2"></i>Salvar Layout
          </button>
        </form>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 class="text-xl font-bold mb-5 text-yellow-400">
          <i class="fas fa-qrcode mr-2"></i>QR Codes dos Artistas
        </h3>
        ${artistsList.length === 0 ? '<p class="text-gray-400">Nenhum artista cadastrado.</p>' : `
          <div class="grid md:grid-cols-2 gap-3">
            ${artistsList.map((artist) => {
              const slug = artist.slug || '';
              if (!slug) return '';
              return `
                <div class="bg-gray-900/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-3">
                  <div>
                    <p class="font-semibold">${escapeHtml(artist.name || artist.user_name || 'Artista')}</p>
                    <p class="text-xs text-gray-400 font-mono">/${escapeHtml(slug)}</p>
                  </div>
                  <button onclick="showArtistQrCode('${escapeHtml(slug)}', '${escapeHtml(artist.name || artist.user_name || 'Artista')}')" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
                    <i class="fas fa-qrcode mr-1"></i>Ver QR Code
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- PIX para receber licenças -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 class="text-xl font-bold mb-5 text-green-400">
          <i class="fas fa-qrcode mr-2"></i>Dados PIX para Receber Licenças
        </h3>
        <form onsubmit="savePixConfig(event)" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Chave PIX</label>
              <input id="cfg_pix_key" type="text" value="${cfg.admin_pix_key || ''}"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 04940013138">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Tipo da Chave</label>
              <select id="cfg_pix_type" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="cpf"    ${cfg.admin_pix_key_type === 'cpf'    ? 'selected' : ''}>CPF</option>
                <option value="email"  ${cfg.admin_pix_key_type === 'email'  ? 'selected' : ''}>Email</option>
                <option value="phone"  ${cfg.admin_pix_key_type === 'phone'  ? 'selected' : ''}>Telefone</option>
                <option value="random" ${cfg.admin_pix_key_type === 'random' ? 'selected' : ''}>Chave Aleatória</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Nome do Titular</label>
              <input id="cfg_pix_name" type="text" value="${cfg.admin_pix_name || ''}"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: João da Silva">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Valor da Licença (R$)</label>
              <input id="cfg_license_amount" type="number" step="0.01" value="${cfg.license_amount || '199.00'}"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="199.00">
            </div>
          </div>
          <button type="submit" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition font-semibold">
            <i class="fas fa-save mr-2"></i>Salvar Dados PIX
          </button>
        </form>
      </div>

      <!-- WhatsApp e Email de suporte -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 class="text-xl font-bold mb-5 text-blue-400">
          <i class="fas fa-headset mr-2"></i>Contato de Suporte (exibido ao cliente)
        </h3>
        <form onsubmit="saveContactConfig(event)" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">
                <i class="fab fa-whatsapp text-green-400 mr-1"></i>Número WhatsApp
              </label>
              <input id="cfg_whatsapp" type="text" value="${cfg.support_whatsapp || ''}"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="5511999999999 (com código do país, sem espaços)">
              <p class="text-xs text-gray-400 mt-1">Exemplo: 5541999999999</p>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">
                <i class="fas fa-envelope text-blue-400 mr-1"></i>Email de Suporte
              </label>
              <input id="cfg_email" type="email" value="${cfg.support_email || ''}"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="suporte@seudominio.com">
            </div>
          </div>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition font-semibold">
            <i class="fas fa-save mr-2"></i>Salvar Dados de Contato
          </button>
        </form>
      </div>

      <!-- Preview -->
      <div class="bg-gray-900/50 border border-gray-600 rounded-xl p-6">
        <h3 class="text-lg font-bold mb-3 text-gray-300">
          <i class="fas fa-eye mr-2"></i>Como aparece para o cliente na página de pagamento:
        </h3>
        <div class="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
          <p><i class="fas fa-key text-yellow-400 mr-2"></i>Chave PIX: <strong>${cfg.admin_pix_key || 'não configurado'}</strong> (${cfg.admin_pix_key_type || '-'})</p>
          <p><i class="fas fa-user text-blue-400 mr-2"></i>Titular: <strong>${cfg.admin_pix_name || 'não configurado'}</strong></p>
          <p><i class="fas fa-dollar-sign text-green-400 mr-2"></i>Valor: <strong>R$ ${cfg.license_amount || '199.00'}</strong></p>
          <p><i class="fab fa-whatsapp text-green-400 mr-2"></i>WhatsApp: <strong>${cfg.support_whatsapp || 'não configurado'}</strong></p>
          <p><i class="fas fa-envelope text-blue-400 mr-2"></i>Email: <strong>${cfg.support_email || 'não configurado'}</strong></p>
        </div>
      </div>
    </div>
  `;
}

// =====================
// SALVAR CONFIGURAÇÕES
// =====================
async function savePixConfig(event) {
  event.preventDefault();
  try {
    await Promise.all([
      axios.post('/api/admin/system-config', { key: 'admin_pix_key',      value: document.getElementById('cfg_pix_key').value }),
      axios.post('/api/admin/system-config', { key: 'admin_pix_key_type', value: document.getElementById('cfg_pix_type').value }),
      axios.post('/api/admin/system-config', { key: 'admin_pix_name',     value: document.getElementById('cfg_pix_name').value }),
      axios.post('/api/admin/system-config', { key: 'license_amount',     value: document.getElementById('cfg_license_amount').value }),
    ]);
    showSuccess('✅ Dados PIX salvos com sucesso!');
    await loadSystemConfig();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao salvar configurações PIX');
  }
}


async function saveLayoutConfig(event) {
  event.preventDefault();
  const payload = {
    app_name: document.getElementById('layout_app_name').value,
    logo_url: document.getElementById('layout_logo_url').value,
    primary_color: document.getElementById('layout_primary_color').value,
    secondary_color: document.getElementById('layout_secondary_color').value,
    welcome_message: document.getElementById('layout_welcome_message').value,
    footer_text: document.getElementById('layout_footer_text').value,
  };

  try {
    for (const [key, value] of Object.entries(payload)) {
      await axios.put(`/api/admin/settings/${key}`, { value });
    }
    showSuccess('✅ Layout salvo com sucesso!');
    await loadLayoutSettings();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao salvar layout');
  }
}

function showArtistQrCode(slug, artistName) {
  const base = window.location.origin;
  const artistUrl = `${base}/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(artistUrl)}`;

  const modal = document.createElement('div');
  modal.id = 'artistQrCodeModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold"><i class="fas fa-qrcode mr-2 text-yellow-400"></i>QR Code - ${escapeHtml(artistName)}</h3>
        <button onclick="closeModal('artistQrCodeModal')" class="text-gray-400 hover:text-white text-xl">&times;</button>
      </div>
      <div class="bg-white rounded-xl p-4 flex items-center justify-center mb-4">
        <img src="${qrUrl}" alt="QR Code ${escapeHtml(artistName)}" class="w-72 h-72 object-contain" />
      </div>
      <p class="text-xs text-gray-400 break-all mb-4">${escapeHtml(artistUrl)}</p>
      <div class="flex gap-3">
        <a href="${artistUrl}" target="_blank" class="flex-1 text-center bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition font-semibold text-sm">
          <i class="fas fa-external-link-alt mr-1"></i>Abrir Página
        </a>
        <a href="${qrUrl}" target="_blank" class="flex-1 text-center bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition font-semibold text-sm">
          <i class="fas fa-download mr-1"></i>Abrir QR
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveContactConfig(event) {
  event.preventDefault();
  try {
    await Promise.all([
      axios.post('/api/admin/system-config', { key: 'support_whatsapp', value: document.getElementById('cfg_whatsapp').value }),
      axios.post('/api/admin/system-config', { key: 'support_email',    value: document.getElementById('cfg_email').value }),
    ]);
    showSuccess('✅ Dados de contato salvos com sucesso!');
    await loadSystemConfig();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao salvar contato');
  }
}

// =====================
// MODAIS / AÇÕES
// =====================
function showChangePasswordModal(userId, userName) {
  const modal = document.createElement('div');
  modal.id = 'changePasswordModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
      <h3 class="text-2xl font-bold mb-6"><i class="fas fa-key mr-2 text-yellow-400"></i>Alterar Senha de ${userName}</h3>
      <form onsubmit="handleAdminChangePassword(event, ${userId})" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Nova Senha</label>
          <input type="password" id="adminNewPassword" required minlength="6"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Mínimo 6 caracteres">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Confirmar Senha</label>
          <input type="password" id="adminConfirmPassword" required minlength="6"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Repita a senha">
        </div>
        <div class="flex gap-4 mt-6">
          <button type="button" onclick="closeModal('changePasswordModal')"
            class="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition">Cancelar</button>
          <button type="submit"
            class="flex-1 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg transition">
            <i class="fas fa-key mr-2"></i>Alterar
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

async function handleAdminChangePassword(event, userId) {
  event.preventDefault();
  const newPassword    = document.getElementById('adminNewPassword').value;
  const confirmPassword = document.getElementById('adminConfirmPassword').value;
  if (newPassword !== confirmPassword) { showError('As senhas não coincidem'); return; }
  try {
    await axios.post(`/api/admin/users/${userId}/change-password`, { new_password: newPassword });
    showSuccess('Senha alterada com sucesso!');
    closeModal('changePasswordModal');
    await loadUsers();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao alterar senha');
  }
}


async function simulateTrialExpired(userId, userName) {
  if (!confirm(`Simular fim do teste grátis para "${userName}"?\n\nIsso vai mover o cadastro para mais de 30 dias e pode bloquear acesso até o pagamento.`)) return;
  try {
    await axios.post(`/api/admin/users/${userId}/simulate-trial-expired`);
    showSuccess('Fim do teste simulado com sucesso.');
    await Promise.allSettled([loadUsers(), loadPendingLicenses(), loadArtistsList(), loadStats()]);
    renderNavigation();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao simular fim do teste');
  }
}

function confirmDeleteUser(userId, userName) {
  if (confirm(`Tem certeza que deseja excluir "${userName}"?\n\nEsta ação não pode ser desfeita!`)) {
    deleteUser(userId);
  }
}

async function deleteUser(userId) {
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    showSuccess('Usuário excluído com sucesso!');
    await loadUsers();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao excluir usuário');
  }
}

async function approveLicense(userId) {
  if (!confirm('Confirma APROVAR esta licença? O usuário terá acesso completo ao sistema.')) return;
  try {
    await axios.post(`/api/admin/licenses/${userId}/approve`);
    showSuccess('✅ Licença aprovada! Usuário liberado.');
    await Promise.allSettled([loadPendingLicenses(), loadUsers()]);
    renderNavigation();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao aprovar licença');
  }
}

async function rejectLicense(userId) {
  const reason = prompt('Motivo da rejeição (opcional):');
  if (reason === null) return;
  if (!confirm('Confirma REJEITAR esta licença?')) return;
  try {
    await axios.post(`/api/admin/licenses/${userId}/reject`, { reason: reason || 'Sem motivo' });
    showSuccess('Licença rejeitada.');
    await Promise.allSettled([loadPendingLicenses(), loadUsers()]);
    renderNavigation();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao rejeitar licença');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.remove();
}

function showSuccess(message) {
  const t = document.createElement('div');
  t.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-[60]';
  t.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function showError(message) {
  const t = document.createElement('div');
  t.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-[60]';
  t.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

async function handleLogout() {
  try { await axios.post('/api/admin/logout'); } catch(e) {}
  localStorage.removeItem('admin_session_id');
  localStorage.removeItem('session_id');
  localStorage.removeItem('user_role');
  window.location.href = '/admin/login';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Admin Panel - Manage Users and System

let currentPage = 'dashboard';
let users = [];
let stats = {};
let pendingLicenses = [];
let systemConfig = {};

// Configure axios with credentials + localStorage session fallback
axios.defaults.withCredentials = true;
const _adminSession = localStorage.getItem('admin_session_id') || localStorage.getItem('session_id');
if (_adminSession) {
  axios.defaults.headers.common['X-Session-ID'] = _adminSession;
}

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
    loadSystemConfig()
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

// Load system config
async function loadSystemConfig() {
  try {
    const response = await axios.get('/api/admin/system-config');
    systemConfig = response.data;
  } catch (error) {
    systemConfig = {};
  }
}

// Render navigation
function renderNavigation() {
  const nav = document.getElementById('admin-nav');
  const navItems = [
    { id: 'dashboard',  icon: 'fas fa-chart-line', label: 'Dashboard' },
    { id: 'licenses',   icon: 'fas fa-id-card',    label: 'Licenças', badge: pendingLicenses.length },
    { id: 'users',      icon: 'fas fa-users',       label: 'Usuários' },
    { id: 'artists',    icon: 'fas fa-guitar',      label: 'Artistas' },
    { id: 'settings',   icon: 'fas fa-cog',         label: 'Configurações' }
  ];

  nav.innerHTML = navItems.map(item => `
    <button
      onclick="navigateTo('${item.id}')"
      class="w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${currentPage === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
    >
      <span><i class="${item.icon} mr-3"></i>${item.label}</span>
      ${item.badge ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">${item.badge}</span>` : ''}
    </button>
  `).join('');
}

// Navigate to page
async function navigateTo(page) {
  currentPage = page;
  renderNavigation();
  try {
    if (page === 'users')      await loadUsers();
    else if (page === 'dashboard') await loadStats();
    else if (page === 'licenses')  await loadPendingLicenses();
    else if (page === 'settings')  await loadSystemConfig();
  } catch(e) {}
  renderPage();
}

// Render main content
function renderPage() {
  const content = document.getElementById('admin-content');
  if      (currentPage === 'dashboard') content.innerHTML = renderDashboard();
  else if (currentPage === 'licenses')  content.innerHTML = renderLicenses();
  else if (currentPage === 'users')     content.innerHTML = renderUsers();
  else if (currentPage === 'artists')   content.innerHTML = renderArtists();
  else if (currentPage === 'settings')  content.innerHTML = renderSettings();
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
                    <span class="text-gray-400">Data Cadastro:</span>
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
                        user.license_status === 'paid'     ? 'bg-yellow-600/20 text-yellow-400' :
                        user.license_status === 'rejected' ? 'bg-red-600/20 text-red-400' :
                                                             'bg-gray-600/20 text-gray-400'}">
                      ${user.license_status === 'approved' ? '✅ Aprovada' :
                        user.license_status === 'paid'     ? '⏳ Aguard. Aprovação' :
                        user.license_status === 'rejected' ? '❌ Rejeitada' : '🕐 Pendente'}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button onclick="showChangePasswordModal(${user.id}, '${user.full_name.replace(/'/g,"\\'")}')"
                        class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition" title="Alterar Senha">
                        <i class="fas fa-key"></i>
                      </button>
                      ${user.role !== 'admin' ? `
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
function renderArtists() {
  const artists = users.filter(u => u.role === 'artist');
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8"><i class="fas fa-guitar mr-3"></i>Artistas (${artists.length})</h2>
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Nome Artístico</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Licença</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${artists.map(a => `
                <tr class="hover:bg-gray-700/50">
                  <td class="px-6 py-4 font-semibold">${a.full_name}</td>
                  <td class="px-6 py-4 text-sm text-gray-300">${a.email}</td>
                  <td class="px-6 py-4 text-sm">${a.artist_name || '-'}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-semibold
                      ${a.license_status === 'approved' ? 'bg-green-600/20 text-green-400' :
                        a.license_status === 'paid'     ? 'bg-yellow-600/20 text-yellow-400' :
                                                          'bg-gray-600/20 text-gray-400'}">
                      ${a.license_status === 'approved' ? '✅ Aprovada' :
                        a.license_status === 'paid'     ? '⏳ Aguardando' : '🕐 Pendente'}
                    </span>
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
// CONFIGURAÇÕES
// =====================
function renderSettings() {
  const cfg = systemConfig;
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8"><i class="fas fa-cog mr-3"></i>Configurações do Sistema</h2>

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

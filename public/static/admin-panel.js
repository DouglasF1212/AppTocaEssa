// Admin Panel - Manage Users and System

let currentPage = 'dashboard';
let users = [];
let stats = {};
let pendingLicenses = [];

// Initialize
async function init() {
  try {
    // Testa autenticação primeiro
    await axios.get('/api/admin/stats');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      window.location.href = '/admin/login';
      return;
    }
  }
  
  // Carrega dados em paralelo, sem travar se um falhar
  await Promise.allSettled([
    loadStats(),
    loadUsers(),
    loadPendingLicenses()
  ]);
  
  renderNavigation();
  renderPage();
}

// Load statistics
async function loadStats() {
  try {
    const response = await axios.get('/api/admin/stats');
    stats = response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
    stats = { total_users: 0, total_artists: 0, total_songs: 0, total_requests: 0 };
  }
}

// Load users
async function loadUsers() {
  try {
    const response = await axios.get('/api/admin/users');
    users = response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar usuários:', error);
    users = [];
  }
}

// Load pending licenses
async function loadPendingLicenses() {
  try {
    const response = await axios.get('/api/admin/licenses/pending');
    pendingLicenses = response.data;
    console.log('📋 Licenças pendentes:', pendingLicenses);
  } catch (error) {
    console.error('❌ Erro ao carregar licenças pendentes:', error);
    pendingLicenses = [];
  }
}

// Render navigation
function renderNavigation() {
  const nav = document.getElementById('admin-nav');
  const navItems = [
    { id: 'dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { id: 'licenses', icon: 'fas fa-id-card', label: 'Licenças', badge: pendingLicenses.length },
    { id: 'users', icon: 'fas fa-users', label: 'Usuários' },
    { id: 'artists', icon: 'fas fa-guitar', label: 'Artistas' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Configurações' }
  ];
  
  nav.innerHTML = navItems.map(item => `
    <button 
      onclick="navigateTo('${item.id}')"
      class="w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${currentPage === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
    >
      <span>
        <i class="${item.icon} mr-3"></i>
        ${item.label}
      </span>
      ${item.badge ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">${item.badge}</span>` : ''}
    </button>
  `).join('');
}

// Navigate to page
async function navigateTo(page) {
  currentPage = page;
  renderNavigation();
  
  try {
    if (page === 'users') {
      await loadUsers();
    } else if (page === 'dashboard') {
      await loadStats();
    } else if (page === 'licenses') {
      await loadPendingLicenses();
    }
  } catch(e) {
    console.error('Erro ao navegar:', e);
  }
  
  renderPage();
}

// Render main content
function renderPage() {
  const content = document.getElementById('admin-content');
  
  if (currentPage === 'dashboard') {
    content.innerHTML = renderDashboard();
  } else if (currentPage === 'licenses') {
    content.innerHTML = renderLicenses();
  } else if (currentPage === 'users') {
    content.innerHTML = renderUsers();
  } else if (currentPage === 'artists') {
    content.innerHTML = renderArtists();
  } else if (currentPage === 'settings') {
    content.innerHTML = renderSettings();
  }
}

// Render Dashboard
function renderDashboard() {
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8">
        <i class="fas fa-chart-line mr-3"></i>
        Dashboard
      </h2>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 border border-blue-500">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 rounded-lg p-3">
              <i class="fas fa-users text-3xl"></i>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_users || 0}</p>
              <p class="text-sm text-blue-200">Total de Usuários</p>
            </div>
          </div>
        </div>
        
        <!-- Total Artists -->
        <div class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 border border-purple-500">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 rounded-lg p-3">
              <i class="fas fa-guitar text-3xl"></i>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_artists || 0}</p>
              <p class="text-sm text-purple-200">Artistas Ativos</p>
            </div>
          </div>
        </div>
        
        <!-- Total Songs -->
        <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 border border-green-500">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 rounded-lg p-3">
              <i class="fas fa-music text-3xl"></i>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_songs || 0}</p>
              <p class="text-sm text-green-200">Músicas Cadastradas</p>
            </div>
          </div>
        </div>
        
        <!-- Total Requests -->
        <div class="bg-gradient-to-br from-yellow-600 to-orange-800 rounded-xl p-6 border border-yellow-500">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 rounded-lg p-3">
              <i class="fas fa-list text-3xl"></i>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold">${stats.total_requests || 0}</p>
              <p class="text-sm text-yellow-200">Pedidos de Música</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 class="text-xl font-bold mb-4">
          <i class="fas fa-clock mr-2"></i>
          Atividade Recente
        </h3>
        <p class="text-gray-400">Sistema funcionando normalmente</p>
      </div>
    </div>
  `;
}

// Render Licenses (Pending Approvals)
function renderLicenses() {
  if (pendingLicenses.length === 0) {
    return `
      <div>
        <h2 class="text-3xl font-bold mb-8">
          <i class="fas fa-id-card mr-3"></i>
          Aprovação de Licenças
        </h2>
        
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
        <i class="fas fa-id-card mr-3"></i>
        Aprovação de Licenças
        <span class="bg-red-500 text-sm px-3 py-1 rounded-full ml-3">${pendingLicenses.length}</span>
      </h2>
      
      <div class="space-y-4">
        ${pendingLicenses.map(license => `
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-start justify-between">
              <!-- User Info -->
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                    ${license.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">${license.full_name}</h3>
                    <p class="text-sm text-gray-400">${license.email}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-400">Nome Artístico:</span>
                    <p class="font-semibold">${license.artist_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Valor:</span>
                    <p class="font-semibold text-green-400">R$ ${license.amount ? license.amount.toFixed(2) : '199.00'}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Status:</span>
                    <p class="font-semibold">
                      ${license.license_status === 'paid' ? 
                        '<span class="text-yellow-400"><i class="fas fa-clock mr-1"></i>Aguardando Aprovação</span>' : 
                        '<span class="text-orange-400"><i class="fas fa-hourglass-half mr-1"></i>Pendente de Pagamento</span>'}
                    </p>
                  </div>
                  <div>
                    <span class="text-gray-400">Data de Pagamento:</span>
                    <p class="font-semibold">${license.license_paid_date ? new Date(license.license_paid_date).toLocaleDateString('pt-BR') : 'Ainda não pago'}</p>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex gap-2 ml-4">
                ${license.license_status === 'paid' ? `
                  <button 
                    onclick="approveLicense(${license.user_id})"
                    class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
                    title="Aprovar licença"
                  >
                    <i class="fas fa-check"></i>
                    Aprovar
                  </button>
                  <button 
                    onclick="rejectLicense(${license.user_id})"
                    class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
                    title="Rejeitar licença"
                  >
                    <i class="fas fa-times"></i>
                    Rejeitar
                  </button>
                ` : `
                  <button 
                    class="bg-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
                    disabled
                    title="Usuário ainda não realizou o pagamento"
                  >
                    <i class="fas fa-hourglass-half mr-2"></i>
                    Aguardando Pagamento
                  </button>
                `}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Render Users
function renderUsers() {
  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold">
          <i class="fas fa-users mr-3"></i>
          Gerenciar Usuários (${users.length})
        </h2>
        <button 
          onclick="showCreateUserModal()"
          class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
        >
          <i class="fas fa-plus mr-2"></i>
          Criar Usuário
        </button>
      </div>
      
      <!-- Users Table -->
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold">ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Criado em</th>
                <th class="px-6 py-4 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${users.map(user => `
                <tr class="hover:bg-gray-700/50 transition">
                  <td class="px-6 py-4 text-sm">${user.id}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                        ${user.full_name.charAt(0).toUpperCase()}
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
                  <td class="px-6 py-4 text-sm text-gray-400">
                    ${new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        onclick="showChangePasswordModal(${user.id}, '${user.full_name}')"
                        class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition"
                        title="Alterar Senha"
                      >
                        <i class="fas fa-key"></i>
                      </button>
                      <button 
                        onclick="showEditUserModal(${user.id})"
                        class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      ${user.role !== 'admin' ? `
                        <button 
                          onclick="confirmDeleteUser(${user.id}, '${user.full_name}')"
                          class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                          title="Excluir"
                        >
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

// Render Artists (placeholder)
function renderArtists() {
  const artists = users.filter(u => u.role === 'artist');
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8">
        <i class="fas fa-guitar mr-3"></i>
        Artistas (${artists.length})
      </h2>
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p class="text-gray-400">Lista de artistas aparecerá aqui</p>
      </div>
    </div>
  `;
}

// Render Settings (placeholder)
function renderSettings() {
  return `
    <div>
      <h2 class="text-3xl font-bold mb-8">
        <i class="fas fa-cog mr-3"></i>
        Configurações do Sistema
      </h2>
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p class="text-gray-400">Configurações do sistema aparecerão aqui</p>
      </div>
    </div>
  `;
}

// Show change password modal
function showChangePasswordModal(userId, userName) {
  const modal = document.createElement('div');
  modal.id = 'changePasswordModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
      <h3 class="text-2xl font-bold mb-6">
        <i class="fas fa-key mr-2 text-yellow-400"></i>
        Alterar Senha de ${userName}
      </h3>
      
      <form onsubmit="handleAdminChangePassword(event, ${userId})" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Nova Senha</label>
          <input 
            type="password"
            id="adminNewPassword"
            required
            minlength="6"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Digite a nova senha (mínimo 6 caracteres)"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2">Confirmar Nova Senha</label>
          <input 
            type="password"
            id="adminConfirmPassword"
            required
            minlength="6"
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Digite novamente a nova senha"
          />
        </div>
        
        <div class="flex gap-4 mt-6">
          <button 
            type="button"
            onclick="closeModal('changePasswordModal')"
            class="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="flex-1 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg transition"
          >
            <i class="fas fa-key mr-2"></i>
            Alterar Senha
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Handle admin change password
async function handleAdminChangePassword(event, userId) {
  event.preventDefault();
  
  const newPassword = document.getElementById('adminNewPassword').value;
  const confirmPassword = document.getElementById('adminConfirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    showError('As senhas não coincidem');
    return;
  }
  
  if (newPassword.length < 6) {
    showError('A senha deve ter no mínimo 6 caracteres');
    return;
  }
  
  try {
    await axios.post(`/api/admin/users/${userId}/change-password`, {
      new_password: newPassword
    });
    
    showSuccess('Senha alterada com sucesso!');
    closeModal('changePasswordModal');
    await loadUsers();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao alterar senha');
  }
}

// Confirm delete user
function confirmDeleteUser(userId, userName) {
  if (confirm(`Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita!`)) {
    deleteUser(userId);
  }
}

// Delete user
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

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-[60]';
  toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Show error message
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-[60]';
  toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Logout
async function handleLogout() {
  try {
    await axios.post('/api/admin/logout');
    window.location.href = '/admin/login';
  } catch (error) {
    window.location.href = '/admin/login';
  }
}

// Approve license
async function approveLicense(userId) {
  if (!confirm('Tem certeza que deseja APROVAR esta licença?')) {
    return;
  }
  
  try {
    await axios.post(`/api/admin/licenses/${userId}/approve`);
    showSuccess('✅ Licença aprovada com sucesso!');
    await loadPendingLicenses();
    renderNavigation();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao aprovar licença');
  }
}

// Reject license
async function rejectLicense(userId) {
  const reason = prompt('Motivo da rejeição (opcional):');
  
  if (reason === null) {
    return; // User cancelled
  }
  
  if (!confirm('Tem certeza que deseja REJEITAR esta licença?')) {
    return;
  }
  
  try {
    await axios.post(`/api/admin/licenses/${userId}/reject`, {
      reason: reason || 'Sem motivo especificado'
    });
    showSuccess('❌ Licença rejeitada');
    await loadPendingLicenses();
    renderNavigation();
    renderPage();
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao rejeitar licença');
  }
}

// Initialize on page load - chamado pelo HTML ou automaticamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

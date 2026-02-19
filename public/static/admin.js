// ======================
// TOCA ESSA - Admin Panel
// ======================

let currentPage = 'dashboard'; // dashboard, settings, artists, bank
let allArtists = [];

// Inicialização
async function initAdminPanel() {
    await loadDashboard();
    renderNavigation();
}

// ======================
// Navigation
// ======================

function renderNavigation() {
    const navItems = [
        { id: 'dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
        { id: 'artists', icon: 'fas fa-users', label: 'Artistas' },
        { id: 'settings', icon: 'fas fa-palette', label: 'Layout' },
        { id: 'bank', icon: 'fas fa-university', label: 'Conta Bancária' }
    ];

    const navHTML = navItems.map(item => `
        <button 
            onclick="navigateTo('${item.id}')" 
            class="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition ${currentPage === item.id ? 'bg-white/20' : ''}"
        >
            <i class="${item.icon} mr-3"></i>
            <span>${item.label}</span>
        </button>
    `).join('');

    document.getElementById('admin-nav').innerHTML = navHTML;
}

async function navigateTo(page) {
    currentPage = page;
    renderNavigation();
    
    switch (page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'artists':
            await loadArtists();
            break;
        case 'settings':
            await loadSettings();
            break;
        case 'bank':
            await loadBankAccount();
            break;
    }
}

// ======================
// Dashboard
// ======================

async function loadDashboard() {
    try {
        const response = await axios.get('/api/admin/stats');
        const stats = response.data;
        
        document.getElementById('admin-content').innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-8 text-white">
                    <i class="fas fa-chart-line mr-3"></i>
                    Dashboard
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Total Artistas -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Artistas Ativos</p>
                                <p class="text-4xl font-bold text-white">${stats.total_artists}</p>
                            </div>
                            <div class="bg-blue-500/20 p-4 rounded-lg">
                                <i class="fas fa-users text-3xl text-blue-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total Músicas -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Total de Músicas</p>
                                <p class="text-4xl font-bold text-white">${stats.total_songs}</p>
                            </div>
                            <div class="bg-green-500/20 p-4 rounded-lg">
                                <i class="fas fa-music text-3xl text-green-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total Pedidos -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Total de Pedidos</p>
                                <p class="text-4xl font-bold text-white">${stats.total_requests}</p>
                            </div>
                            <div class="bg-purple-500/20 p-4 rounded-lg">
                                <i class="fas fa-list text-3xl text-purple-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total Gorjetas -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Total Gorjetas</p>
                                <p class="text-4xl font-bold text-white">R$ ${stats.total_tips.toFixed(2)}</p>
                            </div>
                            <div class="bg-yellow-500/20 p-4 rounded-lg">
                                <i class="fas fa-hand-holding-usd text-3xl text-yellow-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Receita Mensal -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Receita Mensal</p>
                                <p class="text-4xl font-bold text-white">R$ ${stats.monthly_revenue.toFixed(2)}</p>
                            </div>
                            <div class="bg-green-500/20 p-4 rounded-lg">
                                <i class="fas fa-dollar-sign text-3xl text-green-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Assinatura Mensal -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-300 text-sm mb-1">Plano Mensal</p>
                                <p class="text-4xl font-bold text-white">R$ 59,90</p>
                            </div>
                            <div class="bg-indigo-500/20 p-4 rounded-lg">
                                <i class="fas fa-credit-card text-3xl text-indigo-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showError('Erro ao carregar dashboard: ' + (error.response?.data?.error || error.message));
    }
}

// ======================
// Artists Management
// ======================

async function loadArtists() {
    try {
        const response = await axios.get('/api/admin/artists');
        allArtists = response.data;
        renderArtistsList();
    } catch (error) {
        showError('Erro ao carregar artistas: ' + (error.response?.data?.error || error.message));
    }
}

function renderArtistsList() {
    const artistsHTML = allArtists.map(artist => `
        <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                    <img src="${artist.photo_url || 'https://via.placeholder.com/60'}" 
                         alt="${artist.name}" 
                         class="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white/20">
                    <div>
                        <h3 class="text-xl font-bold text-white">${artist.name}</h3>
                        <p class="text-gray-300 text-sm">@${artist.slug}</p>
                        <p class="text-gray-400 text-xs">${artist.email}</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${artist.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
                    ${artist.active ? 'Ativo' : 'Inativo'}
                </span>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4 text-center">
                <div class="bg-white/5 p-3 rounded-lg">
                    <p class="text-2xl font-bold text-white">${artist.song_count || 0}</p>
                    <p class="text-xs text-gray-400">Músicas</p>
                </div>
                <div class="bg-white/5 p-3 rounded-lg">
                    <p class="text-2xl font-bold text-white">${artist.request_count || 0}</p>
                    <p class="text-xs text-gray-400">Pedidos</p>
                </div>
                <div class="bg-white/5 p-3 rounded-lg">
                    <p class="text-2xl font-bold text-white">R$ ${(artist.total_tips || 0).toFixed(2)}</p>
                    <p class="text-xs text-gray-400">Gorjetas</p>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button onclick="editArtist(${artist.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    <i class="fas fa-edit mr-2"></i>
                    Editar
                </button>
                <button onclick="deleteArtist(${artist.id}, '${artist.name}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                    <i class="fas fa-trash mr-2"></i>
                    Excluir
                </button>
            </div>
        </div>
    `).join('');

    document.getElementById('admin-content').innerHTML = `
        <div>
            <h2 class="text-3xl font-bold mb-8 text-white">
                <i class="fas fa-users mr-3"></i>
                Gerenciar Artistas
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${artistsHTML || '<p class="text-gray-400 col-span-2">Nenhum artista cadastrado.</p>'}
            </div>
        </div>
    `;
}

async function editArtist(artistId) {
    try {
        const response = await axios.get(`/api/admin/artists/${artistId}`);
        const artist = response.data;
        
        document.getElementById('admin-content').innerHTML = `
            <div class="max-w-2xl">
                <h2 class="text-3xl font-bold mb-8 text-white">
                    <i class="fas fa-edit mr-3"></i>
                    Editar Artista
                </h2>
                
                <form id="editArtistForm" class="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">
                            <i class="fas fa-user mr-2"></i>
                            Nome do Artista
                        </label>
                        <input type="text" id="artist_name" value="${artist.name}" required
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">
                            <i class="fas fa-at mr-2"></i>
                            Slug (URL)
                        </label>
                        <input type="text" id="artist_slug" value="${artist.slug}" required
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        <p class="text-xs text-gray-400 mt-1">URL: /${artist.slug}</p>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">
                            <i class="fas fa-align-left mr-2"></i>
                            Biografia
                        </label>
                        <textarea id="artist_bio" rows="3"
                                  class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">${artist.bio || ''}</textarea>
                    </div>
                    
                    <div class="mb-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="artist_active" ${artist.active ? 'checked' : ''}
                                   class="mr-3 w-5 h-5">
                            <span class="text-white">Perfil ativo</span>
                        </label>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="button" onclick="navigateTo('artists')" 
                                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('editArtistForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('artist_name').value,
                slug: document.getElementById('artist_slug').value,
                bio: document.getElementById('artist_bio').value,
                active: document.getElementById('artist_active').checked
            };
            
            try {
                await axios.put(`/api/admin/artists/${artistId}`, data);
                showSuccess('Artista atualizado com sucesso!');
                setTimeout(() => navigateTo('artists'), 1500);
            } catch (error) {
                showError('Erro ao atualizar artista: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        showError('Erro ao carregar artista: ' + (error.response?.data?.error || error.message));
    }
}

async function deleteArtist(artistId, artistName) {
    if (!confirm(`Tem certeza que deseja excluir o artista "${artistName}"?\n\nTodos os dados relacionados (músicas, pedidos, gorjetas) serão permanentemente excluídos.`)) {
        return;
    }
    
    try {
        await axios.delete(`/api/admin/artists/${artistId}`);
        showSuccess('Artista excluído com sucesso!');
        await loadArtists();
    } catch (error) {
        showError('Erro ao excluir artista: ' + (error.response?.data?.error || error.message));
    }
}

// ======================
// Settings / Layout
// ======================

async function loadSettings() {
    try {
        const response = await axios.get('/api/admin/settings');
        const settings = response.data;
        
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.setting_key] = s.setting_value;
        });
        
        document.getElementById('admin-content').innerHTML = `
            <div class="max-w-3xl">
                <h2 class="text-3xl font-bold mb-8 text-white">
                    <i class="fas fa-palette mr-3"></i>
                    Configurações de Layout
                </h2>
                
                <form id="settingsForm" class="space-y-6">
                    <!-- Nome do App -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <label class="block text-gray-300 mb-3 font-bold">
                            <i class="fas fa-signature mr-2"></i>
                            Nome do Aplicativo
                        </label>
                        <input type="text" id="app_name" value="${settingsMap.app_name || 'TOCA ESSA'}"
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    </div>
                    
                    <!-- Cores -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <h3 class="text-xl font-bold text-white mb-4">
                            <i class="fas fa-palette mr-2"></i>
                            Cores do Tema
                        </h3>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-300 mb-2">Cor Primária</label>
                                <div class="flex gap-2">
                                    <input type="color" id="primary_color" value="${settingsMap.primary_color || '#3B82F6'}"
                                           class="w-16 h-12 rounded cursor-pointer">
                                    <input type="text" value="${settingsMap.primary_color || '#3B82F6'}" readonly
                                           class="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Cor Secundária</label>
                                <div class="flex gap-2">
                                    <input type="color" id="secondary_color" value="${settingsMap.secondary_color || '#10B981'}"
                                           class="w-16 h-12 rounded cursor-pointer">
                                    <input type="text" value="${settingsMap.secondary_color || '#10B981'}" readonly
                                           class="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Textos -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <h3 class="text-xl font-bold text-white mb-4">
                            <i class="fas fa-align-left mr-2"></i>
                            Textos
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-300 mb-2">Mensagem de Boas-Vindas</label>
                                <input type="text" id="welcome_message" value="${settingsMap.welcome_message || ''}"
                                       class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Texto do Rodapé</label>
                                <input type="text" id="footer_text" value="${settingsMap.footer_text || ''}"
                                       class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Configurações de Gorjeta -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <h3 class="text-xl font-bold text-white mb-4">
                            <i class="fas fa-hand-holding-usd mr-2"></i>
                            Sistema de Gorjetas
                        </h3>
                        
                        <div class="space-y-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="enable_tips" ${settingsMap.enable_tips === 'true' ? 'checked' : ''}
                                       class="mr-3 w-5 h-5">
                                <span class="text-white">Habilitar sistema de gorjetas</span>
                            </label>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Valor Mínimo de Gorjeta (R$)</label>
                                <input type="number" id="min_tip_amount" value="${settingsMap.min_tip_amount || 5}" min="1" step="0.50"
                                       class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preço da Assinatura -->
                    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
                        <label class="block text-gray-300 mb-3 font-bold">
                            <i class="fas fa-dollar-sign mr-2"></i>
                            Preço da Assinatura Mensal (R$)
                        </label>
                        <input type="number" id="subscription_price" value="${settingsMap.subscription_price || 59.90}" min="1" step="0.10"
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    </div>
                    
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        <i class="fas fa-save mr-2"></i>
                        Salvar Configurações
                    </button>
                </form>
            </div>
        `;
        
        document.getElementById('settingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings();
        });
    } catch (error) {
        showError('Erro ao carregar configurações: ' + (error.response?.data?.error || error.message));
    }
}

async function saveSettings() {
    const settingsData = {
        app_name: document.getElementById('app_name').value,
        primary_color: document.getElementById('primary_color').value,
        secondary_color: document.getElementById('secondary_color').value,
        welcome_message: document.getElementById('welcome_message').value,
        footer_text: document.getElementById('footer_text').value,
        enable_tips: document.getElementById('enable_tips').checked ? 'true' : 'false',
        min_tip_amount: document.getElementById('min_tip_amount').value,
        subscription_price: document.getElementById('subscription_price').value
    };
    
    try {
        for (const [key, value] of Object.entries(settingsData)) {
            await axios.put(`/api/admin/settings/${key}`, { value });
        }
        
        showSuccess('Configurações salvas com sucesso!');
    } catch (error) {
        showError('Erro ao salvar configurações: ' + (error.response?.data?.error || error.message));
    }
}

// ======================
// Bank Account
// ======================

async function loadBankAccount() {
    try {
        const response = await axios.get('/api/admin/bank-account');
        const account = response.data;
        
        document.getElementById('admin-content').innerHTML = `
            <div class="max-w-2xl">
                <h2 class="text-3xl font-bold mb-8 text-white">
                    <i class="fas fa-university mr-3"></i>
                    Conta para Receber Assinaturas
                </h2>
                
                <form id="bankAccountForm" class="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-3 font-bold">Tipo de Conta</label>
                        <select id="account_type" onchange="toggleBankFields()"
                                class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="pix" ${account.account_type === 'pix' ? 'selected' : ''}>PIX</option>
                            <option value="bank_transfer" ${account.account_type === 'bank_transfer' ? 'selected' : ''}>Transferência Bancária</option>
                        </select>
                    </div>
                    
                    <!-- PIX Fields -->
                    <div id="pix_fields" class="space-y-4 ${account.account_type === 'pix' ? '' : 'hidden'}">
                        <div>
                            <label class="block text-gray-300 mb-2">
                                <i class="fas fa-key mr-2"></i>
                                Chave PIX
                            </label>
                            <input type="text" id="pix_key" value="${account.pix_key || ''}"
                                   class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Tipo de Chave</label>
                            <select id="pix_type"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="email" ${account.pix_type === 'email' ? 'selected' : ''}>Email</option>
                                <option value="phone" ${account.pix_type === 'phone' ? 'selected' : ''}>Telefone</option>
                                <option value="cpf" ${account.pix_type === 'cpf' ? 'selected' : ''}>CPF</option>
                                <option value="cnpj" ${account.pix_type === 'cnpj' ? 'selected' : ''}>CNPJ</option>
                                <option value="random" ${account.pix_type === 'random' ? 'selected' : ''}>Chave Aleatória</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Bank Transfer Fields -->
                    <div id="bank_fields" class="space-y-4 ${account.account_type === 'bank_transfer' ? '' : 'hidden'}">
                        <div>
                            <label class="block text-gray-300 mb-2">
                                <i class="fas fa-university mr-2"></i>
                                Nome do Banco
                            </label>
                            <input type="text" id="bank_name" value="${account.bank_name || ''}"
                                   class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-300 mb-2">Agência</label>
                                <input type="text" id="agency" value="${account.agency || ''}"
                                       class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Número da Conta</label>
                                <input type="text" id="account_number" value="${account.account_number || ''}"
                                       class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Titular da Conta</label>
                            <input type="text" id="account_holder" value="${account.account_holder || ''}"
                                   class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition font-bold text-lg mt-6">
                        <i class="fas fa-save mr-2"></i>
                        Salvar Conta Bancária
                    </button>
                </form>
            </div>
        `;
        
        document.getElementById('bankAccountForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveBankAccount();
        });
    } catch (error) {
        showError('Erro ao carregar conta bancária: ' + (error.response?.data?.error || error.message));
    }
}

function toggleBankFields() {
    const accountType = document.getElementById('account_type').value;
    document.getElementById('pix_fields').classList.toggle('hidden', accountType !== 'pix');
    document.getElementById('bank_fields').classList.toggle('hidden', accountType !== 'bank_transfer');
}

async function saveBankAccount() {
    const accountType = document.getElementById('account_type').value;
    
    const data = {
        account_type: accountType,
        pix_key: accountType === 'pix' ? document.getElementById('pix_key').value : null,
        pix_type: accountType === 'pix' ? document.getElementById('pix_type').value : null,
        bank_name: accountType === 'bank_transfer' ? document.getElementById('bank_name').value : null,
        agency: accountType === 'bank_transfer' ? document.getElementById('agency').value : null,
        account_number: accountType === 'bank_transfer' ? document.getElementById('account_number').value : null,
        account_holder: accountType === 'bank_transfer' ? document.getElementById('account_holder').value : null
    };
    
    try {
        await axios.put('/api/admin/bank-account', data);
        showSuccess('Conta bancária salva com sucesso!');
    } catch (error) {
        showError('Erro ao salvar conta bancária: ' + (error.response?.data?.error || error.message));
    }
}

// ======================
// Utility Functions
// ======================

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Auto-start
window.addEventListener('DOMContentLoaded', initAdminPanel);

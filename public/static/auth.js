// Authentication Pages - Login & Register

// Render Login Page
function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            TOCA ESSA
          </h1>
          <p class="text-xl text-gray-300">Área do Artista</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">
            <i class="fas fa-sign-in-alt mr-2"></i>
            Entrar
          </h2>
          
          <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                required
                class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="seu@email.com"
              >
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-2">Senha</label>
              <input 
                type="password" 
                id="password" 
                required
                class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="********"
              >
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>
              Entrar
            </button>
          </form>
          
          <div class="mt-4 text-center">
            <a 
              href="#" 
              onclick="showForgotPasswordModal(); return false;" 
              class="text-sm text-blue-400 hover:text-blue-300"
            >
              <i class="fas fa-question-circle mr-1"></i>
              Esqueci minha senha
            </a>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-gray-300">
              Não tem uma conta?
              <a href="/register" class="text-yellow-400 hover:text-yellow-300 font-semibold">
                Cadastre-se aqui
              </a>
            </p>
          </div>
          
          <div class="mt-6 text-center">
            <a href="/" class="text-gray-400 hover:text-gray-300">
              <i class="fas fa-arrow-left mr-2"></i>
              Voltar para início
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Register Page
function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            TOCA ESSA
          </h1>
          <p class="text-xl text-gray-300">Cadastro de Artista</p>
          <div class="mt-4 bg-green-600/20 border border-green-500 rounded-lg p-4">
            <p class="text-lg font-bold text-green-300">
              <i class="fas fa-crown mr-2"></i>
              Licença Vitalícia: R$ 199,00
            </p>
            <p class="text-sm text-gray-300 mt-1">Pagamento único • Sem mensalidades • Acesso para sempre</p>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">
            <i class="fas fa-user-plus mr-2"></i>
            Criar Conta
          </h2>
          
          <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-4">
            <!-- Personal Info -->
            <div class="border-b border-gray-600 pb-4">
              <h3 class="text-lg font-bold mb-3">
                <i class="fas fa-user mr-2"></i>
                Dados Pessoais
              </h3>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-semibold mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    id="full_name" 
                    required
                    class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="João Silva"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2">Nome Artístico *</label>
                  <input 
                    type="text" 
                    id="artist_name" 
                    required
                    class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Como você quer ser chamado"
                  >
                  <p class="text-xs text-gray-400 mt-1">Este nome aparecerá para o público</p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="seu@email.com"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2">Senha *</label>
                  <input 
                    type="password" 
                    id="password" 
                    required
                    minlength="6"
                    class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Mínimo 6 caracteres"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2">Bio (opcional)</label>
                  <textarea 
                    id="bio" 
                    rows="2"
                    class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Conte um pouco sobre você e seu estilo musical"
                  ></textarea>
                  <p class="text-xs text-gray-400 mt-1">
                    Você poderá adicionar sua foto depois, no seu perfil
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Payment Info -->
            <div class="pt-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-xl border border-green-400/30">
              <div class="flex items-start gap-4">
                <div class="text-4xl">💰</div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2 text-green-300">
                    <i class="fas fa-check-circle mr-2"></i>
                    Licença Vitalícia
                  </h3>
                  <p class="text-white text-lg font-semibold mb-2">
                    Apenas R$ 199,00 - Pagamento único
                  </p>
                  <ul class="text-sm text-gray-200 space-y-2">
                    <li><i class="fas fa-check text-green-400 mr-2"></i>Acesso ilimitado para sempre</li>
                    <li><i class="fas fa-check text-green-400 mr-2"></i>Sem mensalidades</li>
                    <li><i class="fas fa-check text-green-400 mr-2"></i>QR Code personalizado</li>
                    <li><i class="fas fa-check text-green-400 mr-2"></i>Receba gorjetas ilimitadas</li>
                    <li><i class="fas fa-check text-green-400 mr-2"></i>Gestão completa de repertório</li>
                  </ul>
                  <p class="text-xs text-yellow-300 mt-4">
                    <i class="fas fa-info-circle mr-1"></i>
                    Após criar sua conta, você receberá instruções para pagamento
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              <i class="fas fa-user-plus mr-2"></i>
              Criar Conta
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-gray-300">
              Já tem uma conta?
              <a href="/login" class="text-yellow-400 hover:text-yellow-300 font-semibold">
                Entre aqui
              </a>
            </p>
          </div>
          
          <div class="mt-6 text-center">
            <a href="/" class="text-gray-400 hover:text-gray-300">
              <i class="fas fa-arrow-left mr-2"></i>
              Voltar para início
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = event.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
  
  try {
    const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    
    if (response.data.success) {
      const user = response.data.user;
      const sid = response.data.session_id;

      // Salva session_id em múltiplos storages para máxima compatibilidade mobile
      if (sid) {
        try { localStorage.setItem('session_id', sid); } catch(e) {}
        try { sessionStorage.setItem('session_id', sid); } catch(e) {}
        // Cookie manual como último fallback
        document.cookie = `session_id=${sid}; path=/; max-age=${30*24*3600}; secure; samesite=None`;
      }
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('license_status', user.license_status);

      // Redireciona imediatamente sem setTimeout
      if (user.role === 'admin') {
        window.location.replace('/admin/panel');
        return;
      }
      if (user.license_status === 'approved') {
        window.location.replace('/manage');
        return;
      }
      window.location.replace('/license-payment');
    }
  } catch (error) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar'; }
    showError(error.response?.data?.error || 'Erro ao fazer login');
  }
}

// Format card number
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formattedValue;
}

// Handle Register
async function handleRegister(event) {
  event.preventDefault();
  
  const full_name = document.getElementById('full_name').value;
  const artist_name = document.getElementById('artist_name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const bio = document.getElementById('bio').value;
  
  try {
    const response = await axios.post('/api/auth/register', {
      full_name,
      artist_name,
      email,
      password,
      bio
    });
    
    if (response.data.success) {
      if (response.data.payment_required) {
        showSuccess('Conta criada! Redirecionando para pagamento da licença...');
        // Armazena credenciais no sessionStorage para login automático na tela de pagamento
        sessionStorage.setItem('pending_email', email);
        sessionStorage.setItem('pending_password', password);
        setTimeout(() => {
          window.location.href = '/license-payment';
        }, 2000);
      } else {
        showSuccess('Conta criada com sucesso! Faça login para continuar.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao criar conta');
  }
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
  }, 4000);
}

// Show forgot password modal
function showForgotPasswordModal() {
  const modal = document.createElement('div');
  modal.id = 'forgotPasswordModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative">
      <button 
        onclick="closeForgotPasswordModal()" 
        class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
      >
        <i class="fas fa-times"></i>
      </button>
      
      <h3 class="text-2xl font-bold mb-4">
        <i class="fas fa-key mr-2 text-yellow-400"></i>
        Esqueci Minha Senha
      </h3>
      
      <p class="text-gray-300 mb-6">
        Entre em contato com o suporte para recuperar sua senha:
      </p>
      
      <div class="space-y-4 mb-6">
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p class="text-sm text-gray-400 mb-2">
            <i class="fas fa-envelope mr-2"></i>
            Email de Suporte
          </p>
          <a href="mailto:suporte@tocaessa.com" class="text-blue-400 hover:text-blue-300 font-semibold">
            suporte@tocaessa.com
          </a>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p class="text-sm text-gray-400 mb-2">
            <i class="fas fa-whatsapp mr-2"></i>
            WhatsApp
          </p>
          <a href="https://wa.me/5511999999999" target="_blank" class="text-green-400 hover:text-green-300 font-semibold">
            (11) 99999-9999
          </a>
        </div>
      </div>
      
      <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <p class="text-sm text-blue-200">
          <i class="fas fa-info-circle mr-2"></i>
          <strong>Importante:</strong> Informe o email cadastrado e um documento de identificação para validação de segurança.
        </p>
      </div>
      
      <button 
        onclick="closeForgotPasswordModal()" 
        class="w-full mt-6 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
      >
        Fechar
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeForgotPasswordModal();
    }
  });
}

// Close forgot password modal
function closeForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) {
    modal.remove();
  }
}

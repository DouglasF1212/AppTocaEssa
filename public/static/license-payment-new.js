// License Payment Page

let currentUser = null;

// Initialize
async function init() {
  try {
    // Check if user is authenticated
    const response = await axios.get('/api/auth/me');
    currentUser = response.data.user;
    
    // Check if already approved
    if (currentUser.license_status === 'approved') {
      window.location.href = '/manage';
      return;
    }
    
    renderPage();
  } catch (error) {
    console.error('❌ Erro ao carregar:', error);
    // If not authenticated, allow to see payment info
    renderPage();
  }
}

// Render page
function renderPage() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <div class="inline-block bg-yellow-500/20 rounded-full p-6 mb-4">
            <i class="fas fa-award text-6xl text-yellow-400"></i>
          </div>
          <h1 class="text-4xl font-bold mb-2">Licença Vitalícia</h1>
          <p class="text-xl text-gray-300">TOCA ESSA - Sistema para Artistas</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <div class="text-center mb-8">
            <p class="text-5xl font-bold text-green-400 mb-2">R$ 199,00</p>
            <p class="text-gray-300">Pagamento único • Acesso vitalício</p>
          </div>
          
          <div class="space-y-4 mb-8">
            <h3 class="text-xl font-bold mb-4">
              <i class="fas fa-check-circle text-green-400 mr-2"></i>
              O que está incluído:
            </h3>
            
            <div class="flex items-start gap-3">
              <i class="fas fa-check text-green-400 mt-1"></i>
              <div>
                <p class="font-semibold">Página Pública Personalizada</p>
                <p class="text-sm text-gray-400">Seu QR Code exclusivo para o público acessar</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <i class="fas fa-check text-green-400 mt-1"></i>
              <div>
                <p class="font-semibold">Gerenciamento de Repertório</p>
                <p class="text-sm text-gray-400">Adicione músicas ilimitadas ao seu repertório</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <i class="fas fa-check text-green-400 mt-1"></i>
              <div>
                <p class="font-semibold">Receba Pedidos em Tempo Real</p>
                <p class="text-sm text-gray-400">Dashboard ao vivo com todos os pedidos do público</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <i class="fas fa-check text-green-400 mt-1"></i>
              <div>
                <p class="font-semibold">Receba Gorjetas via PIX</p>
                <p class="text-sm text-gray-400">Configure sua chave PIX e receba gorjetas direto</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <i class="fas fa-check text-green-400 mt-1"></i>
              <div>
                <p class="font-semibold">Suporte Técnico</p>
                <p class="text-sm text-gray-400">Suporte completo via email e WhatsApp</p>
              </div>
            </div>
          </div>
          
          <hr class="border-gray-700 my-8">
          
          <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-money-bill-wave text-green-400 mr-2"></i>
            Como Pagar
          </h3>
          
          <div class="bg-gray-900/50 rounded-xl p-6 mb-6">
            <h4 class="font-bold mb-3">
              <i class="fas fa-mobile-alt mr-2"></i>
              Dados para Pagamento PIX
            </h4>
            
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-400 mb-1">Chave PIX (CPF)</p>
                <div class="flex items-center gap-2">
                  <code class="bg-gray-800 px-4 py-2 rounded flex-1 font-mono">049.400.131-38</code>
                  <button 
                    onclick="copyToClipboard('04940013138')"
                    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                    title="Copiar"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div>
                <p class="text-sm text-gray-400 mb-1">Nome do Titular</p>
                <code class="bg-gray-800 px-4 py-2 rounded block font-mono">Douglas Felipe Nogueira da Silva</code>
              </div>
              
              <div>
                <p class="text-sm text-gray-400 mb-1">Valor</p>
                <code class="bg-gray-800 px-4 py-2 rounded block font-mono text-green-400">R$ 199,00</code>
              </div>
            </div>
          </div>
          
          <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
            <p class="text-sm">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>Importante:</strong> Após realizar o pagamento, envie o comprovante para nosso WhatsApp ou Email. A aprovação é feita em até 24 horas.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-4">
            <a 
              href="https://wa.me/5511999999999?text=Olá! Acabei de fazer o pagamento da licença TOCA ESSA. CPF: 049.400.131-38" 
              target="_blank"
              class="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg transition text-center font-semibold"
            >
              <i class="fab fa-whatsapp mr-2"></i>
              Enviar via WhatsApp
            </a>
            
            <a 
              href="mailto:suporte@tocaessa.com?subject=Comprovante de Pagamento - Licença&body=Segue em anexo o comprovante de pagamento da licença TOCA ESSA." 
              class="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-lg transition text-center font-semibold"
            >
              <i class="fas fa-envelope mr-2"></i>
              Enviar via Email
            </a>
          </div>
        </div>
        
        ${currentUser ? `
          <div class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6 mb-4">
            <h3 class="font-bold mb-2">
              <i class="fas fa-hourglass-half mr-2 text-yellow-400"></i>
              Status da Licença
            </h3>
            <p class="text-gray-300 mb-3">
              ${currentUser.license_status === 'pending' ? 
                'Aguardando pagamento. Envie seu comprovante para aprovação.' : 
                currentUser.license_status === 'paid' ?
                'Pagamento recebido! Aguardando aprovação do administrador.' :
                'Em análise...'}
            </p>
            
            ${currentUser.license_status === 'pending' ? `
              <button 
                onclick="markAsPaid()"
                class="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition font-semibold"
              >
                <i class="fas fa-check-circle mr-2"></i>
                Já Enviei o Comprovante
              </button>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="text-center">
          <a href="${currentUser ? '/manage' : '/login'}" class="text-gray-400 hover:text-white transition">
            <i class="fas fa-arrow-left mr-2"></i>
            ${currentUser ? 'Voltar para Painel' : 'Fazer Login'}
          </a>
        </div>
      </div>
    </div>
  `;
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess('Chave PIX copiada!');
  }).catch(() => {
    showError('Erro ao copiar');
  });
}

// Mark as paid
async function markAsPaid() {
  try {
    await axios.post('/api/license/mark-as-paid');
    showSuccess('Status atualizado! Aguarde a aprovação do administrador.');
    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao atualizar status');
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

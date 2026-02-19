// License Payment Page

let currentUser = null;
let paymentConfig = {};

// Initialize
async function init() {
  try {
    // Carrega dados de pagamento e usuário em paralelo
    const [configRes, userRes] = await Promise.allSettled([
      axios.get('/api/license/payment-info'),
      axios.get('/api/auth/me')
    ]);

    if (configRes.status === 'fulfilled') {
      paymentConfig = configRes.value.data;
    } else {
      // fallback padrão
      paymentConfig = {
        pix_key: '04940013138',
        pix_key_type: 'cpf',
        recipient_name: 'Douglas Felipe Nogueira da Silva',
        amount: 199.00,
        support_whatsapp: '',
        support_email: ''
      };
    }

    if (userRes.status === 'fulfilled') {
      currentUser = userRes.value.data.user;
      if (currentUser.license_status === 'approved') {
        window.location.href = '/manage';
        return;
      }
    }

    renderPage();
  } catch (error) {
    renderPage();
  }
}

// Formata chave PIX para exibição
function formatPixKey(key, type) {
  if (!key) return '-';
  if (type === 'cpf' && key.length === 11) {
    return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (type === 'phone' && key.length >= 11) {
    return key.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
  }
  return key;
}

// Render page
function renderPage() {
  const app = document.getElementById('app');
  const pixKey      = paymentConfig.pix_key      || '04940013138';
  const pixKeyType  = paymentConfig.pix_key_type  || 'cpf';
  const pixName     = paymentConfig.recipient_name || 'Douglas Felipe Nogueira da Silva';
  const amount      = paymentConfig.amount         || 199.00;
  const whatsapp    = paymentConfig.support_whatsapp || '';
  const email       = paymentConfig.support_email    || '';
  const pixDisplay  = formatPixKey(pixKey, pixKeyType);

  const whatsappMsg = encodeURIComponent(`Olá! Acabei de fazer o pagamento da licença TOCA ESSA. Meu email: ${currentUser?.email || ''}`);

  app.innerHTML = `
    <div class="container mx-auto px-4 py-10">
      <div class="max-w-2xl mx-auto">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-block bg-yellow-500/20 rounded-full p-5 mb-4">
            <i class="fas fa-award text-6xl text-yellow-400"></i>
          </div>
          <h1 class="text-4xl font-bold mb-2">Licença Vitalícia</h1>
          <p class="text-xl text-gray-300">TOCA ESSA — Sistema para Artistas</p>
        </div>

        <!-- Card principal -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">

          <!-- Valor -->
          <div class="text-center mb-8">
            <p class="text-6xl font-bold text-green-400 mb-1">R$ ${Number(amount).toFixed(2).replace('.', ',')}</p>
            <p class="text-gray-300">Pagamento único • Acesso vitalício • Sem mensalidades</p>
          </div>

          <!-- Benefícios -->
          <div class="grid grid-cols-2 gap-3 mb-8">
            ${[
              ['fa-qrcode',   'QR Code exclusivo'],
              ['fa-music',    'Pedidos em tempo real'],
              ['fa-money-bill-wave', 'Gorjetas via PIX'],
              ['fa-infinity', 'Acesso para sempre'],
            ].map(([icon, text]) => `
              <div class="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                <i class="fas ${icon} text-green-400 w-5 text-center"></i>
                <span class="text-sm">${text}</span>
              </div>
            `).join('')}
          </div>

          <hr class="border-gray-600 mb-8">

          <!-- Dados PIX -->
          <h3 class="text-xl font-bold mb-4">
            <i class="fas fa-mobile-alt text-green-400 mr-2"></i>Pague via PIX
          </h3>
          <div class="bg-gray-900/60 rounded-xl p-5 mb-6 space-y-4">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Chave PIX (${pixKeyType.toUpperCase()})</p>
              <div class="flex items-center gap-2">
                <code class="bg-gray-800 px-4 py-2 rounded-lg flex-1 font-mono text-lg">${pixDisplay}</code>
                <button onclick="copyToClipboard('${pixKey}')"
                  class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex-shrink-0" title="Copiar chave PIX">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Titular</p>
              <p class="font-semibold">${pixName}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Valor</p>
              <p class="font-bold text-green-400 text-xl">R$ ${Number(amount).toFixed(2).replace('.', ',')}</p>
            </div>
          </div>

          <!-- Aviso -->
          <div class="bg-blue-900/30 border border-blue-600 rounded-xl p-4 mb-6">
            <p class="text-sm">
              <i class="fas fa-info-circle text-blue-400 mr-2"></i>
              <strong>Após pagar:</strong> envie o comprovante pelo WhatsApp ou Email abaixo.
              A aprovação é feita em até 24 horas.
            </p>
          </div>

          <!-- Botões de contato -->
          <div class="grid ${whatsapp && email ? 'grid-cols-2' : 'grid-cols-1'} gap-4">
            ${whatsapp ? `
              <a href="https://wa.me/${whatsapp}?text=${whatsappMsg}" target="_blank"
                class="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-xl transition text-center font-semibold flex items-center justify-center gap-2">
                <i class="fab fa-whatsapp text-xl"></i>
                Enviar Comprovante<br><span class="text-xs font-normal">via WhatsApp</span>
              </a>
            ` : ''}
            ${email ? `
              <a href="mailto:${email}?subject=Comprovante%20de%20Pagamento%20-%20Licen%C3%A7a%20TOCA%20ESSA&body=Segue%20o%20comprovante%20de%20pagamento."
                class="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl transition text-center font-semibold flex items-center justify-center gap-2">
                <i class="fas fa-envelope text-xl"></i>
                Enviar Comprovante<br><span class="text-xs font-normal">via Email</span>
              </a>
            ` : ''}
            ${!whatsapp && !email ? `
              <div class="bg-gray-700 px-6 py-4 rounded-xl text-center text-gray-400">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Dados de contato não configurados. Entre em contato com o suporte.
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Status da licença (usuário logado) -->
        ${currentUser ? `
          <div class="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-4">
            <h3 class="font-bold mb-2 text-yellow-300">
              <i class="fas fa-hourglass-half mr-2"></i>Status da sua Licença
            </h3>
            <p class="text-gray-300 mb-4">
              ${currentUser.license_status === 'pending'
                ? 'Aguardando pagamento. Após pagar, clique no botão abaixo e envie o comprovante.'
                : currentUser.license_status === 'paid'
                ? '✅ Comprovante enviado! Aguardando aprovação do administrador (até 24h).'
                : currentUser.license_status === 'rejected'
                ? '❌ Licença rejeitada. Entre em contato com o suporte.'
                : 'Em análise...'}
            </p>
            ${currentUser.license_status === 'pending' ? `
              <button onclick="markAsPaid()"
                class="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition font-semibold">
                <i class="fas fa-check-circle mr-2"></i>Já enviei o comprovante
              </button>
            ` : ''}
          </div>
        ` : ''}

        <!-- Voltar -->
        <div class="text-center">
          <a href="${currentUser ? '/manage' : '/login'}" class="text-gray-400 hover:text-white transition">
            <i class="fas fa-arrow-left mr-2"></i>
            ${currentUser ? 'Voltar para o Painel' : 'Ir para Login'}
          </a>
        </div>

      </div>
    </div>
  `;
}

// Copiar para clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess('Chave PIX copiada!');
  }).catch(() => {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
    showSuccess('Chave PIX copiada!');
  });
}

// Marcar como pago
async function markAsPaid() {
  try {
    await axios.post('/api/license/mark-as-paid');
    showSuccess('Status atualizado! Aguarde a aprovação do administrador.');
    setTimeout(() => location.reload(), 2000);
  } catch (error) {
    showError(error.response?.data?.error || 'Erro ao atualizar status');
  }
}

function showSuccess(message) {
  const t = document.createElement('div');
  t.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  t.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function showError(message) {
  const t = document.createElement('div');
  t.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  t.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// Payment Page - PIX Payment Interface

let tipData = null;
let pixData = null;

// Initialize
async function init() {
  try {
    console.log('Iniciando carregamento da página de pagamento...');
    console.log('ARTIST_SLUG:', ARTIST_SLUG, 'TIP_ID:', TIP_ID);
    
    // Verificar se está no navegador
    if (typeof window === 'undefined') {
      throw new Error('Código executando fora do navegador');
    }
    
    // Verificar se axios está disponível
    if (typeof axios === 'undefined') {
      throw new Error('Axios não está carregado');
    }
    
    await loadTipData();
    console.log('Dados carregados com sucesso');
    renderPage();
    console.log('Página renderizada com sucesso');
  } catch (error) {
    console.error('Erro no init():', error);
    
    // Renderizar mensagem de erro na tela
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="container mx-auto px-4 py-8 max-w-lg">
          <div class="bg-red-900/50 border border-red-500 rounded-xl p-8 text-center">
            <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h1 class="text-2xl font-bold mb-2">Erro ao carregar pagamento</h1>
            <p class="text-gray-300 mb-4">${error.message || 'Erro desconhecido'}</p>
            <a href="/${ARTIST_SLUG}" class="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">
              <i class="fas fa-arrow-left mr-2"></i>
              Voltar
            </a>
          </div>
        </div>
      `;
    }
    
    showError('Erro ao carregar dados do pagamento');
  }
}

// Load tip and PIX data
async function loadTipData() {
  console.log(`Carregando dados da gorjeta ${TIP_ID}...`);
  
  // Get tip data by ID (works for pending tips too)
  console.log('Fazendo request para /api/tips/' + TIP_ID);
  const tipResponse = await axios.get(`/api/tips/${TIP_ID}`);
  tipData = tipResponse.data;
  console.log('Dados da gorjeta carregados:', tipData);
  
  if (!tipData) {
    throw new Error('Gorjeta não encontrada');
  }
  
  // Get artist data
  console.log(`Carregando dados do artista ${ARTIST_SLUG}...`);
  const artistResponse = await axios.get(`/api/artists/${ARTIST_SLUG}`);
  const artist = artistResponse.data;
  console.log('Dados do artista carregados:', artist);
  
  // Get PIX info (public route)
  try {
    console.log('Carregando informações PIX...');
    const pixResponse = await axios.get(`/api/artists/${ARTIST_SLUG}/pix-info`);
    console.log('Informações PIX carregadas:', pixResponse.data);
    pixData = {
      key: pixResponse.data.pix_key,
      key_type: pixResponse.data.pix_key_type,
      recipient_name: pixResponse.data.recipient_name,
      amount: tipData.amount,
      description: tipData.message || `Gorjeta para ${artist.name}`
    };
  } catch (error) {
    console.error('Erro ao carregar PIX:', error);
    // PIX not configured
    pixData = {
      key: 'Chave PIX não configurada',
      key_type: 'erro',
      recipient_name: artist.name,
      amount: tipData.amount,
      description: tipData.message || `Gorjeta para ${artist.name}`
    };
    showError('Artista ainda não configurou dados bancários');
  }
  
  console.log('Todos os dados carregados com sucesso');
}

// Render page
function renderPage() {
  const app = document.getElementById('app');
  
  // Generate PIX BR Code (Copia e Cola) with amount included
  let brCode = '';
  try {
    if (typeof generatePixBRCode !== 'function') {
      throw new Error('generatePixBRCode não está disponível');
    }
    brCode = generatePixBRCode({
      key: pixData.key,
      key_type: pixData.key_type,
      recipient_name: pixData.recipient_name,
      amount: pixData.amount
    });
  } catch (error) {
    console.error('Erro ao gerar BR Code:', error);
    brCode = 'ERRO_AO_GERAR_CODIGO';
    showError('Erro ao gerar código PIX');
  }
  
  app.innerHTML = `
    <div class="container mx-auto px-4 py-8 max-w-lg">
      <div class="bg-gray-800 rounded-xl p-8 shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">💰</div>
          <h1 class="text-3xl font-bold mb-2">Pagamento via PIX</h1>
          <p class="text-gray-400">Finalize sua gorjeta</p>
        </div>
        
        <!-- Amount -->
        <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 mb-6 text-center">
          <div class="text-sm text-green-200 mb-1">Valor da Gorjeta</div>
          <div class="text-4xl font-bold">R$ ${parseFloat(tipData.amount).toFixed(2)}</div>
          <div class="text-xs text-green-200 mt-2">
            <i class="fas fa-lock mr-1"></i>
            Valor fixo (não pode ser alterado)
          </div>
        </div>
        
        <!-- PIX Instructions -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4 flex items-center">
            <i class="fas fa-mobile-alt mr-2"></i>
            Como Pagar:
          </h2>
          
          <ol class="space-y-3 text-sm">
            <li class="flex items-start">
              <span class="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
              <span>Copie o código PIX abaixo</span>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
              <span>Abra o app do seu banco</span>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
              <span>Escolha <strong>PIX Copia e Cola</strong></span>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">4</span>
              <span>Cole o código (valor já incluído: <strong>R$ ${parseFloat(tipData.amount).toFixed(2)}</strong>)</span>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">5</span>
              <span>Confirme o pagamento</span>
            </li>
          </ol>
        </div>
        
        <!-- PIX Copia e Cola -->
        <div class="mb-6">
          <label class="block text-sm font-bold mb-3">
            <i class="fas fa-qrcode mr-2"></i>
            Código PIX (Copia e Cola)
          </label>
          
          <div class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500 rounded-lg p-4 mb-4">
            <div class="bg-gray-900 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
              <code class="text-xs font-mono break-all block text-green-400">${brCode}</code>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-gray-400">Destinatário:</span>
                <div class="text-white font-semibold">${pixData.recipient_name}</div>
              </div>
              <div>
                <span class="text-gray-400">Valor fixo:</span>
                <div class="text-green-400 font-bold text-lg">R$ ${parseFloat(tipData.amount).toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          <button 
            onclick="copyBRCode()" 
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-4 rounded-lg font-bold text-lg transition shadow-lg mb-3"
          >
            <i class="fas fa-copy mr-2"></i>
            Copiar Código PIX (Valor Fixo)
          </button>
          
          <div class="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 text-xs text-yellow-200">
            <i class="fas fa-info-circle mr-1"></i>
            <strong>Importante:</strong> O código PIX já contém o valor de R$ ${parseFloat(tipData.amount).toFixed(2)}. 
            Não é possível alterar o valor no app do banco.
          </div>
        </div>
        
        <!-- Confirm Payment Button -->
        <button 
          onclick="confirmPayment()" 
          class="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg font-bold text-lg transition mb-4"
        >
          <i class="fas fa-check-circle mr-2"></i>
          Já Fiz o Pagamento
        </button>
        
        <!-- Back Button -->
        <button 
          onclick="window.location.href='/${ARTIST_SLUG}'" 
          class="w-full bg-gray-600 hover:bg-gray-700 px-6 py-4 rounded-lg font-semibold transition"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          Voltar
        </button>
        
        <!-- Info -->
        <div class="mt-6 text-center text-sm text-gray-400">
          <i class="fas fa-info-circle mr-1"></i>
          O artista receberá sua gorjeta após o pagamento ser confirmado
        </div>
      </div>
    </div>
  `;
  
  // Store BR Code globally for copying
  window.currentBRCode = brCode;
  window.currentPixData = pixData;
}

// Copy BR Code to clipboard
function copyBRCode() {
  const brCode = window.currentBRCode;
  const amount = window.currentPixData.amount;
  
  navigator.clipboard.writeText(brCode).then(() => {
    showSuccess(`✅ Código PIX copiado! Cole no app do banco. Valor fixo: R$ ${amount.toFixed(2)}`);
  }).catch(() => {
    showError('Erro ao copiar código PIX');
  });
}

// Copy PIX Key to clipboard (old function - keeping for compatibility)
function copyPixKey() {
  const pixKey = window.currentPixData.key;
  const amount = window.currentPixData.amount;
  
  navigator.clipboard.writeText(pixKey).then(() => {
    showSuccess(`✅ Chave PIX copiada! Abra seu banco e pague R$ ${amount.toFixed(2)}`);
  }).catch(() => {
    showError('Erro ao copiar chave PIX');
  });
}

// Confirm payment
async function confirmPayment() {
  if (!confirm('Você confirma que já realizou o pagamento via PIX?')) {
    return;
  }
  
  try {
    // Confirm the payment
    await axios.post(`/api/payment/${TIP_ID}/confirm`);
    
    // Get pending song info from localStorage
    const songId = localStorage.getItem('pending_song_id');
    const songTitle = localStorage.getItem('pending_song_title');
    const requesterName = localStorage.getItem('pending_requester_name');
    const requesterMessage = localStorage.getItem('pending_requester_message');
    
    // Create the song request with the tip if song data exists
    if (songId) {
      const requestResponse = await axios.post(`/api/artists/${ARTIST_SLUG}/requests`, {
        song_id: parseInt(songId),
        requester_name: requesterName || 'Anônimo',
        requester_message: requesterMessage || '',
        tip_amount: parseFloat(tipData.amount),
        tip_message: `Gorjeta de R$ ${parseFloat(tipData.amount).toFixed(2)}`
      });
      
      // Save request to localStorage for status tracking
      const myRequests = JSON.parse(localStorage.getItem(`my_requests_${ARTIST_SLUG}`) || '[]');
      myRequests.push({
        id: requestResponse.data.id,
        song_title: songTitle,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(`my_requests_${ARTIST_SLUG}`, JSON.stringify(myRequests));
      
      // Clear pending data
      localStorage.removeItem('pending_song_id');
      localStorage.removeItem('pending_song_title');
      localStorage.removeItem('pending_requester_name');
      localStorage.removeItem('pending_requester_message');
      
      showSuccess(`✅ Pagamento confirmado! "${songTitle}" foi adicionada ao topo da fila!`);
    } else {
      showSuccess('✅ Pagamento confirmado! Obrigado pela gorjeta!');
    }
    
    setTimeout(() => {
      window.location.href = `/${ARTIST_SLUG}`;
    }, 2000);
  } catch (error) {
    showError('Erro ao confirmar pagamento');
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

// Show info message
function showInfo(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
  toast.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Initialize on load - wait for DOM and dependencies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded
  init();
}

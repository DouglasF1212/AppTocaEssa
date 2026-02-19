// License Payment Page - After Registration

let paymentInfo = null;

// Initialize
async function init() {
  try {
    await loadPaymentInfo();
    renderPage();
  } catch (error) {
    console.error('❌ Erro ao carregar página de pagamento:', error);
    showError('Erro ao carregar informações de pagamento');
  }
}

// Load payment information
async function loadPaymentInfo() {
  try {
    const response = await axios.get('/api/license/payment-info');
    paymentInfo = response.data;
    console.log('✅ Informações de pagamento carregadas:', paymentInfo);
  } catch (error) {
    console.error('❌ Erro ao carregar informações de pagamento:', error);
    throw error;
  }
}

// Generate PIX BR Code (Copia e Cola)
function generatePixBRCode() {
  if (!paymentInfo) return '';
  
  const { pix_key, recipient_name, amount, description } = paymentInfo;
  
  // PIX BR Code format (simplified - static PIX)
  // Format: 00020126[PAYLOAD]5204000053039865802BR59[NAME]60[CITY]62[TX_ID]6304[CRC]
  
  const merchantName = recipient_name.substring(0, 25).toUpperCase();
  const city = 'SAO PAULO';
  const txid = 'LICENCATOCAESSA';
  
  // Build payload
  let payload = '';
  
  // Payload Format Indicator (00)
  payload += '000201';
  
  // Point of Initiation Method (01 = static)
  payload += '010212';
  
  // Merchant Account Information (26)
  const pixKeyInfo = `0014BR.GOV.BCB.PIX01${pix_key.length.toString().padStart(2, '0')}${pix_key}`;
  payload += `26${pixKeyInfo.length.toString().padStart(2, '0')}${pixKeyInfo}`;
  
  // Merchant Category Code (52)
  payload += '52040000';
  
  // Transaction Currency (53) - BRL = 986
  payload += '5303986';
  
  // Transaction Amount (54)
  const amountStr = amount.toFixed(2);
  payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  
  // Country Code (58)
  payload += '5802BR';
  
  // Merchant Name (59)
  payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
  
  // Merchant City (60)
  payload += `60${city.length.toString().padStart(2, '0')}${city}`;
  
  // Additional Data Field Template (62)
  const txidField = `05${txid.length.toString().padStart(2, '0')}${txid}`;
  payload += `62${txidField.length.toString().padStart(2, '0')}${txidField}`;
  
  // CRC16 placeholder
  payload += '6304';
  
  // Calculate CRC16
  const crc = calculateCRC16(payload);
  payload += crc;
  
  return payload;
}

// Calculate CRC16-CCITT
function calculateCRC16(str) {
  let crc = 0xFFFF;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Copy PIX code to clipboard
async function copyPixCode() {
  const pixCode = generatePixBRCode();
  
  try {
    await navigator.clipboard.writeText(pixCode);
    showSuccess('✅ Código PIX copiado! Cole no seu app de pagamento.');
  } catch (error) {
    console.error('❌ Erro ao copiar:', error);
    
    // Fallback: create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = pixCode;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    showSuccess('✅ Código PIX copiado! Cole no seu app de pagamento.');
  }
}

// Mark as paid and continue
async function markAsPaidAndContinue() {
  try {
    // First login to get session
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const tempPassword = urlParams.get('temp');
    
    if (!email || !tempPassword) {
      showError('Informações de login ausentes. Por favor, faça login manualmente.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    // Login
    const loginResponse = await axios.post('/api/auth/login', {
      email,
      password: tempPassword
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Falha no login automático');
    }
    
    // Mark as paid
    await axios.post('/api/license/mark-as-paid');
    
    showSuccess('✅ Pagamento registrado! Aguarde aprovação do administrador.');
    
    setTimeout(() => {
      window.location.href = '/manage';
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro ao marcar como pago:', error);
    showError('Erro ao registrar pagamento. Por favor, faça login e tente novamente.');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
}

// Render page
function renderPage() {
  if (!paymentInfo) return;
  
  const pixCode = generatePixBRCode();
  
  document.getElementById('app').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">
          <i class="fas fa-rocket mr-3"></i>
          Pagamento da Licença
        </h1>
        <p class="text-gray-300">
          Finalize seu cadastro pagando a licença vitalícia
        </p>
      </div>
      
      <!-- Payment Card -->
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        <!-- Price -->
        <div class="text-center mb-6">
          <div class="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full font-bold mb-3">
            💎 LICENÇA VITALÍCIA
          </div>
          <div class="text-6xl font-bold mb-2">
            R$ ${paymentInfo.amount.toFixed(2)}
          </div>
          <p class="text-gray-300">Pagamento único • Acesso para sempre</p>
        </div>
        
        <!-- Benefits -->
        <div class="mb-6 space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-check-circle text-green-400"></i>
            <span>QR Code personalizado</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-check-circle text-green-400"></i>
            <span>Receba gorjetas ilimitadas</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-check-circle text-green-400"></i>
            <span>Gestão completa de repertório</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-check-circle text-green-400"></i>
            <span>Pedidos de música em tempo real</span>
          </div>
        </div>
        
        <hr class="border-white/20 my-6">
        
        <!-- PIX Payment -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-center">
            <i class="fas fa-qrcode mr-2"></i>
            Pague com PIX
          </h3>
          
          <!-- QR Code -->
          <div class="bg-white p-4 rounded-lg">
            <div id="qrcode" class="flex justify-center"></div>
          </div>
          
          <!-- PIX Info -->
          <div class="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Beneficiário:</span>
              <span class="font-semibold">${paymentInfo.recipient_name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Chave PIX:</span>
              <span class="font-mono">${paymentInfo.pix_key}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Valor:</span>
              <span class="font-bold text-green-400">R$ ${paymentInfo.amount.toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Copy Button -->
          <button 
            onclick="copyPixCode()" 
            class="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <i class="fas fa-copy"></i>
            Copiar Código PIX (Copia e Cola)
          </button>
          
          <!-- Instructions -->
          <div class="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <h4 class="font-bold mb-2 flex items-center gap-2">
              <i class="fas fa-info-circle"></i>
              Como Pagar
            </h4>
            <ol class="text-sm space-y-1 list-decimal list-inside">
              <li>Escaneie o QR Code ou copie o código PIX</li>
              <li>Abra o app do seu banco</li>
              <li>Cole o código na opção "PIX Copia e Cola"</li>
              <li>Confirme o pagamento de R$ ${paymentInfo.amount.toFixed(2)}</li>
              <li>Volte aqui e clique em "Já Paguei"</li>
            </ol>
          </div>
          
          <!-- Confirm Payment Button -->
          <button 
            onclick="markAsPaidAndContinue()" 
            class="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <i class="fas fa-check-circle"></i>
            Já Paguei - Continuar
          </button>
          
          <p class="text-xs text-center text-gray-400">
            Após o pagamento, sua conta será ativada em até 24 horas após aprovação do administrador.
          </p>
        </div>
      </div>
      
      <!-- Support -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-400">
          Problemas com o pagamento? 
          <a href="mailto:contato@tocaessa.com" class="text-blue-400 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
    
    <!-- Toast notifications -->
    <div id="toast" class="fixed bottom-4 right-4 bg-white text-black px-6 py-3 rounded-lg shadow-lg hidden"></div>
  `;
  
  // Generate QR Code
  new QRCode(document.getElementById('qrcode'), {
    text: pixCode,
    width: 250,
    height: 250,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Show success message
function showSuccess(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
  
  setTimeout(() => {
    toast.className = 'fixed bottom-4 right-4 bg-white text-black px-6 py-3 rounded-lg shadow-lg hidden';
  }, 3000);
}

// Show error message
function showError(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
  
  setTimeout(() => {
    toast.className = 'fixed bottom-4 right-4 bg-white text-black px-6 py-3 rounded-lg shadow-lg hidden';
  }, 3000);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);

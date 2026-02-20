// PIX BR Code Generator
// Generates valid PIX "Copia e Cola" (BR Code) payload
// Spec: Manual de Padrões para Iniciação do Pix (BCB)

function generatePixBRCode(pixData) {
  const {
    key,
    key_type,
    recipient_name,
    amount,
    city = 'SAO PAULO'
  } = pixData;

  // Clean PIX key based on type
  let pixKey;
  if (key_type === 'cpf' || key_type === 'cnpj') {
    // Remove all non-digits from CPF/CNPJ
    pixKey = key.replace(/\D/g, '');
  } else if (key_type === 'phone') {
    // Phone must start with + and country code, digits only after +
    const digits = key.replace(/\D/g, '');
    pixKey = '+' + digits;
  } else {
    // email, evp (random key) — use as-is, trim whitespace
    pixKey = key.trim();
  }

  // Build Merchant Account Information (ID 26)
  const gui = 'BR.GOV.BCB.PIX';
  const merchantAccountInfo =
    buildTLV('00', gui) +       // GUI do PIX (obrigatório)
    buildTLV('01', pixKey);     // Chave PIX (obrigatório)

  // Field 62: Additional Data Field Template
  // Subcampo 05 (Reference Label / txid) é obrigatório para a maioria dos bancos
  // Para PIX estático, usar '***' como placeholder conforme especificação BCB
  const txid = '***';
  const additionalData = buildTLV('05', txid);

  // Build complete EMV payload
  const payload =
    buildTLV('00', '01') +                          // Payload Format Indicator (obrigatório)
    buildTLV('26', merchantAccountInfo) +            // Merchant Account Information (obrigatório)
    buildTLV('52', '0000') +                        // Merchant Category Code (0000 = genérico)
    buildTLV('53', '986') +                         // Transaction Currency (986 = BRL)
    buildTLV('54', amount.toFixed(2)) +             // Transaction Amount
    buildTLV('58', 'BR') +                          // Country Code
    buildTLV('59', sanitizeName(recipient_name)) +   // Merchant Name (max 25 chars)
    buildTLV('60', sanitizeCity(city)) +             // Merchant City (max 15 chars)
    buildTLV('62', additionalData);                  // Additional Data (campo 62, txid obrigatório)

  // Calculate and append CRC16 (campo 63)
  const payloadWithCrcPlaceholder = payload + '6304';
  const crc = calculateCRC16(payloadWithCrcPlaceholder);

  return payloadWithCrcPlaceholder + crc;
}

function buildTLV(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return id + length + value;
}

function sanitizeName(name) {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Remove acentos
    .replace(/[^A-Z0-9 ]/g, ' ')       // Apenas letras, números e espaço
    .trim()
    .replace(/\s+/g, ' ')              // Colapsa espaços múltiplos
    .substring(0, 25);
}

function sanitizeCity(city) {
  return city
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Remove acentos
    .replace(/[^A-Z0-9 ]/g, ' ')       // Apenas letras, números e espaço
    .trim()
    .replace(/\s+/g, ' ')              // Colapsa espaços múltiplos
    .substring(0, 15);
}

function generateTransactionId() {
  return '***' + Math.random().toString(36).substring(2, 11).toUpperCase();
}

function calculateCRC16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Export for use in Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePixBRCode };
}

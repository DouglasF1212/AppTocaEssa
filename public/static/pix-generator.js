// PIX BR Code Generator
// Generates valid PIX "Copia e Cola" (BR Code) payload

function generatePixBRCode(pixData) {
  const {
    key,
    key_type,
    recipient_name,
    amount,
    city = 'SAO PAULO'
  } = pixData;

  // Clean PIX key (remove formatting for CPF/CNPJ)
  const pixKey = (key_type === 'cpf' || key_type === 'cnpj') 
    ? key.replace(/\D/g, '') 
    : key;

  // Build Merchant Account Information (ID 26)
  const gui = 'BR.GOV.BCB.PIX';
  const merchantAccountInfo = 
    buildTLV('00', gui) +      // GUI do PIX
    buildTLV('01', pixKey);     // Chave PIX
  
  // Build complete payload (ID 62 is OPTIONAL for static PIX)
  const payload = 
    buildTLV('00', '01') +                           // Payload Format Indicator
    buildTLV('26', merchantAccountInfo) +             // Merchant Account Information
    buildTLV('52', '0000') +                         // Merchant Category Code
    buildTLV('53', '986') +                          // Transaction Currency (986 = BRL)
    buildTLV('54', amount.toFixed(2)) +              // Transaction Amount
    buildTLV('58', 'BR') +                           // Country Code
    buildTLV('59', sanitizeName(recipient_name)) +    // Merchant Name (max 25 chars)
    buildTLV('60', sanitizeCity(city));              // Merchant City (max 15 chars)
    // ID 62 (Additional Data) is optional and omitted for better compatibility

  // Calculate and append CRC16
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
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25);
}

function sanitizeCity(city) {
  return city
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePixBRCode };
}

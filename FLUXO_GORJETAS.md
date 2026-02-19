# 💰 Fluxo Completo de Gorjetas - TOCA ESSA

## 📊 Como Funciona o Sistema de Gorjetas

### 1. **Cliente Envia Gorjeta**

O público acessa a página do artista e pode enviar gorjetas de duas formas:

#### **Opção A: Gorjeta com Pedido de Música**
1. Cliente acessa: `https://URL-DO-SITE/:slug-do-artista`
2. Busca uma música no repertório
3. Clica em "Pedir Música"
4. **Opcional**: Adiciona gorjeta (valores rápidos: R$ 5, 10, 20 ou personalizado)
5. Preenche nome e mensagem
6. Clica em "Enviar Pedido"

#### **Opção B: Gorjeta Direta (sem pedido)**
1. Cliente acessa: `https://URL-DO-SITE/:slug-do-artista`
2. Rola até a seção "Enviar Gorjeta" no final da página
3. Escolhe valor (R$ 5, 10, 20 ou personalizado)
4. Preenche nome (opcional) e mensagem (opcional)
5. Clica em "Enviar Gorjeta"

### 2. **Sistema Processa a Gorjeta**

**Backend (src/index.tsx):**
```typescript
POST /api/artists/:slug/tips
- Valida o artista
- Cria registro na tabela 'tips'
- Status inicial: 'pending'
- Simula pagamento (muda para 'completed')
- Gera transaction_id
```

**Banco de Dados:**
```sql
INSERT INTO tips (
  artist_id, 
  amount, 
  sender_name, 
  message, 
  payment_method, 
  payment_status, 
  transaction_id
) VALUES (?, ?, ?, ?, 'pix', 'completed', 'TXN-...');
```

### 3. **Artista Visualiza no Dashboard**

**Dashboard do Artista:**
```
URL: https://URL-DO-SITE/dashboard/:slug-do-artista
```

**Onde as gorjetas aparecem:**

1. **Card de Estatística (topo):**
   - 💰 "Total em Gorjetas" → Mostra soma de todas gorjetas

2. **Coluna Lateral Direita:**
   - 🎁 "Gorjetas Recentes"
   - Lista todas as gorjetas recebidas
   - Mostra: valor, nome do remetente, mensagem, data/hora

3. **Auto-atualização:**
   - Dashboard atualiza a cada 5 segundos automaticamente
   - Novas gorjetas aparecem em tempo real

---

## 🧪 Como Testar o Sistema

### **Teste 1: Verificar Gorjetas Existentes**

```bash
# Ver gorjetas no banco
npx wrangler d1 execute toca-essa-production --local --command="SELECT * FROM tips;"

# Ver via API
curl http://localhost:3000/api/artists/douglas-felipe/tips
```

### **Teste 2: Enviar Nova Gorjeta (via API)**

```bash
curl -X POST http://localhost:3000/api/artists/douglas-felipe/tips \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "sender_name": "Teste Cliente",
    "message": "Parabéns pelo show!",
    "payment_method": "pix"
  }'
```

### **Teste 3: Verificar no Dashboard**

1. Acesse: `http://localhost:3000/dashboard/douglas-felipe`
2. Veja o card "Total em Gorjetas" (topo direito)
3. Veja a coluna "Gorjetas Recentes" (lateral direita)

### **Teste 4: Fluxo Completo via Interface**

1. **Abra a página pública:**
   - URL: `http://localhost:3000/douglas-felipe`

2. **Envie uma gorjeta:**
   - Role até o final da página
   - Clique em "R$ 10"
   - Digite seu nome: "Cliente Teste"
   - Digite mensagem: "Adorei o show!"
   - Clique em "Enviar Gorjeta"

3. **Abra o Dashboard:**
   - URL: `http://localhost:3000/dashboard/douglas-felipe`
   - Veja a gorjeta aparecer em tempo real

---

## 📍 URLs Importantes

### **Produção (Sandbox Atual):**
- **Home**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai
- **Página Douglas**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/douglas-felipe
- **Dashboard Douglas**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/dashboard/douglas-felipe

### **Credenciais Douglas Felipe:**
- Email: (criar conta nova ou verificar banco)
- Página pública: `/douglas-felipe`

---

## 🔍 Estrutura do Banco de Dados

### **Tabela: tips**
```sql
CREATE TABLE tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  sender_name TEXT,
  message TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Status da Gorjeta:**
- `pending` → Aguardando pagamento
- `completed` → Pago (aparece no dashboard)
- `failed` → Falhou (não aparece)

---

## 💡 Próximos Passos (Integração Real de Pagamento)

Para implementar pagamento real, você precisará:

### **1. Escolher Gateway de Pagamento:**
- **Mercado Pago** (recomendado para Brasil)
- **PagSeguro**
- **Stripe** (internacional)

### **2. Fluxo com Gateway Real:**

```javascript
// Frontend: Gerar link de pagamento
POST /api/artists/:slug/tips
Response: { payment_url: "https://mercadopago.com/..." }

// Redirecionar cliente para pagamento
window.location.href = payment_url;

// Webhook: Receber confirmação
POST /api/webhooks/payment
- Atualizar payment_status para 'completed'
- Notificar artista
```

### **3. Conta Bancária do Artista:**

O sistema já tem cadastro de dados bancários em `/manage` → Aba "Dados Bancários":
- PIX (email, telefone, CPF, chave aleatória)
- Transferência bancária (banco, agência, conta)

---

## ✅ Checklist de Funcionamento

- [x] Tabela `tips` criada no banco
- [x] API `GET /api/artists/:slug/tips` funcionando
- [x] API `POST /api/artists/:slug/tips` funcionando
- [x] Dashboard carrega gorjetas automaticamente
- [x] Card de total de gorjetas exibido
- [x] Coluna de gorjetas recentes exibida
- [x] Auto-atualização a cada 5 segundos
- [x] Gorjetas com pedidos de música funcionando
- [x] Gorjetas diretas (sem pedido) funcionando
- [x] Dados bancários do artista cadastrados

---

## 🎯 Resumo Rápido

**Para ver suas gorjetas:**
1. Acesse o dashboard: `/dashboard/seu-slug`
2. Veja o card amarelo no topo: "Total em Gorjetas"
3. Veja a coluna direita: "Gorjetas Recentes"

**Para testar:**
1. Acesse sua página pública: `/seu-slug`
2. Role até o final
3. Envie uma gorjeta de teste
4. Volte ao dashboard e veja aparecer em tempo real

**Tudo está funcionando! 🎉**

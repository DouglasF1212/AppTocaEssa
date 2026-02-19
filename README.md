# TOCA ESSA 🎵

Sistema completo para cantores de bares e restaurantes interagirem com o público durante shows ao vivo.

![Logo](https://img.shields.io/badge/TOCA%20ESSA-Live%20Music%20Platform-purple?style=for-the-badge)

## 🚀 **Versão Atual: v12.0 WORKING**

**Status:** ✅ **100% Funcional** - Versão estável antes da implementação do painel administrativo.

---

## 🎯 Objetivo

Conectar artistas e público de forma interativa durante apresentações ao vivo. O público pode ver o repertório, pedir músicas e enviar gorjetas sem interromper o show.

---

## 🌐 **URLs de Acesso**

### **Produção (Sandbox)**
- **Home / Lista de Artistas**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai
- **Login de Artistas**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/login
- **Registro**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/register

### **Páginas Públicas de Artistas**
- **Douglas Felipe**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/douglas-felipe
- **João Silva**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/joao-silva
- **Maria Santos**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/maria-santos

### **Painel de Gerenciamento**
- **Gerenciar Perfil/Repertório**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/manage

### **Dashboard em Tempo Real**
- **Dashboard Douglas**: https://3000-i1fjzrt68mb2vd59p29oo-2e77fc33.sandbox.novita.ai/dashboard/douglas-felipe

---

## 🔑 **Credenciais de Teste**

### **Artista: Douglas Felipe**
- **Email**: `contatodfns@gmail.com`
- **Senha**: `password123`
- **Slug**: `douglas-felipe`
- **Repertório**: 5 músicas cadastradas

### **Outros Artistas**
- **João Silva**: `joao@tocaessa.com` / `password123`
- **Maria Santos**: `maria@tocaessa.com` / `password123`

---

## 🌟 Funcionalidades Principais

### ✅ **Para o Público**
- 🎭 Acesso via QR Code único do artista
- 📱 Ver repertório completo com busca
- 🎵 Pedir músicas (nome + mensagem opcional)
- 💰 **Enviar gorjetas via PIX**:
  - BR Code (Pix Copia e Cola) automático
  - Abertura do app do banco
  - Confirmação de pagamento
  - Pedido criado automaticamente após gorjeta

### ✅ **Para o Artista**
- 🔐 Autenticação completa (login/registro)
- 📸 Editar perfil (foto, nome, bio)
- 🎸 Gerenciar repertório (adicionar/remover músicas)
- 💳 Configurar PIX e dados bancários
- 📊 **Dashboard em tempo real**:
  - Ver pedidos com status colorido
  - Aceitar/recusar/marcar como tocada
  - Ver histórico de gorjetas
  - Auto-refresh a cada 5 segundos

---

## 🗄️ **Estrutura do Banco de Dados (Cloudflare D1)**

### **Tabelas Principais**
1. **`users`** - Usuários do sistema (artistas)
2. **`artists`** - Perfis públicos dos artistas
3. **`songs`** - Repertório de cada artista
4. **`song_requests`** - Pedidos de músicas do público
5. **`tips`** - Gorjetas enviadas via PIX
6. **`bank_accounts`** - Dados bancários dos artistas
7. **`sessions`** - Sessões de autenticação

---

## 💻 **Stack Tecnológica**

### **Backend**
- **Framework**: Hono (TypeScript) - Lightweight web framework
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite distribuído globalmente)
- **Storage**: Cloudflare R2 (fotos de perfil)

### **Frontend**
- **Vanilla JavaScript** (sem frameworks)
- **CSS**: Tailwind CSS (via CDN)
- **Icons**: Font Awesome
- **HTTP Client**: Axios

### **DevOps**
- **Build Tool**: Vite
- **CLI**: Wrangler (Cloudflare)
- **Process Manager**: PM2 (desenvolvimento local)
- **Deploy**: Cloudflare Pages

---

## 🛠️ **Desenvolvimento Local**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn

### **Instalação**
```bash
# Clonar repositório
git clone <repo-url>
cd webapp

# Instalar dependências
npm install

# Criar banco de dados local
npx wrangler d1 migrations apply toca-essa-production --local

# Popular banco com dados de teste
npx wrangler d1 execute toca-essa-production --local --file=./seed_simple.sql

# Build do projeto
npm run build

# Iniciar servidor de desenvolvimento
pm2 start ecosystem.config.cjs

# Verificar status
pm2 status

# Ver logs
pm2 logs webapp --nostream
```

### **Scripts Disponíveis**
```json
{
  "dev": "vite",
  "dev:sandbox": "wrangler pages dev dist --ip 0.0.0.0 --port 3000",
  "build": "vite build",
  "preview": "wrangler pages dev dist",
  "deploy": "npm run build && wrangler pages deploy dist"
}
```

---

## 📦 **Deploy para Produção**

### **1. Criar Banco D1 na Cloudflare**
```bash
npx wrangler d1 create toca-essa-production
# Copiar o database_id retornado
```

### **2. Atualizar wrangler.jsonc**
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "toca-essa-production",
      "database_id": "SEU_DATABASE_ID_AQUI"  // ← Colar aqui
    }
  ]
}
```

### **3. Aplicar Migrations**
```bash
npx wrangler d1 migrations apply toca-essa-production
```

### **4. Popular Banco**
```bash
npx wrangler d1 execute toca-essa-production --file=./seed_simple.sql
```

### **5. Deploy**
```bash
npm run build
npx wrangler pages deploy dist --project-name toca-essa
```

---

## 📊 **Banco de Dados**

### **Migrations Aplicadas**
1. `0001_initial_schema.sql` - Tabelas principais
2. `0002_add_users_and_bank_accounts.sql` - Autenticação e pagamentos
3. `0003_add_subscriptions.sql` - Sistema de assinaturas (legado)
4. `0003_add_admin_and_settings.sql` - Configurações admin
5. `0003_add_license_payment.sql` - Sistema de licença (não usado nesta versão)
6. `0004_remove_subscriptions_add_qrcode.sql` - QR codes dos artistas

### **Dados de Teste (seed_simple.sql)**
- 3 artistas cadastrados
- 5 músicas no repertório de Douglas
- Todos com senha: `password123`

---

## 🔄 **Fluxo Completo de Uso**

### **1. Artista**
1. Registra-se no sistema (`/register`)
2. Faz login (`/login` → redireciona para `/manage`)
3. Edita perfil (foto, nome, bio)
4. Adiciona músicas ao repertório
5. Configura chave PIX para receber gorjetas
6. Gera QR Code da sua página pública
7. Monitora pedidos e gorjetas no dashboard em tempo real

### **2. Cliente (Público)**
1. Escaneia QR Code ou acessa `/<slug-do-artista>`
2. Vê o repertório completo com busca
3. **Opção A**: Pede música sem gorjeta (nome + mensagem)
4. **Opção B**: Envia gorjeta PIX:
   - Clica em "Enviar Gorjeta"
   - Escolhe valor ou insere custom
   - Copia BR Code PIX ou abre app do banco
   - Paga no app do banco
   - Volta e confirma pagamento
   - Pedido criado automaticamente com prioridade

---

## 🎨 **Destaques de Design**

- **Gradientes modernos**: Roxo, rosa e amarelo
- **Animações suaves**: Hover effects e transições
- **Responsivo**: Mobile-first design
- **Status coloridos**:
  - 🟡 Pendente
  - 🟢 Aceito
  - 🔵 Tocado
  - ⭐ Com gorjeta (destaque dourado)

---

## 📝 **Notas Importantes**

### **✅ O Que Funciona Nesta Versão**
- ✅ Autenticação de artistas
- ✅ Gerenciamento de perfil
- ✅ CRUD de repertório
- ✅ Sistema de pedidos
- ✅ Pagamento PIX com gorjetas
- ✅ Dashboard em tempo real
- ✅ QR codes personalizados
- ✅ PWA (Progressive Web App)

### **❌ O Que NÃO Existe Nesta Versão**
- ❌ Painel administrativo
- ❌ Sistema de licença vitalícia
- ❌ Notificações push
- ❌ Gerenciamento de múltiplos artistas pelo admin

### **⚠️ Esta é a última versão estável antes de:**
- Implementação do painel admin
- Sistema de licença (R$ 199)
- Sistema de notificações push
- Problemas de tela preta no login (bugs introduzidos após essas features)

---

## 📁 **Estrutura de Arquivos**

```
webapp/
├── src/
│   └── index.tsx           # Backend principal (Hono)
├── public/
│   └── static/
│       ├── auth.js         # Login/registro frontend
│       ├── manage.js       # Painel de gerenciamento
│       ├── dashboard.js    # Dashboard tempo real
│       ├── audience.js     # Página pública do artista
│       └── pix-generator.js # Gerador de BR Code PIX
├── migrations/             # Migrations do D1
├── dist/                   # Build output
├── wrangler.jsonc          # Config Cloudflare
├── package.json
├── vite.config.ts
├── ecosystem.config.cjs    # Config PM2
└── README.md
```

---

## 🆘 **Troubleshooting**

### **Problema: "No such table: users"**
```bash
# Recriar banco de dados
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply toca-essa-production --local
npx wrangler d1 execute toca-essa-production --local --file=./seed_simple.sql
```

### **Problema: Login não funciona**
```bash
# Reset de senhas
npx wrangler d1 execute toca-essa-production --local --command="UPDATE users SET password_hash='ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' WHERE email='contatodfns@gmail.com';"
```

### **Problema: Servidor não inicia**
```bash
# Limpar porta e reiniciar
fuser -k 3000/tcp 2>/dev/null || true
pm2 delete all
npm run build
pm2 start ecosystem.config.cjs
```

---

## 📦 **Backups**

### **Versão Atual**
- **Download**: https://www.genspark.ai/api/files/s/VCQfQB3R
- **Commit**: `322df60` (working-version-before-admin branch)
- **Data**: 2026-02-18

---

## 👨‍💻 **Desenvolvedor**

Sistema desenvolvido para conectar artistas e público durante apresentações ao vivo.

---

## 📄 **Licença**

Este projeto é privado e confidencial.

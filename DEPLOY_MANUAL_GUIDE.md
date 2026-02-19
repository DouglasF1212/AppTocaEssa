# 🚀 GUIA DE DEPLOY MANUAL - CLOUDFLARE PAGES

## ✅ JÁ FEITO:
- ✅ Código no GitHub: https://github.com/DouglasF1212/AppTocaEssa
- ✅ Branch: main
- ✅ Tudo pronto para deploy!

---

## 📋 PASSO A PASSO COMPLETO:

### **PASSO 1: Acessar Cloudflare Dashboard**
1. Acesse: https://dash.cloudflare.com
2. Faça login (se necessário)

---

### **PASSO 2: Criar Projeto no Pages**

1. No menu lateral, clique em **"Workers & Pages"**
2. Clique no botão **"Create"** (ou "Create application")
3. Selecione a aba **"Pages"**
4. Clique em **"Connect to Git"**

---

### **PASSO 3: Conectar ao GitHub**

1. Você verá uma tela pedindo para conectar ao GitHub
2. Clique em **"Connect GitHub"** ou **"Connect to GitHub"**
3. Autorize o acesso do Cloudflare ao GitHub (se solicitado)
4. Selecione o repositório: **"DouglasF1212/AppTocaEssa"**
5. Clique em **"Begin setup"** ou **"Select repository"**

---

### **PASSO 4: Configurar o Build**

Preencha os campos:

```
Project name: toca-essa
(ou deixe como: apptocaessa)

Production branch: main

Build settings:
Framework preset: None

Build command: npm run build

Build output directory: dist

Root directory: /
(deixe vazio ou /)

Environment variables (production):
(deixe vazio por enquanto)
```

**⚠️ IMPORTANTE**: 
- Framework preset: **None** (não selecione nada)
- Build command: **npm run build**
- Build output directory: **dist**

---

### **PASSO 5: Iniciar Deploy**

1. Clique em **"Save and Deploy"**
2. Cloudflare vai começar o build automático
3. Aguarde 2-5 minutos

Você verá:
- ⏳ Initializing build environment...
- ⏳ Cloning repository...
- ⏳ Installing dependencies...
- ⏳ Building application...
- ⏳ Deploying...
- ✅ Success!

---

### **PASSO 6: Copiar a URL**

Após o deploy, você verá:
```
✅ Success! Your site is live at:
https://apptocaessa.pages.dev
```

**COPIE ESSA URL!** Você vai precisar dela.

---

### **PASSO 7: Criar Database D1**

Agora precisamos criar o banco de dados:

1. No menu lateral, clique em **"Workers & Pages"**
2. Depois clique na aba **"D1 SQL Database"** (ou só "D1")
3. Clique em **"Create database"**
4. Nome do database: **toca-essa-production**
5. Clique em **"Create"**

---

### **PASSO 8: Conectar Database ao Projeto**

1. Volte para **"Workers & Pages"**
2. Clique no seu projeto **"toca-essa"** (ou "apptocaessa")
3. Vá na aba **"Settings"**
4. No menu lateral, clique em **"Functions"**
5. Role até a seção **"D1 database bindings"**
6. Clique em **"Add binding"**

Preencha:
```
Variable name: DB
D1 database: toca-essa-production
```

7. Clique em **"Save"**

---

### **PASSO 9: Aplicar Migrations no Database**

Agora precisamos criar as tabelas no database. Vou te dar um script SQL completo:

1. No Cloudflare Dashboard, vá em **"D1 SQL Database"**
2. Clique em **"toca-essa-production"**
3. Clique na aba **"Console"**
4. Cole o SQL que vou te dar a seguir
5. Clique em **"Execute"**

---

### **PASSO 10: Criar Usuário Admin**

Depois de executar as migrations, execute este comando para criar o admin:

```sql
INSERT INTO users (email, password_hash, full_name, role, email_verified, account_paid, license_paid, license_status) 
VALUES ('admin@tocaessa.com', 'e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a', 'Administrador', 'admin', 1, 1, 1, 'approved');
```

**Senha do admin**: `admin123`

---

### **PASSO 11: Fazer Redeploy**

1. Volte para **"Workers & Pages"** → seu projeto
2. Clique na aba **"Deployments"**
3. Clique no botão **"Retry deployment"** ou **"Redeploy"**
4. Aguarde o novo build (1-2 minutos)

---

## 🎉 PRONTO! SEU APP ESTÁ NO AR!

### **URLs do seu app:**
```
Produção: https://apptocaessa.pages.dev
Admin: https://apptocaessa.pages.dev/admin/login
```

### **Credenciais Admin:**
- Email: admin@tocaessa.com
- Senha: admin123

---

## 📱 COMO INSTALAR NO CELULAR:

### **Android (Chrome):**
1. Abra: https://apptocaessa.pages.dev
2. Menu ⋮ → "Adicionar à tela inicial"
3. Confirme

### **iOS (Safari):**
1. Abra: https://apptocaessa.pages.dev
2. Botão compartilhar 📤
3. "Adicionar à Tela de Início"
4. Confirme

---

## 🔄 ATUALIZAÇÕES FUTURAS:

Quando quiser atualizar o app:

1. Faça as alterações no código
2. Faça commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da atualização"
   git push origin main
   ```
3. Cloudflare faz deploy automático!

---

## ⚠️ ME AVISE QUANDO:

1. ✅ Deploy terminado com sucesso
2. ✅ Database D1 criado
3. ✅ Binding configurado
4. ✅ Migrations executadas

Aí eu te ajudo com os próximos passos!

---

## 💡 DICA:

Mantenha esta página aberta em uma aba para referência!

# 🚀 DEPLOY MANUAL - TOCA ESSA na Cloudflare Pages

## 📦 Opção 1: Upload Direto pelo Dashboard

### Passo 1: Preparar o Projeto
O projeto já está pronto! O diretório `dist/` contém tudo que você precisa.

### Passo 2: Acessar Cloudflare Dashboard
1. Acesse: https://dash.cloudflare.com
2. Vá em **Workers & Pages** (menu lateral esquerdo)
3. Clique em **Create Application**
4. Escolha **Pages** → **Upload assets**

### Passo 3: Fazer Upload
1. Dê um nome ao projeto: **toca-essa**
2. Faça upload da pasta **dist/** completa
3. Clique em **Deploy site**

Pronto! Seu site estará no ar em: https://toca-essa.pages.dev

---

## 🔧 Opção 2: Conectar ao GitHub (Recomendado)

### Passo 1: Push para GitHub
```bash
cd /home/user/webapp
git remote add origin https://github.com/SEU_USUARIO/toca-essa.git
git push -u origin main
```

### Passo 2: Conectar no Cloudflare
1. Acesse: https://dash.cloudflare.com
2. **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**
3. Autorize acesso ao GitHub
4. Selecione o repositório **toca-essa**

### Passo 3: Configurar Build
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (deixe vazio)
- **Framework preset**: None

### Passo 4: Variáveis de Ambiente (Opcional)
Nenhuma necessária por enquanto!

### Passo 5: Deploy
Clique em **Save and Deploy**

---

## 🗄️ IMPORTANTE: Configurar Banco de Dados D1

Após o deploy, você PRECISA criar e configurar o banco de dados:

### Passo 1: Criar Banco D1
```bash
npx wrangler d1 create toca-essa-production
```

Copie o `database_id` retornado.

### Passo 2: Atualizar wrangler.jsonc
Edite o arquivo `wrangler.jsonc` e substitua:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "toca-essa-production",
    "database_id": "SEU_DATABASE_ID_AQUI"
  }
]
```

### Passo 3: Aplicar Migrations
```bash
# Migration 1: Schema inicial
npx wrangler d1 migrations apply toca-essa-production --remote

# Inserir dados de teste
npx wrangler d1 execute toca-essa-production --remote --file=./seed_v2.sql

# Inserir usuário admin
npx wrangler d1 execute toca-essa-production --remote --file=./seed_admin.sql
```

### Passo 4: Vincular ao Pages Project
No dashboard da Cloudflare:
1. Vá em **Workers & Pages** → Seu projeto **toca-essa**
2. **Settings** → **Functions** → **D1 database bindings**
3. Adicione binding:
   - **Variable name**: `DB`
   - **D1 database**: `toca-essa-production`
4. Salve e faça um novo deploy

---

## ✅ Credenciais do Sistema

### Admin
- URL: https://toca-essa.pages.dev/admin
- Email: admin@tocaessa.com
- Senha: admin123

### Artistas de Teste
**João Silva:**
- Email: joao@tocaessa.com
- Senha: password123
- Página: https://toca-essa.pages.dev/joao-silva

**Maria Santos:**
- Email: maria@tocaessa.com  
- Senha: password123
- Página: https://toca-essa.pages.dev/maria-santos

---

## 🎯 URLs do Sistema

- **Home**: https://toca-essa.pages.dev
- **Login Artista**: https://toca-essa.pages.dev/login
- **Cadastro**: https://toca-essa.pages.dev/register
- **Admin**: https://toca-essa.pages.dev/admin
- **Dashboard João**: https://toca-essa.pages.dev/dashboard/joao-silva

---

## 🔧 Troubleshooting

### "Internal Server Error" após deploy
→ Você precisa configurar o banco D1 (veja seção acima)

### "Database not found"
→ Verifique se o binding `DB` está configurado nas settings do projeto

### Migrations não aplicadas
→ Execute os comandos de migration com `--remote`

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Build completou sem erros
2. Banco D1 foi criado e vinculado
3. Migrations foram aplicadas com sucesso
4. Binding `DB` está configurado no projeto Pages


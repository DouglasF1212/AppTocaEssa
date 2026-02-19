# 🌐 Como Alterar a URL do TOCA ESSA

## 🎯 Você Tem 3 Opções:

---

## 📝 **Opção 1: Mudar Nome do Projeto** (URL Gratuita da Cloudflare)

### **Durante a Criação:**
Ao fazer o deploy, escolha um nome personalizado:
```
❌ toca-essa → https://toca-essa.pages.dev
✅ showlive → https://showlive.pages.dev
✅ musicaovivo → https://musicaovivo.pages.dev
✅ seu-nome → https://seu-nome.pages.dev
```

### **Depois de Criado:**
1. Acesse: https://dash.cloudflare.com
2. **Workers & Pages** → Clique no projeto
3. **Settings** → **General**
4. Role até **"Project name"**
5. Clique em **"Change project name"**
6. Digite o novo nome
7. **Save**

⚠️ **IMPORTANTE:** Não use caracteres especiais ou espaços!
✅ Permitido: letras, números, hífens (-)
❌ Não permitido: acentos, espaços, underscores (_)

---

## 🌟 **Opção 2: Domínio Próprio** (Recomendado para Produção)

Se você tem um domínio registrado (ex: `tocaessa.com.br`):

### **Passo 1: Adicionar Domínio Custom**
1. No projeto Cloudflare Pages
2. **Custom domains** (menu lateral)
3. **Set up a custom domain**
4. Digite seu domínio:
   - `tocaessa.com.br` (domínio principal)
   - `app.tocaessa.com.br` (subdomínio)
   - `www.tocaessa.com.br` (com www)

### **Passo 2: Configurar DNS**

**Se seu domínio JÁ está na Cloudflare:**
→ Configuração automática! ✅ Pronto em minutos.

**Se seu domínio está em outro registrador:**
Você tem 2 opções:

#### **Opção A: Transferir Nameservers (Recomendado)**
1. Na Cloudflare: **Add a Site** → Digite seu domínio
2. Copie os nameservers da Cloudflare (ex: `ns1.cloudflare.com`)
3. No seu registrador (Registro.br, GoDaddy, etc):
   - Vá em configurações de DNS
   - Altere os nameservers para os da Cloudflare
4. Aguarde propagação (24-48h)
5. Volte ao Pages e adicione o domínio custom

#### **Opção B: Apenas CNAME (Mais Rápido)**
1. No seu registrador de domínio
2. Adicione um registro CNAME:
   ```
   Tipo:  CNAME
   Nome:  app (ou www, ou @)
   Valor: toca-essa.pages.dev
   TTL:   Automático
   ```
3. Aguarde propagação (5min - 2h)

### **Resultado:**
✅ `https://tocaessa.com.br` (seguro, com SSL grátis)
✅ `https://app.tocaessa.com.br`
✅ `https://www.tocaessa.com.br`

---

## 🔄 **Opção 3: Múltiplas URLs** (Melhor Flexibilidade)

Você pode ter VÁRIAS URLs apontando para o mesmo app!

### **Exemplo de Configuração:**

1. **URL Principal:** `https://tocaessa.com.br`
2. **URL do App:** `https://app.tocaessa.com.br`
3. **URL de Shows:** `https://shows.tocaessa.com.br`
4. **URL Padrão Cloudflare:** `https://toca-essa.pages.dev` (backup)

Todas funcionarão e apontarão para o mesmo sistema!

### **Como Configurar:**
No dashboard do projeto → **Custom domains** → **Add domain**
Repita para cada URL que quiser.

---

## 💰 **Custos:**

| Opção | Custo |
|-------|-------|
| URL Cloudflare (`.pages.dev`) | **Grátis** ✅ |
| Domínio Próprio | R$ 40/ano (registro) |
| SSL/HTTPS | **Grátis** ✅ |
| Hospedagem Cloudflare | **Grátis** ✅ |

---

## 🎯 **Recomendação:**

### **Para Testes:**
→ Use a URL gratuita: `https://toca-essa.pages.dev`

### **Para Produção:**
→ Registre um domínio próprio: `https://tocaessa.com.br`

**Onde Registrar Domínio .com.br:**
- Registro.br (oficial): https://registro.br
- GoDaddy: https://godaddy.com
- HostGator: https://hostgator.com.br
- UOL Host: https://uolhost.com.br

---

## 🔧 **Exemplos Práticos:**

### **URLs Curtas e Memoráveis:**
✅ `showlive.com.br`
✅ `musicaovivo.app`
✅ `tocaessa.com.br`
✅ `pediumusica.com.br`

### **Com Subdomínio:**
✅ `app.tocaessa.com.br`
✅ `live.musicaovivo.com.br`
✅ `artistas.showlive.com.br`

---

## ⚡ **Alteração Rápida (5 minutos):**

Se você já tem um projeto na Cloudflare:

```bash
# 1. Renomear projeto
Dashboard → Settings → Change project name

# 2. Nova URL:
https://novo-nome.pages.dev

# 3. Pronto! ✅
```

---

## 📞 **Precisa de Ajuda?**

Depois de configurar, teste sua URL:
1. Acesse a nova URL no navegador
2. Verifique se o SSL (cadeado 🔒) está ativo
3. Teste todas as funcionalidades

**Se algo não funcionar:**
- Aguarde propagação DNS (até 48h)
- Limpe o cache do navegador (Ctrl + Shift + Del)
- Teste em modo anônimo
- Verifique se o CNAME está correto

---

## ✅ **Resumo:**

| Quando Usar | Opção | Tempo | Custo |
|-------------|-------|-------|-------|
| Teste rápido | Renomear projeto | 1 min | Grátis |
| Produção simples | .pages.dev customizado | 1 min | Grátis |
| Produção profissional | Domínio próprio | 1-48h | R$ 40/ano |

---

**Escolha a opção que melhor se adapta ao seu caso!** 🚀


# 🖼️ Como trocar o ícone do app direto no GitHub

Agora você consegue atualizar o ícone **sem rodar nada localmente**.

## ✅ Como funciona

O repositório tem um workflow do GitHub Actions (`.github/workflows/update-app-icons.yml`) que:
1. detecta mudanças em `public/app-icon-source.png`;
2. gera todos os ícones automaticamente;
3. faz commit dos arquivos atualizados no próprio branch.

## 🚀 Passo a passo (pelo site do GitHub)

1. Abra o arquivo `public/app-icon-source.png` no GitHub.
2. Clique no lápis (**Edit this file**) ou em **Upload files** para substituir a imagem.
3. Faça o commit da alteração.
4. Aguarde o workflow **Update app icons** terminar (aba **Actions**).
5. Pronto: os arquivos abaixo serão atualizados automaticamente:
   - `public/icon-192.png`
   - `public/icon-512.png`
   - `public/favicon.ico`
   - `public/apple-touch-icon.png`
   - `public/apple-touch-icon-*.png`

## 📝 Dicas para melhor resultado

- Use imagem quadrada (ex.: `1024x1024` ou maior).
- Evite bordas muito finas (podem sumir em tamanhos pequenos).
- Centralize o logo para ficar bom em todos os recortes.

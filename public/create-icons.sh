#!/bin/bash
set -euo pipefail

# Gera todos os ícones do app a partir de public/app-icon-source.png
# Uso:
#   bash public/create-icons.sh
#   bash public/create-icons.sh caminho/para/icone.png

SOURCE_IMAGE="${1:-public/app-icon-source.png}"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v convert >/dev/null 2>&1; then
  echo "❌ ImageMagick não encontrado. Instale o pacote 'imagemagick' para gerar os ícones."
  exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "❌ Arquivo de origem não encontrado: $SOURCE_IMAGE"
  exit 1
fi

generate_png() {
  local size="$1"
  local filename="$2"

  convert "$SOURCE_IMAGE" \
    -resize "${size}x${size}^" \
    -gravity center \
    -extent "${size}x${size}" \
    "$ROOT_DIR/$filename"
}

# Ícones PWA
for size in 192 512; do
  generate_png "$size" "icon-${size}.png"
done

# Apple touch icons
for size in 57 60 72 76 114 120 144 152 167 180; do
  generate_png "$size" "apple-touch-icon-${size}x${size}.png"
done

# Atalhos mais comuns
cp "$ROOT_DIR/apple-touch-icon-180x180.png" "$ROOT_DIR/apple-touch-icon.png"
convert "$SOURCE_IMAGE" -resize 48x48 "$ROOT_DIR/favicon.ico"

echo "✅ Ícones atualizados a partir de: $SOURCE_IMAGE"

#!/bin/bash

# Criar ícones simples usando ImageMagick
# Ícone 192x192
convert -size 192x192 xc:'#8b5cf6' \
  -gravity center \
  -pointsize 80 -fill white -font DejaVu-Sans-Bold \
  -annotate +0+0 'TE' \
  icon-192.png

# Ícone 512x512
convert -size 512x512 xc:'#8b5cf6' \
  -gravity center \
  -pointsize 200 -fill white -font DejaVu-Sans-Bold \
  -annotate +0+0 'TE' \
  icon-512.png

echo "✅ Ícones criados: icon-192.png e icon-512.png"

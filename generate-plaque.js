import fs from "fs"
import path from "path"

const files = [
  {
    path: "src/lib/r2.ts",
    content: `
export function getPublicR2Url(key: string) {
  return \`https://assets.tocaessa.com/\${key}\`
}
`.trim()
  },
  {
    path: "src/styles/plaque.css",
    content: `
@page {
  size: 10cm 15cm;
  margin: 0;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.card {
  width: 10cm;
  height: 15cm;
  background: linear-gradient(180deg, #2B124C, #5E2B97);
  color: #fff;
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
}

h1 {
  font-size: 22px;
  margin: 4px 0 10px;
}

.photo {
  width: 90px;
  height: 90px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h2 {
  font-size: 16px;
  margin: 8px 0;
}

.description {
  font-size: 11px;
  opacity: 0.9;
  margin: 6px 0 10px;
}

.qr img {
  width: 110px;
  height: 110px;
  background: #fff;
  padding: 6px;
  border-radius: 6px;
}

.scan {
  font-size: 10px;
  display: block;
  margin-top: 4px;
}

footer {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  margin-top: 8px;
  opacity: 0.8;
}
`.trim()
  },
  {
    path: "src/templates/plaque.html",
    content: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Plaquinha</title>
  <link rel="stylesheet" href="/styles/plaque.css" />
</head>
<body>

<div class="card">
  <h1>🎤 ESTAMOS AO VIVO</h1>

  <div class="photo">
    <img src="{{PHOTO_URL}}" />
  </div>

  <h2>{{ARTIST_NAME}}</h2>

  <p class="description">
    Escaneie o QR Code, veja o perfil do artista,
    peça sua música e deixe uma gorjeta
    para apoiar o artista.
  </p>

  <div class="qr">
    <img src="{{QR_CODE_URL}}" />
  </div>

  <span class="scan">⬇️ Escaneie aqui ⬇️</span>

  <footer>
    <span>Toca Essa</span>
    <span>@{{INSTAGRAM}}</span>
  </footer>
</div>

</body>
</html>
`.trim()
  },
  {
    path: "src/routes/plaque.ts",
    content: `
import { Hono } from "hono"
import template from "../templates/plaque.html?raw"
import { getPublicR2Url } from "../lib/r2"

const plaque = new Hono()

plaque.get("/:slug", async (c) => {
  const slug = c.req.param("slug")

  // TODO: substituir por busca real no banco
  const artist = {
    name: "Douglas Felipe",
    instagram: "douglasfelipecantor",
    photoKey: \`artists/\${slug}/photo.jpg\`,
    qrKey: \`artists/\${slug}/qr.png\`
  }

  const html = template
    .replace("{{ARTIST_NAME}}", artist.name)
    .replace("{{INSTAGRAM}}", artist.instagram)
    .replace("{{PHOTO_URL}}", getPublicR2Url(artist.photoKey))
    .replace("{{QR_CODE_URL}}", getPublicR2Url(artist.qrKey))

  return c.html(html)
})

export default plaque
`.trim()
  }
]

files.forEach(({ path: filePath, content }) => {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content)
    console.log("✔ criado:", filePath)
  } else {
    console.log("⚠ já existe:", filePath)
  }
})

console.log("\n✅ Plaquinha gerada com sucesso.")

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { setCookie, getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
  PHOTOS: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Serve PWA manifest manually
app.get('/manifest.json', (c) => {
  return c.json({
    "name": "TOCA ESSA",
    "short_name": "TOCA ESSA",
    "description": "Plataforma de interação ao vivo entre artistas e público",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a0b2e",
    "theme_color": "#8b5cf6",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "categories": ["music", "entertainment"],
    "lang": "pt-BR",
    "dir": "ltr"
  })
})

// Serve PWA icons using serveStatic with correct path
app.get('/icon-192.png', serveStatic({ path: 'icon-192.png', root: './public' }))
app.get('/icon-512.png', serveStatic({ path: 'icon-512.png', root: './public' }))
app.get('/sw.js', serveStatic({ path: 'sw.js', root: './public' }))

// Serve PWA screenshots
app.get('/screenshot-portrait.png',  serveStatic({ path: 'screenshot-portrait.png',  root: './public' }))
app.get('/screenshot-landscape.png', serveStatic({ path: 'screenshot-landscape.png', root: './public' }))

// Serve Apple touch icons
app.get('/apple-touch-icon.png',        serveStatic({ path: 'apple-touch-icon.png', root: './public' }))
app.get('/apple-touch-icon-57x57.png',  serveStatic({ path: 'apple-touch-icon-57x57.png', root: './public' }))
app.get('/apple-touch-icon-60x60.png',  serveStatic({ path: 'apple-touch-icon-60x60.png', root: './public' }))
app.get('/apple-touch-icon-72x72.png',  serveStatic({ path: 'apple-touch-icon-72x72.png', root: './public' }))
app.get('/apple-touch-icon-76x76.png',  serveStatic({ path: 'apple-touch-icon-76x76.png', root: './public' }))
app.get('/apple-touch-icon-114x114.png',serveStatic({ path: 'apple-touch-icon-114x114.png', root: './public' }))
app.get('/apple-touch-icon-120x120.png',serveStatic({ path: 'apple-touch-icon-120x120.png', root: './public' }))
app.get('/apple-touch-icon-144x144.png',serveStatic({ path: 'apple-touch-icon-144x144.png', root: './public' }))
app.get('/apple-touch-icon-152x152.png',serveStatic({ path: 'apple-touch-icon-152x152.png', root: './public' }))
app.get('/apple-touch-icon-167x167.png',serveStatic({ path: 'apple-touch-icon-167x167.png', root: './public' }))
app.get('/apple-touch-icon-180x180.png',serveStatic({ path: 'apple-touch-icon-180x180.png', root: './public' }))

// Serve Apple splash screens
app.get('/splash-640x1136.png',  serveStatic({ path: 'splash-640x1136.png', root: './public' }))
app.get('/splash-750x1334.png',  serveStatic({ path: 'splash-750x1334.png', root: './public' }))
app.get('/splash-828x1792.png',  serveStatic({ path: 'splash-828x1792.png', root: './public' }))
app.get('/splash-1080x1920.png', serveStatic({ path: 'splash-1080x1920.png', root: './public' }))
app.get('/splash-1125x2436.png', serveStatic({ path: 'splash-1125x2436.png', root: './public' }))
app.get('/splash-1170x2532.png', serveStatic({ path: 'splash-1170x2532.png', root: './public' }))
app.get('/splash-1179x2556.png', serveStatic({ path: 'splash-1179x2556.png', root: './public' }))
app.get('/splash-1242x2208.png', serveStatic({ path: 'splash-1242x2208.png', root: './public' }))
app.get('/splash-1242x2688.png', serveStatic({ path: 'splash-1242x2688.png', root: './public' }))
app.get('/splash-1284x2778.png', serveStatic({ path: 'splash-1284x2778.png', root: './public' }))
app.get('/splash-1290x2796.png', serveStatic({ path: 'splash-1290x2796.png', root: './public' }))
app.get('/splash-1488x2266.png', serveStatic({ path: 'splash-1488x2266.png', root: './public' }))
app.get('/splash-1536x2048.png', serveStatic({ path: 'splash-1536x2048.png', root: './public' }))
app.get('/splash-1620x2160.png', serveStatic({ path: 'splash-1620x2160.png', root: './public' }))
app.get('/splash-1668x2224.png', serveStatic({ path: 'splash-1668x2224.png', root: './public' }))
app.get('/splash-1668x2388.png', serveStatic({ path: 'splash-1668x2388.png', root: './public' }))
app.get('/splash-2048x2732.png', serveStatic({ path: 'splash-2048x2732.png', root: './public' }))

// Serve Android APK for download
app.get('/download/TocaEssa.apk', async (c) => {
  const apkData = await c.env.ASSETS?.fetch?.(new Request('https://assets.local/TocaEssa.apk'))
    .catch(() => null)
  // Serve via serveStatic
  return c.redirect('/TocaEssa.apk', 302)
})
app.get('/TocaEssa.apk', serveStatic({ path: 'TocaEssa.apk', root: './public' }))

// ======================
// Helper Functions
// ======================

// Simple password hashing (in production, use bcrypt properly)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Generate session ID
function generateSessionId(): string {
  return crypto.randomUUID()
}

// Check if user is authenticated
async function checkAuth(c: any): Promise<any> {
  const sessionId = getCookie(c, 'session_id')
  
  if (!sessionId) {
    return null
  }
  
  const session = await c.env.DB.prepare(`
    SELECT s.*, u.id as user_id, u.email, u.full_name, u.role, u.license_status, u.license_paid, u.account_paid
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).bind(sessionId).first()
  
  return session
}

// ======================
// API Routes - Authentication
// ======================

// Register new artist
app.post('/api/auth/register', async (c) => {
  const { email, password, full_name, artist_name, bio } = await c.req.json()
  
  if (!email || !password || !full_name || !artist_name) {
    return c.json({ error: 'Campos obrigatórios faltando' }, 400)
  }
  
  // Check if email already exists
  const existingUser = await c.env.DB.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first()
  
  if (existingUser) {
    return c.json({ error: 'Email já cadastrado' }, 400)
  }
  
  // Hash password
  const passwordHash = await hashPassword(password)
  
  // Create user (account_paid = 0 by default)
  const userResult = await c.env.DB.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, email_verified, account_paid)
    VALUES (?, ?, ?, 'artist', 1, 0)
  `).bind(email, passwordHash, full_name).run()
  
  const userId = userResult.meta.last_row_id
  
  // Create slug from artist name
  const slug = artist_name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // Create artist profile with QR code data
  const qrCodeData = `${c.req.url.split('/api')[0]}/${slug}` // Full URL to artist page
  
  await c.env.DB.prepare(`
    INSERT INTO artists (name, slug, bio, user_id, active, qr_code_data, qr_code_generated_at)
    VALUES (?, ?, ?, ?, 1, ?, datetime('now'))
  `).bind(artist_name, slug, bio || '', userId, qrCodeData).run()
  
  return c.json({ 
    success: true,
    message: 'Conta criada com sucesso!',
    slug,
    payment_required: true,
    payment_amount: 199.00
  })
})

// Login
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'Email e senha são obrigatórios' }, 400)
  }
  
  // Hash password to compare
  const passwordHash = await hashPassword(password)
  
  // Find user
  const user = await c.env.DB.prepare(`
    SELECT u.*, a.slug as artist_slug
    FROM users u
    LEFT JOIN artists a ON a.user_id = u.id
    WHERE u.email = ? AND u.password_hash = ?
  `).bind(email, passwordHash).first()
  
  if (!user) {
    return c.json({ error: 'Email ou senha incorretos' }, 401)
  }
  
  // Create session
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  await c.env.DB.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).bind(sessionId, user.id, expiresAt.toISOString()).run()
  
  // Set cookie
  setCookie(c, 'session_id', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    expires: expiresAt,
    path: '/'
  })
  
  return c.json({ 
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'artist',
      license_status: user.license_status || 'pending',
      artist_slug: user.artist_slug
    }
  })
})

// Logout
app.post('/api/auth/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  
  if (sessionId) {
    await c.env.DB.prepare(`
      DELETE FROM sessions WHERE id = ?
    `).bind(sessionId).run()
  }
  
  setCookie(c, 'session_id', '', {
    maxAge: 0,
    path: '/'
  })
  
  return c.json({ success: true })
})

// Change password
app.post('/api/auth/change-password', async (c) => {
  const session = await checkAuth(c)
  
  if (!session) {
    return c.json({ error: 'Não autenticado' }, 401)
  }
  
  const { current_password, new_password } = await c.req.json()
  
  if (!current_password || !new_password) {
    return c.json({ error: 'Senha atual e nova senha são obrigatórias' }, 400)
  }
  
  if (new_password.length < 6) {
    return c.json({ error: 'A nova senha deve ter no mínimo 6 caracteres' }, 400)
  }
  
  // Hash current password to verify
  const currentPasswordHash = await hashPassword(current_password)
  
  // Get user
  const user = await c.env.DB.prepare(`
    SELECT * FROM users WHERE id = ? AND password_hash = ?
  `).bind(session.user_id, currentPasswordHash).first()
  
  if (!user) {
    return c.json({ error: 'Senha atual incorreta' }, 400)
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(new_password)
  
  // Update password
  await c.env.DB.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `).bind(newPasswordHash, session.user_id).run()
  
  // Delete all sessions (force re-login)
  await c.env.DB.prepare(`
    DELETE FROM sessions WHERE user_id = ?
  `).bind(session.user_id).run()
  
  return c.json({ success: true, message: 'Senha alterada com sucesso' })
})

// Get current user
app.get('/api/auth/me', async (c) => {
  const session = await checkAuth(c)
  
  if (!session) {
    return c.json({ error: 'Não autenticado' }, 401)
  }
  
  // Get artist data
  const artist = await c.env.DB.prepare(`
    SELECT * FROM artists WHERE user_id = ?
  `).bind(session.user_id).first()
  
  return c.json({
    user: {
      id: session.user_id,
      email: session.email,
      full_name: session.full_name,
      role: session.role,
      license_status: session.license_status || 'pending',
      license_paid: session.license_paid || 0,
      account_paid: session.account_paid || 0
    },
    artist: artist
  })
})

// ======================
// API Routes - Artists
// ======================

// List all active artists (for selection page)
app.get('/api/artists', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT id, name, slug, bio, photo_url
    FROM artists 
    WHERE active = 1
    ORDER BY name ASC
  `).all()
  
  return c.json(results)
})

// Get artist by slug
app.get('/api/artists/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT * FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  return c.json(artist)
})

// Update artist profile
app.patch('/api/artists/:slug', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  const body = await c.req.json()
  const { name, bio } = body
  
  // photo_url is optional — only update if explicitly provided
  const hasPhotoUrl = 'photo_url' in body
  const photo_url = body.photo_url

  // Verify ownership (admins can update any artist)
  let artist: any
  if (session.role === 'admin') {
    artist = await c.env.DB.prepare(`
      SELECT id FROM artists WHERE slug = ?
    `).bind(slug).first()
  } else {
    artist = await c.env.DB.prepare(`
      SELECT id FROM artists WHERE slug = ? AND user_id = ?
    `).bind(slug, session.user_id).first()
  }
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  if (hasPhotoUrl) {
    // Update name, bio AND photo_url
    await c.env.DB.prepare(`
      UPDATE artists 
      SET name = ?, bio = ?, photo_url = ?
      WHERE id = ?
    `).bind(name, bio, photo_url, artist.id).run()
  } else {
    // Update only name and bio (photo was already saved by upload route)
    await c.env.DB.prepare(`
      UPDATE artists 
      SET name = ?, bio = ?
      WHERE id = ?
    `).bind(name, bio, artist.id).run()
  }
  
  return c.json({ success: true })
})

// Upload artist photo
app.post('/api/artists/:slug/upload-photo', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  
  // Admins can upload for any artist; artists only for their own
  let artist: any
  if (session.role === 'admin') {
    artist = await c.env.DB.prepare(`
      SELECT id FROM artists WHERE slug = ?
    `).bind(slug).first()
  } else {
    artist = await c.env.DB.prepare(`
      SELECT id FROM artists WHERE slug = ? AND user_id = ?
    `).bind(slug, session.user_id).first()
  }
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  try {
    // Get the uploaded file
    const formData = await c.req.formData()
    const file = formData.get('photo') as File
    
    if (!file) {
      return c.json({ error: 'Nenhum arquivo enviado' }, 400)
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP' }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()

    // Try R2 first (if bucket is configured)
    if (c.env.PHOTOS) {
      // Check file size (max 10MB for R2)
      if (file.size > 10 * 1024 * 1024) {
        return c.json({ error: 'Arquivo muito grande. Máximo: 10MB' }, 400)
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const filename = `artists/${artist.id}/${timestamp}-${randomString}.${extension}`

      await c.env.PHOTOS.put(filename, arrayBuffer, {
        httpMetadata: { contentType: file.type }
      })

      const photoUrl = `https://pub-df20f3da598547869c7b81faf9a60ffd.r2.dev/${filename}`

      await c.env.DB.prepare(`
        UPDATE artists SET photo_url = ? WHERE id = ?
      `).bind(photoUrl, artist.id).run()

      return c.json({ success: true, photo_url: photoUrl })
    }

    // Fallback: store as base64 data URL in D1 (max 512KB)
    if (file.size > 512 * 1024) {
      return c.json({ error: 'Foto muito grande. Sem R2 configurado, use imagens até 512KB. Configure o R2 no painel do Cloudflare para aceitar até 10MB.' }, 400)
    }

    // Safe base64 conversion (avoid stack overflow with large spread)
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    const base64 = btoa(binary)
    const photoUrl = `data:${file.type};base64,${base64}`

    await c.env.DB.prepare(`
      UPDATE artists SET photo_url = ? WHERE id = ?
    `).bind(photoUrl, artist.id).run()

    return c.json({ success: true, photo_url: photoUrl })

  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Erro ao fazer upload da foto' }, 500)
  }
})

// Serve photos from R2
app.get('/api/photos/*', async (c) => {
  if (!c.env.PHOTOS) {
    return c.notFound()
  }

  const path = c.req.path.replace('/api/photos/', '')
  
  try {
    const object = await c.env.PHOTOS.get(path)
    
    if (!object) {
      return c.notFound()
    }
    
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000, immutable')
    
    return new Response(object.body, { headers })
  } catch (error) {
    return c.notFound()
  }
})

// ======================
// API Routes - Songs/Repertoire
// ======================

// Get all songs for an artist
app.get('/api/artists/:slug/songs', async (c) => {
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM songs 
    WHERE artist_id = ? 
    ORDER BY title ASC
  `).bind(artist.id).all()
  
  return c.json(results)
})

// Add song to repertoire
app.post('/api/artists/:slug/songs', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  const { title, artist_name, genre, duration, notes } = await c.req.json()
  
  // Verify ownership
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  const result = await c.env.DB.prepare(`
    INSERT INTO songs (artist_id, title, artist_name, genre, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(artist.id, title, artist_name, genre, duration || null, notes || null).run()
  
  return c.json({ 
    id: result.meta.last_row_id, 
    title, 
    artist_name, 
    genre,
    success: true 
  })
})

// Delete song
app.delete('/api/songs/:id', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const songId = c.req.param('id')
  
  // Verify ownership
  const song = await c.env.DB.prepare(`
    SELECT s.id FROM songs s
    JOIN artists a ON s.artist_id = a.id
    WHERE s.id = ? AND a.user_id = ?
  `).bind(songId, session.user_id).first()
  
  if (!song) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  await c.env.DB.prepare(`
    DELETE FROM songs WHERE id = ?
  `).bind(songId).run()
  
  return c.json({ success: true })
})

// ======================
// API Routes - Song Requests
// ======================

// Get all requests for an artist
app.get('/api/artists/:slug/requests', async (c) => {
  const slug = c.req.param('slug')
  const status = c.req.query('status')
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  let query = `
    SELECT 
      sr.id,
      sr.requester_name,
      sr.requester_message,
      sr.tip_amount,
      sr.tip_message,
      sr.status,
      sr.created_at,
      sr.updated_at,
      s.title as song_title,
      s.artist_name as song_artist,
      s.genre as song_genre
    FROM song_requests sr
    JOIN songs s ON sr.song_id = s.id
    WHERE sr.artist_id = ?
  `
  
  const params: any[] = [artist.id]
  
  if (status) {
    query += ` AND sr.status = ?`
    params.push(status)
  }
  
  // Order by tip amount DESC (requests with tips go first), then by creation date
  query += ` ORDER BY sr.tip_amount DESC, sr.created_at ASC`
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  
  return c.json(results)
})

// Create a song request
app.post('/api/artists/:slug/requests', async (c) => {
  const slug = c.req.param('slug')
  const { song_id, requester_name, requester_message, tip_amount, tip_message } = await c.req.json()
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  const song = await c.env.DB.prepare(`
    SELECT id FROM songs WHERE id = ? AND artist_id = ?
  `).bind(song_id, artist.id).first()
  
  if (!song) {
    return c.json({ error: 'Música não encontrada no repertório' }, 404)
  }
  
  // Insert request with optional tip
  const tipValue = tip_amount && tip_amount > 0 ? tip_amount : 0
  
  const result = await c.env.DB.prepare(`
    INSERT INTO song_requests (artist_id, song_id, requester_name, requester_message, tip_amount, tip_message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).bind(artist.id, song_id, requester_name || 'Anônimo', requester_message || null, tipValue, tip_message || null).run()
  
  // If tip was included, create a tip record
  if (tipValue > 0) {
    await c.env.DB.prepare(`
      INSERT INTO tips (artist_id, amount, sender_name, message, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, 'pix', 'completed', ?)
    `).bind(artist.id, tipValue, requester_name || 'Anônimo', tip_message || 'Gorjeta junto com pedido', `TXN-${Date.now()}`).run()
  }
  
  return c.json({ 
    id: result.meta.last_row_id,
    message: tipValue > 0 ? 'Pedido com gorjeta enviado! Vai para o topo da fila!' : 'Pedido enviado com sucesso!',
    has_tip: tipValue > 0,
    tip_amount: tipValue
  })
})

// Update request status
app.patch('/api/requests/:id', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  if (!['pending', 'accepted', 'played', 'rejected'].includes(status)) {
    return c.json({ error: 'Status inválido' }, 400)
  }
  
  await c.env.DB.prepare(`
    UPDATE song_requests 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(status, id).run()
  
  return c.json({ success: true, status })
})

// ======================
// API Routes - Tips
// ======================

// Get all tips for an artist
app.get('/api/artists/:slug/tips', async (c) => {
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      id,
      amount,
      sender_name,
      message,
      payment_status,
      created_at
    FROM tips
    WHERE artist_id = ? AND payment_status = 'completed'
    ORDER BY created_at DESC
  `).bind(artist.id).all()
  
  const total = await c.env.DB.prepare(`
    SELECT SUM(amount) as total
    FROM tips
    WHERE artist_id = ? AND payment_status = 'completed'
  `).bind(artist.id).first()
  
  return c.json({
    tips: results,
    total: total?.total || 0
  })
})

// Get a specific tip by ID (for payment page)
app.get('/api/tips/:id', async (c) => {
  const id = c.req.param('id')
  
  const tip = await c.env.DB.prepare(`
    SELECT 
      t.id,
      t.amount,
      t.sender_name,
      t.message,
      t.payment_status,
      t.created_at,
      a.slug as artist_slug,
      a.name as artist_name
    FROM tips t
    JOIN artists a ON t.artist_id = a.id
    WHERE t.id = ?
  `).bind(id).first()
  
  if (!tip) {
    return c.json({ error: 'Gorjeta não encontrada' }, 404)
  }
  
  return c.json(tip)
})

// Create a tip
app.post('/api/artists/:slug/tips', async (c) => {
  const slug = c.req.param('slug')
  const { amount, sender_name, message, payment_method } = await c.req.json()
  
  // Get artist with bank account info
  const artist = await c.env.DB.prepare(`
    SELECT a.id, a.name, ba.pix_key, ba.pix_key_type, ba.account_holder_name
    FROM artists a
    LEFT JOIN bank_accounts ba ON a.id = ba.artist_id AND ba.is_active = 1
    WHERE a.slug = ? AND a.active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  if (!amount || amount <= 0) {
    return c.json({ error: 'Valor inválido' }, 400)
  }
  
  // Check if artist has PIX configured
  if (!artist.pix_key) {
    return c.json({ error: 'Artista ainda não configurou dados bancários' }, 400)
  }
  
  // Create tip with pending status
  const result = await c.env.DB.prepare(`
    INSERT INTO tips (artist_id, amount, sender_name, message, payment_method, payment_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(artist.id, amount, sender_name || 'Anônimo', message || null, payment_method || 'pix').run()
  
  const tipId = result.meta.last_row_id
  
  // Return PIX data for payment
  return c.json({ 
    id: tipId,
    message: 'Prossiga para o pagamento',
    pix_data: {
      key: artist.pix_key,
      key_type: artist.pix_key_type,
      amount: amount,
      recipient_name: artist.account_holder_name || artist.name,
      description: message || `Gorjeta para ${artist.name}`
    },
    payment_url: `/payment/${slug}/${tipId}`
  })
})

// ======================
// API Routes - Bank Accounts
// ======================

// Get PIX data for payment (public route - only PIX info)
app.get('/api/artists/:slug/pix-info', async (c) => {
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT a.id, a.name, ba.pix_key, ba.pix_key_type, ba.account_holder_name
    FROM artists a
    LEFT JOIN bank_accounts ba ON a.id = ba.artist_id AND ba.is_active = 1
    WHERE a.slug = ? AND a.active = 1
  `).bind(slug).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  if (!artist.pix_key) {
    return c.json({ error: 'PIX não configurado' }, 404)
  }
  
  return c.json({
    pix_key: artist.pix_key,
    pix_key_type: artist.pix_key_type,
    recipient_name: artist.account_holder_name || artist.name
  })
})

// Get bank account for artist (authenticated)
app.get('/api/artists/:slug/bank-account', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  const account = await c.env.DB.prepare(`
    SELECT * FROM bank_accounts 
    WHERE artist_id = ? AND is_active = 1
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(artist.id).first()
  
  return c.json(account || {})
})

// Save/Update bank account
app.post('/api/artists/:slug/bank-account', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  const data = await c.req.json()
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  // Deactivate old accounts
  await c.env.DB.prepare(`
    UPDATE bank_accounts SET is_active = 0 WHERE artist_id = ?
  `).bind(artist.id).run()
  
  // Insert new account - handle undefined values as null
  const result = await c.env.DB.prepare(`
    INSERT INTO bank_accounts (
      artist_id, account_type, pix_key, pix_key_type,
      bank_code, bank_name, agency, account_number,
      account_holder_name, account_holder_document, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    artist.id, 
    data.account_type || null, 
    data.pix_key || null, 
    data.pix_key_type || null,
    data.bank_code || null, 
    data.bank_name || null, 
    data.agency || null, 
    data.account_number || null,
    data.account_holder_name || null, 
    data.account_holder_document || null
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// ======================
// API Routes - Admin Panel
// ======================

// Admin middleware - Check if user is admin
async function checkAdminAuth(c: any): Promise<any> {
  const session = await checkAuth(c)
  
  if (!session || session.role !== 'admin') {
    return null
  }
  
  return session
}

// Admin login
app.post('/api/admin/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'Email e senha são obrigatórios' }, 400)
  }
  
  const passwordHash = await hashPassword(password)
  
  const user = await c.env.DB.prepare(`
    SELECT * FROM users WHERE email = ? AND password_hash = ? AND role = 'admin'
  `).bind(email, passwordHash).first()
  
  if (!user) {
    return c.json({ error: 'Credenciais inválidas' }, 401)
  }
  
  // Create session
  const sessionId = generateSessionId()
  await c.env.DB.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+7 days'))
  `).bind(sessionId, user.id).run()
  
  setCookie(c, 'session_id', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })
  
  return c.json({ 
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  })
})

// Admin logout
app.post('/api/admin/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  
  if (sessionId) {
    await c.env.DB.prepare(`
      DELETE FROM sessions WHERE id = ?
    `).bind(sessionId).run()
  }
  
  setCookie(c, 'session_id', '', {
    maxAge: 0,
    path: '/'
  })
  
  return c.json({ success: true })
})

// Get admin stats - rota unificada (removida duplicata)

// Get all users
app.get('/api/admin/users', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.created_at,
      a.name as artist_name,
      a.slug as artist_slug
    FROM users u
    LEFT JOIN artists a ON u.id = a.user_id
    ORDER BY u.created_at DESC
  `).all()
  
  return c.json(results)
})

// Change user password (admin)
app.post('/api/admin/users/:id/change-password', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const userId = c.req.param('id')
  const { new_password } = await c.req.json()
  
  if (!new_password || new_password.length < 6) {
    return c.json({ error: 'Nova senha deve ter no mínimo 6 caracteres' }, 400)
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(new_password)
  
  // Update password
  await c.env.DB.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `).bind(newPasswordHash, userId).run()
  
  // Delete all user sessions (force re-login)
  await c.env.DB.prepare(`
    DELETE FROM sessions WHERE user_id = ?
  `).bind(userId).run()
  
  return c.json({ success: true, message: 'Senha alterada com sucesso' })
})

// Delete user (admin)
app.delete('/api/admin/users/:id', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const userId = c.req.param('id')
  
  // Check if user is admin
  const user = await c.env.DB.prepare(`
    SELECT role FROM users WHERE id = ?
  `).bind(userId).first()
  
  if (user?.role === 'admin') {
    return c.json({ error: 'Não é possível excluir usuários admin' }, 400)
  }
  
  try {
    // Delete in correct order to avoid foreign key constraints
    // Note: bank_accounts and tips use artist_id, not user_id
    
    // 1. Delete license payments (uses user_id)
    await c.env.DB.prepare(`
      DELETE FROM license_payments WHERE user_id = ?
    `).bind(userId).run()
    
    // 2. Delete tips (uses artist_id)
    await c.env.DB.prepare(`
      DELETE FROM tips WHERE artist_id IN (SELECT id FROM artists WHERE user_id = ?)
    `).bind(userId).run()
    
    // 3. Delete song_requests (uses artist_id)
    await c.env.DB.prepare(`
      DELETE FROM song_requests WHERE artist_id IN (SELECT id FROM artists WHERE user_id = ?)
    `).bind(userId).run()
    
    // 4. Delete songs (uses artist_id)
    await c.env.DB.prepare(`
      DELETE FROM songs WHERE artist_id IN (SELECT id FROM artists WHERE user_id = ?)
    `).bind(userId).run()
    
    // 5. Delete bank accounts (uses artist_id)
    await c.env.DB.prepare(`
      DELETE FROM bank_accounts WHERE artist_id IN (SELECT id FROM artists WHERE user_id = ?)
    `).bind(userId).run()
    
    // 6. Delete shows (uses artist_id)
    await c.env.DB.prepare(`
      DELETE FROM shows WHERE artist_id IN (SELECT id FROM artists WHERE user_id = ?)
    `).bind(userId).run()
    
    // 7. Delete artist
    await c.env.DB.prepare(`
      DELETE FROM artists WHERE user_id = ?
    `).bind(userId).run()
    
    // 8. Delete user sessions
    await c.env.DB.prepare(`
      DELETE FROM sessions WHERE user_id = ?
    `).bind(userId).run()
    
    // 9. Finally delete user
    await c.env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(userId).run()
    
    return c.json({ success: true, message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return c.json({ error: 'Erro ao excluir usuário: ' + (error as Error).message }, 500)
  }
})

// Get payment information for license (public - no auth needed for registration flow)
app.get('/api/license/payment-info', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT config_key, config_value 
    FROM system_config 
    WHERE config_key IN ('admin_pix_key', 'admin_pix_key_type', 'admin_pix_name', 'license_amount', 'license_description', 'support_whatsapp', 'support_email')
  `).all()
  
  const config: Record<string, string> = {}
  results.forEach((row: any) => {
    config[row.config_key] = row.config_value
  })
  
  return c.json({
    pix_key:           config.admin_pix_key      || '04940013138',
    pix_key_type:      config.admin_pix_key_type  || 'cpf',
    recipient_name:    config.admin_pix_name       || 'Douglas Felipe Nogueira da Silva',
    amount:            parseFloat(config.license_amount || '199.00'),
    description:       config.license_description  || 'Licença Vitalícia TOCA ESSA',
    support_whatsapp:  config.support_whatsapp     || '',
    support_email:     config.support_email        || ''
  })
})

// Mark license as paid (user)
app.post('/api/license/mark-as-paid', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  // Update user license status
  await c.env.DB.prepare(`
    UPDATE users 
    SET license_status = 'paid', license_paid_date = datetime('now')
    WHERE id = ?
  `).bind(session.user_id).run()
  
  // Create or update license payment record
  await c.env.DB.prepare(`
    INSERT INTO license_payments (user_id, amount, payment_status, payment_date)
    VALUES (?, 199.00, 'paid', datetime('now'))
  `).bind(session.user_id).run()
  
  return c.json({ success: true, message: 'Status atualizado para pago' })
})

// Get pending licenses (admin)
app.get('/api/admin/licenses/pending', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  // Only show licenses that are pending or paid (not approved or rejected)
  const { results } = await c.env.DB.prepare(`
    SELECT 
      u.id as user_id,
      u.email,
      u.full_name,
      u.license_status,
      u.license_paid_date,
      a.name as artist_name,
      a.slug as artist_slug,
      lp.id as payment_id,
      lp.amount,
      lp.payment_date
    FROM users u
    LEFT JOIN artists a ON u.id = a.user_id
    LEFT JOIN license_payments lp ON u.id = lp.user_id
    WHERE u.license_status IN ('pending', 'paid')
    ORDER BY 
      CASE u.license_status 
        WHEN 'paid' THEN 1 
        WHEN 'pending' THEN 2 
      END,
      lp.payment_date DESC
  `).all()
  
  return c.json(results)
})

// Approve license (admin)
app.post('/api/admin/licenses/:userId/approve', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const userId = c.req.param('userId')
  
  // Update user license status and mark as paid
  await c.env.DB.prepare(`
    UPDATE users 
    SET license_status = 'approved', 
        license_approved_date = datetime('now'),
        license_approved_by = ?,
        license_paid = 1,
        account_paid = 1,
        license_paid_at = COALESCE(license_paid_at, datetime('now'))
    WHERE id = ?
  `).bind(adminSession.user_id, userId).run()
  
  // Update payment record
  await c.env.DB.prepare(`
    UPDATE license_payments 
    SET payment_status = 'approved',
        approved_date = datetime('now'),
        approved_by = ?
    WHERE user_id = ?
  `).bind(adminSession.user_id, userId).run()
  
  return c.json({ success: true, message: 'Licença aprovada com sucesso! Usuário liberado.' })
})

// Reject license (admin)
app.post('/api/admin/licenses/:userId/reject', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const userId = c.req.param('userId')
  const { reason } = await c.req.json()
  
  // Update user license status
  await c.env.DB.prepare(`
    UPDATE users 
    SET license_status = 'rejected'
    WHERE id = ?
  `).bind(userId).run()
  
  // Update payment record
  await c.env.DB.prepare(`
    UPDATE license_payments 
    SET payment_status = 'rejected',
        rejection_reason = ?
    WHERE user_id = ?
  `).bind(reason || 'Comprovante inválido', userId).run()
  
  return c.json({ success: true, message: 'Licença rejeitada' })
})

// Get all app settings
app.get('/api/admin/settings', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM app_settings ORDER BY setting_key ASC
  `).all()
  
  return c.json(results)
})

// Update app setting
app.put('/api/admin/settings/:key', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const key = c.req.param('key')
  const { value } = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE app_settings 
    SET setting_value = ?, updated_at = datetime('now')
    WHERE setting_key = ?
  `).bind(value, key).run()
  
  return c.json({ success: true, key, value })
})

// Get system config (admin) - retorna objeto chave/valor
app.get('/api/admin/system-config', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)

  const { results } = await c.env.DB.prepare(`
    SELECT config_key, config_value FROM system_config
  `).all()

  const config: Record<string, string> = {}
  results.forEach((row: any) => { config[row.config_key] = row.config_value })
  return c.json(config)
})

// Save/update a single system config key (admin)
app.post('/api/admin/system-config', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)

  const { key, value } = await c.req.json()
  if (!key) return c.json({ error: 'Chave obrigatória' }, 400)

  await c.env.DB.prepare(`
    INSERT INTO system_config (config_key, config_value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(config_key) DO UPDATE SET config_value = excluded.config_value, updated_at = excluded.updated_at
  `).bind(key, value ?? '').run()

  return c.json({ success: true, key, value })
})

// Get admin bank account
app.get('/api/admin/bank-account', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const account = await c.env.DB.prepare(`
    SELECT * FROM admin_bank_account ORDER BY id DESC LIMIT 1
  `).first()
  
  return c.json(account || {})
})

// Update admin bank account
app.put('/api/admin/bank-account', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const { account_type, pix_key, pix_type, bank_name, agency, account_number, account_holder } = await c.req.json()
  
  // Delete old account
  await c.env.DB.prepare(`DELETE FROM admin_bank_account`).run()
  
  // Insert new account
  const result = await c.env.DB.prepare(`
    INSERT INTO admin_bank_account 
    (account_type, pix_key, pix_type, bank_name, agency, account_number, account_holder)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    account_type,
    pix_key || null,
    pix_type || null,
    bank_name || null,
    agency || null,
    account_number || null,
    account_holder || null
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Get all artists (admin)
app.get('/api/admin/artists', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      a.*,
      u.email,
      u.full_name as user_name,
      COUNT(DISTINCT s.id) as song_count,
      COUNT(DISTINCT sr.id) as request_count,
      COALESCE(SUM(CASE WHEN t.payment_status = 'completed' THEN t.amount ELSE 0 END), 0) as total_tips
    FROM artists a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN songs s ON a.id = s.artist_id
    LEFT JOIN song_requests sr ON a.id = sr.artist_id
    LEFT JOIN tips t ON a.id = t.artist_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `).all()
  
  return c.json(results)
})

// Get single artist details (admin)
app.get('/api/admin/artists/:id', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const id = c.req.param('id')
  
  const artist = await c.env.DB.prepare(`
    SELECT a.*, u.email, u.full_name as user_name
    FROM artists a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).bind(id).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  return c.json(artist)
})

// Update artist (admin)
app.put('/api/admin/artists/:id', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const id = c.req.param('id')
  const { name, slug, bio, photo_url, active } = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE artists 
    SET name = ?, slug = ?, bio = ?, active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(name, slug, bio || null, active ? 1 : 0, id).run()
  
  return c.json({ success: true })
})

// Delete artist (admin)
app.delete('/api/admin/artists/:id', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const id = c.req.param('id')
  
  // Get artist to find user_id
  const artist = await c.env.DB.prepare(`
    SELECT user_id FROM artists WHERE id = ?
  `).bind(id).first()
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }
  
  // Delete related data (cascade)
  await c.env.DB.prepare(`DELETE FROM bank_accounts WHERE artist_id = ?`).bind(id).run()
  await c.env.DB.prepare(`DELETE FROM tips WHERE artist_id = ?`).bind(id).run()
  await c.env.DB.prepare(`DELETE FROM song_requests WHERE artist_id = ?`).bind(id).run()
  await c.env.DB.prepare(`DELETE FROM songs WHERE artist_id = ?`).bind(id).run()
  await c.env.DB.prepare(`DELETE FROM artists WHERE id = ?`).bind(id).run()
  await c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(artist.user_id).run()
  
  return c.json({ success: true })
})

// Get dashboard stats (admin)
app.get('/api/admin/stats', async (c) => {
  const adminSession = await checkAdminAuth(c)
  if (!adminSession) return c.json({ error: 'Acesso negado' }, 403)
  
  const totalArtists = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM artists WHERE active = 1
  `).first()
  
  const totalSongs = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM songs
  `).first()
  
  const totalRequests = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM song_requests
  `).first()
  
  const totalTips = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total 
    FROM tips 
    WHERE payment_status = 'completed'
  `).first()
  
  const monthlyRevenue = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
  `).first()
  
  return c.json({
    total_artists: totalArtists?.count || 0,
    total_songs: totalSongs?.count || 0,
    total_requests: totalRequests?.count || 0,
    total_tips: totalTips?.total || 0,
    monthly_revenue: (monthlyRevenue?.count || 0) * 199.00 // Updated to one-time payment
  })
})

// ======================
// API Routes - QR Code
// ======================

// Get QR Code data for artist
app.get('/api/artists/:slug/qrcode', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT id, qr_code_data, qr_code_generated_at FROM artists 
    WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  return c.json({
    qr_code_data: artist.qr_code_data,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(artist.qr_code_data)}`,
    generated_at: artist.qr_code_generated_at
  })
})

// Regenerate QR Code for artist
app.post('/api/artists/:slug/qrcode/regenerate', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)
  
  const slug = c.req.param('slug')
  
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()
  
  if (!artist) {
    return c.json({ error: 'Acesso negado' }, 403)
  }
  
  // Generate new QR code data (URL to artist page)
  const baseUrl = c.req.url.split('/api')[0]
  const qrCodeData = `${baseUrl}/${slug}`
  
  await c.env.DB.prepare(`
    UPDATE artists 
    SET qr_code_data = ?, qr_code_generated_at = datetime('now')
    WHERE id = ?
  `).bind(qrCodeData, artist.id).run()
  
  return c.json({
    success: true,
    qr_code_data: qrCodeData,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`
  })
})

// ======================
// Frontend Routes
// ======================

// Home page - Landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <title>TOCA ESSA - Sistema para Artistas de Shows ao Vivo</title>
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <header class="text-center mb-12">
                <h1 class="text-6xl font-bold mb-4">
                    🎵 TOCA ESSA
                </h1>
                <p class="text-2xl text-gray-300">
                    Conecte-se com seu público durante shows ao vivo
                </p>
            </header>
            
            <!-- Hero Section -->
            <div class="max-w-4xl mx-auto mb-16">
                <div class="bg-white/10 backdrop-blur-lg p-12 rounded-3xl border border-white/20 text-center">
                    <div class="text-6xl mb-6">🎸✨📱</div>
                    <h2 class="text-4xl font-bold mb-6">
                        Receba pedidos de músicas e gorjetas sem interromper o show!
                    </h2>
                    <p class="text-xl text-gray-300 mb-8">
                        Seu público escaneia o QR Code e faz pedidos direto do celular
                    </p>
                    
                    <div class="flex gap-4 justify-center">
                        <a href="/register" class="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold text-xl transition">
                            <i class="fas fa-user-plus mr-2"></i>
                            Criar Conta
                        </a>
                        <a href="/login" class="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-xl transition">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Entrar
                        </a>
                    </div>
                    <div class="mt-4">
                        <a href="/tutorial" class="text-gray-300 hover:text-white text-sm underline transition">
                            <i class="fas fa-graduation-cap mr-1"></i>Ver tutorial completo
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Features -->
            <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
                <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center">
                    <div class="text-5xl mb-4">📱</div>
                    <h3 class="text-2xl font-bold mb-3">QR Code Exclusivo</h3>
                    <p class="text-gray-300">
                        Tenha seu próprio QR Code. Clientes escaneiam e vão direto para sua página.
                    </p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center">
                    <div class="text-5xl mb-4">🎵</div>
                    <h3 class="text-2xl font-bold mb-3">Pedidos em Tempo Real</h3>
                    <p class="text-gray-300">
                        Receba pedidos de músicas ao vivo. Aceite, recuse ou marque como tocada.
                    </p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center">
                    <div class="text-5xl mb-4">💰</div>
                    <h3 class="text-2xl font-bold mb-3">Gorjetas Ilimitadas</h3>
                    <p class="text-gray-300">
                        Clientes podem enviar gorjetas junto com os pedidos. Pedidos com gorjeta têm prioridade!
                    </p>
                </div>
            </div>
            
            <!-- Pricing -->
            <div class="max-w-2xl mx-auto mb-16">
                <div class="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-10 rounded-3xl border-2 border-green-400/50 text-center">
                    <div class="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full font-bold mb-4">
                        💎 OFERTA ESPECIAL
                    </div>
                    <h2 class="text-5xl font-bold mb-4">
                        R$ 199,00
                    </h2>
                    <p class="text-2xl font-bold text-green-300 mb-6">
                        Pagamento Único - Licença Vitalícia
                    </p>
                    <ul class="text-left max-w-md mx-auto space-y-3 mb-8">
                        <li class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <span>Acesso ilimitado para sempre</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <span>Sem mensalidades</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <span>QR Code personalizado</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <span>Gorjetas ilimitadas</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <span>Gestão completa de repertório</span>
                        </li>
                    </ul>
                    
                    <a href="/register" class="inline-block bg-green-600 hover:bg-green-700 px-12 py-5 rounded-xl font-bold text-2xl transition">
                        <i class="fas fa-rocket mr-2"></i>
                        Começar Agora
                    </a>
                </div>
            </div>
            
            <!-- How it works -->
            <div class="max-w-4xl mx-auto mb-16">
                <h2 class="text-4xl font-bold text-center mb-12">
                    Como Funciona
                </h2>
                
                <div class="space-y-8">
                    <div class="flex gap-6 items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                            1
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2">Crie sua conta</h3>
                            <p class="text-gray-300">Cadastre-se em menos de 2 minutos. Sem dados de cartão.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-6 items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                            2
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2">Baixe seu QR Code</h3>
                            <p class="text-gray-300">Acesse o painel e baixe seu QR Code personalizado.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-6 items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                            3
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2">Imprima e coloque nas mesas</h3>
                            <p class="text-gray-300">Imprima o QR Code e coloque nos estabelecimentos onde você toca.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-6 items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                            4
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2">Receba pedidos ao vivo!</h3>
                            <p class="text-gray-300">Clientes escaneiam, pedem músicas e enviam gorjetas. Tudo em tempo real!</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <footer class="text-center text-gray-400 border-t border-white/10 pt-8">
                <p>© 2025 TOCA ESSA - Conectando artistas e público</p>
                <div class="mt-4 flex gap-4 justify-center flex-wrap">
                    <a href="/tutorial" class="hover:text-white transition">
                        <i class="fas fa-graduation-cap mr-1"></i>Tutorial
                    </a>
                    <a href="/download" class="hover:text-white transition">
                        <i class="fas fa-mobile-alt mr-1"></i>Baixar App
                    </a>
                    <a href="/admin" class="hover:text-white transition">
                        <i class="fas fa-user-shield mr-1"></i>Admin
                    </a>
                </div>
            </footer>
        </div>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Tutorial page
app.get('/tutorial', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <title>Tutorial - TOCA ESSA</title>
        <meta name="theme-color" content="#2563EB">
        <link rel="icon" href="/icon-192.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          html { scroll-behavior: smooth; }
          .step-card { transition: transform 0.2s, box-shadow 0.2s; }
          .step-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(37,99,235,0.18); }
          .tab-btn.active { background: #2563EB; color: #fff; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
          ::-webkit-scrollbar { width: 6px; } 
          ::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; }
          .badge { display:inline-block; padding:2px 10px; border-radius:9999px; font-size:0.7rem; font-weight:700; }
        </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white">

      <!-- Header -->
      <header class="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-white/10 px-4 py-3">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="/icon-192.png" class="w-9 h-9 rounded-xl" alt="logo">
            <div>
              <div class="font-bold text-white text-sm leading-tight">TOCA ESSA</div>
              <div class="text-blue-300 text-xs">Tutorial completo</div>
            </div>
          </div>
          <a href="/login" class="text-xs text-blue-300 hover:text-white bg-blue-600/30 hover:bg-blue-600/60 px-3 py-1.5 rounded-lg transition-all">
            <i class="fas fa-sign-in-alt mr-1"></i>Entrar
          </a>
        </div>
      </header>

      <!-- Hero -->
      <section class="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        <div class="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-4">
          <i class="fas fa-graduation-cap"></i> Guia passo a passo
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold mb-3">Como usar o <span class="text-blue-400">TOCA ESSA</span></h1>
        <p class="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
          Plataforma de interação ao vivo entre artistas e público durante shows. Siga os passos abaixo e comece em minutos.
        </p>
      </section>

      <!-- Quick Nav -->
      <div class="max-w-4xl mx-auto px-4 mb-8">
        <div class="flex flex-wrap gap-2 justify-center">
          <a href="#artista" class="bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 px-4 py-2 rounded-xl text-sm transition-all"><i class="fas fa-guitar mr-1.5"></i>Sou Artista</a>
          <a href="#publico" class="bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 px-4 py-2 rounded-xl text-sm transition-all"><i class="fas fa-users mr-1.5"></i>Sou do Público</a>
          <a href="#show" class="bg-green-600/30 hover:bg-green-600/60 border border-green-500/40 px-4 py-2 rounded-xl text-sm transition-all"><i class="fas fa-microphone mr-1.5"></i>Durante o Show</a>
          <a href="#app" class="bg-orange-600/30 hover:bg-orange-600/60 border border-orange-500/40 px-4 py-2 rounded-xl text-sm transition-all"><i class="fas fa-mobile-alt mr-1.5"></i>Instalar App</a>
        </div>
      </div>

      <!-- ===== ARTISTA ===== -->
      <section id="artista" class="max-w-4xl mx-auto px-4 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-lg">🎸</div>
          <div>
            <h2 class="text-xl font-bold">Para Artistas</h2>
            <p class="text-slate-400 text-xs">Cadastro, configuração e uso durante o show</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">

          <!-- Passo 1 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">1</span>
              <h3 class="font-semibold text-sm">Criar sua conta</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Acesse <strong class="text-white">apptocaessa.com.br</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Clique em <strong class="text-white">"Cadastrar como Artista"</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Preencha: nome completo, e-mail, senha, nome artístico e bio</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Clique em <strong class="text-white">"Criar conta"</strong></li>
            </ol>
            <div class="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300">
              <i class="fas fa-info-circle mr-1"></i>Após o cadastro você será redirecionado para a <strong>página de pagamento da licença</strong>.
            </div>
          </div>

          <!-- Passo 2 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">2</span>
              <h3 class="font-semibold text-sm">Pagar a licença</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Na página de licença, copie a <strong class="text-white">chave Pix</strong> exibida</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Faça o pagamento pelo seu banco (R$ 199,00)</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Envie o comprovante por e-mail ou WhatsApp (contatos na página)</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Aguarde a <strong class="text-white">aprovação</strong> (normalmente em até 24h)</li>
            </ol>
            <div class="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 text-xs text-blue-300">
              <i class="fas fa-check-circle mr-1"></i>Após aprovação você receberá acesso completo ao painel.
            </div>
          </div>

          <!-- Passo 3 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">3</span>
              <h3 class="font-semibold text-sm">Configurar seu perfil</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Acesse <strong class="text-white">Gerenciar → Perfil</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Adicione sua <strong class="text-white">foto de perfil</strong> (JPG/PNG, até 10MB)</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Edite seu <strong class="text-white">nome artístico</strong> e <strong class="text-white">bio</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Clique em <strong class="text-white">"Salvar"</strong></li>
            </ol>
          </div>

          <!-- Passo 4 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">4</span>
              <h3 class="font-semibold text-sm">Adicionar seu repertório</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Vá em <strong class="text-white">Gerenciar → Repertório</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Clique em <strong class="text-white">"+ Nova Música"</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Preencha: título, artista original, e opcionalmente o link do YouTube</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Repita para todas as músicas do seu setlist</li>
            </ol>
            <div class="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-2.5 text-xs text-green-300">
              <i class="fas fa-lightbulb mr-1"></i>O público votará nas músicas para pedir na hora do show!
            </div>
          </div>

          <!-- Passo 5 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">5</span>
              <h3 class="font-semibold text-sm">Configurar conta bancária (PIX)</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Vá em <strong class="text-white">Gerenciar → Conta Bancária</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Escolha o tipo de chave Pix: CPF, Telefone, E-mail ou Aleatória</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Insira a chave e o nome do destinatário</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Salve — o público poderá enviar gorjetas via QR Code!</li>
            </ol>
          </div>

          <!-- Passo 6 -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="badge bg-indigo-600 text-white">6</span>
              <h3 class="font-semibold text-sm">Iniciar o Dashboard do Show</h3>
            </div>
            <ol class="text-slate-300 text-xs space-y-2 ml-1">
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Vá em <strong class="text-white">Gerenciar → Dashboard</strong></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Copie o link do seu perfil público: <code class="bg-white/10 px-1 rounded">apptocaessa.com.br/seu-slug</code></li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Compartilhe com o público via QR Code ou link</li>
              <li class="flex gap-2"><span class="text-indigo-400 mt-0.5">→</span> Acompanhe os pedidos e gorjetas em tempo real</li>
            </ol>
          </div>

        </div>
      </section>

      <!-- ===== PÚBLICO ===== -->
      <section id="publico" class="max-w-4xl mx-auto px-4 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-lg">👥</div>
          <div>
            <h2 class="text-xl font-bold">Para o Público</h2>
            <p class="text-slate-400 text-xs">Sem cadastro necessário — é instantâneo!</p>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4">

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div class="text-4xl mb-3">📲</div>
            <h3 class="font-semibold text-sm mb-2">1. Escanear o QR Code</h3>
            <p class="text-slate-400 text-xs">O artista exibe um QR Code no palco ou projeta na tela. Escaneie com a câmera do celular — não precisa baixar nada.</p>
          </div>

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div class="text-4xl mb-3">🎵</div>
            <h3 class="font-semibold text-sm mb-2">2. Pedir uma música</h3>
            <p class="text-slate-400 text-xs">Na página do artista, veja o repertório completo. Clique na música que quer ouvir e vote — o artista vê os pedidos ao vivo!</p>
          </div>

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div class="text-4xl mb-3">💸</div>
            <h3 class="font-semibold text-sm mb-2">3. Enviar gorjeta (opcional)</h3>
            <p class="text-slate-400 text-xs">Se quiser valorizar o show, toque em "Gorjeta" e envie qualquer valor via Pix. O QR Code é gerado na hora — rápido e seguro.</p>
          </div>

        </div>
      </section>

      <!-- ===== DURANTE O SHOW ===== -->
      <section id="show" class="max-w-4xl mx-auto px-4 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-lg">🎤</div>
          <div>
            <h2 class="text-xl font-bold">Durante o Show</h2>
            <p class="text-slate-400 text-xs">Dicas para usar o TOCA ESSA ao vivo</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-4">

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-qrcode text-green-400 text-xl"></i>
              <h3 class="font-semibold text-sm">Exibir o QR Code</h3>
            </div>
            <p class="text-slate-300 text-xs">Acesse seu painel → copie o link do perfil → use um gerador de QR online (ex: qr.io) → projete no telão ou imprima e cole no palco.</p>
          </div>

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-chart-bar text-green-400 text-xl"></i>
              <h3 class="font-semibold text-sm">Monitorar pedidos em tempo real</h3>
            </div>
            <p class="text-slate-300 text-xs">Mantenha o Dashboard aberto no seu celular ou tablet. Os pedidos aparecem em ordem de votos — você vê o que o público mais quer ouvir.</p>
          </div>

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-money-bill-wave text-green-400 text-xl"></i>
              <h3 class="font-semibold text-sm">Receber gorjetas</h3>
            </div>
            <p class="text-slate-300 text-xs">As gorjetas são enviadas diretamente para sua chave Pix cadastrada. Você recebe uma notificação do banco e pode acompanhar no app.</p>
          </div>

          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-wifi text-green-400 text-xl"></i>
              <h3 class="font-semibold text-sm">Funciona offline?</h3>
            </div>
            <p class="text-slate-300 text-xs">O app precisa de internet para enviar/receber pedidos. Certifique-se que o local do show tem sinal de celular ou Wi-Fi disponível para o público.</p>
          </div>

        </div>

        <!-- Dica pro -->
        <div class="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl p-5">
          <div class="flex items-start gap-3">
            <i class="fas fa-star text-green-400 text-xl mt-0.5"></i>
            <div>
              <h3 class="font-semibold text-sm text-green-300 mb-1">Dica profissional</h3>
              <p class="text-slate-300 text-xs">Anuncie no microfone: <em>"Escaneie o QR Code e peça sua música! O mais votado toca a seguir!"</em> Isso engaja o público e aumenta as gorjetas.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== INSTALAR APP ===== -->
      <section id="app" class="max-w-4xl mx-auto px-4 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-lg">📱</div>
          <div>
            <h2 class="text-xl font-bold">Instalar o App</h2>
            <p class="text-slate-400 text-xs">Funciona no Android e iPhone</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">

          <!-- Android -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="fab fa-android text-green-400 text-2xl"></i>
              <h3 class="font-semibold">Android</h3>
              <span class="badge bg-green-600 text-white ml-auto">Recomendado</span>
            </div>
            <p class="text-slate-400 text-xs mb-4">Instale o APK diretamente — ícone aparece na tela inicial como app nativo.</p>
            <ol class="text-slate-300 text-xs space-y-2 mb-4">
              <li class="flex gap-2"><span class="text-green-400 font-bold">1.</span> Acesse <strong class="text-white">apptocaessa.com.br/download</strong></li>
              <li class="flex gap-2"><span class="text-green-400 font-bold">2.</span> Toque em <strong class="text-white">"Baixar para Android (.apk)"</strong></li>
              <li class="flex gap-2"><span class="text-green-400 font-bold">3.</span> Abra o arquivo baixado</li>
              <li class="flex gap-2"><span class="text-green-400 font-bold">4.</span> Se pedido: <em>Configurações → Segurança → Fontes desconhecidas → Ativar</em></li>
              <li class="flex gap-2"><span class="text-green-400 font-bold">5.</span> Toque em <strong class="text-white">"Instalar"</strong> e pronto!</li>
            </ol>
            <a href="/download" class="block text-center bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <i class="fas fa-download mr-2"></i>Baixar APK Android
            </a>
          </div>

          <!-- iPhone -->
          <div class="step-card bg-white/5 border border-white/10 rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="fab fa-apple text-white text-2xl"></i>
              <h3 class="font-semibold">iPhone / iPad</h3>
              <span class="badge bg-slate-600 text-white ml-auto">PWA</span>
            </div>
            <p class="text-slate-400 text-xs mb-4">Adicione à tela inicial pelo Safari — funciona como app sem precisar da App Store.</p>
            <ol class="text-slate-300 text-xs space-y-2 mb-4">
              <li class="flex gap-2"><span class="text-blue-400 font-bold">1.</span> Abra o <strong class="text-white">Safari</strong> <em>(não o Chrome!)</em></li>
              <li class="flex gap-2"><span class="text-blue-400 font-bold">2.</span> Acesse <strong class="text-white">apptocaessa.com.br</strong></li>
              <li class="flex gap-2"><span class="text-blue-400 font-bold">3.</span> Toque no ícone de <strong class="text-white">Compartilhar</strong> (quadrado com seta ↑)</li>
              <li class="flex gap-2"><span class="text-blue-400 font-bold">4.</span> Role para baixo e toque em <strong class="text-white">"Adicionar à Tela de Início"</strong></li>
              <li class="flex gap-2"><span class="text-blue-400 font-bold">5.</span> Confirme o nome e toque em <strong class="text-white">"Adicionar"</strong></li>
            </ol>
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 text-xs text-blue-300">
              <i class="fas fa-info-circle mr-1"></i>O ícone azul aparecerá na tela inicial com tela cheia, sem barra do Safari.
            </div>
          </div>

        </div>
      </section>

      <!-- ===== FAQ ===== -->
      <section class="max-w-4xl mx-auto px-4 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-slate-600 rounded-2xl flex items-center justify-center text-lg">❓</div>
          <div>
            <h2 class="text-xl font-bold">Perguntas Frequentes</h2>
          </div>
        </div>

        <div class="space-y-3">
          ${[
            ['O público precisa criar conta?', 'Não! O público acessa o perfil do artista pelo link ou QR Code e interage sem precisar se cadastrar.'],
            ['O artista precisa pagar para usar?', 'Sim, há uma licença única de R$ 199,00 por artista. Após o pagamento e aprovação, o acesso é vitalício.'],
            ['Quantas músicas posso cadastrar?', 'Não há limite de músicas no repertório. Cadastre todas as músicas que você sabe tocar!'],
            ['O Pix vai direto para minha conta?', 'Sim! As gorjetas são enviadas diretamente para sua chave Pix cadastrada, sem intermediários.'],
            ['Funciona sem internet no show?', 'É necessário internet para a interação em tempo real. O local do show precisa ter Wi-Fi ou sinal de celular.'],
            ['Posso mudar meu nome artístico depois?', 'Sim, a qualquer momento em Gerenciar → Perfil → Editar. O link do seu perfil (slug) permanece o mesmo.'],
          ].map(([q, a]) => `
          <details class="bg-white/5 border border-white/10 rounded-xl group" open>
            <summary class="flex items-center justify-between p-4 cursor-pointer text-sm font-medium hover:bg-white/5 rounded-xl transition-all list-none">
              <span>${q}</span>
              <i class="fas fa-chevron-down text-slate-400 text-xs transition-transform group-open:rotate-180"></i>
            </summary>
            <div class="px-4 pb-4 text-slate-400 text-xs">${a}</div>
          </details>
          `).join('')}
        </div>
      </section>

      <!-- CTA -->
      <section class="max-w-4xl mx-auto px-4 pb-16 text-center">
        <div class="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-3xl p-8">
          <h2 class="text-2xl font-bold mb-2">Pronto para começar?</h2>
          <p class="text-slate-400 text-sm mb-6">Crie sua conta grátis e configure seu perfil em menos de 5 minutos.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
              <i class="fas fa-user-plus mr-2"></i>Criar conta de artista
            </a>
            <a href="/login" class="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-2xl transition-all border border-white/20">
              <i class="fas fa-sign-in-alt mr-2"></i>Já tenho conta
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-white/10 text-center py-6 text-slate-500 text-xs">
        <p>© 2025 TOCA ESSA · <a href="/login" class="hover:text-white transition-colors">Login</a> · <a href="/register" class="hover:text-white transition-colors">Cadastro</a> · <a href="/download" class="hover:text-white transition-colors">Baixar App</a></p>
      </footer>

    </body>
    </html>
  `)
})

// APK Download page
app.get('/download', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <title>Baixar App - TOCA ESSA</title>
        <meta name="theme-color" content="#2563EB">
        <link rel="icon" href="/icon-192.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div class="max-w-md w-full">
            <!-- App Card -->
            <div class="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border border-white/20">
                <!-- Icon -->
                <img src="/icon-512.png" alt="TOCA ESSA" class="w-24 h-24 mx-auto rounded-2xl shadow-lg mb-6">
                
                <h1 class="text-3xl font-bold text-white mb-2">TOCA ESSA</h1>
                <p class="text-blue-200 mb-8">Plataforma para artistas de shows ao vivo</p>
                
                <!-- Android Download -->
                <a href="/TocaEssa.apk" download="TocaEssa.apk"
                   class="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-6 rounded-2xl mb-4 transition-all transform hover:scale-105 shadow-lg">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.341l-1.523-.879V9a5 5 0 0 0-10 0v5.462l-1.523.879A1 1 0 0 0 4 16.317V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.683a1 1 0 0 0-.477-.976zM12 3a3 3 0 0 1 3 3v5H9V6a3 3 0 0 1 3-3z"/>
                        <circle cx="8.5" cy="2.5" r="1" fill="#a3e635"/>
                        <circle cx="15.5" cy="2.5" r="1" fill="#a3e635"/>
                        <rect x="7" y="1" width="1.5" height="3" rx="0.75" fill="#a3e635" transform="rotate(-30 7 1)"/>
                        <rect x="15.5" y="1" width="1.5" height="3" rx="0.75" fill="#a3e635" transform="rotate(30 15.5 1)"/>
                    </svg>
                    <div class="text-left">
                        <div class="text-xs opacity-80">Baixar para</div>
                        <div class="text-lg">Android (.apk)</div>
                    </div>
                </a>
                
                <!-- iOS Instructions -->
                <div class="bg-white/10 rounded-2xl p-4 mb-6 text-left">
                    <div class="flex items-center gap-2 mb-3">
                        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <span class="text-white font-semibold">iPhone / iPad</span>
                    </div>
                    <ol class="text-blue-200 text-sm space-y-1">
                        <li>1. Abra o <strong class="text-white">Safari</strong> (não o Chrome)</li>
                        <li>2. Acesse <strong class="text-white">apptocaessa.com.br</strong></li>
                        <li>3. Toque em <strong class="text-white">Compartilhar</strong> (ícone ↑)</li>
                        <li>4. Selecione <strong class="text-white">"Adicionar à Tela de Início"</strong></li>
                    </ol>
                </div>
                
                <!-- Info -->
                <div class="text-blue-300 text-xs space-y-1">
                    <p>📦 Versão 1.0 • 444 KB • Android 6.0+</p>
                    <p>🔒 APK assinado digitalmente</p>
                </div>
                
                <a href="/login" class="block mt-6 text-blue-300 hover:text-white text-sm transition-colors">
                    ← Voltar para o app
                </a>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Login - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script>renderLoginPage()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Register page
app.get('/register', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Cadastro - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script>renderRegisterPage()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// License Payment Page (after registration) - rota única consolidada
app.get('/license-payment', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Pagamento da Licença - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/license-payment-new.js"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Admin login page
app.get('/admin/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Admin Login - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div class="min-h-screen flex items-center justify-center px-4">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-bold mb-2">
                        <i class="fas fa-user-shield mr-3"></i>
                        TOCA ESSA
                    </h1>
                    <p class="text-xl text-gray-300">Painel Administrativo</p>
                </div>
                
                <form id="adminLoginForm" class="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">
                            <i class="fas fa-envelope mr-2"></i>
                            Email
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                               placeholder="admin@tocaessa.com">
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">
                            <i class="fas fa-lock mr-2"></i>
                            Senha
                        </label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                               placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-bold">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Entrar
                    </button>
                    
                    <div class="mt-6 text-center">
                        <a href="/" class="text-gray-300 hover:text-white transition">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Voltar para o app
                        </a>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    await axios.post('/api/admin/login', { email, password });
                    window.location.href = '/admin/panel';
                } catch (error) {
                    alert('Erro ao fazer login: ' + (error.response?.data?.error || error.message));
                }
            });
        </script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Admin panel - redirect to panel
app.get('/admin', (c) => {
  return c.redirect('/admin/panel')
})

// Admin panel page
app.get('/admin/panel', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Painel Admin - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div class="flex h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-black/30 backdrop-blur-lg border-r border-white/10">
                <div class="p-6">
                    <h1 class="text-2xl font-bold mb-8">
                        <i class="fas fa-user-shield mr-2"></i>
                        Admin Panel
                    </h1>
                    
                    <nav id="admin-nav" class="space-y-2">
                        <!-- Navigation will be rendered by JS -->
                    </nav>
                    
                    <div class="mt-8 pt-8 border-t border-white/10">
                        <a href="#" onclick="handleLogout(); return false;" class="flex items-center px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg transition">
                            <i class="fas fa-sign-out-alt mr-3"></i>
                            <span>Sair</span>
                        </a>
                    </div>
                </div>
            </aside>
            
            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto">
                <div class="p-8">
                    <div id="admin-content">
                        <!-- Content will be rendered by JS -->
                    </div>
                </div>
            </main>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/admin-panel.js"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Artist management page
app.get('/manage', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Gerenciar - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-white">
        <div id="app">
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-center items-center min-h-screen">
                    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/manage.js"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// ======================
// API Routes - Payment
// ======================

// Confirm payment (manual confirmation by user)
app.post('/api/payment/:tipId/confirm', async (c) => {
  const tipId = c.req.param('tipId')
  
  // Update tip status to completed
  await c.env.DB.prepare(`
    UPDATE tips 
    SET payment_status = 'completed', transaction_id = ?
    WHERE id = ?
  `).bind(`PIX-${Date.now()}`, tipId).run()
  
  return c.json({ success: true, message: 'Pagamento confirmado!' })
})

// Payment page
app.get('/payment/:slug/:tipId', async (c) => {
  const slug = c.req.param('slug')
  const tipId = c.req.param('tipId')
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Pagamento PIX - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const ARTIST_SLUG = '${slug}';
          const TIP_ID = '${tipId}';
        </script>
        <script src="/static/pix-generator.js"></script>
        <script src="/static/payment.js"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Artist dashboard page
app.get('/dashboard/:slug', (c) => {
  const slug = c.req.param('slug')
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Dashboard - TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-white">
        <div id="app">
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-center items-center min-h-screen">
                    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const ARTIST_SLUG = '${slug}';
        </script>
        <script src="/static/dashboard.js"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

// Public audience page
app.get('/:slug', (c) => {
  const slug = c.req.param('slug')
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <meta name="theme-color" content="#8b5cf6">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <title>Repertório - TOCA ESSA</title>
        
        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#8b5cf6">
        <meta name="description" content="Plataforma de interação ao vivo entre artistas e público">
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="57x57"   href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60"   href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72"   href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76"   href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <!-- Splash screens iOS -->
        <link rel="apple-touch-startup-image" media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)"  href="/splash-640x1136.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)"  href="/splash-750x1334.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2208.png">
        <link rel="apple-touch-startup-image" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1125x2436.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)"  href="/splash-828x1792.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1242x2688.png">
        <link rel="apple-touch-startup-image" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1170x2532.png">
        <link rel="apple-touch-startup-image" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1284x2778.png">
        <link rel="apple-touch-startup-image" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1179x2556.png">
        <link rel="apple-touch-startup-image" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1290x2796.png">
        <link rel="apple-touch-startup-image" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)"  href="/splash-1080x1920.png">
        <link rel="apple-touch-startup-image" media="(device-width:768px) and (device-height:1024px) and (-webkit-device-pixel-ratio:2)" href="/splash-1536x2048.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1112px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2224.png">
        <link rel="apple-touch-startup-image" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" href="/splash-1668x2388.png">
        <link rel="apple-touch-startup-image" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" href="/splash-2048x2732.png">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TOCA ESSA">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <div id="app">
            <div class="container mx-auto px-4 py-8">
                <div class="flex justify-center items-center min-h-screen">
                    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const ARTIST_SLUG = '${slug}';
        </script>
        <script src="/static/pix-generator.js"></script>
        <script src="/static/audience.js"></script>
        <script>init()</script>
        
        <!-- PWA Service Worker -->
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('✅ Service Worker registrado'))
                .catch((err) => console.log('❌ Service Worker falhou:', err));
            });
          }
        </script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW erro:', err));
        });
      }
    </script>
    </body>
    </html>
  `)
})

export default app

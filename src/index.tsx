import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { setCookie, getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
  PHOTOS: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>()

// Redireciona apptocaessa.com.br (sem www) para www.apptocaessa.com.br
app.use('*', async (c, next) => {
  const host = c.req.header('host') || ''
  if (host === 'apptocaessa.com.br') {
    return c.redirect('https://www.apptocaessa.com.br' + c.req.path, 301)
  }
  await next()
})

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

// APK download — redirect to static asset served directly by Cloudflare Pages
app.get('/download/TocaEssa.apk', (c) => {
  return c.redirect('/TocaEssa.apk', 302)
})

// Also serve directly at /TocaEssa.apk with correct headers (fallback if CF Pages doesn't add them)
app.get('/TocaEssa.apk', (c) => {
  c.header('Content-Type', 'application/vnd.android.package-archive')
  c.header('Content-Disposition', 'attachment; filename="TocaEssa.apk"')
  return serveStatic({ path: 'TocaEssa.apk', root: './' })(c, async () => {})
})

// Serve promotional video
app.get('/video-promo', (c) => {
  return c.redirect('/video_toca_essa_promo.mp4', 302)
})

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
  // Try cookie first
  let sessionId = getCookie(c, 'session_id')
  
  // Fallback: try X-Session-ID header
  if (!sessionId) {
    sessionId = c.req.header('X-Session-ID') || null
  }
  
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

// Debug: check cookies received
app.get('/api/debug/cookies', (c) => {
  const allCookies = c.req.header('cookie') || 'nenhum cookie'
  const sessionId = getCookie(c, 'session_id') || 'session_id ausente'
  return c.json({ cookies_raw: allCookies, session_id: sessionId })
})

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
  
  // Create session — usar datetime SQLite para compatibilidade com a query de validação
  const sessionId = generateSessionId()
  
  await c.env.DB.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+30 days'))
  `).bind(sessionId, user.id).run()
  
  // Set cookie — sem httpOnly para que JS possa ler; SameSite=None para PWA mobile
  setCookie(c, 'session_id', sessionId, {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
    maxAge: 30 * 24 * 60 * 60,
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
    },
    session_id: sessionId
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

  // Count today's requests (pending + accepted + played — everything except rejected)
  const todayCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM song_requests
    WHERE artist_id = ?
      AND status != 'rejected'
      AND date(created_at) = date('now')
  `).bind(artist.id).first() as any

  return c.json({
    ...artist,
    today_requests_count: todayCount?.count ?? 0,
    max_requests: (artist as any).max_requests ?? 0,
    requests_open: (artist as any).requests_open ?? 1,
  })
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

// Update show settings (max requests and open/close requests)
app.put('/api/artists/:slug/show-settings', async (c) => {
  const session = await checkAuth(c)
  if (!session) return c.json({ error: 'Não autenticado' }, 401)

  const slug = c.req.param('slug')
  const { max_requests, requests_open } = await c.req.json()

  // Verify ownership
  const artist = await c.env.DB.prepare(`
    SELECT id FROM artists WHERE slug = ? AND user_id = ?
  `).bind(slug, session.user_id).first()

  if (!artist) return c.json({ error: 'Artista não encontrado ou sem permissão' }, 404)

  // Ensure columns exist (self-healing migration for production databases)
  try {
    await c.env.DB.prepare(`ALTER TABLE artists ADD COLUMN max_requests INTEGER DEFAULT 0`).run()
  } catch (_) { /* column already exists */ }
  try {
    await c.env.DB.prepare(`ALTER TABLE artists ADD COLUMN requests_open INTEGER DEFAULT 1`).run()
  } catch (_) { /* column already exists */ }

  await c.env.DB.prepare(`
    UPDATE artists SET
      max_requests = ?,
      requests_open = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    max_requests !== undefined ? Math.max(0, parseInt(max_requests) || 0) : 0,
    requests_open !== undefined ? (requests_open ? 1 : 0) : 1,
    artist.id
  ).run()

  return c.json({ success: true, max_requests, requests_open })
})

// Create a song request
app.post('/api/artists/:slug/requests', async (c) => {
  const slug = c.req.param('slug')
  const { song_id, requester_name, requester_message, tip_amount, tip_message } = await c.req.json()

  // Self-healing: ensure columns exist (production DB may not have them yet)
  try { await c.env.DB.prepare(`ALTER TABLE artists ADD COLUMN max_requests INTEGER DEFAULT 0`).run() } catch (_) {}
  try { await c.env.DB.prepare(`ALTER TABLE artists ADD COLUMN requests_open INTEGER DEFAULT 1`).run() } catch (_) {}

  const artist = await c.env.DB.prepare(`
    SELECT id,
           COALESCE(max_requests, 0)  AS max_requests,
           COALESCE(requests_open, 1) AS requests_open
    FROM artists WHERE slug = ? AND active = 1
  `).bind(slug).first() as any
  
  if (!artist) {
    return c.json({ error: 'Artista não encontrado' }, 404)
  }

  // Check if requests are open (0 = closed, 1 = open)
  if (artist.requests_open == 0) {
    return c.json({ error: 'O artista não está aceitando pedidos no momento', closed: true }, 403)
  }

  // Check daily request limit
  if (artist.max_requests && artist.max_requests > 0) {
    const todayCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM song_requests
      WHERE artist_id = ?
        AND status != 'rejected'
        AND date(created_at) = date('now')
    `).bind(artist.id).first() as any

    if ((todayCount?.count ?? 0) >= artist.max_requests) {
      return c.json({ 
        error: 'O artista atingiu o limite de pedidos para hoje', 
        limit_reached: true,
        max_requests: artist.max_requests 
      }, 403)
    }
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
  
  // If tip was included, create a tip record as PENDING (only completes when user confirms payment)
  let tipId = null
  if (tipValue > 0) {
    const tipResult = await c.env.DB.prepare(`
      INSERT INTO tips (artist_id, amount, sender_name, message, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, 'pix', 'pending', ?)
    `).bind(artist.id, tipValue, requester_name || 'Anônimo', tip_message || 'Gorjeta junto com pedido', `TXN-${Date.now()}`).run()
    tipId = tipResult.meta.last_row_id
  }
  
  return c.json({ 
    id: result.meta.last_row_id,
    message: tipValue > 0 ? 'Pedido com gorjeta enviado! Vai para o topo da fila!' : 'Pedido enviado com sucesso!',
    has_tip: tipValue > 0,
    tip_amount: tipValue,
    tip_id: tipId
  })
})

// Get single request status (public — for client to check their own request)
app.get('/api/requests/:id', async (c) => {
  const id = c.req.param('id')

  const request = await c.env.DB.prepare(`
    SELECT sr.id, sr.status, sr.requester_name, s.title as song_title, s.artist_name as song_artist,
           sr.created_at, sr.updated_at
    FROM song_requests sr
    LEFT JOIN songs s ON sr.song_id = s.id
    WHERE sr.id = ?
  `).bind(id).first()

  if (!request) {
    return c.json({ error: 'Pedido não encontrado' }, 404)
  }

  return c.json(request)
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
    VALUES (?, ?, datetime('now', '+30 days'))
  `).bind(sessionId, user.id).run()
  
  setCookie(c, 'session_id', sessionId, {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  })
  
  return c.json({ 
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    session_id: sessionId
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
      u.license_status,
      u.license_paid,
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
      u.license_status,
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
  
  const totalUsers = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role != 'admin'
  `).first()

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

  const totalRevenue = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM users WHERE license_status = 'approved' AND role != 'admin'
  `).first()
  
  return c.json({
    total_users: totalUsers?.count || 0,
    total_artists: totalArtists?.count || 0,
    total_songs: totalSongs?.count || 0,
    total_requests: totalRequests?.count || 0,
    total_tips: totalTips?.total || 0,
    monthly_revenue: (totalRevenue?.count || 0) * 199.00
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
                    
                    <div class="flex gap-4 justify-center flex-wrap">
                        <a href="/register" class="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold text-xl transition">
                            <i class="fas fa-user-plus mr-2"></i>
                            Criar Conta
                        </a>
                        <a href="/login" class="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-xl transition">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Entrar
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
                <p>© 2024 TOCA ESSA - Conectando artistas e público</p>
                <div class="mt-4 flex gap-4 justify-center flex-wrap">
                    <a href="/download" class="hover:text-white transition">
                        <i class="fas fa-download mr-1"></i>
                        Baixar App
                    </a>
                    <span class="text-gray-600">|</span>
                    <a href="/admin" class="hover:text-white transition">
                        <i class="fas fa-user-shield mr-1"></i>
                        Admin
                    </a>
                </div>
            </footer>
        </div>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
      }
    </script>
    </body>
    </html>
  `)
})


// Download page
app.get('/download', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Baixar App - TOCA ESSA</title>
        <meta name="description" content="Baixe o app TOCA ESSA para Android e conecte artistas ao público durante shows ao vivo.">
        <link rel="icon" href="/icon-192.png">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 28px;
            padding: 48px 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            backdrop-filter: blur(16px);
            box-shadow: 0 24px 64px rgba(0,0,0,0.4);
          }
          .app-icon {
            width: 120px;
            height: 120px;
            border-radius: 28px;
            box-shadow: 0 8px 32px rgba(99,102,241,0.5);
            margin: 0 auto 20px;
            display: block;
          }
          .app-name {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 2px;
            background: linear-gradient(90deg, #a78bfa, #60a5fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 6px;
          }
          .app-sub {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 28px;
          }
          .badges {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 32px;
          }
          .badge {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 12px;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .badge i { color: #a78bfa; }
          .btn-android {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: linear-gradient(135deg, #16a34a, #15803d);
            border: none;
            border-radius: 16px;
            padding: 16px 28px;
            color: #fff;
            font-size: 17px;
            font-weight: 700;
            text-decoration: none;
            width: 100%;
            margin-bottom: 14px;
            box-shadow: 0 4px 20px rgba(22,163,74,0.4);
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .btn-android:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(22,163,74,0.5);
          }
          .btn-android .btn-label { text-align: left; line-height: 1.2; }
          .btn-android .btn-label small { font-size: 11px; font-weight: 400; opacity: 0.85; display: block; }
          .btn-pwa {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: rgba(99,102,241,0.2);
            border: 1px solid rgba(99,102,241,0.4);
            border-radius: 16px;
            padding: 16px 28px;
            color: #fff;
            font-size: 17px;
            font-weight: 700;
            text-decoration: none;
            width: 100%;
            margin-bottom: 28px;
            transition: background 0.15s;
          }
          .btn-pwa:hover { background: rgba(99,102,241,0.35); }
          .btn-pwa .btn-label { text-align: left; line-height: 1.2; }
          .btn-pwa .btn-label small { font-size: 11px; font-weight: 400; opacity: 0.75; display: block; }
          .divider {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #475569;
            font-size: 12px;
            margin-bottom: 14px;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.1);
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 28px;
          }
          .feature {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 12px;
            font-size: 12px;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .feature i { color: #a78bfa; font-size: 14px; }
          .note {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
          }
          .note a { color: #818cf8; text-decoration: none; }
          .back {
            margin-top: 24px;
            font-size: 13px;
            color: #64748b;
          }
          .back a { color: #94a3b8; text-decoration: none; }
          .back a:hover { color: #fff; }
          .version-tag {
            display: inline-block;
            background: rgba(99,102,241,0.2);
            border: 1px solid rgba(99,102,241,0.3);
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 11px;
            color: #818cf8;
            margin-bottom: 20px;
          }
        </style>
    </head>
    <body>
        <div class="card">
            <img src="/icon-192.png" alt="TOCA ESSA" class="app-icon">
            <div class="app-name">TOCA ESSA</div>
            <div class="app-sub">Conectando artistas e público ao vivo</div>
            <span class="version-tag">v1.0 · Gratuito</span>

            <div class="badges">
                <span class="badge"><i class="fas fa-music"></i> Pedidos de músicas</span>
                <span class="badge"><i class="fas fa-hand-holding-dollar"></i> Gorjetas</span>
                <span class="badge"><i class="fas fa-qrcode"></i> QR Code</span>
                <span class="badge"><i class="fas fa-bolt"></i> Tempo real</span>
            </div>

            <div class="features">
                <div class="feature"><i class="fas fa-mobile-alt"></i> Android & iOS</div>
                <div class="feature"><i class="fas fa-wifi"></i> Funciona offline</div>
                <div class="feature"><i class="fas fa-lock"></i> 100% seguro</div>
                <div class="feature"><i class="fas fa-infinity"></i> Uso ilimitado</div>
            </div>

            <a href="/download/TocaEssa.apk" download="TocaEssa.apk" class="btn-android">
                <i class="fab fa-android" style="font-size:28px;"></i>
                <div class="btn-label">
                    <small>Baixar para</small>
                    Android APK
                </div>
                <i class="fas fa-download" style="margin-left:auto;font-size:16px;"></i>
            </a>

            <div class="divider">ou instale como PWA</div>

            <a href="/" class="btn-pwa" onclick="handlePWAInstall(event)">
                <i class="fas fa-globe" style="font-size:22px;color:#818cf8;"></i>
                <div class="btn-label">
                    <small>Instalar no</small>
                    iPhone / Navegador
                </div>
                <i class="fas fa-plus-circle" style="margin-left:auto;font-size:16px;color:#818cf8;"></i>
            </a>

            <div class="note">
                <strong style="color:#94a3b8;">Android:</strong> Após baixar, abra o arquivo .apk. Se aparecer aviso de segurança, toque em <em>Instalar mesmo assim</em>.<br><br>
                <strong style="color:#94a3b8;">iPhone / Safari:</strong> Acesse <a href="https://www.apptocaessa.com.br">apptocaessa.com.br</a>, toque em <i class="fas fa-share-from-square"></i> e escolha <em>Adicionar à Tela de Início</em>.
            </div>
        </div>

        <div class="back">
            <a href="/"><i class="fas fa-arrow-left" style="margin-right:6px;"></i>Voltar ao início</a>
        </div>

        <script>
          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
          });

          function handlePWAInstall(e) {
            if (deferredPrompt) {
              e.preventDefault();
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
            }
            // else: navigate to homepage normally
          }
        </script>
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
        <script src="/static/auth.js?v=2"></script>
        <script>renderLoginPage()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
        <script src="/static/auth.js?v=2"></script>
        <script>renderRegisterPage()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
        <script src="/static/license-payment-new.js?v=2"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
                const btn = e.target.querySelector('button[type="submit"]');
                if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    const response = await axios.post('/api/admin/login', { email, password }, { withCredentials: true });
                    const sid = response.data.session_id;
                    if (sid) {
                        try { localStorage.setItem('admin_session_id', sid); } catch(e) {}
                        try { localStorage.setItem('session_id', sid); } catch(e) {}
                        try { sessionStorage.setItem('session_id', sid); } catch(e) {}
                        document.cookie = 'session_id=' + sid + '; path=/; max-age=' + (30*24*3600) + '; secure; samesite=None';
                    }
                    window.location.replace('/admin/panel');
                } catch (error) {
                    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
                    alert('Erro ao fazer login: ' + (error.response?.data?.error || error.message));
                }
            });
        </script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
    <style>
      /* Mobile sidebar overlay */
      #sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:40; }
      #sidebar-overlay.active { display:block; }
      #admin-sidebar {
        position:fixed; top:0; left:0; height:100%; width:260px;
        background:rgba(0,0,0,0.85); backdrop-filter:blur(16px);
        border-right:1px solid rgba(255,255,255,0.1);
        z-index:50; transform:translateX(-100%); transition:transform 0.3s ease;
        display:flex; flex-direction:column;
      }
      #admin-sidebar.open { transform:translateX(0); }
      @media (min-width:768px) {
        #admin-sidebar { position:relative; transform:none !important; flex-shrink:0; }
        #sidebar-overlay { display:none !important; }
        #hamburger-btn { display:none !important; }
      }
      #admin-main { flex:1; overflow-y:auto; }
    </style>
    <body class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
        <!-- Mobile overlay -->
        <div id="sidebar-overlay" onclick="closeSidebar()"></div>

        <div style="display:flex; height:100vh; overflow:hidden;">
            <!-- Sidebar -->
            <aside id="admin-sidebar">
                <div style="padding:24px; display:flex; flex-direction:column; height:100%; overflow-y:auto;">
                    <!-- Mobile close button -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
                      <h1 style="font-size:1.3rem; font-weight:700; margin:0;">
                        <i class="fas fa-user-shield" style="margin-right:8px;"></i>Admin Panel
                      </h1>
                      <button onclick="closeSidebar()" id="close-sidebar-btn" style="background:none;border:none;color:white;font-size:1.3rem;cursor:pointer;padding:4px 8px;">✕</button>
                    </div>
                    
                    <nav id="admin-nav" style="flex:1;">
                        <!-- Navigation will be rendered by JS -->
                    </nav>
                    
                    <div style="padding-top:24px; border-top:1px solid rgba(255,255,255,0.1); margin-top:16px;">
                        <a href="#" onclick="handleLogout(); return false;" style="display:flex; align-items:center; padding:12px 16px; color:#fca5a5; border-radius:8px; text-decoration:none;">
                            <i class="fas fa-sign-out-alt" style="margin-right:12px;"></i>
                            <span>Sair</span>
                        </a>
                    </div>
                </div>
            </aside>
            
            <!-- Main Content -->
            <main id="admin-main">
                <!-- Mobile top bar -->
                <div style="display:flex; align-items:center; padding:16px; background:rgba(0,0,0,0.3); border-bottom:1px solid rgba(255,255,255,0.1); position:sticky; top:0; z-index:30;">
                  <button id="hamburger-btn" onclick="openSidebar()" style="background:none;border:none;color:white;font-size:1.4rem;cursor:pointer;margin-right:12px;padding:4px;">
                    <i class="fas fa-bars"></i>
                  </button>
                  <span style="font-size:1rem; font-weight:600;">Admin Panel</span>
                </div>
                <div style="padding:20px;">
                    <div id="admin-content">
                        <!-- Content will be rendered by JS -->
                    </div>
                </div>
            </main>
        </div>
        
        <script>
          function openSidebar() {
            document.getElementById('admin-sidebar').classList.add('open');
            document.getElementById('sidebar-overlay').classList.add('active');
          }
          function closeSidebar() {
            document.getElementById('admin-sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('active');
          }
        </script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/admin-panel.js?v=6"></script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
      }
    </script>
    </body>
    </html>
  `)
})

// Admin artists full-page listing
app.get('/admin/artists', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artistas - Admin TOCA ESSA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { background: linear-gradient(135deg, #4c1d95 0%, #312e81 50%, #1e3a5f 100%); min-height: 100vh; }
          .table-row:hover { background: rgba(255,255,255,0.05); }
          .sort-btn { cursor: pointer; user-select: none; }
          .sort-btn:hover { color: #a78bfa; }
          .badge-approved { background: rgba(22,163,74,0.2); color: #4ade80; }
          .badge-paid     { background: rgba(202,138,4,0.2); color: #fbbf24; }
          .badge-pending  { background: rgba(107,114,128,0.2); color: #9ca3af; }
          .badge-rejected { background: rgba(220,38,38,0.2); color: #f87171; }
        </style>
    </head>
    <body class="text-white">
      <!-- Top bar -->
      <div style="background:rgba(0,0,0,0.4);border-bottom:1px solid rgba(255,255,255,0.1);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:16px;">
          <a href="/admin/panel" style="color:#a78bfa;text-decoration:none;font-size:0.9rem;">
            <i class="fas fa-arrow-left mr-2"></i>Painel Admin
          </a>
          <span style="color:rgba(255,255,255,0.3);">|</span>
          <span style="font-weight:700;font-size:1.1rem;"><i class="fas fa-guitar mr-2 text-purple-400"></i>Lista de Artistas</span>
        </div>
        <div id="auth-status" style="font-size:0.8rem;color:#9ca3af;"></div>
      </div>

      <div style="padding:24px;max-width:1400px;margin:0 auto;">
        <!-- Header + search -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.8rem;font-weight:700;margin:0;">Artistas Cadastrados</h1>
            <p id="subtitle" style="color:#9ca3af;margin:4px 0 0;font-size:0.9rem;">Carregando...</p>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <input id="searchInput" type="text" placeholder="Buscar por nome ou slug..."
              oninput="filterArtists()"
              style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 16px;color:white;width:260px;outline:none;"
            >
            <select id="statusFilter" onchange="filterArtists()"
              style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:white;outline:none;">
              <option value="">Todos os status</option>
              <option value="approved">Aprovados</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </div>

        <!-- Stats cards -->
        <div id="statsCards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px;"></div>

        <!-- Table -->
        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:rgba(0,0,0,0.4);">
                  <th class="sort-btn" onclick="sortBy('name')" style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Nome <i id="sort-name" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('slug')" style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Slug <i id="sort-slug" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('license_status')" style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Status <i id="sort-license_status" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('license_paid_date')" style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Dt. Pagamento <i id="sort-license_paid_date" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('song_count')" style="padding:14px 16px;text-align:center;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Músicas <i id="sort-song_count" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('request_count')" style="padding:14px 16px;text-align:center;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Pedidos <i id="sort-request_count" class="fas fa-sort ml-1 text-gray-500"></i>
                  </th>
                  <th class="sort-btn" onclick="sortBy('created_at')" style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;white-space:nowrap;">
                    Cadastro <i id="sort-created_at" class="fas fa-sort-down ml-1 text-purple-400"></i>
                  </th>
                  <th style="padding:14px 16px;text-align:left;font-size:0.85rem;font-weight:600;">Ações</th>
                </tr>
              </thead>
              <tbody id="artistsTableBody">
                <tr>
                  <td colspan="8" style="padding:40px;text-align:center;color:#9ca3af;">
                    <i class="fas fa-spinner fa-spin mr-2"></i>Carregando artistas...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="pagination" style="padding:16px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <span id="paginationInfo" style="color:#9ca3af;font-size:0.85rem;"></span>
            <div id="paginationButtons" style="display:flex;gap:8px;"></div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/admin-artists.js?v=1"></script>
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
        <script src="/static/manage.js?v=8"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
        <script src="/static/pix-generator.js?v=2"></script>
        <script src="/static/payment.js?v=2"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
        <script src="/static/dashboard.js?v=8"></script>
        <script>init()</script>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=8')
          .then(reg => console.log('✅ SW registrado:', reg.scope))
          .catch(err => console.log('SW erro:', err));
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
        <script src="/static/pix-generator.js?v=2"></script>
        <script src="/static/audience.js?v=8"></script>
        <script>init()</script>
        
        <!-- PWA Service Worker -->
        <script>
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js?v=8')
              .then(reg => console.log('✅ SW registrado:', reg.scope))
              .catch(err => console.log('SW erro:', err));
          }
        </script>
    </body>
    </html>
  `)
})

export default app

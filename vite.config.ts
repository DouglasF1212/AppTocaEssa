import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Plugin to copy public/ assets to dist/ after build, and patch _routes.json
function copyPublicAssets() {
  return {
    name: 'copy-public-assets',
    closeBundle() {
      const publicDir = 'public'
      const distDir = 'dist'
      if (!existsSync(publicDir)) return

      function copyDir(src: string, dest: string) {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
        for (const file of readdirSync(src)) {
          const srcPath = join(src, file)
          const destPath = join(dest, file)
          if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath)
          } else {
            copyFileSync(srcPath, destPath)
          }
        }
      }
      copyDir(publicDir, distDir)
      console.log('✅ public/ assets copied to dist/')

      // Patch _routes.json to serve large static files directly (bypass Worker)
      const routesPath = join(distDir, '_routes.json')
      if (existsSync(routesPath)) {
        const routes = JSON.parse(readFileSync(routesPath, 'utf-8'))
        const extraExcludes = [
          '/TocaEssa.apk',
          '/video_toca_essa_promo.mp4',
          '/app-icon-source.png'
        ]
        const current: string[] = routes.exclude || []
        for (const ex of extraExcludes) {
          if (!current.includes(ex)) current.push(ex)
        }
        routes.exclude = current
        writeFileSync(routesPath, JSON.stringify(routes))
        console.log('✅ _routes.json patched with static asset exclusions')
      }
    }
  }
}

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    }),
    copyPublicAssets()
  ]
})

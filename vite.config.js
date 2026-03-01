import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Generates sitemap.xml from moduleData.js at build time (runs in Node.js during vite build)
function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const src = readFileSync(resolve('src/moduleData.js'), 'utf-8')
      // Extract paired {id, tag} from each module object
      const modules = [...src.matchAll(/\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?tag:\s*['"]([^'"]+)['"]/g)]
        .map(m => ({ id: m[1], tag: m[2] }))
      const site = 'https://www.aidecoded.academy'
      const today = new Date().toISOString().split('T')[0]
      const urls = [
        `  <url>\n    <loc>${site}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
        ...modules.map(({ id, tag }) => {
          const priority = tag === 'Game' ? '0.7' : '0.8'
          return `  <url>\n    <loc>${site}/?tab=${id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
        }),
      ]
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      writeFileSync(resolve('dist/sitemap.xml'), xml)
      console.log(`Sitemap generated: 1 homepage + ${modules.length} modules = ${modules.length + 1} URLs`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let appVersion = '1.0'
  try {
    appVersion = JSON.parse(readFileSync(resolve('version.json'), 'utf-8')).version
  } catch { /* fallback if version.json missing */ }

  return {
    base: '/',
    plugins: [react(), sitemapPlugin()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    envPrefix: ['VITE_', 'FORMSPREE_', 'SUPABASE_'],
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: () => '/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.OPENAI_API_KEY}`)
            })
          },
        },
        '/api/embeddings': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: () => '/v1/embeddings',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.OPENAI_API_KEY}`)
            })
          },
        },
      },
    },
  }
})

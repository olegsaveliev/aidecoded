import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [react()],
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

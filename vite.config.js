import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages + custom domain: base '/' works with CNAME.
// Deep-link refresh handled by public/404.html fallback.
export default defineConfig({
  base: './',
  plugins: [react()],
})

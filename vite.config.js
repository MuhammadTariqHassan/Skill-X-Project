import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built site in dist/ works from any folder / static host
export default defineConfig({
  plugins: [react()],
  base: './',
})

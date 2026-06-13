import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // './' garante caminhos relativos — essencial para Hostinger shared hosting
  base: './',
})

import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, 'src/main.tsx'),
    }
  },
})

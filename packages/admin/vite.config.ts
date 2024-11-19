import fs from 'fs'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    https: {
      key: fs.readFileSync('../../certs/localhost-key.pem'),
      cert: fs.readFileSync('../../certs/localhost.pem')
    }
  }
})

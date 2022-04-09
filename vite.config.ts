import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 8888,
        proxy: {
            '/socket.io': {
                target: 'ws://localhost:3000',
                ws: true,
            },
        },
    },

})

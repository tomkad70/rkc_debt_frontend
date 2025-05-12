import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'



// https://vite.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'https://rkc-api.barkovskii.ru/',
                changeOrigin: true,
                secure: true
            }
        },
        allowedHosts:['rkc.barkovskii.ru','rkc-api.barkovskii.ru']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src') // Добавить настройку алиаса
        }
    },
    plugins: [vue(), tailwindcss()],
})

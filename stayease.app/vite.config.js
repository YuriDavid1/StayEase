import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [plugin(), tailwindcss()],
    server: {
        port: 55131,
        proxy: {
            '/api': {
                target: 'http://localhost:5047',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    test: {
        // jsdom provides window, localStorage and events used by the session code.
        environment: 'jsdom',
        include: ['src/**/*.test.{js,jsx}'],
        restoreMocks: true,
    },
});
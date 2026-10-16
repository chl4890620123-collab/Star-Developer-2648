import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-downloads',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.includes('SafeStack_Weather_Guard_Presentation.pptx')) {
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
              res.setHeader('Content-Disposition', 'attachment; filename="SafeStack_Weather_Guard_Presentation.pptx"');
            } else if (req.url && req.url.endsWith('.mp4')) {
              res.setHeader('Content-Type', 'video/mp4');
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/kma': {
          target: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kma/, ''),
          secure: false,
        },
      },
    },
  };
});

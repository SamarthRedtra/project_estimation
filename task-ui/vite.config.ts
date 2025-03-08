import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import proxyOptions from './proxyOptions';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  
	server: {
	port: 8080,
	host: '0.0.0.0',
	proxy: proxyOptions
	},
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Redtra Task Manager App',
        short_name: 'Redtra',
        description: 'Manage your tasks efficiently with Redtra.',
        theme_color: '#ff0000',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
      dedupe: ['react', 'react-dom', 'react-redux']
  },
  build: {
	outDir: '../project_estimation/public/task-ui',
	emptyOutDir: true,
	target: 'es2015',
}
}));



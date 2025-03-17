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
			strategies: "injectManifest",
			injectRegister: null,
      outDir: "../project_estimation/public/task-ui",
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true
      },
      includeAssets: ['fav.png', 'redtra-logo.png'],
      manifest: {
        name: 'Redtra Task Manager App',
        short_name: 'Redtra',
        start_url: "/task-ui",
        scope: "/task-ui/",
        description: 'Manage your tasks efficiently with Redtra.',
        theme_color: '#ff0000',
        display: "standalone",
        background_color: "#ffffff",
        screenshots: [
          {
            src: '/assets/project_estimation/manifest/desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/assets/project_estimation/manifest/mobile.png',
            sizes: '390x844',
            type: 'image/png'
          }
        ],
        icons: [
          {
            src: '/assets/project_estimation/manifest/256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/assets/project_estimation/manifest/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/project_estimation/manifest/1024.png',
            sizes: '1024x1024',
            type: 'image/png',
          }
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
  commonjsOptions: {
    include: [/tailwind.config.js/, /node_modules/],
  },
	emptyOutDir: true,
	target: 'es2015',
}
}));



import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    // Allow Cloudflare Tunnel hostnames
    allowedHosts: ['.trycloudflare.com'],
    hmr: {
      clientPort: 443, // Directs HMR over secure tunnel port
    },
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // No proxy needed — the Anthropic API is called directly from the browser
  // via the user's own key (BYOK), using the anthropic-dangerous-direct-browser-access
  // header. See src/api.js.
});

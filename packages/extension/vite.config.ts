import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import { resolve } from 'path';

const targetBrowser = process.env.TARGET_BROWSER || 'chrome';

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './src/manifest.json',
      browser: targetBrowser as 'chrome' | 'firefox',
      webExtPolyfill: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: `dist/${targetBrowser}`,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        'content-script': resolve(__dirname, 'src/content-script/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        dashboard: resolve(__dirname, 'src/dashboard/index.html'),
      },
    },
  },
  define: {
    __TARGET_BROWSER__: JSON.stringify(targetBrowser),
  },
});
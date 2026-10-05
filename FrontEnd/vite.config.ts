import { basename, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { isLegalPage, legalTitle, renderLegalPage } from './src/legal.ts';
import { renderApp, renderJsonLd } from './src/render.ts';

const PORT = 5175;
const APP_PLACEHOLDER = '<!--app-->';
const JSONLD_PLACEHOLDER = '<!--jsonld-->';
const LEGAL_PAGES = ['aviso-legal', 'privacidad', 'cookies'] as const;

// Pre-renders the Spanish page into index.html so content and links are
// crawlable without JavaScript. main.ts takes over for language switching.
function prerender(): Plugin {
  return {
    name: 'premium-prerender',
    transformIndexHtml(html, ctx) {
      const page = basename(ctx.filename, '.html');
      if (isLegalPage(page)) {
        return html.replace('<!--legal-title-->', legalTitle(page)).replace('<!--legal-->', renderLegalPage(page));
      }
      return html.replace(APP_PLACEHOLDER, renderApp('es')).replace(JSONLD_PLACEHOLDER, renderJsonLd());
    },
  };
}

export default defineConfig({
  plugins: [prerender()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(LEGAL_PAGES.map((page) => [page, resolve(import.meta.dirname, `${page}.html`)])),
      },
    },
  },
  server: { port: PORT, strictPort: true },
  preview: { port: PORT, strictPort: true },
});

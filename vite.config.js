import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import * as cheerio from 'cheerio';

// Artigos and projetos are pre-rendered to static HTML by
// scripts/generate-pages.mjs (one file per slug) before this config loads,
// so each gets its own crawlable page instead of sharing one JS-only template.
function generatedPageInputs(dir, prefix) {
  const abs = resolve(__dirname, dir);
  if (!existsSync(abs)) return {};
  return Object.fromEntries(
    readdirSync(abs)
      .filter((f) => f.endsWith('.html'))
      .map((f) => [`${prefix}-${f.replace(/\.html$/, '')}`, resolve(abs, f)])
  );
}

// Injects admin-editable copy (public/data/site-content.json) into elements
// marked with data-cms="<namespace>.<field>" — runs on both `vite dev` and
// `vite build`, so the source HTML files are never written to on disk.
function siteContentPlugin() {
  let siteContent = {};
  return {
    name: 'inject-site-content',
    buildStart() {
      const jsonPath = resolve(__dirname, 'public/data/site-content.json');
      try {
        siteContent = JSON.parse(readFileSync(jsonPath, 'utf8'));
      } catch {
        siteContent = {};
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes('data-cms=')) return html;

        const $ = cheerio.load(html);
        $('[data-cms]').each((_, el) => {
          const key = $(el).attr('data-cms');
          const [namespace, field] = key.split('.');
          const value = siteContent?.[namespace]?.[field];
          if (value != null && value !== '') {
            $(el).text(value);
          }
        });
        return $.html();
      },
    },
  };
}

export default defineConfig({
  plugins: [siteContentPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobre: resolve(__dirname, 'sobre.html'),
        servicos: resolve(__dirname, 'servicos.html'),
        projetos: resolve(__dirname, 'projetos.html'),
        projeto: resolve(__dirname, 'projeto.html'),
        artigos: resolve(__dirname, 'artigos.html'),
        artigo: resolve(__dirname, 'artigo.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        vagas: resolve(__dirname, 'vagas.html'),
        contato: resolve(__dirname, 'contato.html'),
        obrigado: resolve(__dirname, 'obrigado.html'),
        ...generatedPageInputs('artigos', 'artigo-page'),
        ...generatedPageInputs('projetos', 'projeto-page'),
      },
    },
  },
});

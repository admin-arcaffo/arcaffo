import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { materiaSitePlugin } from './scripts/materia-site.mjs';

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

export default defineConfig({
  plugins: [materiaSitePlugin()],
  build: {
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobre: resolve(__dirname, 'sobre.html'),
        servicos: resolve(__dirname, 'servicos.html'),
        brandingCampoGrande: resolve(__dirname, 'agencia-de-branding-campo-grande/index.html'),
        projetos: resolve(__dirname, 'projetos.html'),
        projeto: resolve(__dirname, 'projeto.html'),
        artigos: resolve(__dirname, 'artigos.html'),
        artigo: resolve(__dirname, 'artigo.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        vagas: resolve(__dirname, 'vagas.html'),
        contato: resolve(__dirname, 'contato.html'),
        obrigado: resolve(__dirname, 'obrigado.html'),
        notFound: resolve(__dirname, '404.html'),
        ...generatedPageInputs('artigos', 'artigo-page'),
        ...generatedPageInputs('projetos', 'projeto-page'),
      },
    },
  },
});

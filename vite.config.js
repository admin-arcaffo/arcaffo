import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
        vagas: resolve(__dirname, 'vagas.html'),
        contato: resolve(__dirname, 'contato.html'),
      },
    },
  },
});

/**
 * Seed Script — envia os dados locais (public/data/*.json) para o Vercel Blob
 * para que apareçam no painel /admin.
 *
 * Uso:
 *   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." node scripts/seed-blob.mjs
 */

import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('❌  Defina BLOB_READ_WRITE_TOKEN antes de rodar este script.');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────
function readJson(name) {
  return JSON.parse(readFileSync(resolve(root, 'public', 'data', name), 'utf-8'));
}

async function uploadToBlob(key, data) {
  const json = JSON.stringify(data, null, 2);
  const blob = await put(key, json, { access: 'public', addRandomSuffix: false, allowOverwrite: true, token });
  console.log(`  ✅  ${key}  →  ${blob.url}  (${data.length} itens)`);
}

// ─── Normalizar Artigos ──────────────────────────────────────────────
function normalizeArtigos(raw) {
  return raw.map((a, i) => ({
    id: a.id || `artigo_${i}`,
    title: a.title || '',
    slug: a.slug || '',
    date: a.date || '',
    cover: a.cover || '',
    content: a.content || '',
    excerpt: a.excerpt || '',
    status: a.status || 'published',
    author: a.author || { name: '', role: '', photo: '' },
    seo: a.seo || { metaTitle: a.title || '', metaDescription: a.excerpt || '', keywords: '' },
    createdAt: a.createdAt || new Date().toISOString(),
    updatedAt: a.updatedAt || new Date().toISOString(),
  }));
}

// ─── Normalizar Projetos ─────────────────────────────────────────────
function normalizeProjetos(raw) {
  return raw.map((p, i) => ({
    id: p.id || `projeto_${i}`,
    title: p.title || '',
    slug: p.slug || '',
    description: p.description || '',
    cover: p.cover || '',
    tags: p.tags || [],
    team: p.team || '',
    images: p.images || [],
    media: (p.images || []).map(img => ({ type: 'image', url: img.url || img })),
    status: p.status || 'published',
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  }));
}

// ─── Normalizar Vagas ────────────────────────────────────────────────
function normalizeVagas(raw) {
  return raw.map((v, i) => {
    // Montar slug a partir do título
    const slug = v.slug || v.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Montar descrição rica juntando os campos antigos
    const sections = [];
    if (v.sobre) sections.push(`<h3>Sobre a vaga</h3><p>${v.sobre}</p>`);
    if (v.quem_e_voce) sections.push(`<h3>Quem é você</h3><p>${v.quem_e_voce}</p>`);
    if (v.o_que_buscamos) {
      const items = v.o_que_buscamos
        .replace(/^'/, '').replace(/'$/, '')
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      sections.push(`<h3>O que buscamos</h3><ul>${items.map(li => `<li>${li}</li>`).join('')}</ul>`);
    }

    return {
      id: v.id || `vaga_${i}`,
      title: v.title || '',
      slug,
      location: v.perfil || 'São Paulo, SP',
      type: v.regime || 'Tempo Integral',
      description: sections.join('\n') || '',
      status: v.status || 'published',
      createdAt: v.publishDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Enviando dados locais para o Vercel Blob...\n');

  const artigos = normalizeArtigos(readJson('artigos.json'));
  await uploadToBlob('db/artigos.json', artigos);

  const projetos = normalizeProjetos(readJson('projetos.json'));
  await uploadToBlob('db/projetos.json', projetos);

  const vagas = normalizeVagas(readJson('vagas.json'));
  await uploadToBlob('db/vagas.json', vagas);

  console.log('\n🎉  Seed completo! Todos os dados foram enviados ao Blob.');
  console.log('    Agora abra /admin e confira.');
}

main().catch(err => {
  console.error('❌  Erro no seed:', err);
  process.exit(1);
});

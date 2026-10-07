import { put } from '@vercel/blob';
import { readFile } from 'node:fs/promises';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error('BLOB_READ_WRITE_TOKEN ausente.');

const sourcePath = new URL('../public/data/projetos.json', import.meta.url);
const projects = JSON.parse(await readFile(sourcePath, 'utf8'));
const payload = `${JSON.stringify(projects, null, 2)}\n`;

const blob = await put('db/projetos.json', payload, {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json; charset=utf-8',
  token,
});

console.log(`Projetos publicados no Blob: ${projects.length}`);
console.log(`Destino: ${blob.pathname}`);

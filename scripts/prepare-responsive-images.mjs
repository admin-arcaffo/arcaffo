import sharp from 'sharp';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const projects = JSON.parse(readFileSync('public/data/projetos.json', 'utf8'));
const covers = [...new Set(projects.map(project => project.cover || project.images?.[0]?.url).filter(Boolean))];
let generated = 0;

async function writeIfStale(input, output, transform) {
  if (existsSync(output) && statSync(output).mtimeMs >= statSync(input).mtimeMs) return;
  await transform(sharp(input)).toFile(output);
  generated++;
}

for (const cover of covers) {
  const match = String(cover).match(/^\/images\/projetos\/(.+)\.(?:avif|jpe?g|png|webp)$/i);
  if (!match) continue;
  const input = resolve('public', cover.slice(1));
  if (!existsSync(input)) continue;
  const base = resolve('public/images/projetos', match[1]);
  for (const width of [480, 960]) {
    await writeIfStale(input, `${base}-${width}.webp`, image => image.resize({width, withoutEnlargement:true}).webp({quality:78, effort:4}));
  }
}

const facadeInput = 'public/images/materia/fachada-960.avif';
if (existsSync(facadeInput)) {
  await writeIfStale(facadeInput, 'public/images/materia/fachada-640.avif', image => image.resize({width:640}).avif({quality:55, effort:4}));
}

console.log(`Responsive images ready (${generated} generated).`);

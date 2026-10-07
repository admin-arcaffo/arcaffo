import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'public/data/projetos.json');
const OUTPUT_ROOT = path.join(ROOT, 'social/instagram/carrosseis-identidade');
const MANIFEST_ROOT = path.join(OUTPUT_ROOT, '_manifests');
const FEED_WIDTH = 1080;
const FEED_HEIGHT = 1350;

// Todos os carrosséis usam o formato vertical 4:5 do feed do Instagram.
// A imagem original é sempre encaixada inteira: não há crop de logotipo, assinatura
// ou conteúdo. O respiro necessário usa a cor predominante da própria imagem,
// preservando a composição e os pontos de atenção definidos pelos terços originais.
const CAROUSELS = {
  'calixto-sandes-e-zabaleta': {
    slides: [[1, 'centre'], [2, 'centre'], [3, 'centre'], [4, 'centre'], [5, 'centre']],
  },
  'instituto-construindo-um-artista': {
    slides: [[1, 'centre'], [3, 'centre'], [5, 'centre'], [7, 'centre'], [8, 'centre'], [10, 'centre'], [12, 'centre'], [13, 'centre']],
  },
  'casa-santa-thereza': {
    slides: [[1, 'centre'], [2, 'centre'], [3, 'centre'], [4, 'centre'], [5, 'centre']],
  },
  'torque-solucoes-automotivas': {
    slides: [[1, 'centre'], [2, 'centre'], [4, 'centre'], [5, 'centre'], [6, 'centre'], [7, 'centre'], [8, 'centre'], [9, 'centre'], [11, 'centre'], [12, 'centre']],
  },
  'tassia-brito': {
    slides: [[1, 'centre'], [2, 'centre'], [3, 'centre'], [4, 'centre'], [5, 'centre'], [6, 'centre']],
  },
  aldraba: {
    slides: [[1, 'centre'], [2, 'centre'], [4, 'centre'], [5, 'centre'], [7, 'centre'], [8, 'centre'], [10, 'centre'], [11, 'centre']],
  },
  'nadyelle-farias-arquiteta': {
    slides: [[1, 'centre'], [2, 'centre'], [3, 'centre'], [4, 'centre'], [5, 'centre'], [6, 'centre'], [7, 'centre'], [8, 'centre'], [9, 'centre'], [10, 'centre']],
  },
  'lucas-grisoste': {
    slides: [[3, 'north'], [4, 'centre'], [5, 'centre'], [6, 'centre'], [9, 'centre'], [10, 'centre'], [12, 'centre'], [14, 'centre'], [16, 'centre'], [17, 'north']],
  },
  'dra-yana': {
    slides: [[1, 'centre'], [6, 'centre'], [7, 'centre'], [8, 'centre'], [9, 'centre'], [10, 'centre'], [11, 'centre'], [12, 'centre'], [13, 'centre'], [14, 'centre'], [17, 'centre']],
  },
  'priscila-pieczykolan-arquitetura': {
    slides: [[1, 'centre'], [2, 'centre'], [4, 'centre'], [5, 'centre'], [7, 'centre'], [8, 'centre'], [9, 'centre'], [10, 'centre'], [11, 'centre']],
  },
};

const projects = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const report = [];

await mkdir(OUTPUT_ROOT, { recursive: true });
await mkdir(MANIFEST_ROOT, { recursive: true });

for (const [slug, carousel] of Object.entries(CAROUSELS)) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Projeto não encontrado: ${slug}`);

  const outputDir = path.join(OUTPUT_ROOT, slug);
  await mkdir(outputDir, { recursive: true });
  await unlink(path.join(outputDir, 'manifest.json')).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  const previousSlides = (await readdir(outputDir)).filter((name) => /^\d+\.jpg$/.test(name));
  await Promise.all(previousSlides.map((name) => unlink(path.join(outputDir, name))));
  const slides = [];

  for (let slideIndex = 0; slideIndex < carousel.slides.length; slideIndex += 1) {
    const [sourceIndex, position] = carousel.slides[slideIndex];
    const source = project.images?.[sourceIndex - 1]?.url || project.images?.[sourceIndex - 1];
    if (!source) throw new Error(`${slug}: imagem ${sourceIndex} não encontrada`);

    const inputPath = path.join(ROOT, 'public', source.replace(/^\//, ''));
    const outputName = `${String(slideIndex + 1).padStart(2, '0')}.jpg`;
    const outputPath = path.join(outputDir, outputName);

    const sourceImage = sharp(inputPath, { animated: false, limitInputPixels: false }).rotate();
    const { dominant } = await sourceImage.clone().stats();
    const background = { ...dominant, alpha: 1 };

    await sourceImage
      .resize(FEED_WIDTH, FEED_HEIGHT, { fit: 'contain', position, background })
      .flatten({ background })
      .jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(outputPath);

    slides.push({
      slide: slideIndex + 1,
      file: outputName,
      source,
      placement: position,
      treatment: 'contain-with-source-dominant-margin',
      background,
    });
  }

  const manifest = {
    title: project.title,
    slug,
    format: 'Instagram carousel',
    dimensions: `${FEED_WIDTH}x${FEED_HEIGHT}`,
    aspectRatio: '4:5',
    rule: 'Somente imagens originais da identidade, sem elementos sobrepostos, sem crop e sem cortar assinaturas. Margens usam a cor predominante da própria imagem.',
    slides,
  };
  await writeFile(path.join(MANIFEST_ROOT, `${slug}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
  report.push({ title: project.title, slug, slides: slides.length, outputDir });
}

console.log(JSON.stringify({ carousels: report.length, slides: report.reduce((sum, item) => sum + item.slides, 0), report }, null, 2));

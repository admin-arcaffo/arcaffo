import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const __dirname = new URL('.', import.meta.url).pathname;

const dataFile = path.join(__dirname, '../public/data/projetos.json');
const imgDir = path.join(__dirname, '../public/images/projetos');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// O import dinâmico de sharp resolve o problema caso seja commonjs ou esm
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error("Falha ao carregar sharp", e);
  process.exit(1);
}

const projetos = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

async function downloadAndOptimize(url) {
  if (!url || !url.includes('wix')) return url; // Ignorar urls não-wix se houver

  let finalUrl = url;
  
  // Tratamento especial para wix:video
  if (url.startsWith('wix:video://')) {
    const posterMatch = url.match(/posterUri=([^&]+)/);
    if (posterMatch && posterMatch[1]) {
      finalUrl = `https://static.wixstatic.com/media/${posterMatch[1]}`;
    } else {
      return url; // Não consegue converter, mantém
    }
  }

  // Gera nome de arquivo único baseado na URL
  const hash = crypto.createHash('md5').update(finalUrl).digest('hex').substring(0, 10);
  const ext = finalUrl.split('.').pop().split('~')[0].split('?')[0]; // pega a extensao original
  const filename = `${hash}.webp`;
  const filepath = path.join(imgDir, filename);
  const localUrl = `/images/projetos/${filename}`;

  if (fs.existsSync(filepath)) {
    return localUrl; // Já foi baixado
  }

  console.log(`Baixando: ${finalUrl}`);
  try {
    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Otimiza
    await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true }) // Max width para não pesar
      .webp({ quality: 80, effort: 4 })
      .toFile(filepath);
    
    return localUrl;
  } catch (error) {
    console.error(`Erro ao baixar ${finalUrl}:`, error.message);
    return url; // Retorna original em caso de erro
  }
}

async function processAll() {
  for (let p of projetos) {
    console.log(`Processando projeto: ${p.title}`);
    
    // Cover
    if (p.cover) {
      p.cover = await downloadAndOptimize(p.cover);
    }

    // Images
    if (p.images && p.images.length > 0) {
      for (let i = 0; i < p.images.length; i++) {
        p.images[i].url = await downloadAndOptimize(p.images[i].url);
      }
    }
  }

  fs.writeFileSync(dataFile, JSON.stringify(projetos, null, 2));
  console.log('Migração concluída com sucesso!');
}

processAll();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const sharp = require('sharp');

const artigosJsonPath = path.join(__dirname, '../public/data/artigos.json');
const outputDir = path.join(__dirname, '../public/images/artigos');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const artigos = JSON.parse(fs.readFileSync(artigosJsonPath, 'utf8'));

// Simple regex to find wixstatic URLs
const wixUrlRegex = /https:\/\/static\.wixstatic\.com\/media\/([a-zA-Z0-9~_.-]+)/g;

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

function getHash(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 10);
}

async function processImage(url) {
  // Extract clean wix URL without query params or extra paths
  // Some URLs in data-pin-media have /v1/fill/... appended
  const cleanUrlMatch = url.match(/(https:\/\/static\.wixstatic\.com\/media\/[a-zA-Z0-9_]+~mv2\.(jpg|jpeg|png|webp|gif))/);
  const downloadUrl = cleanUrlMatch ? cleanUrlMatch[1] : url.split('/v1/')[0];
  
  const ext = 'webp';
  const hash = getHash(downloadUrl);
  const filename = `${hash}.${ext}`;
  const localPath = path.join(outputDir, filename);
  const localUrl = `/images/artigos/${filename}`;

  if (!fs.existsSync(localPath)) {
    console.log(`Downloading: ${downloadUrl}`);
    try {
      const buffer = await downloadImage(downloadUrl);
      await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(localPath);
      console.log(`Saved: ${localPath}`);
    } catch (error) {
      console.error(`Error processing ${downloadUrl}:`, error.message);
      return url; // Return original on error
    }
  }
  return localUrl;
}

async function run() {
  const urlMap = new Map();

  for (let i = 0; i < artigos.length; i++) {
    const artigo = artigos[i];
    
    // Process cover
    if (artigo.cover && artigo.cover.includes('wixstatic')) {
      if (!urlMap.has(artigo.cover)) {
        urlMap.set(artigo.cover, await processImage(artigo.cover));
      }
      artigo.cover = urlMap.get(artigo.cover);
    }

    // Process content URLs
    if (artigo.content) {
      const urls = [];
      let match;
      while ((match = wixUrlRegex.exec(artigo.content)) !== null) {
        // match[0] is the base URL. Wait, the regex might not capture full url if there are extra paths.
        // Let's use a broader regex for capturing any wix url in the content
      }
      
      // Broader replace approach
      const allWixUrls = artigo.content.match(/https:\/\/static\.wixstatic\.com\/media\/[^\s"']+/g) || [];
      for (const wixUrl of allWixUrls) {
        // Some URLs might have /v1/fill... which we should also replace with the same local image
        if (!urlMap.has(wixUrl)) {
          urlMap.set(wixUrl, await processImage(wixUrl));
        }
      }
      
      // Replace all mapped URLs in content
      for (const [oldUrl, newUrl] of urlMap.entries()) {
        artigo.content = artigo.content.split(oldUrl).join(newUrl);
      }
    }
  }

  fs.writeFileSync(artigosJsonPath, JSON.stringify(artigos, null, 2), 'utf8');
  console.log('Migration complete!');
}

run();

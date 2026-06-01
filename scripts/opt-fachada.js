const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = '/Users/arthurfava/Documents/Sites/arcaffo/_assets/_arquivos da marca/IMG_2848.jpg';
const outputPath = path.join(__dirname, '../public/images/fachada.webp');

async function processImage() {
  if (fs.existsSync(inputPath)) {
    // Resize to max width 1920 to keep it manageable and fast, and convert to webp
    await sharp(inputPath)
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log('Facade image optimized and saved to', outputPath);
  } else {
    console.log('Image not found:', inputPath);
  }
}

processImage();

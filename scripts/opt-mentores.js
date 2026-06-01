const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = '/Users/arthurfava/Documents/Sites/arcaffo/_assets/mentores';
const outputDir = path.join(__dirname, '../public/images/lideranca');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg'));

async function run() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const filename = file.replace('.jpg', '.webp');
    const outputPath = path.join(outputDir, filename);

    try {
      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Saved: ${outputPath}`);
    } catch (e) {
      console.error(e);
    }
  }
}

run();

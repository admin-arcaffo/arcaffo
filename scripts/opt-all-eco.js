const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../_assets/ecossistema');
const outputDir = path.join(__dirname, '../public/images/ecossistema');

async function convertAll() {
  const folders = ['advisor', 'enm', 'group', 'ordo'];
  for (const folder of folders) {
    const folderPath = path.join(inputDir, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
          const input = path.join(folderPath, file);
          const output = path.join(outputDir, `${folder}_${file.replace(/[^a-zA-Z0-9]/g, '_')}.webp`);
          await sharp(input).resize(600, null, { withoutEnlargement: true }).webp().toFile(output);
          console.log('Saved', output);
        }
      }
    }
  }
}
convertAll();

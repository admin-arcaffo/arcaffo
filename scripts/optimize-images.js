const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../_assets/_arquivos da marca');
const outputDir = path.join(__dirname, '../public/images/brand');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i) && !f.includes('logo'));

async function optimizeImages() {
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        console.log(`Optimizing ${file}...`);
        try {
            await sharp(inputPath)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`Created ${outputPath}`);
        } catch (e) {
            console.error(`Error optimizing ${file}:`, e);
        }
    }
}

optimizeImages();

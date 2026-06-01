const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const artigosDir = path.join(__dirname, '../_assets/_artigos');
const outputJson = path.join(__dirname, '../public/data/artigos.json');

const artigos = JSON.parse(fs.readFileSync(outputJson, 'utf8'));

function resolveWixImage(src) {
    if (!src) return '';
    if (src.startsWith('http')) return src;
    const match = src.match(/([a-zA-Z0-9]+_[a-zA-Z0-9]+~mv2\.(jpg|jpeg|png|webp|gif))/);
    if (match) {
        return `https://static.wixstatic.com/media/${match[1]}`;
    }
    return src;
}

const files = fs.readdirSync(artigosDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(artigosDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    let title = $('h1').first().text().trim();
    if (!title) title = file.replace('.html', '');

    const slug = file.replace(/\.html$/, '').toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/[ãáàâ]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úùû]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const allImages = [];
    $('[data-hook=\"post-image\"], article img').each((i, el) => {
        allImages.push($(el).attr('src'));
    });

    // The first image is usually the author avatar. We want the second one.
    // If there is no second image, fallback to first, or generate placeholder.
    let properCover = '';
    if (allImages.length > 1) {
        properCover = resolveWixImage(allImages[1]);
    } else if (allImages.length === 1) {
        properCover = resolveWixImage(allImages[0]);
    }

    // Find the corresponding article in JSON and update it
    const articleIndex = artigos.findIndex(a => a.slug === slug);
    if (articleIndex !== -1 && properCover) {
        artigos[articleIndex].cover = properCover;
    }
});

fs.writeFileSync(outputJson, JSON.stringify(artigos, null, 2));
console.log('Successfully updated article covers!');

const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('_assets/_artigos/A Arte da Comunicação Leve e Profunda das Marcas.html', 'utf8');
const $ = cheerio.load(html);

console.log('H1:', $('h1').text());
console.log('Post title:', $('[data-hook=\"post-title\"]').text());
console.log('Wix Blog Viewer post container exists:', $('.blog-post-page').length > 0);
console.log('Data-hook post-description exists:', $('[data-hook=\"post-description\"]').length > 0);

const contentHtml = $('[data-hook=\"post-description\"]').html() || $('.blog-post-content').html() || $('.post-content__body').html();
if (contentHtml) {
    console.log('Found content block, length:', contentHtml.length);
} else {
    // If not found, try to find the largest text container
    const texts = $('div, section').map((i, el) => $(el).text().trim()).get();
    const largest = texts.sort((a, b) => b.length - a.length)[0];
    console.log('Largest text block length:', largest ? largest.length : 0);
}

// Find cover image
const img = $('[data-hook=\"post-image\"], article img').first().attr('src');
console.log('Image src:', img);

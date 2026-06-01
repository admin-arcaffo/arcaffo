const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const artigosDir = path.join(__dirname, '../_assets/_artigos');
const outputJson = path.join(__dirname, '../data/artigos.json');

const files = fs.readdirSync(artigosDir).filter(f => f.endsWith('.html'));

const artigos = [];

function resolveWixImage(src) {
    if (!src) return '';
    // If it's already a full URL, return it
    if (src.startsWith('http')) return src;
    
    // e.g. ./A Arte da Comunicação_files/0eac0d_b8acbcb3...~mv2.jpg
    const match = src.match(/([a-zA-Z0-9]+_[a-zA-Z0-9]+~mv2\.(jpg|jpeg|png|webp|gif))/);
    if (match) {
        return `https://static.wixstatic.com/media/${match[1]}`;
    }
    
    return src;
}

files.forEach((file, index) => {
    const filePath = path.join(artigosDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    // Extract Title
    let title = $('h1').first().text().trim();
    if (!title) {
        title = file.replace('.html', '');
    }

    // Extract Date
    // Usually inside [data-hook="post-date"] or similar. Let's look for time tags or specific span
    let dateStr = $('time').text().trim();
    if (!dateStr) {
        dateStr = $('.blog-post-page-font-date').first().text().trim();
    }
    if (!dateStr) {
        // Fallback or leave empty
        dateStr = "2023"; // just a fallback
    }

    // Extract Content
    const contentNode = $('[data-hook=\"post-description\"]');
    if (!contentNode.length) {
        console.warn(`No content found for ${file}`);
        return;
    }

    // Fix images inside content
    contentNode.find('img').each((i, el) => {
        const $img = $(el);
        const originalSrc = $img.attr('src');
        const newSrc = resolveWixImage(originalSrc);
        $img.attr('src', newSrc);
        
        // Remove srcset and other weird wix attributes
        $img.removeAttr('srcset');
        $img.removeAttr('style');
        $img.removeAttr('width');
        $img.removeAttr('height');
        
        // Clean classes
        $img.attr('class', 'article-image');
    });

    // Clean up content HTML
    // Remove scripts, wix hidden elements
    contentNode.find('script, style, link, noscript').remove();
    contentNode.find('[style*=\"display: none\"], [style*=\"display:none\"]').remove();
    
    // Unwrap weird wrappers but keep structure
    // Let's just keep the inner HTML as is for now, it's safer.
    let contentHtml = contentNode.html();

    // Extract Cover Image
    let coverImage = $('[data-hook=\"post-image\"], article img').first().attr('src');
    coverImage = resolveWixImage(coverImage);

    // If no cover image found in header, use the first image in content
    if (!coverImage) {
        const firstImg = contentNode.find('img').first().attr('src');
        if (firstImg) coverImage = firstImg;
    }

    // Generate Slug
    const slug = file.replace(/\.html$/, '').toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/[ãáàâ]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úùû]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    artigos.push({
        id: `artigo_${index}`,
        title,
        slug,
        date: dateStr,
        cover: coverImage,
        content: contentHtml.trim()
    });
});

fs.writeFileSync(outputJson, JSON.stringify(artigos, null, 2));
console.log(`Successfully migrated ${artigos.length} artigos to ${outputJson}`);

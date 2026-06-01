const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/artigos.json');
if (fs.existsSync(filePath)) {
  const artigos = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  artigos.forEach(artigo => {
    if (artigo.images && artigo.images.length >= 2) {
      // Typically, author is first, and actual cover is the second or last.
      // Let's swap the cover to the second image (index 1) or the last one.
      // Assuming index 1 is the main article image if author is index 0.
      artigo.cover = artigo.images[1];
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(artigos, null, 2), 'utf8');
  console.log('Fixed cover images in artigos.json');
} else {
  console.log('File not found');
}

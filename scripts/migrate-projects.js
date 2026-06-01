const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, '../_assets/Projetos (1).csv');
const jsonFilePath = path.join(__dirname, '../data/projetos.json');

const projects = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    // Only import published projects
    if (data['Status'] !== 'PUBLISHED') return;

    // Extract basic fields
    const title = data['Título do Projeto'] || data['Title'] || '';
    if (!title || title.trim() === '') return;

    const slugRaw = data['Projetos (Item)'];
    const slug = slugRaw ? slugRaw.replace('/projetos/', '') : title.toLowerCase().replace(/[\s\W-]+/g, '-');
    
    // Parse tags
    let tags = [];
    try {
      tags = JSON.parse(data['Tags'] || '[]');
    } catch (e) {
      console.warn(`Failed to parse tags for ${title}`);
    }

    // Process images
    let images = [];
    let coverImage = '';
    
    // Attempt to parse "Imagens do Projeto" gallery
    try {
      const gallery = JSON.parse(data['Imagens do Projeto'] || '[]');
      images = gallery.map(img => {
        // Wix image URL format: wix:image://v1/hash~filename/filename#originWidth=W&originHeight=H
        let src = img.src;
        let url = '';
        if (src.startsWith('wix:image://v1/')) {
          const parts = src.split('/');
          if (parts.length > 3) {
            const hash = parts[3];
            url = `https://static.wixstatic.com/media/${hash}`;
          }
        }
        return {
          url: url || src,
          width: img.settings?.width,
          height: img.settings?.height
        };
      });
    } catch (e) {
      console.warn(`Failed to parse images for ${title}`);
    }

    // Process cover image
    const capaStr = data['Capa'] || '';
    if (capaStr.startsWith('wix:image://v1/')) {
        const parts = capaStr.split('/');
        if (parts.length > 3) {
          const hash = parts[3];
          coverImage = `https://static.wixstatic.com/media/${hash}`;
        }
    }

    projects.push({
      id: data['ID'],
      title: title.trim(),
      slug: slug,
      description: data['Conteúdo'] || '',
      team: data['Time'] || '',
      tags: tags,
      cover: coverImage,
      images: images
    });
  })
  .on('end', () => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(projects, null, 2));
    console.log(`Successfully migrated ${projects.length} projects to ${jsonFilePath}`);
  });

import fs from 'fs';
import path from 'path';

function generateSitemap() {
  const domain = 'https://www.arcaffo.com';
  
  const staticPages = [
    '',
    '/sobre.html',
    '/servicos.html',
    '/projetos.html',
    '/artigos.html',
    '/vagas.html',
    '/contato.html'
  ];

  const artigos = JSON.parse(fs.readFileSync('public/data/artigos.json', 'utf8')).filter(a => a.status !== 'draft');
  const projetos = JSON.parse(fs.readFileSync('public/data/projetos.json', 'utf8')).filter(p => p.status !== 'draft');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${domain}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  }

  // Articles
  for (const artigo of artigos) {
    const date = artigo.createdAt || artigo.date || new Date().toISOString();
    xml += `  <url>\n    <loc>${domain}/artigo.html?slug=${artigo.slug}</loc>\n    <lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Projects
  for (const projeto of projetos) {
    const date = projeto.createdAt || projeto.date || new Date().toISOString();
    xml += `  <url>\n    <loc>${domain}/projeto.html?id=${projeto.slug}</loc>\n    <lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log('Sitemap gerado com sucesso em public/sitemap.xml');
}

generateSitemap();

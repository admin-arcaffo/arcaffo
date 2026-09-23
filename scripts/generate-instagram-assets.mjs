import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const social = JSON.parse(await fs.readFile(path.join(root, 'social/instagram/content.json'), 'utf8'));
const articles = JSON.parse(await fs.readFile(path.join(root, 'public/data/artigos.json'), 'utf8'));
const outputRoot = path.join(root, 'social/instagram/exports');

const colors = {
  paper: '#f7f3ea', sand: '#ede7dc', linen: '#d8cfc0', stone: '#b3a692',
  umber: '#7a5c3e', graphite: '#574f45', ink: '#221c16', espresso: '#17130f', ember: '#c99a63'
};

const [newsreader, inter, logoSource] = await Promise.all([
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/fonts/newsreader-latin.woff2')),
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/fonts/inter-latin.woff2')),
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/logo/ArcaffoGroup_logo_p_1.1.svg'), 'utf8')
]);

const fontCss = `
  @font-face{font-family:Newsreader;src:url(data:font/woff2;base64,${newsreader.toString('base64')}) format('woff2');font-weight:300}
  @font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter.toString('base64')}) format('woff2');font-weight:100 900}
`;

const xml = value => String(value ?? '').replace(/[<>&"']/g, char => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[char]));

function wrap(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock({ text, x, y, width, size, lineHeight = 1.12, family = 'Inter', weight = 400, fill, maxLines = 8, anchor = 'start' }) {
  const factor = family === 'Newsreader' ? .5 : .56;
  const lines = wrap(text, Math.max(10, Math.floor(width / (size * factor))));
  if (lines.length > maxLines) throw new Error(`Texto excede ${maxLines} linhas: ${text}`);
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? size * lineHeight : 0}">${xml(line)}</tspan>`).join('')}</text>`;
}

function embeddedLogo(deep, x, y, width) {
  const recolored = logoSource.replace(/<path/g, `<path fill="${deep ? colors.paper : colors.ink}"`);
  const uri = `data:image/svg+xml;base64,${Buffer.from(recolored).toString('base64')}`;
  return `<image href="${uri}" x="${x}" y="${y}" width="${width}" height="${Math.round(width / 2.9)}" preserveAspectRatio="xMidYMid meet"/>`;
}

async function imageData(src, width, height) {
  const file = path.join(root, 'public', src.replace(/^\//, ''));
  const buffer = await sharp(file).resize(width, height, { fit: 'cover', position: 'attention' }).jpeg({ quality: 90 }).toBuffer();
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

function chrome({ width, height, deep, index, total, format }) {
  const fg = deep ? colors.paper : colors.ink;
  const muted = deep ? colors.stone : colors.graphite;
  const top = format === 'story' ? 150 : 62;
  const bottom = format === 'story' ? height - 230 : height - 56;
  return `
    ${embeddedLogo(deep, 72, top, format === 'story' ? 240 : 205)}
    <line x1="72" y1="${top + 102}" x2="${width - 72}" y2="${top + 102}" stroke="${deep ? 'rgba(247,243,234,.18)' : colors.linen}" stroke-width="1"/>
    <text x="72" y="${bottom}" font-family="Inter" font-size="18" font-weight="500" letter-spacing="3" fill="${muted}">${format === 'story' ? 'MATÉRIA · ARCAFFO' : 'ARC AFFO · MATÉRIA'}</text>
    ${format === 'feed' ? `<text x="${width - 72}" y="${bottom}" text-anchor="end" font-family="Inter" font-size="18" font-weight="500" letter-spacing="2" fill="${muted}">${String(index).padStart(2,'0')} / ${String(total).padStart(2,'0')}</text>` : ''}
    <rect x="72" y="${bottom + 22}" width="${width - 144}" height="2" fill="${deep ? colors.ember : colors.umber}" opacity=".8"/>
  `;
}

async function feedSvg(slide, article, index, total) {
  const width = 1080, height = 1350;
  const deep = slide.theme === 'deep' || slide.layout === 'cta';
  const bg = deep ? colors.espresso : colors.paper;
  const fg = deep ? colors.paper : colors.ink;
  const muted = deep ? colors.stone : colors.graphite;
  const accent = deep ? colors.ember : colors.umber;
  const titleSize = slide.layout === 'cover' ? (slide.title.length > 42 ? 72 : 82) : slide.layout === 'cta' ? 68 : 60;
  const titleY = slide.layout === 'cover' ? 330 : 405;
  const bodyY = slide.layout === 'cover' ? 610 : 700;
  let image = '';
  if (slide.layout === 'cover' || slide.image) {
    const uri = await imageData(article.cover, 1080, slide.layout === 'cover' ? 470 : 430);
    const y = slide.layout === 'cover' ? 880 : 820;
    image = `<image href="${uri}" x="0" y="${y}" width="1080" height="${1350-y}" preserveAspectRatio="xMidYMid slice"/>
      <rect x="0" y="${y}" width="1080" height="${1350-y}" fill="${colors.ink}" opacity=".10"/>`;
  }
  const eyebrow = slide.eyebrow || (slide.number ? `PONTO ${slide.number}` : 'MATÉRIA');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><style>${fontCss}</style></defs>
    <rect width="1080" height="1350" fill="${bg}"/>
    ${slide.layout === 'cta' ? `<circle cx="900" cy="250" r="360" fill="${colors.ember}" opacity=".07"/>` : ''}
    ${chrome({ width, height, deep, index, total, format:'feed' })}
    <text x="72" y="${slide.layout === 'cover' ? 258 : 315}" font-family="Inter" font-size="20" font-weight="500" letter-spacing="4" fill="${accent}">${xml(eyebrow)}</text>
    ${textBlock({ text:slide.title, x:72, y:titleY, width:905, size:titleSize, lineHeight:1.02, family:'Newsreader', weight:300, fill:fg, maxLines:4 })}
    ${textBlock({ text:slide.body, x:72, y:bodyY, width:slide.image ? 880 : 900, size:29, lineHeight:1.45, family:'Inter', weight:400, fill:muted, maxLines:5 })}
    ${slide.layout === 'cover' ? `<text x="948" y="820" text-anchor="end" font-family="Inter" font-size="20" font-weight="500" letter-spacing="3" fill="${accent}">DESLIZE →</text>` : ''}
    ${slide.layout === 'cta' ? `<text x="72" y="1000" font-family="Inter" font-size="22" font-weight="500" letter-spacing="3" fill="${colors.ember}">ARCAFFO.COM/ARTIGOS</text>` : ''}
    ${image}
  </svg>`;
}

async function storySvg(slide, article, index) {
  const width = 1080, height = 1920;
  const deep = slide.theme === 'deep' || slide.layout === 'cta';
  const bg = deep ? colors.espresso : colors.paper;
  const fg = deep ? colors.paper : colors.ink;
  const muted = deep ? colors.stone : colors.graphite;
  const accent = deep ? colors.ember : colors.umber;
  const titleSize = slide.title.length > 48 ? 76 : 88;
  const imageY = slide.layout === 'cover' ? 1190 : slide.layout === 'cta' ? 1110 : null;
  const image = imageY ? `<image href="${await imageData(article.cover, 1080, 1920-imageY)}" x="0" y="${imageY}" width="1080" height="${1920-imageY}" preserveAspectRatio="xMidYMid slice"/><rect x="0" y="${imageY}" width="1080" height="${1920-imageY}" fill="${colors.ink}" opacity=".12"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><style>${fontCss}</style></defs>
    <rect width="1080" height="1920" fill="${bg}"/>
    ${chrome({ width, height, deep, index, total:3, format:'story' })}
    <text x="72" y="430" font-family="Inter" font-size="21" font-weight="500" letter-spacing="4" fill="${accent}">${xml(slide.eyebrow)}</text>
    ${textBlock({ text:slide.title, x:72, y:525, width:900, size:titleSize, lineHeight:1.02, family:'Newsreader', weight:300, fill:fg, maxLines:5 })}
    ${textBlock({ text:slide.body, x:72, y:900, width:880, size:32, lineHeight:1.45, family:'Inter', weight:400, fill:muted, maxLines:5 })}
    ${slide.sticker ? `<rect x="72" y="1240" width="820" height="150" fill="none" stroke="${accent}" stroke-width="2"/><text x="108" y="1300" font-family="Inter" font-size="18" font-weight="500" letter-spacing="3" fill="${accent}">INTERAÇÃO NO INSTAGRAM</text>${textBlock({text:slide.sticker.replace(/^[^:]+:\s*/,''),x:108,y:1350,width:740,size:28,lineHeight:1.2,family:'Inter',weight:400,fill:fg,maxLines:2})}` : ''}
    ${slide.layout === 'cta' ? `<text x="72" y="1060" font-family="Inter" font-size="21" font-weight="500" letter-spacing="3" fill="${accent}">USE O ADESIVO DE LINK</text>` : ''}
    ${image}
  </svg>`;
}

async function writePng(svg, target) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
}

await fs.mkdir(outputRoot, { recursive:true });
const contactFeed = [];
const contactStories = [];

for (const [slug, entry] of Object.entries(social.articles)) {
  const article = articles.find(item => item.slug === slug);
  if (!article) throw new Error(`Artigo não encontrado: ${slug}`);
  const dir = path.join(outputRoot, slug);
  const feedSlides = entry.carousel || [entry.fixedPost];
  const feedFolder = entry.carousel ? 'carousel' : 'post-fixo';
  await fs.mkdir(path.join(dir, feedFolder), { recursive:true });
  if (entry.stories) await fs.mkdir(path.join(dir, 'stories'), { recursive:true });
  for (let i=0; i<feedSlides.length; i++) {
    const target = path.join(dir, feedFolder, `${String(i+1).padStart(2,'0')}.png`);
    await writePng(await feedSvg(feedSlides[i], article, i+1, feedSlides.length), target);
    if (i === 0) contactFeed.push(await sharp(target).resize(540,675).toBuffer());
  }
  for (let i=0; i<(entry.stories?.length || 0); i++) {
    const target = path.join(dir, 'stories', `${String(i+1).padStart(2,'0')}.png`);
    await writePng(await storySvg(entry.stories[i], article, i+1), target);
    if (i === 0) contactStories.push(await sharp(target).resize(270,480).toBuffer());
  }
  await fs.writeFile(path.join(dir, 'caption.txt'), `${entry.caption.trim()}\n`);
  const notes = (entry.stories || []).map((slide,index) => [
    `Story ${index+1}`,
    slide.sticker ? `Adesivo: ${slide.sticker}` : '',
    slide.link ? `Link: https://www.arcaffo.com${slide.link}` : ''
  ].filter(Boolean).join('\n')).join('\n\n');
  await fs.writeFile(path.join(dir, 'stories-notes.txt'), `${notes}\n`);
  console.log(`✓ ${slug}: ${feedSlides.length} peça(s) de feed + ${entry.stories?.length || 0} Stories`);
}

if (contactFeed.length === 4) {
  await sharp({ create:{ width:1080, height:1350, channels:3, background:colors.sand } })
    .composite(contactFeed.map((input,index)=>({ input, left:(index%2)*540, top:Math.floor(index/2)*675 })))
    .png().toFile(path.join(outputRoot, '_preview-carrosseis.png'));
}
if (contactStories.length === 4) {
  await sharp({ create:{ width:1080, height:480, channels:3, background:colors.sand } })
    .composite(contactStories.map((input,index)=>({ input, left:index*270, top:0 })))
    .png().toFile(path.join(outputRoot, '_preview-stories.png'));
}

console.log(`Assets prontos em ${path.relative(root, outputRoot)}`);

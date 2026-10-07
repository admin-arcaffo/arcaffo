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

const profiles = {
  'rebranding-ou-redesign-como-saber-do-que-sua-empresa-precisa': { code:'R / R', issue:'01', mode:'split' },
  'sinais-de-que-a-marca-nao-acompanha-o-crescimento-da-empresa': { code:'07', issue:'02', mode:'diagnostic' },
  'como-escolher-agencia-de-branding-em-campo-grande': { code:'CG', issue:'03', mode:'fieldguide' },
  'arquitetura-de-marca-como-organizar-produtos-servicos-e-submarcas': { code:'A — B', issue:'04', mode:'system' }
};

function profileFor(article) {
  return profiles[article.slug] || { code:'M', issue:'00', mode:'split' };
}

function svgDefs() {
  return `<defs>
    <style>${fontCss}</style>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M 42 0 L 0 0 0 42" fill="none" stroke="${colors.linen}" stroke-width="1"/>
    </pattern>
  </defs>`;
}

function masthead({ deep, profile, index, total, story = false }) {
  const y = story ? 122 : 56;
  const muted = deep ? colors.stone : colors.graphite;
  const right = story ? 1008 : 1016;
  return `
    ${embeddedLogo(deep, 64, y, story ? 225 : 190)}
    <text x="${right}" y="${y + 37}" text-anchor="end" font-family="Inter" font-size="16" font-weight="500" letter-spacing="3.2" fill="${muted}">MATÉRIA ${profile.issue}</text>
    <line x1="64" y1="${y + 90}" x2="${right}" y2="${y + 90}" stroke="${deep ? 'rgba(247,243,234,.2)' : colors.linen}" stroke-width="1"/>
    ${!story ? `<text x="${right}" y="1292" text-anchor="end" font-family="Inter" font-size="16" font-weight="500" letter-spacing="2.8" fill="${muted}">${String(index).padStart(2,'0')} — ${String(total).padStart(2,'0')}</text>` : ''}
  `;
}

function motif(profile, deep, story = false) {
  const accent = deep ? colors.ember : colors.umber;
  const pale = deep ? 'rgba(247,243,234,.08)' : colors.sand;
  const h = story ? 1920 : 1350;
  if (profile.mode === 'split') return `
    <line x1="540" y1="0" x2="540" y2="${h}" stroke="${accent}" stroke-width="2" opacity=".48"/>
    <rect x="540" y="0" width="540" height="${h}" fill="${pale}" opacity=".34"/>
    <text x="520" y="${story ? 1770 : 1195}" text-anchor="end" font-family="Newsreader" font-size="${story ? 210 : 154}" font-weight="300" fill="none" stroke="${accent}" stroke-width="1" opacity=".28">OU</text>`;
  if (profile.mode === 'diagnostic') return `
    <text x="38" y="${story ? 1600 : 1140}" font-family="Newsreader" font-size="${story ? 900 : 660}" font-weight="300" fill="none" stroke="${accent}" stroke-width="2" opacity=".17">7</text>
    <line x1="64" y1="${story ? 1660 : 1170}" x2="1016" y2="${story ? 1660 : 1170}" stroke="${accent}" stroke-width="1" opacity=".42"/>`;
  if (profile.mode === 'fieldguide') return `
    <rect x="0" y="${story ? 1120 : 710}" width="1080" height="${story ? 800 : 640}" fill="url(#grid)" opacity=".48"/>
    <circle cx="${story ? 840 : 875}" cy="${story ? 1370 : 940}" r="110" fill="none" stroke="${accent}" stroke-width="1" opacity=".45"/>
    <line x1="${story ? 700 : 735}" y1="${story ? 1370 : 940}" x2="${story ? 980 : 1015}" y2="${story ? 1370 : 940}" stroke="${accent}" opacity=".4"/>
    <line x1="${story ? 840 : 875}" y1="${story ? 1230 : 800}" x2="${story ? 840 : 875}" y2="${story ? 1510 : 1080}" stroke="${accent}" opacity=".4"/>`;
  return `
    <rect x="650" y="${story ? 1080 : 700}" width="300" height="180" fill="none" stroke="${accent}" opacity=".5"/>
    <rect x="570" y="${story ? 1320 : 930}" width="190" height="145" fill="${pale}" stroke="${accent}" opacity=".7"/>
    <rect x="805" y="${story ? 1320 : 930}" width="210" height="145" fill="none" stroke="${accent}" opacity=".5"/>
    <line x1="800" y1="${story ? 1260 : 880}" x2="800" y2="${story ? 1320 : 930}" stroke="${accent}"/>
    <line x1="665" y1="${story ? 1260 : 880}" x2="910" y2="${story ? 1260 : 880}" stroke="${accent}"/>
    <line x1="665" y1="${story ? 1260 : 880}" x2="665" y2="${story ? 1320 : 930}" stroke="${accent}"/>
    <line x1="910" y1="${story ? 1260 : 880}" x2="910" y2="${story ? 1320 : 930}" stroke="${accent}"/>`;
}

function label(text, x, y, fill) {
  return `<text x="${x}" y="${y}" font-family="Inter" font-size="18" font-weight="500" letter-spacing="4" fill="${fill}">${xml(text)}</text>`;
}

async function coverFeed(slide, article, profile, index, total) {
  const photo = await imageData(article.cover, 900, 1350);
  const dark = profile.mode === 'diagnostic';
  const bg = dark ? colors.espresso : colors.paper;
  const fg = dark ? colors.paper : colors.ink;
  const body = dark ? colors.stone : colors.graphite;
  const accent = dark ? colors.ember : colors.umber;
  let visual = '';
  let textX = 64, textY = 350, textW = 580, titleSize = slide.title.length > 39 ? 72 : 82, bodyY = 720;
  if (profile.mode === 'split') {
    visual = `<image href="${photo}" x="690" y="0" width="390" height="1350" preserveAspectRatio="xMidYMid slice"/>
      <rect x="650" y="930" width="80" height="230" fill="${colors.paper}"/>
      <text x="645" y="1060" text-anchor="end" font-family="Newsreader" font-size="165" fill="${colors.umber}" opacity=".82">ou</text>`;
    textW = 555; bodyY = 785;
  } else if (profile.mode === 'diagnostic') {
    visual = `<image href="${photo}" x="0" y="830" width="1080" height="520" preserveAspectRatio="xMidYMid slice"/>
      <rect x="0" y="730" width="250" height="100" fill="${colors.ember}"/>
      <text x="58" y="812" font-family="Newsreader" font-size="290" fill="${colors.ember}" opacity=".98">7</text>`;
    textX = 345; textY = 350; textW = 660; bodyY = 680; titleSize = 75;
  } else if (profile.mode === 'fieldguide') {
    visual = `<rect x="688" y="226" width="328" height="906" fill="${colors.sand}"/>
      <image href="${photo}" x="720" y="258" width="296" height="842" preserveAspectRatio="xMidYMid slice"/>
      <text x="64" y="1160" font-family="Inter" font-size="16" letter-spacing="3" fill="${colors.umber}">20.4571° S · 54.5979° W</text>`;
    textW = 560; textY = 360; bodyY = 835; titleSize = 72;
  } else {
    visual = `<image href="${photo}" x="625" y="645" width="391" height="487" preserveAspectRatio="xMidYMid slice"/>
      <rect x="585" y="605" width="210" height="135" fill="none" stroke="${colors.umber}"/>
      <rect x="835" y="510" width="181" height="95" fill="${colors.espresso}"/>
      <text x="926" y="571" text-anchor="middle" font-family="Inter" font-size="17" letter-spacing="3" fill="${colors.ember}">PORTFÓLIO</text>`;
    textW = 680; textY = 350; bodyY = 810; titleSize = 76;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    ${svgDefs()}<rect width="1080" height="1350" fill="${bg}"/>
    ${profile.mode === 'fieldguide' ? '<rect x="0" y="720" width="680" height="630" fill="url(#grid)" opacity=".35"/>' : ''}
    ${masthead({deep:dark,profile,index,total})}
    ${visual}
    ${label(slide.eyebrow, textX, 260, accent)}
    ${textBlock({text:slide.title,x:textX,y:textY,width:textW,size:titleSize,lineHeight:1.0,family:'Newsreader',weight:300,fill:fg,maxLines:5})}
    ${textBlock({text:slide.body,x:textX,y:bodyY,width:profile.mode === 'diagnostic' ? 620 : 540,size:28,lineHeight:1.38,family:'Inter',weight:400,fill:body,maxLines:5})}
    <text x="${profile.mode === 'split' ? 625 : 64}" y="1268" font-family="Inter" font-size="17" font-weight="500" letter-spacing="3.4" fill="${accent}">DESLIZE  →</text>
  </svg>`;
}

async function contentFeed(slide, article, profile, index, total) {
  const deep = slide.theme === 'deep';
  const bg = deep ? colors.espresso : index % 2 === 0 ? colors.sand : colors.paper;
  const fg = deep ? colors.paper : colors.ink;
  const body = deep ? colors.stone : colors.graphite;
  const accent = deep ? colors.ember : colors.umber;
  const eyebrow = slide.number ? `PONTO ${slide.number}` : slide.eyebrow;
  const hasImage = Boolean(slide.image);
  const photo = hasImage ? await imageData(article.cover, 620, 1350) : '';
  const x = 64;
  const width = hasImage ? 515 : index % 2 === 0 ? 760 : 855;
  const titleY = hasImage ? 365 : index % 2 === 0 ? 440 : 385;
  const bodyY = hasImage ? 740 : index % 2 === 0 ? 765 : 720;
  const titleSize = slide.title.length > 48 ? 61 : 68;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    ${svgDefs()}<rect width="1080" height="1350" fill="${bg}"/>
    ${!hasImage ? motif(profile, deep) : ''}
    ${hasImage ? `<image href="${photo}" x="636" y="0" width="444" height="1350" preserveAspectRatio="xMidYMid slice"/><rect x="602" y="195" width="68" height="720" fill="${bg}"/><line x1="602" y1="195" x2="602" y2="915" stroke="${accent}"/>` : ''}
    ${masthead({deep,profile,index,total})}
    ${label(eyebrow, x, 278, accent)}
    ${slide.number ? `<text x="1016" y="326" text-anchor="end" font-family="Newsreader" font-size="210" font-weight="300" fill="${accent}" opacity="${deep ? '.22' : '.16'}">${xml(slide.number)}</text>` : ''}
    ${textBlock({text:slide.title,x,y:titleY,width,size:titleSize,lineHeight:1.02,family:'Newsreader',weight:300,fill:fg,maxLines:5})}
    <line x1="64" y1="${bodyY - 62}" x2="${hasImage ? 535 : 430}" y2="${bodyY - 62}" stroke="${accent}" stroke-width="2"/>
    ${textBlock({text:slide.body,x,y:bodyY,width:hasImage ? 510 : 690,size:29,lineHeight:1.45,family:'Inter',weight:400,fill:body,maxLines:6})}
    <text x="64" y="1292" font-family="Inter" font-size="15" font-weight="500" letter-spacing="3" fill="${accent}">${profile.code}</text>
  </svg>`;
}

async function ctaFeed(slide, article, profile, index, total) {
  const photo = await imageData(article.cover, 500, 1350);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    ${svgDefs()}<rect width="1080" height="1350" fill="${colors.espresso}"/>
    <image href="${photo}" x="710" y="0" width="370" height="1350" preserveAspectRatio="xMidYMid slice"/>
    <rect x="675" y="0" width="35" height="1350" fill="${colors.ember}"/>
    ${masthead({deep:true,profile,index,total})}
    ${label(slide.eyebrow,64,300,colors.ember)}
    ${textBlock({text:slide.title,x:64,y:405,width:560,size:68,lineHeight:1.02,family:'Newsreader',weight:300,fill:colors.paper,maxLines:5})}
    ${textBlock({text:slide.body,x:64,y:800,width:540,size:29,lineHeight:1.42,family:'Inter',weight:400,fill:colors.stone,maxLines:5})}
    <line x1="64" y1="1005" x2="610" y2="1005" stroke="${colors.ember}"/>
    <text x="64" y="1065" font-family="Inter" font-size="20" font-weight="500" letter-spacing="3.2" fill="${colors.ember}">ARCAFFO.COM/ARTIGOS  ↗</text>
    <text x="64" y="1215" font-family="Newsreader" font-size="42" font-weight="300" fill="${colors.paper}">Pessoas, valores, Negócios &amp; Marcas.</text>
  </svg>`;
}

async function feedSvg(slide, article, index, total) {
  const profile = profileFor(article);
  if (slide.layout === 'cover') return coverFeed(slide, article, profile, index, total);
  if (slide.layout === 'cta') return ctaFeed(slide, article, profile, index, total);
  return contentFeed(slide, article, profile, index, total);
}

async function storySvg(slide, article, index) {
  const profile = profileFor(article);
  const deep = slide.theme === 'deep' || slide.layout === 'cta';
  const bg = deep ? colors.espresso : colors.paper;
  const fg = deep ? colors.paper : colors.ink;
  const body = deep ? colors.stone : colors.graphite;
  const accent = deep ? colors.ember : colors.umber;
  const photo = slide.layout === 'cover' || slide.layout === 'cta' ? await imageData(article.cover, 1080, 760) : '';
  const imageY = slide.layout === 'cover' ? 1160 : slide.layout === 'cta' ? 1200 : null;
  const titleSize = slide.title.length > 52 ? 78 : 91;
  const stickerText = slide.sticker?.replace(/^[^:]+:\s*/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    ${svgDefs()}<rect width="1080" height="1920" fill="${bg}"/>
    ${!imageY ? motif(profile,deep,true) : ''}
    ${imageY ? `<image href="${photo}" x="0" y="${imageY}" width="1080" height="${1920-imageY}" preserveAspectRatio="xMidYMid slice"/><rect x="64" y="${imageY-36}" width="${profile.mode === 'diagnostic' ? 285 : 120}" height="72" fill="${accent}"/>` : ''}
    ${masthead({deep,profile,index,total:3,story:true})}
    ${label(slide.eyebrow,64,380,accent)}
    ${textBlock({text:slide.title,x:64,y:500,width:910,size:titleSize,lineHeight:1.02,family:'Newsreader',weight:300,fill:fg,maxLines:6})}
    ${textBlock({text:slide.body,x:64,y:900,width:820,size:32,lineHeight:1.46,family:'Inter',weight:400,fill:body,maxLines:6})}
    ${slide.sticker ? `<rect x="64" y="1260" width="850" height="185" fill="${deep ? 'rgba(247,243,234,.035)' : colors.sand}" stroke="${accent}" stroke-width="1"/><text x="104" y="1320" font-family="Inter" font-size="16" font-weight="500" letter-spacing="3.2" fill="${accent}">INTERAÇÃO</text>${textBlock({text:stickerText,x:104,y:1382,width:760,size:30,lineHeight:1.2,family:'Inter',weight:400,fill:fg,maxLines:2})}` : ''}
    ${slide.layout === 'cta' ? `<line x1="64" y1="1050" x2="670" y2="1050" stroke="${accent}"/><text x="64" y="1110" font-family="Inter" font-size="19" font-weight="500" letter-spacing="3.2" fill="${accent}">USE O ADESIVO DE LINK  ↗</text>` : ''}
    <text x="1016" y="1790" text-anchor="end" font-family="Inter" font-size="16" font-weight="500" letter-spacing="3" fill="${imageY ? colors.paper : accent}">${String(index).padStart(2,'0')} — 03</text>
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
    contactFeed.push(await sharp(target).resize(270,338, { fit:'fill' }).toBuffer());
  }
  for (let i=0; i<(entry.stories?.length || 0); i++) {
    const target = path.join(dir, 'stories', `${String(i+1).padStart(2,'0')}.png`);
    await writePng(await storySvg(entry.stories[i], article, i+1), target);
    contactStories.push(await sharp(target).resize(270,480, { fit:'fill' }).toBuffer());
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

if (contactFeed.length) {
  const rows = Math.ceil(contactFeed.length / 4);
  await sharp({ create:{ width:1080, height:rows * 338, channels:3, background:colors.sand } })
    .composite(contactFeed.map((input,index)=>({ input, left:(index%4)*270, top:Math.floor(index/4)*338 })))
    .png().toFile(path.join(outputRoot, '_preview-carrosseis.png'));
}
if (contactStories.length) {
  const rows = Math.ceil(contactStories.length / 4);
  await sharp({ create:{ width:1080, height:rows * 480, channels:3, background:colors.sand } })
    .composite(contactStories.map((input,index)=>({ input, left:(index%4)*270, top:Math.floor(index/4)*480 })))
    .png().toFile(path.join(outputRoot, '_preview-stories.png'));
}

console.log(`Assets prontos em ${path.relative(root, outputRoot)}`);

// Instagram dos artigos — sistema "Dossiê" (direção aprovada em 23/09/2026).
//
// A leitura estratégica como documento: grade fixa (margem 72, coluna de notas
// 72–348, coluna de texto 396–1008), cabeçalho corrido, pranchas fotográficas
// com legenda e uma figura própria por tema. Textos vêm de content.json sem
// alteração; este arquivo decide só composição, fotografia e figuras.
//
// Renderização em Chromium (Playwright) para que Newsreader e Inter sejam de
// fato usadas. Primeira execução numa máquina nova:
//   npx playwright install chromium
// ou aponte ARCAFFO_CHROMIUM para um Chrome/Chromium instalado.

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const root = process.cwd();
const social = JSON.parse(await fs.readFile(path.join(root, 'social/instagram/content.json'), 'utf8'));
const articles = JSON.parse(await fs.readFile(path.join(root, 'public/data/artigos.json'), 'utf8'));
const outputRoot = path.join(root, 'social/instagram/exports');

const C = {
  paper: '#f7f3ea', sand: '#ede7dc', linen: '#d8cfc0', stone: '#b3a692', umber: '#7a5c3e',
  graphite: '#574f45', ink: '#221c16', espresso: '#17130f', ember: '#c99a63'
};
const TREATMENT = {
  none: 'none',
  warm: 'sepia(0.48) contrast(0.96) brightness(1.02) saturate(0.72)', // --arcaffo-photo-warm
  mono: 'grayscale(1) contrast(1.06) brightness(0.94)'                // --arcaffo-photo-mono
};
const FEED = { w: 1080, h: 1350 };
const STORY = { w: 1080, h: 1920, safeTop: 250, safeBottom: 1670 };

// ---------------------------------------------------------------------------
// Direção de arte por artigo. Fotografia real do acervo; trabalhos de clientes
// sem filtro, fotos institucionais com os tratamentos oficiais.
// crop: [x, y, largura] em px da imagem de origem (altura segue a caixa).
// ---------------------------------------------------------------------------
const CIA = 'Cia do Vidro, projeto Arcaffo.';
const KASSAR = 'Kassar, projeto Arcaffo.';
const DIRECTION = {
  'rebranding-ou-redesign-como-saber-do-que-sua-empresa-precisa': {
    issue: '01', figure: 'strata',
    special: { 4: 'strata-full' },
    photos: {
      cover: { src: '/images/projetos/816a80878d.webp', crop: [620, 120, 780], caption: `${CIA.replace(', projeto', '. Sistema de papelaria, projeto')}` },
      plate: { src: '/images/projetos/1be061735e.webp', crop: [160, 130, 1700], caption: `${CIA.replace(', projeto', '. Formas do sistema visual, projeto')}` },
      cta: { src: '/images/projetos/3476ec507d.webp', crop: [220, 0, 1480], caption: `${CIA.replace(', projeto', '. Construção do logotipo, projeto')}` },
      storyCover: { src: '/images/projetos/77fb4d8d93.webp', crop: [300, 200, 1300], caption: CIA },
      storyQuestion: { src: '/images/projetos/bc15925088.webp', crop: [1150, 250, 500], caption: CIA }
    }
  },
  'sinais-de-que-a-marca-nao-acompanha-o-crescimento-da-empresa': {
    issue: '02', figure: 'evidence',
    photos: {
      cover: { src: '/images/brand/IMG_2848.webp', crop: [150, 0, 690], treatment: 'mono', caption: 'Arcaffo, Campo Grande.' },
      plate: { src: '/images/brand/IMG_9396.webp', crop: [0, 160, 1440], treatment: 'mono', caption: 'Arcaffo.' },
      cta: { src: '/images/brand/IMG_2848.webp', crop: [560, 0, 1000], treatment: 'mono', caption: 'Arcaffo, Campo Grande.' },
      storyCover: { src: '/images/brand/IMG_2848.webp', crop: [640, 0, 900], treatment: 'mono', caption: 'Arcaffo, Campo Grande.' },
      storyQuestion: { src: '/images/brand/IMG_9396.webp', crop: [470, 280, 520], treatment: 'mono', caption: 'Arcaffo.' }
    }
  },
  'como-escolher-agencia-de-branding-em-campo-grande': {
    issue: '03', figure: 'index',
    photos: {
      cover: { src: '/images/materia/casa-1600.webp', crop: [300, 900, 1000], treatment: 'warm', caption: 'Arcaffo, Campo Grande.' },
      plate: {
        caption: 'Arthur Fava, Luiz Paulo Pacheco e Fabrício O. Rodrigues.',
        triptych: [
          { src: '/images/materia/arthur-1600.webp', crop: [220, 80, 1160], treatment: 'warm' },
          { src: '/images/materia/luiz-1600.webp', crop: [220, 80, 1160], treatment: 'warm' },
          { src: '/images/materia/fabricio-1600.webp', crop: [220, 80, 1160], treatment: 'warm' }
        ]
      },
      cta: { src: '/images/brand/IMG_2848.webp', crop: [380, 290, 900], treatment: 'mono', caption: 'Arcaffo, Campo Grande.' },
      storyCover: { src: '/images/materia/casa-1600.webp', crop: [380, 1060, 880], treatment: 'warm', caption: 'Arcaffo, Campo Grande.' },
      storyQuestion: { src: '/images/brand/IMG_2848.webp', crop: [420, 260, 460], treatment: 'mono', caption: 'Arcaffo, Campo Grande.' }
    }
  },
  'arquitetura-de-marca-como-organizar-produtos-servicos-e-submarcas': {
    issue: '04', figure: 'structure',
    photos: {
      cover: { src: '/images/projetos/646be12444.webp', crop: [60, 60, 560], caption: `${KASSAR.replace(', projeto', '. Papelaria, projeto')}` },
      plate: { src: '/images/projetos/20bb486831.webp', crop: [880, 0, 1040], caption: `${KASSAR.replace(', projeto', '. Cartões dos sócios, projeto')}` },
      cta: { src: '/images/projetos/0e1f246735.webp', crop: [200, 150, 1520], caption: KASSAR },
      storyCover: { src: '/images/projetos/646be12444.webp', crop: [500, 0, 484], caption: KASSAR },
      storyQuestion: { src: '/images/projetos/20bb486831.webp', crop: [0, 470, 460], caption: KASSAR }
    }
  }
};
const FALLBACK = { issue: '00', figure: 'strata', photos: {} };

// ---------------------------------------------------------------------------
// Recursos
// ---------------------------------------------------------------------------
const [newsreader, inter, logoSource] = await Promise.all([
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/fonts/newsreader-latin.woff2')),
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/fonts/inter-latin.woff2')),
  fs.readFile(path.join(root, 'public/design-system/arcaffo-materia/logo/ArcaffoGroup_logo_p_1.1.svg'), 'utf8')
]);
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n).padStart(2, '0');

function logo(color, x, y, w) {
  const svg = logoSource.replace(/<path/g, `<path fill="${color}"`);
  return `<img class="logo" alt="Arcaffo GROUP" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="left:${x}px;top:${y}px;width:${w}px">`;
}

const imageCache = new Map();
async function cropped(spec, w, h) {
  const key = JSON.stringify([spec.src, spec.crop, w, h]);
  if (imageCache.has(key)) return imageCache.get(key);
  const file = path.join(root, 'public', spec.src.replace(/^\//, ''));
  const meta = await sharp(file).metadata();
  let [sx, sy, sw] = spec.crop || [0, 0, meta.width];
  let sh = Math.round(sw * h / w);
  if (sh > meta.height) { sh = meta.height; sw = Math.round(sh * w / h); }
  sx = Math.max(0, Math.min(sx, meta.width - sw));
  sy = Math.max(0, Math.min(sy, meta.height - sh));
  const buf = await sharp(file).extract({ left: Math.round(sx), top: Math.round(sy), width: Math.round(sw), height: sh })
    .resize(w, h).jpeg({ quality: 92 }).toBuffer();
  const uri = `data:image/jpeg;base64,${buf.toString('base64')}`;
  imageCache.set(key, uri);
  return uri;
}

async function plate(spec, box, extra = '') {
  if (!spec) return '';
  const [x, y, w, h] = box;
  if (spec.triptych) {
    const gap = 12, each = Math.floor((w - gap * (spec.triptych.length - 1)) / spec.triptych.length);
    const parts = await Promise.all(spec.triptych.map(p => cropped(p, each, h)));
    return parts.map((uri, i) => `<figure class="plate" style="left:${x + i * (each + gap)}px;top:${y}px;width:${each}px;height:${h}px;${extra}"><img src="${uri}" style="filter:${TREATMENT[spec.triptych[i].treatment || 'none']}"></figure>`).join('');
  }
  const uri = await cropped(spec, w, h);
  return `<figure class="plate" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}"><img src="${uri}" style="filter:${TREATMENT[spec.treatment || 'none']}"></figure>`;
}

function caption(fig, text, x, y, dark, anchor = 'top') {
  if (!text) return '';
  return `<div class="t cap" data-anchor="${anchor}" style="left:${x}px;${anchor === 'top' ? `top:${y}px` : `bottom:${y}px`};width:276px;color:${dark ? C.stone : C.graphite}"><span class="lb" style="color:${dark ? C.ember : C.umber}">Fig. ${fig}</span><br>${esc(text)}</div>`;
}

// ---------------------------------------------------------------------------
// Estrutura comum
// ---------------------------------------------------------------------------
const CSS = `
@font-face{font-family:Newsreader;src:url(data:font/woff2;base64,${newsreader.toString('base64')}) format('woff2');font-weight:300}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter.toString('base64')}) format('woff2');font-weight:400 600}
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.paper}}
.page{position:relative;overflow:hidden;width:1080px}
.page>*{position:absolute}
.logo{display:block}
.plate{overflow:hidden;background:${C.linen}} .plate img{display:block;width:100%;height:auto}
.nr{font-family:Newsreader,Georgia,serif;font-weight:300;letter-spacing:-.012em;font-kerning:normal;hyphens:none}
.in{font-family:Inter,sans-serif;font-weight:400}
.lb{font-family:Inter,sans-serif;font-weight:500;text-transform:uppercase;letter-spacing:.18em;font-size:15px}
.cap{font-family:Inter,sans-serif;font-size:17px;line-height:1.45}
.cap .lb{font-size:14px}
.hr{height:1px} .vr{width:1px}
.fig div{position:absolute}
.body{font-family:Inter,sans-serif;font-size:32px;line-height:1.42}
`;

function head({ dark, issue, running, folio, y = 58 }) {
  const fg = dark ? C.paper : C.ink, mut = dark ? C.stone : C.graphite;
  return `${logo(fg, 72, y, 120)}
    <div class="t lb" style="left:396px;top:${y + 16}px;color:${mut}">Matéria ${issue} — ${esc(running)}</div>
    <div class="t lb" style="right:72px;top:${y + 16}px;color:${mut}">${folio}</div>
    <div class="hr" style="left:72px;top:${y + 66}px;width:936px;background:${dark ? 'rgba(247,243,234,.24)' : C.ink}"></div>`;
}

function document(kind, bg, body, script = '') {
  const size = kind === 'story' ? STORY : FEED;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="page" id="page" data-kind="${kind}" style="width:${size.w}px;height:${size.h}px;background:${bg}">${body}</div>
<script>
// Ajusta o corpo de títulos até caber no número máximo de linhas.
function fit(el){
  const max=+el.dataset.max, min=+el.dataset.min, lines=+el.dataset.lines;
  let s=max; el.style.fontSize=s+'px';
  const lh=()=>parseFloat(getComputedStyle(el).lineHeight);
  while(s>min && (Math.round(el.getBoundingClientRect().height/lh())>lines || el.scrollWidth>el.clientWidth+1)){ s-=2; el.style.fontSize=s+'px'; }
}
window.__layout=async()=>{
  await document.fonts.ready;
  document.querySelectorAll('[data-max]').forEach(fit);
  ${script}
  return true;
};
</script></body></html>`;
}

// ---------------------------------------------------------------------------
// Figuras por tema (sem ícones; só filetes, planos e texto do próprio slide)
// ---------------------------------------------------------------------------
function figureStrata(dark, highlight) {
  // Três camadas de espessura decrescente; a camada tratada no slide recebe tom.
  const heights = [150, 118, 88];
  let y = 1350 - heights.reduce((a, b) => a + b, 0) - 70;
  let s = '';
  heights.forEach((h, i) => {
    const on = highlight.includes(i);
    const fill = dark ? (on ? 'rgba(201,154,99,.34)' : 'rgba(247,243,234,.05)') : (on ? C.stone : [C.linen, C.sand, C.paper][i]);
    s += `<div style="left:0;top:${y}px;width:1080px;height:${h}px;background:${fill};border-top:1px solid ${dark ? 'rgba(247,243,234,.3)' : C.ink}"></div>`;
    y += h;
  });
  return s + `<div class="hr" style="left:0;top:${y}px;width:1080px;background:${dark ? 'rgba(247,243,234,.3)' : C.ink}"></div>`;
}

function figureEvidence(dark, active) {
  // Régua de diagnóstico: sete sinais; os tratados no slide aparecem marcados.
  const x0 = 72, w = 936, gap = 8, n = 7, cw = (w - gap * (n - 1)) / n, y = 1010, h = 190;
  let s = '';
  for (let i = 1; i <= n; i++) {
    const on = active.includes(i);
    const bg = on ? (dark ? C.ember : C.umber) : 'transparent';
    const bd = on ? bg : (dark ? 'rgba(247,243,234,.3)' : C.linen);
    const fg = on ? (dark ? C.espresso : C.paper) : (dark ? C.stone : C.stone);
    s += `<div style="left:${x0 + (i - 1) * (cw + gap)}px;top:${y}px;width:${cw}px;height:${h}px;background:${bg};border:1px solid ${bd}"></div>`;
    s += `<div class="t nr" style="left:${x0 + (i - 1) * (cw + gap) + 14}px;top:${y + h - 70}px;font-size:52px;line-height:1;color:${fg}">${pad(i)}</div>`;
  }
  return s;
}

function figureIndex(dark, active) {
  // Índice do guia: sete critérios na coluna de notas; o atual avança até o texto.
  const y0 = 176, row = 150;
  let s = '';
  for (let i = 1; i <= 7; i++) {
    const on = active.includes(i), y = y0 + (i - 1) * row;
    const line = dark ? 'rgba(247,243,234,.22)' : C.linen;
    s += `<div class="hr" style="left:72px;top:${y}px;width:${on ? 300 : 276}px;background:${on ? (dark ? C.ember : C.umber) : line}"></div>`;
    s += on
      ? `<div class="t nr" style="left:68px;top:${y + 14}px;font-size:92px;line-height:1;color:${dark ? C.ember : C.umber}">${pad(i)}</div>`
      : `<div class="t lb" style="left:72px;top:${y + 18}px;font-size:18px;color:${dark ? C.stone : C.graphite}">${pad(i)}</div>`;
  }
  return s;
}

function figureStructure(dark, variant, words = []) {
  // Diagramas de arquitetura: dispersão, relação, modelos e mapa.
  const line = dark ? C.stone : C.ink, soft = dark ? 'rgba(247,243,234,.08)' : C.sand, acc = dark ? C.ember : C.umber;
  const box = (x, y, w, h, fill = 'transparent', stroke = line) => `<div style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${fill};border:1px solid ${stroke}"></div>`;
  const hl = (x, y, w) => `<div class="hr" style="left:${x}px;top:${y}px;width:${w}px;background:${line}"></div>`;
  const vl = (x, y, h) => `<div class="vr" style="left:${x}px;top:${y}px;height:${h}px;background:${line}"></div>`;
  const Y = 960;
  if (variant === 'dispersion') {
    const r = [[72, 30, 170, 96], [290, 110, 110, 70], [450, 0, 210, 120], [700, 150, 120, 80], [860, 40, 148, 110], [180, 200, 90, 60], [560, 190, 90, 70]];
    return r.map(([x, y, w, h], i) => box(x, Y + y, w, h, i === 2 ? soft : 'transparent')).join('');
  }
  if (variant === 'relation') {
    let s = box(396, Y, 288, 110, dark ? C.ember : C.ink, dark ? C.ember : C.ink);
    s += vl(540, Y + 110, 50) + hl(162, Y + 160, 756);
    [72, 324, 576, 828].forEach(x => { s += vl(x + 90, Y + 160, 40) + box(x, Y + 200, 180, 90); });
    return s;
  }
  if (variant === 'models') {
    // marca monolítica · marcas endossadas · casa de marcas · arquitetura híbrida
    const cw = 216, gap = 24, top = Y - 20;
    const cells = [
      () => box(0, 0, cw, 150, acc, acc) + [0, 1, 2].map(i => `<div class="hr" style="left:16px;top:${44 + i * 34}px;width:${cw - 32}px;background:${dark ? C.espresso : C.paper};opacity:.6"></div>`).join(''),
      () => box(58, 0, 100, 40, acc, acc) + `<div class="vr" style="left:108px;top:40px;height:24px;background:${line}"></div><div class="hr" style="left:30px;top:64px;width:156px;background:${line}"></div>` + [0, 1, 2].map(i => box(i * 78, 88, 60, 62)).join(''),
      () => [0, 1, 2].map(i => box(i * 78, 30 + (i % 2) * 30, 60, 90 - (i % 2) * 20)).join(''),
      () => box(0, 0, 120, 60, acc, acc) + `<div class="vr" style="left:60px;top:60px;height:30px;background:${line}"></div>` + box(0, 90, 120, 60) + box(150, 30, 66, 120)
    ];
    return cells.map((f, i) => `<div class="fig" style="left:${72 + i * (cw + gap)}px;top:${top}px;width:${cw}px;height:230px">${f()}<div class="t in" style="left:0;top:176px;width:${cw}px;font-size:21px;line-height:1.3;color:${dark ? C.stone : C.graphite}">${esc(words[i] || '')}</div></div>`).join('');
  }
  if (variant === 'map') {
    const cols = words.length || 4, cw = 936 / cols;
    let s = hl(72, Y, 936);
    words.forEach((w, i) => { s += `<div class="t lb" style="left:${72 + i * cw + 12}px;top:${Y + 16}px;color:${acc}">${esc(w)}</div>`; });
    for (let r = 0; r < 4; r++) s += hl(72, Y + 60 + r * 58, 936);
    for (let c = 1; c < cols; c++) s += vl(72 + c * cw, Y, 60 + 3 * 58);
    s += box(72 + cw * 2 - 1, Y + 118, cw + 2, 59, soft, acc);
    return s;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Peças de feed
// ---------------------------------------------------------------------------
async function feedCover(slide, ctx) {
  const p = ctx.dir.photos.cover;
  const body = `${head({ dark: false, issue: ctx.dir.issue, running: ctx.running, folio: `01 / ${pad(ctx.total)}` })}
    <div class="t lb" style="left:72px;top:170px;width:276px;line-height:1.7;font-size:17px;color:${C.umber}">${esc(slide.eyebrow)}</div>
    <div id="plateWrap" style="left:396px;top:160px;width:612px;height:760px;overflow:hidden">${(await plate(p, [0, 0, 612, 760])).replace('class="plate" style="', 'class="plate" style="position:absolute;')}</div>
    <div id="cap" class="t cap" style="left:72px;top:0;width:276px;color:${C.graphite}"><span class="lb" style="color:${C.umber}">Fig. 01</span><br>${esc(p?.caption)}</div>
    <h1 id="title" class="t nr" data-max="132" data-min="92" data-lines="3" style="left:66px;width:958px;bottom:230px;line-height:.95;color:${C.ink};padding-left:170px;text-indent:-170px">${esc(slide.title)}</h1>
    <div class="hr" style="left:72px;top:1150px;width:936px;background:${C.linen}"></div>
    <div class="t lb" style="left:72px;top:1186px;font-size:17px;color:${C.umber}">Deslize →</div>
    <p class="t body" style="left:396px;top:1174px;width:600px;font-size:31px;line-height:1.35;color:${C.graphite}">${esc(slide.body)}</p>`;
  const script = `
    const t=document.getElementById('title'), w=document.getElementById('plateWrap'), c=document.getElementById('cap');
    const top=t.getBoundingClientRect().top; const h=Math.max(480,Math.min(760, top-22-160)); w.style.height=h+'px';
    c.style.top=(top-14-c.getBoundingClientRect().height)+'px';`;
  return document('feed', C.paper, body, script);
}

async function feedText(slide, ctx, index) {
  const dark = slide.theme === 'deep';
  const fg = dark ? C.paper : C.ink, mut = dark ? C.stone : C.graphite, acc = dark ? C.ember : C.umber;
  const special = ctx.dir.special?.[index - 1];
  const nums = numbersOf(slide.number);
  let figure = '', notes = '', bodyStyle = '', figTop = 1300;
  const bigNumber = `<div class="t nr" style="left:68px;top:172px;font-size:${slide.number.length > 2 ? 92 : 120}px;line-height:1;color:${acc}">${esc(slide.number)}</div>`;

  if (special === 'strata-full') return feedStrataFull(slide, ctx, index);

  switch (ctx.dir.figure) {
    case 'strata': {
      const hl = { 1: [], 2: [2], 3: [0, 1, 2] }[index - 1] ?? [];
      figure = figureStrata(dark, hl); notes = bigNumber; figTop = 924; break;
    }
    case 'evidence': figure = figureEvidence(dark, nums); notes = bigNumber; figTop = 1010; break;
    case 'index': notes = figureIndex(dark, nums); bodyStyle = 'bottom'; break;
    case 'structure': {
      const variants = { 1: ['dispersion'], 2: ['relation'], 3: ['models', ['marca monolítica', 'marcas endossadas', 'casa de marcas', 'arquitetura híbrida']], 4: ['map', ['ofertas', 'públicos', 'canais', 'sobreposições']] };
      const [v, words] = variants[index - 1] || ['relation'];
      figure = figureStructure(dark, v, words); notes = bigNumber; figTop = v === 'models' ? 940 : 960; break;
    }
    default: notes = bigNumber;
  }

  const bodyBlock = bodyStyle === 'bottom'
    ? `<div class="hr" id="rule" style="left:396px;width:612px;background:${acc};bottom:${1350 - 1180}px"></div>
       <p class="t body" id="body" style="left:396px;width:612px;top:1204px;color:${mut}">${esc(slide.body)}</p>`
    : `<div class="hr" id="rule" style="left:396px;width:612px;background:${acc};top:0"></div>
       <p class="t body" id="body" style="left:396px;width:612px;top:0;color:${mut}">${esc(slide.body)}</p>`;
  const body = `${head({ dark, issue: ctx.dir.issue, running: ctx.running, folio: `${pad(index)} / ${pad(ctx.total)}` })}
    ${figure}${notes}
    <h2 id="title" class="t nr" data-max="84" data-min="58" data-lines="4" style="left:396px;top:176px;width:612px;line-height:1.02;color:${fg}">${esc(slide.title)}</h2>
    ${bodyBlock}`;
  const script = bodyStyle === 'bottom'
    ? `const b=document.getElementById('body'), r=document.getElementById('rule'); const bh=b.getBoundingClientRect().height; b.style.top=(1270-bh)+'px'; r.style.bottom=''; r.style.top=(1270-bh-26)+'px';`
    : `const t=document.getElementById('title'), b=document.getElementById('body'), r=document.getElementById('rule');
       const place=()=>{ const y=t.getBoundingClientRect().bottom+44; r.style.top=y+'px'; b.style.top=(y+26)+'px'; };
       place(); let s=parseFloat(t.style.fontSize);
       while(b.getBoundingClientRect().bottom>${figTop} - 40 && s>58){ s-=2; t.style.fontSize=s+'px'; place(); }
       if(b.getBoundingClientRect().bottom>${figTop} - 40) window.__errors=['corpo encosta na figura'];`;
  return document('feed', dark ? C.espresso : C.paper, body, script);
}

function numbersOf(label = '') {
  const m = String(label).match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) { const a = +m[1], b = +m[2]; return Array.from({ length: b - a + 1 }, (_, i) => a + i); }
  const n = parseInt(label, 10);
  return Number.isFinite(n) ? [n] : [];
}

function splitLayers(text) {
  // "Estratégia: pergunta? Percepção: pergunta? ..." → [['Estratégia:', 'pergunta?'], ...]
  const parts = [...String(text).matchAll(/([A-ZÀ-Ý][^:?.]*:)\s*([^?]*\?)/g)].map(m => [m[1], m[2].trim()]);
  return parts.length >= 2 && parts.map(p => p.join(' ')).join(' ') === String(text).trim() ? parts : null;
}

async function feedStrataFull(slide, ctx, index) {
  const parts = splitLayers(slide.body);
  if (!parts) throw new Error(`Camadas não reconhecidas no slide ${index}: ${slide.body}`);
  const bands = [[C.linen, 340], [C.sand, 310], [C.paper, 280]];
  let y = 420, rows = '';
  parts.forEach(([k, q], i) => {
    const [bg, h] = bands[i] || bands[2];
    rows += `<div style="left:0;top:${y}px;width:1080px;height:${h}px;background:${bg};border-top:1px solid ${C.ink}"></div>
      <div class="t lb" style="left:72px;top:${y + 30}px;font-size:18px;color:${C.umber}">${esc(k)}</div>
      <div class="t nr" style="left:396px;top:${y + 20}px;width:612px;font-size:56px;line-height:1.06;color:${C.ink}">${esc(q)}</div>`;
    y += h;
  });
  const body = `${head({ dark: false, issue: ctx.dir.issue, running: ctx.running, folio: `${pad(index)} / ${pad(ctx.total)}` })}
    <div class="t nr" style="left:68px;top:172px;font-size:120px;line-height:1;color:${C.umber}">${esc(slide.number)}</div>
    <h2 class="t nr" data-max="80" data-min="60" data-lines="2" style="left:396px;top:186px;width:612px;line-height:1;color:${C.ink}">${esc(slide.title)}</h2>
    ${rows}`;
  return document('feed', C.paper, body);
}

async function feedImage(slide, ctx, index) {
  const p = ctx.dir.photos.plate;
  const body = `${head({ dark: false, issue: ctx.dir.issue, running: ctx.running, folio: `${pad(index)} / ${pad(ctx.total)}` })}
    ${await plate(p, p?.triptych ? [72, 150, 936, 560] : [0, 150, 1008, 560])}
    ${caption(pad(index), p?.caption, 72, 736, false)}
    <div class="t nr" style="left:68px;top:880px;font-size:${slide.number.length > 2 ? 92 : 120}px;line-height:1;color:${C.umber}">${esc(slide.number)}</div>
    <h2 id="title" class="t nr" data-max="70" data-min="52" data-lines="3" style="left:396px;top:736px;width:612px;line-height:1.02;color:${C.ink}">${esc(slide.title)}</h2>
    <p class="t body" id="body" style="left:396px;top:0;width:612px;font-size:30px;color:${C.graphite}">${esc(slide.body)}</p>`;
  const script = `const t=document.getElementById('title'), b=document.getElementById('body'); b.style.top=(t.getBoundingClientRect().bottom+30)+'px';`;
  return document('feed', C.paper, body, script);
}

async function feedCta(slide, ctx, index) {
  const p = ctx.dir.photos.cta;
  const body = `${head({ dark: true, issue: ctx.dir.issue, running: ctx.running, folio: `${pad(index)} / ${pad(ctx.total)}` })}
    <div class="t lb" style="left:72px;top:176px;font-size:17px;color:${C.ember}">${esc(slide.eyebrow)}</div>
    <h2 class="t nr" data-max="80" data-min="58" data-lines="5" style="left:396px;top:166px;width:612px;line-height:1.04;color:${C.paper}">${esc(slide.title)}</h2>
    ${await plate(p, [72, 680, 936, 320])}
    ${caption(pad(index), p?.caption, 72, 1030, true)}
    <div class="hr" style="left:396px;top:1034px;width:612px;background:${C.ember}"></div>
    <p class="t body" style="left:396px;top:1058px;width:600px;color:${C.paper}">${esc(slide.body)}</p>
    <div class="t lb" style="left:72px;bottom:56px;font-size:14px;color:${C.stone}">Pessoas, valores, Negócios &amp; Marcas.</div>`;
  return document('feed', C.espresso, body);
}

async function feedSvgless(slide, ctx, index) {
  if (slide.layout === 'cover') return feedCover(slide, ctx);
  if (slide.layout === 'cta') return feedCta(slide, ctx, index);
  if (slide.image) return feedImage(slide, ctx, index);
  return feedText(slide, ctx, index);
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------
const STICKERS = {
  enquete: { h: 260, label: 'Área reservada · adesivo de enquete' },
  caixa: { h: 430, label: 'Área reservada · caixa de perguntas' },
  link: { h: 170, w: 620, label: 'Área reservada · adesivo de link' }
};
function stickerZone(type, x, y, color, labelColor) {
  const z = STICKERS[type]; const w = z.w || 780, h = z.h, L = 36;
  let s = '';
  for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    s += `<div style="left:${Math.min(cx, cx + dx * L)}px;top:${cy - 1}px;width:${L}px;height:2px;background:${color}"></div>`;
    s += `<div style="left:${cx - 1}px;top:${Math.min(cy, cy + dy * L)}px;width:2px;height:${L}px;background:${color}"></div>`;
  }
  return { html: s + `<div class="t lb" style="left:${x}px;top:${y + h + 22}px;font-size:18px;color:${labelColor}">${z.label}</div>`, w, h };
}
function stickerType(slide) {
  if (slide.link) return 'link';
  if (/^caixa/i.test(slide.sticker || '')) return 'caixa';
  if (slide.sticker) return 'enquete';
  return null;
}
function storyHead(dark, ctx, n) { return head({ dark, issue: ctx.dir.issue, running: ctx.running, folio: `${pad(n)} / 03`, y: 290 }); }

async function storyCover(slide, ctx, n) {
  const p = ctx.dir.photos.storyCover;
  const body = `${storyHead(false, ctx, n)}
    <div class="t lb" style="left:72px;top:404px;font-size:18px;color:${C.umber}">${esc(slide.eyebrow)}</div>
    <h1 id="title" class="t nr" data-max="112" data-min="76" data-lines="4" style="left:68px;top:448px;width:940px;line-height:1;color:${C.ink}">${esc(slide.title)}</h1>
    <p class="t body" id="body" style="left:396px;top:0;width:612px;color:${C.graphite}">${esc(slide.body)}</p>
    ${await plate(p, [396, 1160, 684, 470])}
    ${caption('01', p?.caption, 72, 1920 - 1630, false, 'bottom')}`;
  const script = `const t=document.getElementById('title'), b=document.getElementById('body');
    const place=()=>{ b.style.top=(t.getBoundingClientRect().bottom+40)+'px'; };
    place(); let s=parseFloat(t.style.fontSize); while(b.getBoundingClientRect().bottom>1110 && s>76){ s-=2; t.style.fontSize=s+'px'; place(); }`;
  return document('story', C.paper, body, script);
}

async function storyQuestion(slide, ctx, n) {
  const p = ctx.dir.photos.storyQuestion;
  const type = stickerType(slide) || 'enquete';
  const zh = STICKERS[type].h, zoneY = 1600 - zh - 30, bandY = zoneY - 60;
  const zone = stickerZone(type, 150, zoneY, C.umber, C.graphite);
  const body = `${storyHead(false, ctx, n)}
    <div class="t lb" style="left:72px;top:404px;font-size:18px;color:${C.umber}">${esc(slide.eyebrow)}</div>
    <h1 id="title" class="t nr" data-max="100" data-min="70" data-lines="5" style="left:68px;top:448px;width:940px;line-height:1;color:${C.ink}">${esc(slide.title)}</h1>
    <div class="hr" id="rule" style="left:396px;width:612px;background:${C.linen};top:0"></div>
    <p class="t body" id="body" style="left:396px;top:0;width:612px;font-size:31px;color:${C.graphite}">${esc(slide.body)}</p>
    <div id="thumb" style="left:72px;top:0;width:276px;height:276px">${(await plate(p, [0, 0, 276, 276])).replace('class="plate" style="', 'class="plate" style="position:absolute;')}</div>
    <div style="left:0;top:${bandY}px;width:1080px;height:${1920 - bandY}px;background:${C.sand};border-top:1px solid ${C.ink}"></div>
    ${zone.html}`;
  const script = `const t=document.getElementById('title'), b=document.getElementById('body'), r=document.getElementById('rule'), th=document.getElementById('thumb');
    const place=()=>{ const y=t.getBoundingClientRect().bottom+44; r.style.top=y+'px'; b.style.top=(y+24)+'px'; th.style.top=(y+24)+'px'; };
    place(); let s=parseFloat(t.style.fontSize);
    const bottom=()=>Math.max(b.getBoundingClientRect().bottom, th.getBoundingClientRect().bottom);
    while(bottom()>${bandY - 40} && s>70){ s-=2; t.style.fontSize=s+'px'; place(); }
    if(bottom()>${bandY - 40}) th.style.display='none';`;
  return document('story', C.paper, body, script);
}

async function storyCta(slide, ctx, n) {
  const zone = stickerZone('link', 230, 1330, C.ember, C.stone);
  const body = `${storyHead(true, ctx, n)}
    <div class="t lb" style="left:72px;top:404px;font-size:18px;color:${C.ember}">${esc(slide.eyebrow)}</div>
    <h1 id="title" class="t nr" data-max="118" data-min="80" data-lines="5" style="left:68px;top:448px;width:940px;line-height:1;color:${C.paper}">${esc(slide.title)}</h1>
    <div class="hr" id="rule" style="left:396px;width:612px;background:${C.ember};top:0"></div>
    <p class="t body" id="body" style="left:396px;top:0;width:612px;color:${C.paper}">${esc(slide.body)}</p>
    ${zone.html}
    <div class="t lb" style="left:72px;top:1590px;font-size:14px;color:${C.stone}">Pessoas, valores, Negócios &amp; Marcas.</div>`;
  const script = `const t=document.getElementById('title'), b=document.getElementById('body'), r=document.getElementById('rule');
    const place=()=>{ const y=t.getBoundingClientRect().bottom+48; r.style.top=y+'px'; b.style.top=(y+26)+'px'; };
    place(); let s=parseFloat(t.style.fontSize); while(b.getBoundingClientRect().bottom>1270 && s>80){ s-=2; t.style.fontSize=s+'px'; place(); }`;
  return document('story', C.espresso, body, script);
}

async function storyHtml(slide, ctx, n) {
  if (slide.layout === 'cta' || slide.link) return storyCta(slide, ctx, n);
  if (slide.sticker) return storyQuestion(slide, ctx, n);
  return storyCover(slide, ctx, n);
}

// ---------------------------------------------------------------------------
// Renderização e verificação
// ---------------------------------------------------------------------------
async function launch() {
  const attempts = [
    process.env.ARCAFFO_CHROMIUM && { executablePath: process.env.ARCAFFO_CHROMIUM },
    {},
    { channel: 'chrome' }
  ].filter(Boolean);
  let last;
  for (const opts of attempts) {
    try { return await chromium.launch(opts); } catch (error) { last = error; }
  }
  throw new Error(`Chromium indisponível. Rode "npx playwright install chromium" ou defina ARCAFFO_CHROMIUM.\n${last?.message}`);
}

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'arcaffo-ig-'));
async function render(browser, html, target, kind) {
  const size = kind === 'story' ? STORY : FEED;
  const page = await browser.newPage({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1 });
  const file = path.join(tmp, `${path.basename(path.dirname(path.dirname(target)))}-${path.basename(path.dirname(target))}-${path.basename(target)}.html`);
  await fs.writeFile(file, html);
  await page.goto(`file://${file}`);
  await page.evaluate(() => window.__layout());
  const problems = await page.evaluate(({ kind, safeTop, safeBottom }) => {
    const out = [...(window.__errors || [])];
    const fonts = [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family);
    if (fonts.length) out.push(`fonte não carregada: ${fonts.join(', ')}`);
    const page = document.getElementById('page').getBoundingClientRect();
    for (const el of document.querySelectorAll('.t')) {
      if (getComputedStyle(el).display === 'none' || !el.textContent.trim()) continue;
      const r = el.getBoundingClientRect();
      const label = el.textContent.trim().slice(0, 40);
      if (r.left < 0 || r.top < 0 || r.right > page.width + .5 || r.bottom > page.height + .5) out.push(`fora da página: "${label}"`);
      if (el.scrollWidth > el.clientWidth + 1) out.push(`texto estourando a largura: "${label}"`);
      if (kind === 'story' && (r.top < safeTop || r.bottom > safeBottom)) out.push(`fora da área segura do Story: "${label}" (${Math.round(r.top)}–${Math.round(r.bottom)})`);
    }
    const texts = [...document.querySelectorAll('.t')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) out.push(`textos sobrepostos (${Math.round(a.left)},${Math.round(a.top)}) × (${Math.round(b.left)},${Math.round(b.top)})`);
    }
    return out;
  }, { kind, safeTop: STORY.safeTop, safeBottom: STORY.safeBottom });
  if (problems.length) throw new Error(`${path.relative(root, target)}\n  - ${problems.join('\n  - ')}`);
  await page.screenshot({ path: target, clip: { x: 0, y: 0, width: size.w, height: size.h } });
  await page.close();
  const meta = await sharp(target).metadata();
  if (meta.width !== size.w || meta.height !== size.h) throw new Error(`${target}: dimensão ${meta.width}×${meta.height}`);
}

async function reviewBoard(browser, rows, target, title, thumbH) {
  const rowsHtml = rows.map(r => `<section><div class="m"><div class="n">Matéria ${r.issue}</div><div class="t">${esc(r.title)}</div></div><div class="r">${r.files.map((f, i) => `<figure><img src="file://${f}" style="height:${thumbH}px"><figcaption>${pad(i + 1)}</figcaption></figure>`).join('')}</div></section>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>${CSS}
    body{background:${C.sand};color:${C.ink};font-family:Inter;padding:0 0 40px}
    header{padding:56px 64px 32px;border-bottom:1px solid ${C.ink}} h1{font-family:Newsreader;font-weight:300;font-size:60px}
    header p{margin-top:10px;font-size:18px;color:${C.graphite}}
    section{display:flex;gap:40px;padding:36px 64px;border-bottom:1px solid ${C.linen}}
    .m{width:260px;flex:none}.n{font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:${C.umber};font-weight:500}
    .m .t{font-family:Newsreader;font-weight:300;font-size:30px;line-height:1.1;margin-top:10px}
    .r{display:flex;gap:18px} figure{display:flex;flex-direction:column;gap:8px} figure img{display:block;outline:1px solid ${C.linen}}
    figcaption{font-size:13px;letter-spacing:.16em;color:${C.graphite}}</style>
    <header><h1>${esc(title)}</h1><p>Arcaffo GROUP · sistema Dossiê · gerado por scripts/generate-instagram-assets.mjs</p></header>${rowsHtml}`;
  const file = path.join(tmp, path.basename(target) + '.html');
  await fs.writeFile(file, html);
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  const width = await page.evaluate(() => Math.ceil(Math.max(...[...document.querySelectorAll('section')].map(s => [...s.children].reduce((w, c) => w + c.getBoundingClientRect().width, 0) + 40 * (s.children.length - 1) + 128))));
  await page.setViewportSize({ width, height: 400 });
  await page.screenshot({ path: target, fullPage: true });
  await page.close();
}

// ---------------------------------------------------------------------------
await fs.mkdir(outputRoot, { recursive: true });
const browser = await launch();
const boardFeed = [], boardStories = [];
try {
  for (const [slug, entry] of Object.entries(social.articles)) {
    const article = articles.find(item => item.slug === slug);
    if (!article) throw new Error(`Artigo não encontrado: ${slug}`);
    const dir = path.join(outputRoot, slug);
    const feedSlides = entry.carousel || [entry.fixedPost];
    const feedFolder = entry.carousel ? 'carousel' : 'post-fixo';
    const coverSlide = feedSlides.find(s => s.layout === 'cover') || feedSlides[0];
    const ctx = { dir: DIRECTION[slug] || FALLBACK, running: coverSlide.eyebrow || article.title, total: feedSlides.length };
    await fs.mkdir(path.join(dir, feedFolder), { recursive: true });
    const feedFiles = [], storyFiles = [];
    for (let i = 0; i < feedSlides.length; i++) {
      const target = path.join(dir, feedFolder, `${pad(i + 1)}.png`);
      await render(browser, await feedSvgless(feedSlides[i], ctx, i + 1), target, 'feed');
      feedFiles.push(target);
    }
    if (entry.stories) {
      await fs.mkdir(path.join(dir, 'stories'), { recursive: true });
      for (let i = 0; i < entry.stories.length; i++) {
        const target = path.join(dir, 'stories', `${pad(i + 1)}.png`);
        await render(browser, await storyHtml(entry.stories[i], ctx, i + 1), target, 'story');
        storyFiles.push(target);
      }
    }
    await fs.writeFile(path.join(dir, 'caption.txt'), `${entry.caption.trim()}\n`);
    const notes = (entry.stories || []).map((slide, index) => [
      `Story ${index + 1}`,
      slide.sticker ? `Adesivo: ${slide.sticker}` : '',
      slide.link ? `Link: https://www.arcaffo.com${slide.link}` : ''
    ].filter(Boolean).join('\n')).join('\n\n');
    await fs.writeFile(path.join(dir, 'stories-notes.txt'), `${notes}\n`);
    boardFeed.push({ issue: ctx.dir.issue, title: coverSlide.title, files: feedFiles });
    if (storyFiles.length) boardStories.push({ issue: ctx.dir.issue, title: coverSlide.title, files: storyFiles });
    console.log(`✓ ${slug}: ${feedSlides.length} peça(s) de feed + ${storyFiles.length} Stories`);
  }
  if (boardFeed.length) await reviewBoard(browser, boardFeed, path.join(outputRoot, '_preview-carrosseis.png'), 'Carrosséis — revisão', 380);
  if (boardStories.length) await reviewBoard(browser, boardStories, path.join(outputRoot, '_preview-stories.png'), 'Stories — revisão', 520);
} finally {
  await browser.close();
  await fs.rm(tmp, { recursive: true, force: true });
}
console.log(`Assets prontos em ${path.relative(root, outputRoot)}`);

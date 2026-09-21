import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
const source = '/Users/arthurfava/Library/CloudStorage/GoogleDrive-admin@arcaffo.com/Drives compartilhados/Clientes/_Arcaffo/1. Institucional/4. Site/0. Criação';
const portraits = '/Users/arthurfava/Library/CloudStorage/GoogleDrive-admin@arcaffo.com/Drives compartilhados/Clientes/_Arcaffo/1. Institucional/0. Gestão/1. Posicionamento/Pasta ARCF_Posicionamento_2025.10/Links';
const files = {
 casa: `${source}/1 Home/_MG_9172.jpg`,
 arthur: `${portraits}/Retrato0065Namour_Gestão_Arcaffo_.JPG`,
 luiz: `${portraits}/Retrato0066Namour_Gestão_Arcaffo_.JPG`,
 fabricio: `${portraits}/Retrato0068Namour_Gestão_Arcaffo_.JPG`,
};
mkdirSync('public/images/materia',{recursive:true});
for(const [name,file] of Object.entries(files)) {
 for(const width of [640,960,1600]) await sharp(file).rotate().resize({width,withoutEnlargement:true}).webp({quality:83}).toFile(`public/images/materia/${name}-${width}.webp`);
}
const original = readFileSync('public/images/brand/ff-mark.svg','utf8');
const paths = original.match(/<path[\s\S]*?(?=<\/svg>)/)?.[0].replaceAll('class="cls-1"','fill="#F7F3EA"');
if(!paths)throw new Error('Missing official mark');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#221C16"/><g transform="translate(16 12) scale(1.04)">${paths}</g></svg>`;
writeFileSync('public/favicon.svg',svg);
for(const [file,size] of [['favicon-96.png',96],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]])await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`public/${file}`);
// ICO container with PNG payloads (supported by current browsers and Windows).
const entries=await Promise.all([16,32,48].map(size=>sharp(Buffer.from(svg)).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+entries.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(entries.length,4);let offset=header.length;
entries.forEach((png,i)=>{const p=6+i*16;header[p]=[16,32,48][i];header[p+1]=header[p];header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(png.length,p+8);header.writeUInt32LE(offset,p+12);offset+=png.length;});
writeFileSync('public/favicon.ico',Buffer.concat([header,...entries]));
const logo=readFileSync('public/images/brand/logo-arcaffo-group-b.svg');
const logoPng=await sharp(logo).resize({width:420}).png().toBuffer();
const room=await sharp(files.casa).resize(580,630,{fit:'cover',position:'center'}).jpeg({quality:88}).toBuffer();
await sharp({create:{width:1200,height:630,channels:3,background:'#F7F3EA'}}).composite([{input:logoPng,left:90,top:245},{input:room,left:620,top:0}]).jpeg({quality:88}).toFile('public/images/materia/social-home.jpg');
writeFileSync('public/images/materia/provenance.json',JSON.stringify({prepared:'2026-09-15',files:Object.fromEntries(Object.entries(files).map(([key,file])=>[key,basename(file)])),notes:'Existing institutional photographs. Leadership portraits use the 2025 institutional set. Captions describe the photograph, not an unverified historical date. Mark from official FF symbol.'},null,2));
console.log('Editorial photographs, social cover and icon family prepared.');

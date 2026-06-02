import fs from 'fs';
import * as cheerio from 'cheerio';

const dataPath = 'public/data/artigos.json';
const artigos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const a = artigos.find(a => a.content.includes('data-loaded="true"'));
if(a) {
  const $ = cheerio.load(a.content);
  console.log($('[data-loaded="true"]').parent().parent().html());
}

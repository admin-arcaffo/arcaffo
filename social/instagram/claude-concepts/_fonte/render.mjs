import { chromium } from 'playwright';
import fs from 'node:fs';
const jobs = JSON.parse(fs.readFileSync('jobs.json','utf8'));
const b = await chromium.launch();
for (const j of jobs) {
  const p = await b.newPage({ viewport:{width:j.w,height:j.h}, deviceScaleFactor:1 });
  await p.goto('file://'+j.html); await p.evaluate(()=>document.fonts.ready);
  await p.waitForTimeout(150);
  const fonts = await p.evaluate(()=>[...document.fonts].map(f=>f.family+':'+f.status).join(','));
  await p.screenshot({ path:j.png, clip:{x:0,y:0,width:j.w,height:j.h} });
  console.log(j.png.split('/').pop(), fonts);
  await p.close();
}
await b.close();

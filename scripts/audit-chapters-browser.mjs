import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const engines=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:5174';
const out='.impeccable/qa/chapters';mkdirSync(out,{recursive:true});
const results=[];
for(const name of (process.env.AUDIT_ENGINES||'chromium,firefox,webkit').split(',')) {
 const browser=await engines[name].launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://forms.arcaffo.com/**',r=>r.abort());
  for(const width of [360,430,768,1024,1440]) {
   await page.setViewportSize({width,height:900});
   for(const path of ['/','/sobre.html','/servicos.html']) {
    console.log(name,width,path);
    await page.goto(base+path);await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,5000))]));
    await page.waitForTimeout(800); // Finish cross-document view transition snapshots as well.
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width}))}));
    if(overflow.scroll>overflow.width+1)console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,class:e.className,client:e.clientWidth,scroll:e.scrollWidth,text:e.textContent.slice(0,70)}))));
    assert.ok(overflow.scroll<=overflow.width+1,`${name} ${path} overflow ${width}: ${JSON.stringify(overflow)}`);
   }
  }
  await page.goto(base+'/sobre.html');
  const essenceTabs=page.locator('[data-essence] [role="tab"]');await essenceTabs.nth(1).click();assert.equal(await essenceTabs.nth(1).getAttribute('aria-selected'),'true');assert.equal(await page.locator('[data-essence] [role="tabpanel"]:visible').count(),1);
  await page.locator('[data-chapter="2021"]').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.25,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.history-stage-year').textContent==='2021');
  await page.screenshot({path:`${out}/${name}-history.png`});
  const detail=page.locator('.culture-accordions details').nth(1);await detail.locator('summary').click();assert.ok(await detail.evaluate(el=>el.open));
  await page.goto(base+'/servicos.html');
  const explorer=page.locator('[data-explorer]').first();const tabs=explorer.getByRole('tab');
  await tabs.first().focus();await page.keyboard.press('End');assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
  assert.equal(await explorer.locator('[data-explorer-panel]:visible').count(),1);
  await page.screenshot({path:`${out}/${name}-services.png`});
  await page.goto(base+'/projetos/indreco.html');const opener=page.locator('[data-gallery-image]').first();await opener.click();
  await page.locator('.gallery-dialog img').waitFor({state:'visible'});
  const viewport=page.locator('.gallery-viewport');
  await viewport.dispatchEvent('pointerdown',{isPrimary:true,clientX:260,clientY:300});
  await viewport.dispatchEvent('pointerup',{isPrimary:true,clientX:100,clientY:305});
  assert.match(await page.locator('[data-gallery-count]').textContent(),/^2 \//);
  await page.screenshot({path:`${out}/${name}-gallery.png`});
  await page.keyboard.press('Escape');assert.ok(await opener.evaluate(el=>el===document.activeElement));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/servicos.html');await page.getByRole('tab').nth(1).click();assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  const context=await browser.newContext({javaScriptEnabled:false});const staticPage=await context.newPage();
  await staticPage.goto(base+'/sobre.html');assert.equal(await staticPage.locator('[data-chapter]').count(),5);assert.equal(await staticPage.locator('[data-essence] [role="tabpanel"]:visible').count(),3);
  await staticPage.goto(base+'/servicos.html');assert.equal(await staticPage.locator('[data-explorer-panel]:visible').count(),10);await context.close();
  assert.deepEqual(errors,[]);results.push({engine:name,ok:true,widths:[360,430,768,1024,1440],history:true,essence:true,tabs:true,swipe:true,focus:true,reducedMotion:true,noJavaScript:true});
 } finally {await browser.close();writeFileSync(`${out}/report.json`,JSON.stringify(results,null,2));}
}
console.log(JSON.stringify(results,null,2));

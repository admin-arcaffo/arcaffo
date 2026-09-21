import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:5173';
const out='.impeccable/qa/materia';mkdirSync(out,{recursive:true});
const browser=await chromium.launch(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL,headless:true}:{headless:true});
const report={pages:[],interactions:[],errors:[],provider:'GET definition and script snapshot; POST intercepted, no live submission'};
try {
  const context=await browser.newContext();
  // Block all actual response writes (including provider draft autosave).
  await context.route('https://forms.arcaffo.com/**',async route=>{
    const req=route.request();
    if(req.method()!=='GET') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({responseId:'local-test',thankYou:{title:'Recebido'}})});
    if(req.url().includes('/api/embed/forms/'))return route.fulfill({status:200,contentType:'application/json',body:readFileSync('/private/tmp/arcaffo-contact-definition.json','utf8')});
    return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    for(const path of ['/','/sobre.html','/servicos.html','/projetos.html','/artigos.html','/contato.html','/vagas.html','/obrigado.html','/projetos/indreco.html','/artigos/como-alinhar-a-cultura-organizacional-e-os-objetivos-dos-funciona-rios-nas-pmes.html']){
      await page.goto(base+path);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});
      const state=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.src),fonts:document.fonts.check('300 32px Newsreader')}));
      report.pages.push({path,width,...state});assert.ok(!state.overflow,`Overflow ${path} at ${width}`);assert.ok(state.title,`No h1 ${path}`);assert.deepEqual(state.images,[],`Broken image on ${path}`);
      await page.screenshot({path:`${out}/${path==='/'?'home':path.replaceAll('/','_').replace('.html','')}-${width}.png`,fullPage:true});
    }
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/');
  assert.equal(await page.locator('#cta-diagnostico-hero').getAttribute('aria-label'),'Pedir diagnóstico gratuito');
  assert.equal(await page.locator('[role="tabpanel"]').evaluateAll(nodes=>nodes.every(node=>node.tagName==='DIV')),true);
  await page.evaluate(()=>{window.dataLayer=[];document.addEventListener('click',event=>{if(event.target.closest('[data-cta="diagnostico"]'))event.preventDefault();},true);});
  assert.equal(await page.locator('#cta-diagnostico-hero .cta-label-mobile').isVisible(),true);assert.equal(await page.locator('#cta-diagnostico-hero .cta-label-full').isVisible(),false);
  for(const id of ['cta-diagnostico-hero','cta-diagnostico-bloco','cta-diagnostico-final'])await page.locator(`#${id}`).click();
  const diagnosticEvents=await page.evaluate(()=>window.dataLayer.filter(item=>item?.event==='cta_diagnostico_click'));
  assert.deepEqual(diagnosticEvents,[
    {event:'cta_diagnostico_click',cta_local:'cta-diagnostico-hero'},
    {event:'cta_diagnostico_click',cta_local:'cta-diagnostico-bloco'},
    {event:'cta_diagnostico_click',cta_local:'cta-diagnostico-final'},
  ]);report.interactions.push('three diagnostic CTAs and dataLayer events');
  await page.getByRole('button',{name:'Menu'}).click();assert.equal(await page.getByRole('button',{name:'Menu'}).getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Menu'}).getAttribute('aria-expanded'),'false');report.interactions.push('mobile menu and Escape');
  await page.getByRole('tab',{name:/Minha equipe/}).click();assert.equal(await page.locator('[data-panel="pessoas"]').isVisible(),true);await page.keyboard.press('ArrowDown');assert.equal(await page.locator('[data-panel="negocio"]').isVisible(),true);report.interactions.push('worktable touch and keyboard');
  await page.goto(base+'/projetos.html');await page.locator('[data-search]').fill('indreco');assert.equal(await page.locator('.project-card:visible').count(),1);await page.locator('[data-search]').fill('sem-resultados-xyz');assert.equal(await page.locator('[data-empty]').isVisible(),true);report.interactions.push('project search and empty state');
  await page.goto(base+'/projetos/indreco.html');await page.locator('[data-gallery-image]').first().click();assert.equal(await page.getByRole('dialog').isVisible(),true);await page.getByRole('button',{name:'Próxima imagem'}).click();assert.match(await page.locator('[data-gallery-count]').textContent(),/^2 \//);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').isVisible(),false);report.interactions.push('gallery navigation and Escape');
  await page.goto(base+'/contato.html?assunto=marca');await page.locator('.arcaffo-form').waitFor();
  await page.getByRole('button',{name:'Enviar minha solicitação'}).click();assert.ok(await page.locator('[data-invalid]').count()>0);
  const fields=page.locator('.arcaffo-fields input');await fields.nth(0).fill('Teste local');await fields.nth(1).fill('teste@example.com');await fields.nth(2).fill('67999999999');
  await page.getByRole('button',{name:'Enviar minha solicitação'}).click();await page.getByText('Recebemos sua solicitação.').waitFor();report.interactions.push('contact validation and simulated success');
  await page.waitForURL('**/obrigado.html');report.interactions.push('same-origin confirmation, no Instagram redirect');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');await page.getByRole('tab',{name:/Minha equipe/}).click();assert.equal(await page.evaluate(()=>document.getAnimations().length),0);report.interactions.push('reduced motion');
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();await staticPage.goto(base+'/');assert.equal(await staticPage.locator('.worktable-page:visible').count(),3);assert.equal(await staticPage.locator('.project-card').count(),4);report.interactions.push('no-JavaScript content and navigation');await nojs.close();
  assert.deepEqual(report.errors,[]);report.ok=true;
} catch(e) {report.ok=false;report.failure=e.message;throw e;} finally {writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}

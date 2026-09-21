import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:5173';
const axePath=process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.route('https://forms.arcaffo.com/**',route=>{
    if(route.request().method()==='GET'&&route.request().url().includes('/api/embed/forms/'))return route.fulfill({status:200,contentType:'application/json',body:readFileSync('/private/tmp/arcaffo-contact-definition.json','utf8')});
    return route.abort();
  });
  const page=await context.newPage();
  for(const path of ['/','/sobre.html','/servicos.html','/projetos.html','/artigos.html','/contato.html','/vagas.html','/obrigado.html','/projetos/indreco.html','/artigos/como-alinhar-a-cultura-organizacional-e-os-objetivos-dos-funciona-rios-nas-pmes.html']){
    await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);if(path==='/contato.html')await page.locator('.arcaffo-form').waitFor();
    await page.addScriptTag({path:axePath});
    const audit=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.length};});
    results.push({path,...audit});
  }
  for(const width of [360,768,1280]){
    await page.setViewportSize({width,height:900});await page.goto(base+'/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`home overflow at ${width}`);
    await page.locator('#mesa-de-trabalho').screenshot({path:`.impeccable/qa/materia/worktable-${width}.png`});
  }
  // Large text equivalent to a narrow 200%-zoom layout, and real error recovery.
  await page.setViewportSize({width:640,height:450});await page.goto(base+'/contato.html');await page.locator('.arcaffo-form').waitFor();
  await page.locator('.arcaffo-fields input').nth(0).fill('Teste local');await page.locator('.arcaffo-fields input').nth(1).fill('teste@example.com');await page.locator('.arcaffo-fields input').nth(2).fill('67999999999');
  await page.getByRole('button',{name:'Enviar minha solicitação'}).click();await page.locator('.arcaffo-status').filter({hasText:/fetch|enviar|network/i}).waitFor();
  assert.equal(await page.locator('.arcaffo-fields input').nth(0).inputValue(),'Teste local');assert.equal(await page.getByRole('button',{name:'Enviar minha solicitação'}).isEnabled(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  console.log(JSON.stringify({results,errorRecovery:true},null,2));
  assert.ok(results.every(r=>r.violations.length===0),'Accessibility violations detected');
} finally {mkdirSync('.impeccable/qa/materia',{recursive:true});writeFileSync('.impeccable/qa/materia/accessibility.json',JSON.stringify(results,null,2));await browser.close();}

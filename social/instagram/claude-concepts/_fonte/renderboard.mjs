import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:2460,height:1000}});
await p.goto('file://'+process.cwd()+'/board.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({path:'out/prancha-comparativa.png',fullPage:true}); await b.close();

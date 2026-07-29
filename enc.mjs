import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const bad=/[ÂÃ¢â€™œ]{2,}|â€|Ã¢|Â /;
  const hits=[];
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length) return;
    const t=(el.textContent||'').trim();
    if(t && bad.test(t)) hits.push(t.slice(0,70));
  });
  return {charset:document.characterSet, hits:hits.slice(0,10), total:hits.length,
          placeholders:document.querySelectorAll('[data-slot="copy"]').length};
});
console.log('document charset :',r.charset);
console.log('mojibake strings :',r.total);
r.hits.forEach(h=>console.log('   ',h));
console.log('copy placeholders:',r.placeholders);
await b.close();

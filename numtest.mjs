import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
const errs=[];
p.on('pageerror',e=>errs.push(String(e).slice(0,110)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,110))});
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1000);
await p.evaluate(()=>document.querySelector('.n4-stats_layout').scrollIntoView({block:'center'}));
for(const t of [120,300,700]){
  await p.waitForTimeout(t===120?120:t-120);
  const n=await p.evaluate(()=>[...document.querySelectorAll('.n4-stats_item_number')].map(x=>x.textContent.trim()).join(' | '));
  console.log(`t=${t}ms:`, n);
}
console.log('errors:', errs.length?errs.slice(0,3):'none');
await b.close();

import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1200);
const read=()=>p.evaluate(()=>({
  off:[...document.querySelectorAll('.ring-arc')].map(a=>a.getAttribute('stroke-dashoffset')).join(','),
  nums:[...document.querySelectorAll('.n4-stats_item_number')].map(n=>n.textContent.trim()).join(' | ')
}));
console.log('before scroll:', JSON.stringify(await read()));
await p.evaluate(()=>document.querySelector('.n4-stats_layout').scrollIntoView({block:'center'}));
await p.waitForTimeout(400);
console.log('mid-anim     :', JSON.stringify(await read()));
await p.waitForTimeout(2200);
console.log('settled      :', JSON.stringify(await read()));
await p.screenshot({path:'_therapy2/rings-final.png',clip:{x:0,y:220,width:1440,height:460}});
await b.close();

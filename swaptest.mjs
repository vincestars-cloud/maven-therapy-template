import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1500);
const ops=async()=>p.evaluate(()=>[...document.querySelectorAll('.n4-industry_visual_img')]
  .map(i=>getComputedStyle(i).opacity).join(','));
await p.evaluate(()=>document.querySelector('.n4-industry_link_item').scrollIntoView({block:'center'}));
await p.waitForTimeout(400);
console.log('at rest        :', await ops());
const items=await p.$$('.n4-industry_link_item');
for(const idx of [2,4,1]){
  await items[idx].hover(); await p.waitForTimeout(600);
  console.log('hover item '+idx+'   :', await ops());
}
await b.close();

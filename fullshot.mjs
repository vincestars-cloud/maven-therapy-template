import { chromium } from 'playwright';
import path from 'path';
const url='file://'+path.resolve('_clone/index.html');
const b=await chromium.launch();
for(const v of [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844,m:true}]){
  const c=await b.newContext({viewport:{width:v.w,height:v.h},isMobile:!!v.m,hasTouch:!!v.m});
  const p=await c.newPage();
  await p.goto(url,{waitUntil:'networkidle'});
  await p.evaluate(()=>{document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));
    const s=document.createElement('style');s.textContent='*{transition:none!important;animation:none!important}';document.head.appendChild(s);});
  await p.waitForTimeout(200);
  await p.screenshot({path:`_clone/full-${v.n}.png`,fullPage:true});
  console.log('wrote _clone/full-'+v.n+'.png');
  await c.close();
}
await b.close();

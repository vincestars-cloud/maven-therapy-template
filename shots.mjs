import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(2500);
// readable, viewport-sized slices down the page
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
const stops=[0,900,1800,3400,4600,5600,7000,H-950];
for(let i=0;i<stops.length;i++){
  await p.evaluate(y=>window.scrollTo(0,y),stops[i]);
  await p.waitForTimeout(450);
  await p.screenshot({path:`_therapy2/slice-${i}.png`});
}
console.log('page height',H,'slices',stops.length);
await b.close();

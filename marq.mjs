import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:560}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(2000);
const el=await p.$('.n4-main_marquee_component');
if(!el){console.log('NO MARQUEE');process.exit(0);}
await p.evaluate(()=>{document.querySelector('.n4-main_marquee_component').scrollIntoView({block:'center'});
  const s=document.createElement('style');s.textContent='*{animation-play-state:paused!important}';document.head.appendChild(s);});
await p.waitForTimeout(600);
await p.screenshot({path:'_therapy2/marquee.png',clip:await (async()=>{const bb=await el.boundingBox();
  return {x:0,y:Math.max(0,bb.y-70),width:1440,height:Math.min(320,bb.height+150)};})()});
console.log('shot ok');
await b.close();

import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{
  const body=document.querySelector('.n4-stats_item_body');
  const wrap=document.querySelector('.n4-stats_item_wrap');
  const out={bodyBox:null,wrapBox:null,decor:[]};
  if(body){const b=body.getBoundingClientRect();out.bodyBox={w:Math.round(b.width),h:Math.round(b.height)};}
  if(wrap){const b=wrap.getBoundingClientRect();out.wrapBox={w:Math.round(b.width),h:Math.round(b.height)};}
  // find the element drawing the decorative circle
  document.querySelectorAll('.n4-stats_item_wrap *').forEach(el=>{
    const cs=getComputedStyle(el), bb=el.getBoundingClientRect();
    if(parseFloat(cs.borderRadius)>50 || cs.borderRadius.includes('%')){
      out.decor.push({cls:(el.className||'').toString().split(' ')[0],
        w:Math.round(bb.width),h:Math.round(bb.height),
        radius:cs.borderRadius, border:cs.borderWidth, bg:cs.backgroundColor});
    }
  });
  ['::before','::after'].forEach(ps=>{
    const el=document.querySelector('.n4-stats_item_wrap');
    if(!el)return; const cs=getComputedStyle(el,ps);
    if(cs.content&&cs.content!=='none') out.decor.push({pseudo:ps,w:cs.width,h:cs.height,radius:cs.borderRadius,border:cs.border});
  });
  return out;
});
console.log(JSON.stringify(r,null,1).slice(0,900));
await b.close();

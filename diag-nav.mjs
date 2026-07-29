import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_clone2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
  const nav=document.querySelector('.navbar');
  const out={navH:nav.getBoundingClientRect().height,children:[]};
  const walk=(el,d)=>{
    for(const ch of el.children){
      const b=ch.getBoundingClientRect(), cs=getComputedStyle(ch);
      if(b.height>70) out.children.push({d,cls:(ch.className||'').toString().slice(0,44),
        h:Math.round(b.height),disp:cs.display,pos:cs.position});
      if(d<4) walk(ch,d+1);
    }
  };
  walk(nav,0);
  const dl=document.querySelectorAll('.w-dropdown-list');
  out.dropdowns=[...dl].slice(0,4).map(e=>({cls:(e.className||'').toString().slice(0,40),
    disp:getComputedStyle(e).display,h:Math.round(e.getBoundingClientRect().height)}));
  return out;
});
console.log(JSON.stringify(r,null,1));
await b.close();

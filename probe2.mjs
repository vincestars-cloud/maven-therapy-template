import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const out={links:[],parallax:{}};
  document.querySelectorAll('.n4-industry_link_item').forEach(el=>{
    const cs=getComputedStyle(el);
    const h=el.querySelector('.n4-industry_links_heading');
    out.links.push({t:(h&&h.textContent.trim().slice(0,22))||'?',
      opacity:cs.opacity, color:getComputedStyle(h||el).color, transform:cs.transform.slice(0,28)});
  });
  ['.n4-parallax_wrap','.n4-parallax_sticky','.n4-parallax_overlap','.n4-stats_wrap'].forEach(s=>{
    const el=document.querySelector(s); if(!el)return;
    const bb=el.getBoundingClientRect();
    out.parallax[s]={h:Math.round(bb.height),pos:getComputedStyle(el).position};
  });
  return out;
});
console.log(JSON.stringify(r,null,1));
await b.close();

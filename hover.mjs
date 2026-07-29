import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1200);
const snap=async(label)=>{
  const r=await p.evaluate(()=>[...document.querySelectorAll('.n4-industry_link_item')].map(el=>{
    const h=el.querySelector('.n4-industry_links_heading');
    const cs=getComputedStyle(el), hs=h?getComputedStyle(h):null;
    return {t:(h&&h.textContent.trim().slice(0,20))||'?',
      cls:(el.className||'').toString().replace('n4-industry_link_item','').trim().slice(0,30),
      color:hs&&hs.color, op:cs.opacity, bg:cs.backgroundColor,
      borderB:cs.borderBottomColor+' '+cs.borderBottomWidth};
  }));
  console.log('\n['+label+']');
  r.forEach(x=>console.log('  ',x.t.padEnd(21),'color='+x.color,'op='+x.op,'cls='+(x.cls||'-')));
};
await p.evaluate(()=>document.querySelector('.n4-industry_link_item').scrollIntoView({block:'center'}));
await p.waitForTimeout(400);
await snap('no hover');
const items=await p.$$('.n4-industry_link_item');
await items[2].hover(); await p.waitForTimeout(400);
await snap('hovering item 3 (Teens)');
await b.close();

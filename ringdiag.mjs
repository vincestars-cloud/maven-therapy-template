import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const wrap=document.querySelector('.n4-stats_item_wrap');
  const svg=wrap&&wrap.querySelector('svg');
  const circles=svg?[...svg.querySelectorAll('circle')]:[];
  const wb=wrap?wrap.getBoundingClientRect():null;
  const sb=svg?svg.getBoundingClientRect():null;
  // is there ALSO a decorative ring from the reference CSS?
  const others=[...wrap.querySelectorAll('*')].filter(el=>el!==svg&&!svg.contains(el)).map(el=>{
    const cs=getComputedStyle(el),bb=el.getBoundingClientRect();
    return {cls:(el.className||'').toString().split(' ')[0]||el.tagName,
      br:cs.borderRadius,bw:cs.borderWidth,bc:cs.borderColor,
      w:Math.round(bb.width),h:Math.round(bb.height)};
  }).filter(o=>parseFloat(o.bw)>2||o.br.includes('%')||parseFloat(o.br)>40);
  return {
    wrap:wb&&{w:Math.round(wb.width),h:Math.round(wb.height)},
    svg:sb&&{w:Math.round(sb.width),h:Math.round(sb.height)},
    circles:circles.map(c=>({r:c.getAttribute('r'),sw:c.getAttribute('stroke-width'),
      computedSW:getComputedStyle(c).strokeWidth, stroke:(c.getAttribute('stroke')||'').slice(0,26)})),
    decorative:others
  };
});
console.log(JSON.stringify(r,null,1));
await b.close();

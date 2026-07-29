import { chromium } from 'playwright';
import path from 'path';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage();
await p.goto('file://'+path.resolve('_therapy2/index.html'),{waitUntil:'load'});
await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{
  const items=[...document.querySelectorAll('.n4-industry_link_item')];
  const desc=el=>[...el.querySelectorAll('*')].map(d=>{
    const cs=getComputedStyle(d);
    return {cls:(d.className||'').toString().split(' ')[0]||d.tagName,
      op:cs.opacity,bg:cs.backgroundColor,color:cs.color,
      w:Math.round(d.getBoundingClientRect().width),
      h:Math.round(d.getBoundingClientRect().height),
      disp:cs.display,transform:cs.transform.slice(0,22)};
  });
  const a=desc(items[0]), bl=desc(items[1]);
  const diffs=[];
  a.forEach((x,i)=>{ const y=bl[i]; if(!y)return;
    Object.keys(x).forEach(k=>{ if(k==='cls')return;
      if(String(x[k])!==String(y[k])) diffs.push(`${x.cls}.${k}: [Individuals]${x[k]}  vs  [Couples]${y[k]}`); });
  });
  // also check panel/visual siblings
  const panel=document.querySelector('.n4-industry_visual_wrap, .n4-industry_img_wrap, .n4-industry_content');
  return {diffs:diffs.slice(0,14), itemCount:items.length,
    panelImgs:[...document.querySelectorAll('.n4-industry_layout img')].map(i=>({
      src:(i.getAttribute('src')||'').slice(-22),op:getComputedStyle(i).opacity,
      cls:(i.className||'').toString().split(' ')[0]}))};
});
console.log('DIFFS Individuals vs Couples:');
r.diffs.forEach(d=>console.log('  ',d));
console.log('\npanel images:', JSON.stringify(r.panelImgs,null,1).slice(0,500));
await b.close();

import { chromium, webkit } from 'playwright';
import path from 'path';
const url='file://'+path.resolve('_therapy2/index.html');
const VPS=[
  {n:'iPhone SE',w:320,h:568},{n:'iPhone 12/13',w:390,h:844},
  {n:'iPhone Pro Max',w:430,h:932},{n:'tablet portrait',w:768,h:1024},
];
const results=[];
for(const engine of [chromium, webkit]){
  const b=await engine.launch();
  for(const v of VPS){
    const c=await b.newContext({viewport:{width:v.w,height:v.h},isMobile:v.w<600,hasTouch:v.w<600,deviceScaleFactor:2});
    const p=await c.newPage();
    const errs=[];
    p.on('pageerror',e=>errs.push(String(e).slice(0,60)));
    await p.goto(url,{waitUntil:'load'});
    await p.waitForTimeout(1800);
    const r=await p.evaluate(()=>{
      const cw=document.documentElement.clientWidth;
      // real horizontal scroll?
      const sx=window.scrollX; window.scrollTo(9999,0);
      const scrolls=window.scrollX>0; window.scrollTo(sx,0);
      // unclipped overflow offenders
      const over=[];
      document.querySelectorAll('body *').forEach(el=>{
        const b=el.getBoundingClientRect(); if(!b.width||!b.height) return;
        let a=el.parentElement,clip=false;
        while(a){ if(/hidden|clip|auto|scroll/.test(getComputedStyle(a).overflowX)){clip=true;break} a=a.parentElement; }
        if(clip) return;
        const o=Math.max(b.right-cw,-b.left);
        if(o>2) over.push({c:(el.className||'').toString().split(' ')[0]||el.tagName,o:Math.round(o)});
      });
      // tap targets under 44px
      const small=[];
      document.querySelectorAll('a,button,[role=button],input,select').forEach(el=>{
        const b=el.getBoundingClientRect();
        if(b.width===0||b.height===0) return;
        if(getComputedStyle(el).display==='none') return;
        if(b.height<44||b.width<24) small.push({c:(el.className||'').toString().split(' ')[0]||el.tagName,
          h:Math.round(b.height),w:Math.round(b.width),t:(el.textContent||'').trim().slice(0,18)});
      });
      // tiny text
      const tiny=[];
      document.querySelectorAll('p,span,div,li,a,h1,h2,h3,h4').forEach(el=>{
        if(el.children.length) return;
        const t=(el.textContent||'').trim(); if(t.length<4) return;
        const fs=parseFloat(getComputedStyle(el).fontSize);
        if(fs>0&&fs<12) tiny.push({t:t.slice(0,22),fs:Math.round(fs*10)/10});
      });
      const cs=s=>{const e=document.querySelector(s);return e?getComputedStyle(e):null};
      const box=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
        return {w:Math.round(b.width),h:Math.round(b.height)}};
      return {scrolls,over:over.slice(0,4),overCount:over.length,
        small:small.slice(0,5),smallCount:small.length,
        tiny:tiny.slice(0,3),tinyCount:tiny.length,
        burger:(cs('.w-nav-button')||{}).display,
        navMenu:(cs('.nav-menu-4')||{}).display,
        h1:(cs('h1')||{}).fontSize, root:(cs('body')||{}).fontSize,
        hero:box('.n4-hero_main_wrap'), stats:box('.n4-stats_layout'),
        statCols:(cs('.n4-stats_layout')||{}).gridTemplateColumns,
        aboutCols:(cs('#about > div > div')||{}).gridTemplateColumns,
        docH:document.documentElement.scrollHeight};
    });
    results.push({e:engine.name(),v:v.n,w:v.w,...r,errs:errs.length});
    if(engine.name()==='chromium') await p.screenshot({path:`_therapy2/m-${v.w}.png`,fullPage:false});
    await c.close();
  }
  await b.close();
}
for(const r of results){
  console.log(`\n[${r.e} ${r.v} ${r.w}px] docH=${r.docH}`);
  console.log(`  scrollsX=${r.scrolls}  overflow=${r.overCount}${r.overCount?' '+JSON.stringify(r.over):''}`);
  console.log(`  burger=${r.burger} navMenu=${r.navMenu}  h1=${r.h1} root=${r.root}`);
  console.log(`  statCols=${r.statCols}  aboutCols=${r.aboutCols}`);
  console.log(`  tapTargets<44=${r.smallCount}${r.smallCount?' '+JSON.stringify(r.small.slice(0,3)):''}`);
  console.log(`  tinyText=${r.tinyCount}${r.tinyCount?' '+JSON.stringify(r.tiny):''}  jsErrors=${r.errs}`);
}

import { chromium } from 'playwright';
import path from 'path';
const url='file://'+path.resolve('_therapy2/index.html');
const b=await chromium.launch();
for(const v of [{n:'desktop',w:1440,h:900},{n:'tablet',w:768,h:1024},{n:'mobile',w:390,h:844,m:true}]){
  const c=await b.newContext({viewport:{width:v.w,height:v.h},isMobile:!!v.m,hasTouch:!!v.m});
  const p=await c.newPage(); const errs=[];
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,80))});
  p.on('pageerror',e=>errs.push('PAGEERR '+String(e).slice(0,80)));
  await p.goto(url,{waitUntil:'networkidle'});
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const cs=s=>{const e=document.querySelector(s);return e?getComputedStyle(e):null};
    const box=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return{h:Math.round(b.height),w:Math.round(b.width)}};
    const cw=document.documentElement.clientWidth;
    const sx=window.scrollX;window.scrollTo(9999,0);const sxx=window.scrollX;window.scrollTo(sx,0);
    // unclipped overflow only
    let worst=null;
    document.querySelectorAll('body *').forEach(el=>{
      const bx=el.getBoundingClientRect(); if(!bx.width||!bx.height)return;
      let a=el.parentElement,clip=false;
      while(a){if(/hidden|clip|auto|scroll/.test(getComputedStyle(a).overflowX)){clip=true;break}a=a.parentElement}
      if(clip)return;
      const o=Math.max(bx.right-cw,-bx.left);
      if(o>1&&(!worst||o>worst.o))worst={o:Math.round(o),c:(el.className||'').toString().slice(0,34)};
    });
    return{
      scrollH:document.documentElement.scrollHeight,
      hero:box('.n4-hero_main_wrap'), h1:cs('h1').fontSize+'/'+cs('h1').fontWeight,
      h2:cs('.n4-services_heading').fontSize, root:cs('body').fontSize,
      modCols:cs('.n4-services_layout').gridTemplateColumns.split(' ').length,
      statCols:(cs('.n4-stats_layout').gridTemplateColumns.match(/px|fr/g)||[]).length,
      revCols:cs('.n4-industry_layout').gridTemplateColumns.split(' ').length,
      sticky:cs('.n4-parallax_sticky').position,
      burger:cs('.w-nav-button').display, navMenu:cs('.nav-menu-4').display,
      secSpace:box('.n4-g_section_space').h,
      btnRadius:cs('.cta__green').borderRadius,
      svgFilled:[...document.querySelectorAll('svg:not(.g-logo):not(.stars svg)')].filter(s=>{
        const f=getComputedStyle(s).fill;return f&&f!=='none'}).length,
      docScrollsX:sxx>0, worst
    };
  });
  console.log(`\n[${v.n}] scrollH=${r.scrollH} hero=${r.hero.h} secSpace=${r.secSpace}`);
  console.log(`  h1=${r.h1} h2=${r.h2} root=${r.root} btnRadius=${r.btnRadius}`);
  console.log(`  grids: mod=${r.modCols} stats=${r.statCols} reviews=${r.revCols}  sticky=${r.sticky}`);
  console.log(`  burger=${r.burger} navMenu=${r.navMenu} svgFilled=${r.svgFilled}`);
  console.log(`  docScrollsX=${r.docScrollsX} overflow=${r.worst?JSON.stringify(r.worst):'NONE'}`);
  if(errs.length)console.log('  ERRORS:',errs.slice(0,3).join(' | '));
  await p.screenshot({path:`_therapy2/shot-${v.n}.png`,fullPage:true});
  await c.close();
}
await b.close();

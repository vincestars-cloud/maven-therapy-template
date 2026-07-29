import { chromium } from 'playwright';
import path from 'path';
const url='file://'+path.resolve('_clone2/index.html');
const b=await chromium.launch();
for(const v of [{n:'desktop',w:1440,h:900},{n:'tablet',w:768,h:1024},{n:'mobile',w:390,h:664,m:true}]){
  const c=await b.newContext({viewport:{width:v.w,height:v.h},isMobile:!!v.m,hasTouch:!!v.m});
  const p=await c.newPage();
  const errs=[];
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,90))});
  p.on('pageerror',e=>errs.push('PAGEERR '+String(e).slice(0,90)));
  await p.goto(url,{waitUntil:'load'});
  await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>{
    const cs=s=>{const e=document.querySelector(s);return e?getComputedStyle(e):null};
    const box=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return{y:Math.round(b.y),h:Math.round(b.height),w:Math.round(b.width)}};
    const cw=document.documentElement.clientWidth;
    const sx=window.scrollX;window.scrollTo(9999,0);const sxx=window.scrollX;window.scrollTo(sx,0);
    return{
      scrollH:document.documentElement.scrollHeight,
      hero:box('.n4-hero_main_wrap'),
      heroComp:box('.n4-hero_main_component'),
      navbar:box('.navbar'),
      navShell:(cs('.content__nav')||{}).borderRadius,
      navShellH:box('.content__nav'),
      h1:(()=>{const e=document.querySelector('h1');return e?getComputedStyle(e).fontSize+'/'+getComputedStyle(e).fontWeight:null})(),
      bodyBg:cs('body').backgroundColor,
      bodyFs:cs('body').fontSize,
      sectionSpace:box('.n4-g_section_space'),
      stats:box('.n4-stats_layout'),
      statsCols:(cs('.n4-stats_layout')||{}).gridTemplateColumns,
      industryCols:(cs('.n4-industry_layout')||{}).gridTemplateColumns,
      sticky:(cs('.n4-parallax_sticky')||{}).position,
      docScrollsX:sxx>0,
      swipers:document.querySelectorAll('.swiper-initialized').length,
      imgs:document.querySelectorAll('img').length,
    };
  });
  console.log(`\n[${v.n}] scrollH=${r.scrollH} docScrollsX=${r.docScrollsX}`);
  console.log(`  hero=${JSON.stringify(r.hero)} comp=${JSON.stringify(r.heroComp)}`);
  console.log(`  navbar=${JSON.stringify(r.navbar)} shellH=${r.navShellH&&r.navShellH.h} radius=${r.navShell}`);
  console.log(`  h1=${r.h1} bodyFs=${r.bodyFs} bg=${r.bodyBg}`);
  console.log(`  sectionSpace=${r.sectionSpace&&r.sectionSpace.h} sticky=${r.sticky} swipersInit=${r.swipers} imgs=${r.imgs}`);
  console.log(`  statsCols=${r.statsCols}`);
  console.log(`  industryCols=${r.industryCols}`);
  if(errs.length)console.log('  ERRORS:',errs.slice(0,4).join(' | '));
  await p.screenshot({path:`_clone2/shot-${v.n}.png`});
  await c.close();
}
await b.close();

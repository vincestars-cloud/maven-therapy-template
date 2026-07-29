import { chromium } from 'playwright';
import path from 'path';
const url = 'file://' + path.resolve('_clone/index.html');
const b = await chromium.launch();

for (const vp of [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }]) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.n === 'mobile', hasTouch: vp.n === 'mobile' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const contain = document.querySelector('.stats-contain');
    const grid = document.querySelector('.stats-grid');
    const cs = getComputedStyle(grid);
    // does the page ACTUALLY scroll sideways? (scrollWidth is unreliable under clip)
    const cw = document.documentElement.clientWidth;
    const before = window.scrollX;
    window.scrollTo(9999, 0);
    const scrolledX = window.scrollX;
    window.scrollTo(before, 0);
    // overflow ignoring elements clipped by an ancestor
    let worst = null;
    document.querySelectorAll('body *').forEach(el => {
      const bx = el.getBoundingClientRect();
      if (!bx.width || !bx.height) return;
      let anc = el.parentElement, clipped = false;
      while (anc) {
        const o = getComputedStyle(anc);
        if (/hidden|clip|auto|scroll/.test(o.overflowX)) { clipped = true; break; }
        anc = anc.parentElement;
      }
      if (clipped) return;
      const over = Math.max(bx.right - cw, -bx.left);
      if (over > 1 && (!worst || over > worst.over)) worst = { over: Math.round(over), cls: el.className.toString().slice(0, 40) };
    });
    return {
      containW: Math.round(contain.getBoundingClientRect().width),
      containType: getComputedStyle(contain).containerType,
      containName: getComputedStyle(contain).containerName,
      colCountVar: cs.getPropertyValue('--column-count').trim(),
      gridCols: cs.gridTemplateColumns,
      docScrollsX: scrolledX > 0,
      realOverflow: worst,
    };
  });
  console.log(`[${vp.n}]`, JSON.stringify(r, null, 1));
  await ctx.close();
}
await b.close();

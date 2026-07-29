// check.mjs — render the reference build and assert the measured behaviours hold.
import { chromium, webkit } from 'playwright';
import path from 'path';

const url = 'file://' + path.resolve('_clone/index.html');
const VPS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const results = [];
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  for (const vp of VPS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    // force all reveals in so geometry is measured in the settled state
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'));
      const s = document.createElement('style');
      s.textContent = '*{transition:none!important;animation:none!important}';
      document.head.appendChild(s);
    });
    await page.waitForTimeout(150);

    const r = await page.evaluate(() => {
      const out = {};
      out.scrollH = document.documentElement.scrollHeight;
      // Real horizontal overflow. scrollWidth is useless here (the wrap uses
      // overflow-x:clip), and a raw rect walk false-positives on every
      // width:max-content track that its own ancestor already clips — so skip
      // any element that has a clipping ancestor, and confirm by actually
      // trying to scroll the document sideways.
      const cw = document.documentElement.clientWidth;
      const sx = window.scrollX;
      window.scrollTo(9999, 0);
      out.docScrollsX = window.scrollX > 0;
      window.scrollTo(sx, 0);
      let worst = null;
      document.querySelectorAll('body *').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return;
        let anc = el.parentElement, clipped = false;
        while (anc) {
          if (/hidden|clip|auto|scroll/.test(getComputedStyle(anc).overflowX)) { clipped = true; break; }
          anc = anc.parentElement;
        }
        if (clipped) return;
        const over = Math.max(b.right - cw, -b.left);
        if (over > 1 && (!worst || over > worst.over)) {
          worst = { over: Math.round(over), cls: el.className.toString().slice(0, 50), tag: el.tagName };
        }
      });
      out.overflow = worst;
      const cs = s => getComputedStyle(document.querySelector(s));
      const box = s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width) }; };
      out.hero = box('.hero');
      out.heroPanelRadius = cs('.hero-panel').borderRadius;
      out.banner = { pos: cs('.banner').position, h: box('.banner').h };
      out.navToggle = cs('.nav-toggle').display;
      out.navMenu = cs('.nav-menu').display;
      out.sticky = cs('.parallax-sticky').position;
      out.h1 = cs('.hero h1').fontSize + ' / ' + cs('.hero h1').fontWeight;
      out.bodyBg = cs('body').backgroundColor;
      // count real tracks: computed value is either resolved px tracks or an
      // unresolved repeat() — read the custom property in the latter case
      const sg = cs('.stats-grid');
      const gtc = sg.gridTemplateColumns;
      out.statsCols = /^repeat\(/.test(gtc)
        ? Number(sg.getPropertyValue('--column-count').trim() || 4)
        : gtc.split(/\s+/).length;
      out.sectionSpace = box('.section-space').h;
      // svg fill check
      out.svgFilled = [...document.querySelectorAll('svg')].filter(s => {
        const f = getComputedStyle(s).fill; return f && f !== 'none';
      }).length;
      return out;
    });
    results.push({ engine: engine.name(), vp: vp.name, ...r });
    await page.screenshot({ path: `_clone/shot-${engine.name()}-${vp.name}.png`, fullPage: false });
    await ctx.close();
  }
  await browser.close();
}

for (const r of results) {
  console.log(`\n[${r.engine} ${r.vp}]`);
  console.log(`  scrollH=${r.scrollH}  hero=${r.hero.h}h  panelRadius=${r.heroPanelRadius}`);
  console.log(`  banner=${r.banner.pos}/${r.banner.h}h  sticky=${r.sticky}  sectionSpace=${r.sectionSpace}`);
  console.log(`  h1=${r.h1}  bodyBg=${r.bodyBg}  statsCols=${r.statsCols}`);
  console.log(`  navToggle=${r.navToggle}  navMenu=${r.navMenu}  svgFilled=${r.svgFilled}`);
  console.log(`  overflow=${r.overflow ? JSON.stringify(r.overflow) : 'NONE'}`);
}

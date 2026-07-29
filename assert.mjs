// assert.mjs — compare the clone's RENDERED values against the values measured
// from spec.json at each captured viewport. This is the gate: not "does it look
// fine" but "does it equal what was measured".
import { chromium } from 'playwright';
import path from 'path';
const url = 'file://' + path.resolve('_clone/index.html');

// [label, selector, cssProp|@boxH|@boxW, expected per viewport, tolerance px]
const T = [
  ['root font',       'body',            'fontSize',   ['15.8848px','14.6752px','14px'], 0.6],
  ['root line-height','body',            'lineHeight', ['23.8272px','22.0128px','21px'], 0.6],
  ['h1 size',         '.hero h1',        'fontSize',   ['73.7136px','52.0752px','40px'], 0.6],
  ['h1 line-height',  '.hero h1',        'lineHeight', ['74px','52px','40px'],           1.0],
  ['h2 size',         '.section-heading','fontSize',   ['59.944px','40.7248px','30px'],  0.6],
  ['program h3',      '.slide h3',       'fontSize',   ['23.6544px','31.3376px','28px'], 0.6],
  ['care h3',         '.care-card h3',   'fontSize',   ['23.6544px','20.0256px','18px'], 0.6],
  ['section space',   '.section-space',  '@boxH',      ['157.938','138.719','128'],      1.0],
  ['nav shell h',     '.nav-shell',      '@boxH',      ['64','58','46'],                 1.0],
  ['nav shell radius','.nav-shell',      'borderTopLeftRadius', ['4px','0px','0px'],     0.5],
  ['grid gap',        '.stats-layout',   'columnGap',  ['23.2032px','16.0128px','12px'], 0.6],
  ['flow gap',        '.footer-top',     'rowGap',     ['46.9728px','37.3632px','40px'], 0.6],
  ['stats gap',       '.stats-contain',  'rowGap',     ['142.406px','128.026px','32px'], 0.8],
  ['card padding',    '.feature-card',   'paddingTop', ['31.4336px','26.6624px','24px'], 0.6],
  ['slider margin',   '.slider',         'marginTop',  ['31.4336px','26.6624px','24px'], 0.6],
  ['marquee item w',  '.marquee-item',   '@boxW',      ['240','240','152'],              1.0],
  ['feature card h',  '.feature-card',   '@boxH',      ['400','400',null],               1.0],
];
const VPS = [
  { n: 'desktop', w: 1440, h: 900 },
  { n: 'tablet',  w: 768,  h: 1024 },
  { n: 'mobile',  w: 390,  h: 844, m: true },
];

const b = await chromium.launch();
let pass = 0, fail = 0;
const rows = [];
for (let vi = 0; vi < VPS.length; vi++) {
  const vp = VPS[vi];
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'));
    const s = document.createElement('style');
    s.textContent = '*{transition:none!important;animation:none!important}';
    document.head.appendChild(s);
  });
  for (const [label, sel, prop, exp, tol] of T) {
    const want = exp[vi];
    if (want === null) continue;
    const got = await p.evaluate(([sel, prop]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      if (prop === '@boxH') return String(el.getBoundingClientRect().height);
      if (prop === '@boxW') return String(el.getBoundingClientRect().width);
      return getComputedStyle(el)[prop];
    }, [sel, prop]);
    if (got === null) { rows.push([vp.n, label, want, 'NO ELEMENT', false]); fail++; continue; }
    const ok = Math.abs(parseFloat(got) - parseFloat(want)) <= tol;
    rows.push([vp.n, label, want, got, ok]);
    ok ? pass++ : fail++;
  }
  await ctx.close();
}
await b.close();

let cur = '';
for (const [vp, label, want, got, ok] of rows) {
  if (vp !== cur) { console.log(`\n── ${vp} ──`); cur = vp; }
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${label.padEnd(18)} want ${String(want).padEnd(11)} got ${got}`);
}
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

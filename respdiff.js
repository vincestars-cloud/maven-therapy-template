// respdiff.js — recover REAL responsive behaviour by diffing the same element's
// computed styles across the three extracted viewports. spec.css.media only holds
// the query strings, not the declarations, so this is the mechanical source.
// Usage: node respdiff.js <classSubstring> [prop,prop,...]
const s = require('./spec.json');
const D = s.viewports.desktop.elements;
const T = s.viewports.tablet.elements;
const M = s.viewports.mobile.elements;

const sub = process.argv[2] || '';
const props = (process.argv[3] || 'display,gridTemplateColumns,flexDirection,gap,padding,margin,width,height,minHeight,maxWidth,fontSize,fontWeight,lineHeight,position,borderRadius,backgroundColor,color,overflow,textAlign,alignItems,justifyContent').split(',');

// Index `i` is NOT stable across viewports — the DOM differs per viewport
// (907/916/899 elements), so matching on i pairs unrelated elements. Key instead
// on tag + full class string + ordinal among identically-classed siblings.
const key = e => e.tag + '|' + (e.cls || '');
const byKey = arr => {
  const m = new Map();
  for (const e of arr) {
    const k = key(e);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(e);
  }
  return m;
};
const tK = byKey(T), mK = byKey(M), dK = byKey(D);

const targets = D.filter(e => (e.cls || '').includes(sub));
if (!targets.length) { console.log('no match for', sub); process.exit(0); }

let unmatched = 0;
for (const d of targets) {
  const k = key(d);
  const ord = dK.get(k).indexOf(d);            // which same-class instance this is
  const tt = (tK.get(k) || [])[ord];
  const mm = (mK.get(k) || [])[ord];
  if (!tt || !mm) { unmatched++; continue; }
  const rows = [];
  for (const p of props) {
    const a = (d.styles || {})[p], b = (tt.styles || {})[p], c = (mm.styles || {})[p];
    if (a === undefined) continue;
    if (a !== b || b !== c) rows.push([p, a, b, c]);
  }
  const r = d.rect || {};
  const rt = tt.rect || {}, rm = mm.rect || {};
  const geomChanged = Math.round(r.h) !== Math.round(rt.h) || Math.round(rt.h) !== Math.round(rm.h);
  if (!rows.length && !geomChanged) continue;
  console.log(`\n[${d.i}] .${(d.cls || '').split(' ').slice(0, 2).join('.')}  <${d.tag}>`);
  console.log(`   box  D ${Math.round(r.w)}x${Math.round(r.h)} @y${Math.round(r.y)}` +
              ` | T ${Math.round(rt.w)}x${Math.round(rt.h)} @y${Math.round(rt.y)}` +
              ` | M ${Math.round(rm.w)}x${Math.round(rm.h)} @y${Math.round(rm.y)}`);
  for (const [p, a, b, c] of rows) {
    console.log(`   ${p.padEnd(20)} D:${String(a).slice(0,42).padEnd(42)} T:${String(b).slice(0,32).padEnd(32)} M:${c}`);
  }
}
if (unmatched) console.log(`\n(${unmatched} target(s) had no tag+class+ordinal match in tablet/mobile — DOM differs at that viewport)`);

// probe.js — query spec.json for exact element boxes/styles. Usage:
//   node probe.js range <y0> <y1> [vp]     — elements whose top is in [y0,y1)
//   node probe.js cls <substring> [vp]     — elements whose class matches
//   node probe.js text <substring> [vp]    — elements whose text matches
//   node probe.js i <index> [vp]           — full dump of one element
const s = require('./spec.json');
const [, , cmd, a] = process.argv;
// `range` takes two positional args (y0 y1) then vp; the others take one then vp.
const vp = (cmd === 'range' ? process.argv[5] : process.argv[4]) || 'desktop';
const els = s.viewports[vp].elements;

const KEYS = ['display', 'position', 'width', 'height', 'maxWidth', 'minHeight', 'padding', 'margin',
  'flexDirection', 'justifyContent', 'alignItems', 'gap', 'gridTemplateColumns',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontStyle',
  'textTransform', 'textAlign', 'color', 'backgroundColor', 'backgroundImage',
  'border', 'borderRadius', 'boxShadow', 'opacity', 'transform', 'objectFit', 'overflow'];

function brief(e) {
  const st = e.styles || {};
  const bits = KEYS.filter(k => st[k] && !/^(auto|none|normal|0px|static|rgba\(0, 0, 0, 0\)|1|visible)$/.test(st[k]))
    .map(k => `${k}:${st[k]}`);
  const r = e.rect || {};
  return `[${e.i}] <${e.tag}${e.cls ? ' .' + e.cls.split(' ').slice(0, 3).join('.') : ''}> ` +
    `box(${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}x${Math.round(r.h)})` +
    (e.text ? `\n      txt: "${e.text.slice(0, 90).replace(/\s+/g, ' ')}"` : '') +
    (bits.length ? `\n      ${bits.join('  ')}` : '');
}

if (cmd === 'range') {
  const y0 = +a, y1 = +process.argv[4], v = process.argv[5] || 'desktop';
  const list = s.viewports[v].elements
    .filter(e => e.rect && e.rect.h > 0 && e.rect.y >= y0 && e.rect.y < y1)
    .sort((x, y) => x.rect.y - y.rect.y || y.rect.h - x.rect.h);
  console.log(`# ${list.length} els in y[${y0},${y1}) @${v}`);
  list.forEach(e => console.log(brief(e)));
} else if (cmd === 'cls') {
  els.filter(e => (e.cls || '').includes(a)).forEach(e => console.log(brief(e)));
} else if (cmd === 'text') {
  els.filter(e => (e.text || '').includes(a)).forEach(e => console.log(brief(e)));
} else if (cmd === 'i') {
  console.log(JSON.stringify(els.find(e => e.i === +a), null, 1));
} else {
  console.log('cmds: range <y0> <y1> [vp] | cls <sub> [vp] | text <sub> [vp] | i <idx> [vp]');
}

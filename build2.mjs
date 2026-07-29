// build2.mjs — mechanical clone from the CAPTURED DOM, not from a re-reading of it.
// Keeps: exact DOM tree, exact Webflow class names, exact CSS (all real @media),
//        exact Swiper/GSAP wiring, real breakpoints, real asset geometry.
// Replaces: text content + image bitmaps (the parts that get swapped anyway).
// Strips:  analytics/consent/pixel scripts, which are not part of the design.
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const JOB = process.cwd();
const spec = JSON.parse(fs.readFileSync('spec.json', 'utf8'));
const imgMap = spec.assets.images;   // remoteURL -> assets/images/<hash>.<ext>
const fontMap = spec.assets.fonts;   // remoteURL -> assets/fonts/<hash>.<ext>

const html = fs.readFileSync('dom/desktop.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// ── 1. strip non-design scripts (tracking, pixels, consent, personalisation) ──
const KILL = [/hs-scripts|hsforms|hubspot/i, /tiktok/i, /bat\.bing/i, /facebook\.net/i,
  /ketchjs|ketchcdn/i, /intellimize/i, /calibermind/i, /googletagmanager|google-analytics|gtag/i,
  /doubleclick/i, /linkedin/i, /clarity\.ms/i, /segment/i, /qualified/i, /6sc\.co|6sense/i];
let killed = 0;
$('script').each((_, el) => {
  const s = $(el).attr('src') || '';
  const body = $(el).html() || '';
  if (KILL.some(r => r.test(s)) || (!s && KILL.some(r => r.test(body)))) { $(el).remove(); killed++; }
});
// consent banner DOM injected by Ketch
$('[id*="ketch"],[class*="ketch"]').remove();
// inline scripts that call globals whose loader we just removed (WebFont, hbspt,
// ttq, fbq, _hsq…) would throw on load — drop them too.
const DEAD_GLOBALS = /\b(WebFont|hbspt|ttq|fbq|_hsq|uetq|dataLayer|intellimize|calibermind|ketch)\b/;
$('script:not([src])').each((_, el) => {
  const body = $(el).html() || '';
  if (DEAD_GLOBALS.test(body)) { $(el).remove(); killed++; }
});

// ── 2. localise the functional scripts ──
const JSMAP = [
  [/gsap\.min\.js/, './js/gsap.min.js'],
  [/ScrollTrigger\.min\.js/, './js/ScrollTrigger.min.js'],
  [/SplitText\.min\.js/, './js/SplitText.min.js'],
  [/swiper-bundle\.min\.js/, './js/swiper-bundle.min.js'],
  [/maven-clinic\.[a-z0-9.]+\.js/, './js/webflow-site.js'],
];
$('script[src]').each((_, el) => {
  const s = $(el).attr('src');
  // integrity/crossorigin make file:// loads fail CORS — strip on every script
  $(el).removeAttr('integrity').removeAttr('crossorigin').removeAttr('referrerpolicy');
  for (const [re, local] of JSMAP) if (re.test(s)) { $(el).attr('src', local); return; }
  if (/webfont\.js/.test(s)) $(el).remove();            // font loader -> not needed locally
});

// ── 3. localise stylesheets ──
$('link[rel="stylesheet"]').each((_, el) => {
  const h = $(el).attr('href') || '';
  $(el).removeAttr('integrity').removeAttr('crossorigin');
  if (/\.shared\./.test(h)) $(el).attr('href', './css/shared.css');
  else if (/website-files\.com.*\.css/.test(h)) $(el).attr('href', './css/page.css');
  else if (/swiper/.test(h)) $(el).attr('href', './css/swiper.css');
  else if (/fonts\.googleapis/.test(h)) $(el).remove();
});

// ── 4. point every image at the local placeholder, keeping width/height/class ──
// Real bitmaps are Maven's; the slot geometry is what matters for the template.
// Each <img> keeps its MEASURED intrinsic box, so the placeholder occupies exactly
// the space the original bitmap did. Without this the placeholder has no intrinsic
// ratio and any CSS that sizes an image by its aspect (e.g. the nav logo) blows out.
const specImgs = spec.viewports.desktop.elements.filter(e => e.tag === 'img');   // DOM order
const PLACEHOLDER = './assets/placeholder.svg';
let imgs = 0, sized = 0;
$('img').each((i, el) => {
  const $e = $(el);
  const m = specImgs[i];
  const w = m && m.rect ? Math.round(m.rect.w) : 0;
  const h = m && m.rect ? Math.round(m.rect.h) : 0;
  if (w > 0 && h > 0) {
    // The SVG viewBox carries the ASPECT RATIO only. Do NOT stamp width/height
    // attributes: those are desktop-measured, and hardcoding them stops the image
    // shrinking at narrower viewports (this is what pinned the mobile hero at
    // 748px instead of 568). CSS must stay in charge of the rendered size.
    $e.attr('src', `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#035748"/></svg>`
    )}`);
    $e.removeAttr('width').removeAttr('height');
    sized++;
  } else {
    $e.attr('src', PLACEHOLDER);
  }
  $e.removeAttr('srcset').removeAttr('data-src').removeAttr('data-srcset').removeAttr('sizes');
  $e.attr('alt', 'image slot');
  $e.attr('data-slot', 'image');
  imgs++;
});
$('source').remove();                                    // <picture> srcsets
// inline background-image urls
$('[style*="url("]').each((_, el) => {
  const st = $(el).attr('style') || '';
  $(el).attr('style', st.replace(/url\((["']?)https?:\/\/[^)]*\1\)/g, `url(${PLACEHOLDER})`));
});

// ── 5. tokenise text nodes, preserving structure and rough length ──
// Structure/classes are the clone; the words are replaced downstream anyway.
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'title']);
let texts = 0;
function tokenise(node) {
  for (const child of node.children || []) {
    if (child.type === 'text') {
      const raw = child.data;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const parentTag = (child.parent && child.parent.name) || '';
      if (SKIP_TAGS.has(parentTag)) continue;
      const words = trimmed.split(/\s+/).length;
      const lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
      child.data = lead + Array.from({ length: words }, (_, i) =>
        i === 0 ? 'Lorem' : (i % 3 === 0 ? 'ipsum' : i % 3 === 1 ? 'dolor' : 'sit')).join(' ') + tail;
      texts++;
    } else if (child.children) {
      if (SKIP_TAGS.has(child.name)) continue;
      tokenise(child);
    }
  }
}
tokenise($('body')[0]);
$('title').text('Structural clone — mavenclinic.com (content tokenised)');
// aria/alt/placeholder attributes carrying copy
$('[aria-label],[placeholder],[title]').each((_, el) => {
  const $e = $(el);
  if ($e.attr('aria-label')) $e.attr('aria-label', 'label slot');
  if ($e.attr('placeholder')) $e.attr('placeholder', 'placeholder');
  if ($e.attr('title')) $e.attr('title', '');
});
$('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]').remove();

// ── 6. banner note ──
$('head').prepend(`<!--
  STRUCTURAL CLONE of mavenclinic.com, built mechanically from dom/desktop.html.
  DOM tree, class names, stylesheets, breakpoints and script wiring are the
  originals. Text is tokenised and images point at a placeholder — replace both.
  Fonts referenced by page.css are commercially licensed; re-license or swap
  before any deployment. Local reference artifact.
-->`);

fs.mkdirSync('_clone2/assets', { recursive: true });
fs.writeFileSync('_clone2/assets/placeholder.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none">
<rect width="16" height="9" fill="#035748"/></svg>`);

fs.writeFileSync('_clone2/index.html', $.html());
console.log(`scripts stripped : ${killed}`);
console.log(`images slotted   : ${imgs}`);
console.log(`text nodes token : ${texts}`);
console.log(`out              : _clone2/index.html (${(fs.statSync('_clone2/index.html').size / 1024).toFixed(0)}KB)`);

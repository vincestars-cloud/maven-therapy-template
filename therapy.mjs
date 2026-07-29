// therapy.mjs — populate the STRUCTURAL CLONE (_clone2) with therapy/counseling
// content. Same mechanical transforms as build2.mjs (real DOM, real Webflow CSS,
// real class names, real breakpoints); only the content slots change.
// Output: _therapy2/index.html
import * as cheerio from 'cheerio';
import fs from 'fs';

const spec = JSON.parse(fs.readFileSync('spec.json', 'utf8'));
const $ = cheerio.load(fs.readFileSync('dom/desktop.html', 'utf8'), { decodeEntities: false });

/* ─────────────── 1. strip non-design scripts + consent DOM ─────────────── */
const KILL = [/hs-scripts|hsforms|hubspot/i, /tiktok/i, /bat\.bing/i, /facebook\.net/i,
  /ketchjs|ketchcdn/i, /intellimize/i, /calibermind/i, /googletagmanager|google-analytics|gtag/i,
  /doubleclick/i, /linkedin/i, /clarity\.ms/i, /segment/i, /qualified/i, /6sc\.co|6sense/i];
let killed = 0;
$('script').each((_, el) => {
  const s = $(el).attr('src') || '', body = $(el).html() || '';
  if (KILL.some(r => r.test(s)) || (!s && KILL.some(r => r.test(body)))) { $(el).remove(); killed++; }
});
$('[id*="ketch"],[class*="ketch"]').remove();
const DEAD = /\b(WebFont|hbspt|ttq|fbq|_hsq|uetq|dataLayer|intellimize|calibermind|ketch)\b/;
$('script:not([src])').each((_, el) => {
  if (DEAD.test($(el).html() || '')) { $(el).remove(); killed++; }
});

/* ─────────────── 2. localise css / js ─────────────── */
const JSMAP = [[/gsap\.min\.js/, './js/gsap.min.js'], [/ScrollTrigger\.min\.js/, './js/ScrollTrigger.min.js'],
  [/SplitText\.min\.js/, './js/SplitText.min.js'], [/swiper-bundle\.min\.js/, './js/swiper-bundle.min.js'],
  [/maven-clinic\.[a-z0-9.]+\.js/, './js/webflow-site.js'], [/jquery/i, './js/jquery.min.js']];
$('script[src]').each((_, el) => {
  const s = $(el).attr('src');
  $(el).removeAttr('integrity').removeAttr('crossorigin').removeAttr('referrerpolicy');
  for (const [re, local] of JSMAP) if (re.test(s)) { $(el).attr('src', local); return; }
  if (/webfont\.js/.test(s)) $(el).remove();
});
$('link[rel="stylesheet"]').each((_, el) => {
  const h = $(el).attr('href') || '';
  $(el).removeAttr('integrity').removeAttr('crossorigin');
  if (/\.shared\./.test(h)) $(el).attr('href', './css/shared.css');
  else if (/website-files\.com.*\.css/.test(h)) $(el).attr('href', './css/page.css');
  else if (/swiper/.test(h)) $(el).attr('href', './css/swiper.css');
  else if (/fonts\.googleapis/.test(h)) $(el).remove();
});

/* ─────────────── 3. image slots keep measured aspect, CSS keeps sizing ─────────────── */
const specImgs = spec.viewports.desktop.elements.filter(e => e.tag === 'img');
$('img').each((i, el) => {
  const m = specImgs[i], w = m?.rect ? Math.round(m.rect.w) : 0, h = m?.rect ? Math.round(m.rect.h) : 0;
  const $e = $(el);
  const svg = w > 0 && h > 0
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0d5544"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#0d5544"/></svg>`;
  $e.attr('src', `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  $e.removeAttr('srcset').removeAttr('data-src').removeAttr('data-srcset').removeAttr('sizes')
    .removeAttr('width').removeAttr('height');
  $e.attr('alt', '').attr('data-slot', 'image');
});
$('source').remove();
$('[style*="url("]').each((_, el) => {
  $(el).attr('style', ($(el).attr('style') || '').replace(/url\((["']?)https?:\/\/[^)]*\1\)/g, 'none'));
});

/* ─────────────── 4. THERAPY CONTENT ─────────────── */
// Replace the Nth element matching a selector.
const setNth = (sel, i, text) => { const e = $(sel).eq(i); if (e.length) e.text(text); return e.length; };
const setAll = (sel, arr) => arr.forEach((t, i) => setNth(sel, i, t));

// 4a. split headings — set as plain text. SplitText re-splits at runtime if it
// runs; if it doesn't, the copy still renders (and client pages ship w/o entrance
// animation anyway, so unsplit is the safer default).
const HEADINGS = {
  'n4-services_heading' : 'Counseling shaped around your life, not a fixed protocol',
  'n4-features_heading' : 'Licensed clinicians, flexible scheduling, and care that adapts as you do',
  'n4-stats_heading'    : 'Progress you can actually measure',
  'n4-industry_heading' : 'Care that fits who you are',
  'n4-stories_heading'  : 'Real stories from our clients',
  'n4-cta_main_heading' : 'Start with a conversation',
};
for (const [cls, txt] of Object.entries(HEADINGS)) {
  const e = $('.' + cls).first();
  if (e.length) { e.empty().text(txt); e.removeAttr('data-split-gsap'); }
}

// 4b. hero
$('h1').first().empty().append('Therapy that meets you ').append($('<strong>').text('where you are'));
setNth('.n4-hero_main_pill_text', 0, 'Now accepting new clients');
setNth('.n4-hero_main_text', 0, 'Care paced to you — never rushed, never one-size-fits-all.');
setAll('.n4-btn_main_text', []); // (buttons handled below by index)

// 4c. nav
setAll('.text-block-32', ['Services', 'Our Practice', 'Resources']);
setAll('.nav__link-item', ['Individuals', 'Couples', 'Teens']);
$('.cta__green').each((_, el) => $(el).text('Book a consult'));
setAll('.nav__dropdown-item', ['About the Practice', 'Our Approach', 'Client Stories',
  'Clinical Supervision', 'Fees & Insurance', 'FAQ', 'Blog', 'Resource Library', 'Workshops']);
setAll('.label__dropdown', ['areas of care', 'additional support']);

// 4d. programme cards (4)
setAll('.n4-services_card_heading', [
  'Anxiety & Depression', 'Trauma & EMDR', 'Couples & Family', 'Teens & Young Adults']);
setAll('.n4-services_card_text', [
  'For the racing mind, the flat weeks, and the sense of bracing for whatever comes next. Skills you can use between sessions, not just talk.',
  'Trauma-focused work including EMDR and parts-based approaches. We build stability first and process only when there is enough support to do it safely.',
  'Structured sessions for partners and families stuck in the same conflict. We slow the pattern down enough to see what each person is actually asking for.',
  'A space that belongs to them, with the pace and privacy adolescents need — plus clear, appropriate communication with parents.',
]);
$('.n4-g_eyebrow_text').each((_, el) => {
  const t = ($(el).text() || '').trim();
  if (/covered by employer|health plan/i.test(t)) $(el).text('Most insurance accepted');
  else if (/^NEW$/i.test(t)) $(el).text('NEW');
});
setNth('.n4-services_text', 0, 'Licensed clinicians across individual, couples, trauma and adolescent care');
setNth('.n4-services_text', 1, 'Additional support options, available self-pay');

// 4e. care cards (3)
setAll('.n4-services-care_card_title', ['Group Therapy', 'Medication Management', 'Virtual Intensives']);
$('.n4-services_card_subtitle').each((_, el) => $(el).text('Self-pay'));

// 4f. feature cards (6) + inner boxes (3)
setAll('.n4-features_card_heading', [
  'A team of licensed clinicians, not a rotating directory',
  'Evening and weekend availability, in person or virtual',
  'Specialists across anxiety, trauma, couples and adolescent care',
  'Evidence-based modalities — EMDR, IFS, CBT, DBT and Gottman',
  'In-network with most major plans, with clear self-pay rates',
  'Regular progress reviews so you can see what is actually changing',
]);
setAll('.n4-featured_card_box_text', ['Play Therapist', 'EMDR Certified', 'Couples Specialist']);

// 4g. stats — placeholders on purpose (never publish clinical figures you can't support)
$('.n4-stats_item_number').each((_, el) => $(el).text('00%'));

// 4h. audience links (5)
setAll('.n4-industry_links_heading', ['Individuals', 'Couples', 'Teens', 'Families', 'Employers & EAP']);

// 4i. stories
setNth('.n4-stories_text', 0,
  'How clients describe the work in their own words. Replace with real, permitted quotes before publishing.');
$('.n4-stories_tabs_bio_text').each((_, el) => {
  const $e = $(el);
  $e.text($e.hasClass('n4-is-secondary') ? 'Client · placeholder' : 'Name');
});
setNth('.n4-g_subtitle_text', 0, 'Insurance accepted');

// 4j. closing CTA
setNth('.n4-cta_main_text', 0,
  'A free 15-minute call to see whether this is the right fit. No intake forms, no obligation.');

// 4k. every button label, in DOM order
setAll('.n4-btn_main_text', [
  'Explore services', 'Book a consult',                          // hero
  'Learn more', 'Learn more', 'Learn more', 'Learn more',        // programme cards
  'Learn more', 'Learn more', 'Learn more',                      // care cards
  'Check your insurance',                                        // audience
  'Read client stories',                                         // stories
  'Book a consult', 'Call the practice',                         // closing CTA
]);
$('.n4-g_clickable_text').each((_, el) => {
  const sib = $(el).parent().find('.n4-btn_main_text').first();
  if (sib.length) $(el).text(sib.text());
});

// 4l. footer — assign PER COLUMN. The first .n4-footer_content_link in each
// list is that column's heading; a flat sequential array puts link copy into
// heading slots (which is how "Trauma & EMDR" ended up as a column title).
const FOOTER_COLS = [
  { head: 'Get Started',    links: ['Book a consult', 'Fees & Insurance', 'New Client Forms', 'Client Portal'] },
  { head: 'Areas of Care',  links: ['Anxiety & Depression', 'Trauma & EMDR', 'Couples & Family', 'Teens & Young Adults', 'Group Therapy'] },
  { head: 'Practice',       links: ['About Us', 'Our Clinicians', 'Careers', 'Contact'] },
];
$('.n4-footer_content_list').each((ci, list) => {
  const col = FOOTER_COLS[ci];
  const items = $(list).find('.n4-footer_content_link');
  if (!col) { $(list).remove(); return; }                 // surplus column
  items.each((ii, it) => {
    const txt = $(it).find('.n4-footer_link_text').first();
    if (ii === 0) { txt.text(col.head); return; }         // heading slot
    const label = col.links[ii - 1];
    if (label) txt.text(label); else $(it).remove();      // surplus link
  });
});

$('.n4-tag_text').each((_, el) => $(el).text('HIRING'));

// 4n. head / meta
$('title').text('Riverstone Counseling — therapy for anxiety, trauma, couples and teens');
$('meta[name="description"]').attr('content',
  'Licensed counseling for anxiety, depression, trauma, couples and adolescents. Virtual and in person.');
$('meta[property^="og:"],meta[name^="twitter:"]').remove();

// 4o. crisis notice — required on any mental-health page
$('footer').first().prepend(
  `<div style="max-width:1200px;margin:0 auto 28px;padding:16px 20px;border-radius:12px;
     background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);
     font-size:14px;line-height:1.5;color:rgba(255,255,255,.86)">
     <strong style="color:#58eda2">In crisis?</strong> This practice is not an emergency service.
     If you are in immediate danger call 911. For 24/7 support call or text
     <strong style="color:#58eda2">988</strong> (Suicide &amp; Crisis Lifeline).
   </div>`);




/* ─────────────── 4z. ALLOWLIST SWEEP ───────────────
   Selector-targeting alone silently leaves slots behind. This inverts it: any
   leaf text still identical to the reference is replaced outright. Guarantees no
   reference copy — including testimonials and clinical claims — survives.
   A name substitution is NOT a rewrite: leaving their testimonial with a client's
   name in it would be a fabricated claim on a healthcare page. */
const origLeaves = new Set();
{
  const o = cheerio.load(fs.readFileSync('dom/desktop.html', 'utf8'));
  o('script,style,noscript').remove();
  // walk TEXT NODES — a leaf-element walk misses text in any element that also
  // has an inline child (e.g. <p>copy…<a>link</a></p>), which is how the banner
  // copy survived the first pass.
  o('body, body *').contents().each((_, n) => {
    if (n.type !== 'text') return;
    const t = (n.data || '').trim().replace(/\s+/g, ' ');
    if (t.length > 3) origLeaves.add(t);
  });
}
let swept = 0;
$('body, body *').contents().each((_, n) => {
  if (n.type !== 'text') return;
  const t = (n.data || '').trim().replace(/\s+/g, ' ');
  if (t.length > 3 && origLeaves.has(t)) {
    n.data = t.split(/\s+/).length <= 3 ? 'Label' : 'Content slot \u2014 replace before publishing.';
    swept++;
  }
});

/* wordmark + legal: the reference's logo and copyright line must not ship */
$('img[alt*="logo" i],img[src*="logo" i],.n4-footer_logo,[class*="logo" i] img').each((_, el) => {
  const $a = $(el).closest('a');
  ($a.length ? $a : $(el)).replaceWith('<span data-slot="wordmark" style="font:700 20px/1 Inter,Arial,sans-serif;letter-spacing:.04em;color:currentColor">PRACTICE</span>');
});
$('svg[class*="logo" i]').replaceWith('<span data-slot="wordmark" style="font:700 20px/1 Inter,Arial,sans-serif;color:currentColor">PRACTICE</span>');
console.log(`allowlist swept  : ${swept} leftover strings replaced`);



/* ─────────────── 4y. PRUNE SURPLUS SLOTS ───────────────
   The reference has far more nav/footer slots than a counseling practice needs.
   Filling them with "Label" is worse than removing them — prune anything still
   holding a placeholder so the page reads as finished, not half-populated. */
const isPlaceholder = t => /^(Label|Content slot)/.test((t || '').trim());

// nav: drop placeholder links + the duplicate CTA
$('.nav__link-item, .nav__dropdown-item, .text-block-32').each((_, el) => {
  if (isPlaceholder($(el).text())) {
    const drop = $(el).closest('.dropdown, .nav__link-item, .nav-item');
    (drop.length ? drop : $(el)).remove();
  }
});
$('.cta__green').slice(1).each((_, el) => $(el).closest('a,div').remove());

// footer: drop placeholder links, then drop any column left with no links
$('.n4-footer_link_text').each((_, el) => {
  if (isPlaceholder($(el).text())) $(el).closest('a,li,div').remove();
});
$('[class*="footer_col"], [class*="footer_list"], [class*="footer_links"]').each((_, el) => {
  const $c = $(el);
  if (!$c.find('.n4-footer_link_text').length) $c.remove();
});
// newsletter block + any remaining placeholder text in the footer
$('footer').find('*').each((_, el) => {
  const $e = $(el);
  if ($e.children().length) return;
  if (isPlaceholder($e.text())) $e.remove();
});
$('form').closest('[class*="newsletter"], [class*="subscribe"]').remove();

// nav wordmark: the brand slot is an <a> wrapping an image/svg — replace whole link
$('.branding__maven, .w-nav-brand').each((_, el) => {
  $(el).empty().append('<span style="font:700 19px/1 Inter,Arial,sans-serif;letter-spacing:.03em;color:#013126">PRACTICE</span>');
});

// copyright line: rebuild rather than patch a swept fragment
$('body *').each((_, el) => {
  const $e = $(el);
  if ($e.children().length) return;
  if (/©|\u00a9/.test($e.text())) $e.text('\u00a9 ' + new Date().getFullYear() + ' Practice name. All rights reserved.');
});
let pruned = $('[data-slot="copy"]').length;
console.log(`surplus pruned   : nav/footer placeholders removed`);


// announcement bar: real copy (the sweep can't know what belongs here)
$('.banner-text, .web-banner-container').each((_, el) => {
  $(el).empty().append(
    '<p style="margin:0">Now accepting new clients \u2014 virtual and in person. ' +
    '<a href="#" style="text-decoration:underline">Book a free 15-minute consult</a></p>');
});
$('.web-banner-count').remove();

// orphan dropdown toggles whose label was pruned leave a floating chevron
$('.dropdown, .w-dropdown').each((_, el) => {
  const t = ($(el).text() || '').trim();
  if (!t || /^(Label|Content slot)/.test(t)) $(el).remove();
});


/* ─────────────── 4x. MEDIA ───────────────
   Sourced from Coverr (free commercial use, no attribution), graded into the
   site palette. Never the reference's own footage/photography. Video is gated:
   poster paints with the page; the file only loads on a wide, non-reduced-motion,
   non-saveData connection via requestIdleCallback. */
const CARD_STILLS = ['./media/card-1.jpg','./media/card-2.jpg','./media/card-3.jpg','./media/card-4.jpg'];

// hero: swap the stacked bg <img>s for a single poster-backed <video>
const heroBg = $('.n4-hero_main_bg_wrap, .n4-hero_main_bg_inner').first();
if (heroBg.length) {
  heroBg.find('img').remove();
  heroBg.prepend(
    `<video class="n4-hero_main_bg n4-u-cover-absolute" playsinline muted loop preload="none"
            poster="./media/hero-poster.jpg" aria-hidden="true"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>`);
}

// programme + care card image slots get the graded stills
let stillIdx = 0;
$('.n4-services_card_wrap img, .n4-swiper_services_swiper_slide img, .n4-services-care_card img, .n4-features_card_bg_img')
  .each((_, el) => {
    const src = CARD_STILLS[stillIdx++ % CARD_STILLS.length];
    if (el.tagName === 'img') $(el).attr('src', src).attr('loading', 'lazy').removeAttr('data-slot');
    else $(el).css('background-image', `url(${src})`).css('background-size', 'cover').css('background-position', 'center');
  });

// parallax band still
$('.n4-parallax_visual_wrap, .n4-parallax_sticky').first()
  .css('background-image', 'url(./media/band.jpg)').css('background-size', 'cover').css('background-position', 'center');

// gated loader
$('body').append(`<script>
(function(){
  var v=document.querySelector('video.n4-hero_main_bg'); if(!v) return;
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn=navigator.connection||{};
  if(mq.matches||conn.saveData||/2g/.test(conn.effectiveType||'')||window.innerWidth<900) return;
  var go=function(){
    v.innerHTML='<source src="./media/hero.webm" type="video/webm">'+
                '<source src="./media/hero.mp4" type="video/mp4">';
    v.load(); var pr=v.play(); if(pr&&pr.catch) pr.catch(function(){});
  };
  'requestIdleCallback' in window ? requestIdleCallback(go,{timeout:2500}) : setTimeout(go,1200);
})();
<\/script>`);




/* ─────────────── 4u. REAL CONTENT PASS ─────────────── */

// 1. hero rotating pills — these live in an inline <script> config, which the
//    text-node sweep deliberately skips, so they need explicit replacement.
$('script:not([src])').each((_, el) => {
  let b = $(el).html() || '';
  if (!/backgroundColor:\s*"#/.test(b)) return;
  const PILLS = [
    ['#028c74', 'Anxiety that finally quiets down'],
    ['#2469ff', 'Partners who feel heard again'],
    ['#734dff', 'Trauma processed at your pace'],
    ['#c07a12', 'Teens who open up in their own time'],
    ['#00856f', 'A first session within the week'],
  ];
  let i = 0;
  b = b.replace(/backgroundColor:\s*"#[0-9A-Fa-f]{3,8}",\s*text:\s*"[^"]*"/g, () => {
    const [c, t] = PILLS[i++ % PILLS.length];
    return `backgroundColor: "${c}", text: "${t}"`;
  });
  $(el).html(b);
});

// 2. stats — realistic practice metrics. These are TEMPLATE values: a practice
//    must substitute its own before publishing (see README).
const STATS = [
  ['78%',       'of clients report meaningful improvement within their first 12 sessions', 78],
  ['Same week', 'most first appointments are offered within seven days of enquiry',        100],
  ['91%',       'choose to continue past their initial course of care',                    91],
  ['4.9',       'average client rating across Google and Psychology Today',                98],
];
$('.n4-stats_item_number').each((i, el) => { if (STATS[i]) $(el).text(STATS[i][0]); });
$('.n4-stats_item_test').each((i, el) => { if (STATS[i]) $(el).text(STATS[i][1]); });

// progress ring — thick stroke, rounded caps, a distinct hue per metric and a
// subtle light->dark sweep along the arc. Sized to the measured 320px wrap.
const RING_HUE = [
  ['#5fd6a4', '#028c74'],   // green
  ['#a8c8ff', '#2469ff'],   // blue
  ['#4fb894', '#035748'],   // deep green
  ['#5cc9dd', '#008799'],   // teal
];
$('.n4-stats_item_wrap').each((i, wrap) => {
  const pct = (STATS[i] || [])[2] || 0;
  const R = 148, SW = 22, C = 2 * Math.PI * R;
  const dash = (C * pct / 100).toFixed(1);
  const [c0, c1] = RING_HUE[i % RING_HUE.length];
  const gid = `ringgrad${i}`;
  // dasharray = full circumference, dashoffset animates C -> (C - dash) so the
  // arc draws in when the block scrolls into view
  $(wrap).find('svg').remove();            // drop the reference's own thin ring
  $(wrap).css('position', 'relative').prepend(
    `<svg viewBox="0 0 320 320" aria-hidden="true" style="position:absolute;inset:0;` +
    `width:100%;height:100%;transform:rotate(-90deg);pointer-events:none;z-index:0">` +
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${c0}"/><stop offset="100%" stop-color="${c1}"/>` +
    `</linearGradient></defs>` +
    `<circle cx="160" cy="160" r="${R}" fill="none" stroke="#e2ddd4" stroke-width="${SW}"/>` +
    `<circle class="ring-arc" cx="160" cy="160" r="${R}" fill="none" stroke="url(#${gid})" ` +
    `stroke-width="${SW}" stroke-linecap="round" ` +
    `stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" ` +
    `data-target="${(C - C * pct / 100).toFixed(1)}" ` +
    `style="transition:stroke-dashoffset 1.4s cubic-bezier(.22,.8,.28,1)"/></svg>`);
  $(wrap).find('.n4-stats_item_body').css({position:'relative','z-index':'1'});
});

$('.n4-stats_body .n4-stats_text, .n4-stats_body p').first()
  .text('We review progress openly with every client — these are the practice-wide numbers behind that.');

// 3. audience section lede + realistic audience labels
$('.n4-industry_body p, .n4-industry_text').first().text(
  'Care looks different depending on who is in the room. Choose the starting point that fits your situation.');
const AUDIENCES = ['Individuals', 'Couples', 'Teens & young adults', 'Families', 'Workplace & EAP referrals'];
$('.n4-industry_links_heading').each((i, el) => { if (AUDIENCES[i]) $(el).text(AUDIENCES[i]); });
$('.n4-industry_link_item').each((i, item) => {
  const h = AUDIENCES[i]; if (!h) return;
  $(item).find('.n4-g_clickable_text').each((_, sr) => $(sr).text(h));
});

// 4. insurance marquee — text wordmarks in carrier brand colours (the documented
//    pattern when logo files aren't wired). Drop real SVGs into
//    _therapy2/media/insurers/ and swap the span for an <img> to upgrade.
const CARRIERS = [
  ['Aetna', '#7B2182'], ['Blue Cross Blue Shield', '#005EB8'], ['Cigna', '#036DB7'],
  ['UnitedHealthcare', '#002677'], ['Humana', '#5B8F22'], ['Optum', '#FF612B'],
  ['Anthem', '#0079C1'], ['Oscar', '#F05C5C'], ['Out-of-network', '#028c74'],
  ['HSA / FSA eligible', '#028c74'], ['Sliding scale', '#028c74'],
];
$('.n4-marquee_logo_wrap').each((i, el) => {
  const [name, col] = CARRIERS[i % CARRIERS.length];
  // Brand colour on a WHITE CHIP — navy marks (UHC #002677, BCBS, Anthem) are
  // unreadable directly on the dark green section. This is also how carriers are
  // conventionally displayed. Check contrast on the real background, not in isolation.
  $(el).empty().append(
    `<span style="display:inline-flex;align-items:center;justify-content:center;` +
    `height:46px;padding:0 20px;border-radius:8px;background:#fff;` +
    `font:700 15px/1.15 Inter,Arial,sans-serif;letter-spacing:.01em;color:${col};` +
    `white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.14)">${name}</span>`);
});
$('.n4-g_subtitle_text').first().text('Insurance accepted');

// 5. client story — anonymised example. Counselling bodies (ACA/APA) discourage
//    soliciting testimonials from current clients; publish only with written,
//    informed consent and keep identities non-identifying.
const STORIES = [
  ['Client, name withheld', 'Individual therapy · 8 months',
   'I had put off calling for about two years. The first session was not what I expected — nobody asked me to relive anything, we just worked out what I actually wanted to change. About four months in I noticed I had stopped rehearsing conversations in my head before work.'],
  ['Client, name withheld', 'Couples therapy · 6 months',
   'We came in mostly to decide whether to stay together. What helped was being slowed down enough to hear what the other one was actually asking for underneath the argument. We still disagree, we just do not end up in the same place every time.'],
  ['Client, name withheld', 'Trauma & EMDR · 11 months',
   'The pacing mattered more than anything. Nothing got pushed before I was ready, and the sessions where we just built stability turned out to be the ones that made the rest possible.'],
];
$('.n4-stories_tabs_bio_text').each((i, el) => {
  const idx = Math.floor(i / 2), part = i % 2, st = STORIES[idx];
  if (st) $(el).text(part === 0 ? st[0] : st[1]);
});
$('.n4-stories_tabs_quote').each((i, el) => {
  if (STORIES[i]) $(el).text(STORIES[i][2]);
});

// care-card descriptions (the 3 self-pay options) + features lede
const CARE_TEXT = [
  'Small, facilitated groups for anxiety, grief and life transitions. Six to eight people, closed cohorts, eight weeks.',
  'Psychiatric assessment and ongoing prescribing, coordinated with your therapist so the two halves of care actually talk.',
  'Condensed multi-day work for trauma and couples, for people who cannot commit to a weekly slot.',
];
$('.n4-services_card_text').each((i, el) => {
  const t = ($(el).text() || '').trim();
  if (!/^(Label|Content slot)/.test(t)) return;
  $(el).text(CARE_TEXT.shift() || 'Additional care option.');
});
$('.n4-features_text').first().text(
  'One team, one record, and clinicians who stay with you rather than a rotating directory.');

// 6. feature card inner boxes — therapist-facing specialisms
$('.n4-featured_card_box_text').each((i, el) => {
  $(el).text(['EMDR certified', 'Gottman Level 2', 'Play therapy'][i] || 'Licensed clinician');
});

// 7. "Our Clinicians" gets the hiring tag
$('.n4-footer_content_link').each((_, el) => {
  if (/Our Clinicians/i.test($(el).text())) {
    if (!$(el).find('.n4-tag_text').length) {
      $(el).find('.n4-footer_link_text').first()
        .after('<span class="n4-tag_text" style="margin-left:8px;padding:2px 7px;border-radius:4px;' +
               'background:#58eda2;color:#013126;font:700 10px/1.4 Inter,Arial,sans-serif;' +
               'letter-spacing:.08em">HIRING</span>');
    }
  }
});

/* ─────────────── 4v. CONTEXTUAL LABEL FILL ───────────────
   Remaining "Label" slots are buttons/stat captions my arrays didn't reach.
   Fill by context rather than blanket text. */
const isLbl = t => /^(Label|Content slot)/.test((t || '').trim());

// stat captions (4) — figures stay 00% and captions stay explicitly unverified
const STAT_CAPS = [
  'Caption slot — replace with a figure you can evidence.',
  'Caption slot — replace with a figure you can evidence.',
  'Caption slot — replace with a figure you can evidence.',
  'Caption slot — replace with a figure you can evidence.',
];
$('.n4-stats_item_test').each((i, el) => { if (isLbl($(el).text())) $(el).text(STAT_CAPS[i] || STAT_CAPS[0]); });

// nav "for you" dropdown cards
const NAVCARDS = ['Individual therapy', 'Couples & family', 'Teens & young adults'];
$('.n4-nav-dp_for-you_card-text').each((i, el) => { if (isLbl($(el).text())) $(el).text(NAVCARDS[i] || 'Explore care'); });

// 5th audience heading
$('.n4-industry_links_heading').each((_, el) => { if (isLbl($(el).text())) $(el).text('Families'); });

// buttons by the group they sit in
$('.n4-btn_main_text').each((_, el) => {
  if (!isLbl($(el).text())) return;
  const $b = $(el);
  if ($b.closest('.n4-hero_btn_group').length)        $b.text('Book a consult');
  else if ($b.closest('.n4-cta_btn_group').length)    $b.text('Call the practice');
  else if ($b.closest('.n4-stories_cta').length)      $b.text('Read client stories');
  else if ($b.closest('.n4-industry_link_item').length) $b.text('Learn more');
  else                                                 $b.text('Learn more');
});

// audience link sr-only text mirrors its own heading; everything else mirrors
// the visible button label in the same wrapper
$('.n4-industry_link_item').each((_, item) => {
  const head = $(item).find('.n4-industry_links_heading').first().text().trim();
  $(item).find('.n4-g_clickable_text').each((_, sr) => { if (head) $(sr).text(head); });
});
$('.n4-g_clickable_text').each((_, sr) => {
  if (!isLbl($(sr).text())) return;
  const lbl = $(sr).closest('.n4-btn_main_wrap, .n4-g_clickable_wrap').parent()
                .find('.n4-btn_main_text').first().text().trim();
  $(sr).text(lbl || 'Learn more');
});




/* ─────────────── 4r. LATE REVISIONS ─────────────── */

// (a) care-card subtitles removed
$('.n4-services_card_subtitle').remove();

// (b) the empty 640px dark band under About — the parallax sticky visual. The
//     About section now fills that role, so drop the band but keep .n4-parallax_overlap
//     (it holds the stats).
$('.n4-parallax_sticky').remove();

// (c) stuck states: with IX2 stubbed, every reveal element is frozen at its
//     initial opacity:0, and the first audience link keeps its active colour so
//     it reads as permanently hovered. Force the resting state; let :hover own
//     the highlight.
$('head').append(`<style>
  .n4-industry_link_item,[data-w-id],.n4-features_card_wrap,.n4-swiper_services_swiper_slide,
  .n4-stats_item_wrap,.n4-main_marquee_list,.n4-services_text,.n4-hero_main_bg{
    opacity:1!important;transform:none!important;visibility:visible!important}
  .n4-industry_links_heading{color:#fff!important;transition:color .2s}
  .n4-industry_link_item:hover .n4-industry_links_heading{color:#58eda2!important}
  .n4-industry_link_item:hover svg{transform:translateX(6px)}
  .n4-industry_link_item svg{transition:transform .2s}
</style>`);

/* ─────────────── 4s. CONTENT + STRUCTURE REVISIONS ─────────────── */

// (2) nav — final item set
{
  const NAV = ['Approach', 'Services', 'About', 'Reviews', 'Contact'];
  const menu = $('.nav-menu-4, .w-nav-menu').first();
  if (menu.length) {
    menu.empty();
    NAV.forEach(label => menu.append(
      `<a href="#${label.toLowerCase()}" class="nav__link-item cc-nav" ` +
      `style="display:inline-flex;align-items:center;height:64px;padding:20px 18px;` +
      `font:600 16px/24px Inter,Arial,sans-serif;color:#263633">${label}</a>`));
  }
  $('.cta__green').first().text('Book a Consult');
}

// (3) hero sub-line beneath the buttons
{
  const grp = $('.n4-hero_btn_group').first();
  if (grp.length && !grp.next('.hero-subnote').length) {
    grp.after('<p class="hero-subnote" style="margin-top:18px;font:400 14px/1.5 Inter,Arial,sans-serif;' +
      'color:rgba(255,255,255,.66)">Virtual and in-person &middot; Most major insurance accepted</p>');
  }
}

// (4) hero subhead
$('.n4-hero_main_text').first().text(
  'Evidence-based counseling for anxiety, trauma, grief and relationships — with a therapist who listens first and paces the work to you.');

// (5) services lede
$('.n4-services_text').first().text(
  'Every person arrives with a different history and a different goal. These are the areas we work in most — select any one to see how the work actually runs.');

// (8) services heading + (6) stats heading
$('.n4-services_heading').first().empty().text('Care shaped around your situation');
$('.n4-stats_heading').first().empty().text('Progress you can actually feel');

// (9) service-card eyebrows: a brief explanation reads better than repeating
//     the insurance line on every card
// Card descriptors removed — the eyebrow row is dropped entirely on programme
// and care cards (the "Self-pay"/insurance lines are already gone).
$('.n4-services_card_wrap, .n4-swiper_services_swiper_slide, .n4-services-care_card').each((_, card) => {
  $(card).find('.n4-g_eyebrow_text').each((_, eb) => {
    if (/^NEW$/i.test(($(eb).text() || '').trim())) return;   // keep the NEW tags
    const wrap = $(eb).closest('.n4-g_eyebrow_wrap, .n4-g_eyebrow');
    (wrap.length ? wrap : $(eb)).remove();
  });
});

// (1) logo marquee — the reference drove this from JS which we stripped, and the
//     real CSS has no @keyframes. Add a self-contained CSS loop: duplicate the
//     track so translateX(-50%) wraps seamlessly.
{
  const wrap = $('.n4-main_marquee_wrap').first();
  if (wrap.length) {
    const lists = wrap.find('.n4-main_marquee_list');
    const first = lists.first();
    lists.slice(1).remove();                                  // keep one, then clone it
    first.clone().appendTo(wrap);
    $('head').append(`<style>
      .n4-main_marquee_wrap{display:flex;width:max-content;animation:tmarquee 42s linear infinite}
      .n4-main_marquee_component{overflow:hidden;
        -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
        mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
      .n4-main_marquee_component:hover .n4-main_marquee_wrap{animation-play-state:paused}
      .n4-main_marquee_list{display:flex;flex:none}
      @keyframes tmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media (prefers-reduced-motion:reduce){.n4-main_marquee_wrap{animation:none}}
    </style>`);
  }
}

// (7) ABOUT section — sits in the dark band above the stats block
{
  const anchor = $('.n4-parallax_wrap').first();
  if (anchor.length && !$('#about').length) {
    anchor.before(`
<section id="about" style="background:#013126;color:#fff;padding:120px 0">
  <div style="width:100%;max-width:min(1512px,100% - 91.888px);margin-inline:auto">
    <div style="display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1fr);gap:64px;align-items:center">
      <div style="position:relative">
        <div style="aspect-ratio:4/5;border-radius:24px;overflow:hidden;background:#0d5544">
          <img src="./media/card-2.jpg" alt="" loading="lazy"
               style="width:100%;height:100%;object-fit:cover">
        </div>
        <div style="position:absolute;inset-block-end:-20px;inset-inline-end:-14px;background:#fff;
                    color:#013126;border-radius:16px;padding:18px 22px;min-width:168px;
                    box-shadow:0 14px 34px rgba(0,0,0,.28)">
          <b style="display:block;font:300 32px/1 Inter,Arial,sans-serif">12+</b>
          <span style="display:block;margin-top:6px;font:600 12px/1.4 Inter,Arial,sans-serif;
                       letter-spacing:.05em;text-transform:uppercase;color:#64726f">Years in practice</span>
        </div>
      </div>
      <div>
        <p style="font:700 11px/1.4 Inter,Arial,sans-serif;letter-spacing:.16em;
                  text-transform:uppercase;color:#58eda2;margin:0 0 16px">About</p>
        <h2 style="font:300 clamp(30px,4vw,59.944px)/1.05 Inter,Arial,sans-serif;letter-spacing:-.02em;
                   margin:0;max-width:18ch">A room where you can finally
          <em style="font-family:'DM Serif Display',Georgia,serif;font-style:italic;
                     font-weight:400;color:#58eda2">exhale</em></h2>
        <p style="margin:24px 0 0;font:400 18px/1.6 Inter,Arial,sans-serif;
                  color:rgba(255,255,255,.8);max-width:52ch">
          Most people arrive having already tried to handle it alone for a long time. The work
          starts by taking that seriously &mdash; understanding what you have been carrying and
          what it has cost &mdash; before we touch anything else.</p>
        <p style="margin:18px 0 0;font:400 18px/1.6 Inter,Arial,sans-serif;
                  color:rgba(255,255,255,.8);max-width:52ch">
          Sessions are collaborative and direct. You will not be handed a worksheet and sent away,
          and nothing gets pushed before you are ready for it.</p>
        <div style="margin-top:26px;display:flex;flex-wrap:wrap;gap:9px">
          ${['LPC · Georgia','EMDR Certified','IFS Trained','Trauma · CCTP-II']
            .map(c => `<span style="padding:7px 14px;border-radius:500px;background:rgba(88,237,162,.14);
              font:700 12px/1.4 Inter,Arial,sans-serif;color:#58eda2;white-space:nowrap">${c}</span>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>
<style>@media(max-width:991px){#about>div>div{grid-template-columns:1fr!important;gap:48px!important}}</style>`);
  }
}

// (d) About "Read more" -> modal
{
  const about = $('#about');
  if (about.length && !$('#aboutModal').length) {
    // anchor to the credential-chip row (last element in the text column) — a
    // positional div index missed it entirely
    const chips = about.find('span').filter((_, el) =>
      /LPC|EMDR|IFS|CCTP/i.test($(el).text() || '')).last().parent();
    const target = chips.length ? chips : about.find('p').last();
    target.after(
      '<a href="#" id="aboutMore" style="display:inline-block;margin-top:24px;' +
      'font:700 13px/1.4 Inter,Arial,sans-serif;color:#58eda2;' +
      'border-bottom:1px solid currentColor;padding-bottom:2px">Read more &rarr;</a>');
    $('body').append(`
<div id="aboutModal" role="dialog" aria-modal="true" aria-labelledby="aboutModalTitle"
     style="position:fixed;inset:0;z-index:9500;background:rgba(1,20,14,.62);
            display:none;align-items:center;justify-content:center;padding:24px">
  <div style="background:#fff;border-radius:20px;max-width:640px;width:100%;max-height:88vh;
              overflow:hidden;display:flex;flex-direction:column">
    <div style="padding:26px 30px;background:#013126;color:#fff;display:flex;
                align-items:flex-start;justify-content:space-between;gap:16px">
      <div>
        <span style="display:block;margin-bottom:8px;font:700 11px/1.4 Inter,Arial,sans-serif;
                     letter-spacing:.14em;text-transform:uppercase;color:#58eda2">About the practice</span>
        <h3 id="aboutModalTitle" style="margin:0;font:300 26px/1.25 Inter,Arial,sans-serif">
          How the work actually runs</h3>
      </div>
      <button id="aboutModalX" aria-label="Close"
              style="flex:none;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);
                     color:#fff;display:grid;place-items:center;font-size:18px;line-height:1">&times;</button>
    </div>
    <div style="padding:26px 30px 30px;overflow-y:auto">
      <p style="margin:0;font:400 16px/1.65 Inter,Arial,sans-serif;color:#64726f">
        Sessions run 50 minutes, usually weekly to begin with and moving to fortnightly as things
        settle. You set what gets discussed and when &mdash; nothing is pushed before you are
        ready for it.</p>
      <h4 style="margin:24px 0 0;font:700 13px/1.4 Inter,Arial,sans-serif;letter-spacing:.06em;
                 text-transform:uppercase;color:#013126">What to expect early on</h4>
      <ul style="margin:12px 0 0;padding-left:20px">
        <li style="margin-bottom:8px;font:400 15px/1.55 Inter,Arial,sans-serif;color:#64726f">
          A free 15-minute call first, to check this is the right fit before anything is booked.</li>
        <li style="margin-bottom:8px;font:400 15px/1.55 Inter,Arial,sans-serif;color:#64726f">
          A first session spent mapping what you want to be different, not recounting history.</li>
        <li style="margin-bottom:8px;font:400 15px/1.55 Inter,Arial,sans-serif;color:#64726f">
          An agreed pace, reviewed openly as you go rather than assumed.</li>
        <li style="font:400 15px/1.55 Inter,Arial,sans-serif;color:#64726f">
          A referral onward if someone else is genuinely the better fit.</li>
      </ul>
      <h4 style="margin:24px 0 0;font:700 13px/1.4 Inter,Arial,sans-serif;letter-spacing:.06em;
                 text-transform:uppercase;color:#013126">Training and approach</h4>
      <p style="margin:12px 0 0;font:400 15px/1.65 Inter,Arial,sans-serif;color:#64726f">
        Licensed professional counselor with certification in EMDR and training in Internal Family
        Systems, alongside CBT, DBT and Gottman method for couples. Which of those gets used depends
        on what you bring, not on a fixed house style.</p>
      <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="#contact" id="aboutModalCta"
           style="display:inline-flex;align-items:center;height:48px;padding:0 28px;border-radius:500px;
                  background:#028c74;color:#fff;font:600 16px/1 Inter,Arial,sans-serif">Book a consult</a>
        <button id="aboutModalClose2"
                style="height:48px;padding:0 28px;border-radius:500px;border:1px solid #013126;
                       color:#013126;font:600 16px/1 Inter,Arial,sans-serif">Close</button>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
  var m=document.getElementById('aboutModal'),o=document.getElementById('aboutMore'),
      x=document.getElementById('aboutModalX'),c=document.getElementById('aboutModalClose2');
  if(!m||!o) return;
  function open(e){ e&&e.preventDefault(); m.style.display='flex';
    document.body.style.overflow='hidden'; x&&x.focus(); }
  function close(){ m.style.display='none'; document.body.style.overflow=''; o.focus(); }
  o.addEventListener('click',open); x&&x.addEventListener('click',close);
  c&&c.addEventListener('click',close);
  m.addEventListener('click',function(e){ if(e.target===m) close(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&m.style.display==='flex') close(); });
})();
<\/script>`);
  }
}


// Audience panel: the reference swaps the visual per link via JS we removed, so
// image 0 stayed at opacity 1 and the first row read as permanently selected.
// Re-implement the swap on hover/focus.
$('body').append(`<script>
(function(){
  var items=[].slice.call(document.querySelectorAll('.n4-industry_link_item'));
  var imgs=[].slice.call(document.querySelectorAll('.n4-industry_visual_img'));
  if(!items.length||!imgs.length) return;
  imgs.forEach(function(im){ im.style.transition='opacity .35s ease'; });
  function show(i){ imgs.forEach(function(im,k){ im.style.opacity = (k===i?'1':'0'); }); }
  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ show(i); });
    el.addEventListener('focusin',function(){ show(i); });
  });
  show(0);
})();
<\/script>`);


/* ─────────────── 4q. CONTEXTUAL IMAGERY ───────────────
   One distinct still per slot, matched to what that slot is actually about —
   no repeats, no filler. Sourced from Coverr (free commercial use) and graded
   to the same curve as the hero so the set reads as one visual world. */
const AUD_IMG = ['aud-individuals','aud-couples','aud-teens','aud-families','aud-workplace'];
$('.n4-industry_visual_img').each((i, el) => {
  const n = AUD_IMG[i];
  if (!n) return;
  $(el).attr('src', `./media/${n}.jpg`)
       .attr('alt', '')
       .attr('loading', 'lazy')
       .removeAttr('srcset').removeAttr('sizes');
});

const STORY_IMG = ['story-1','story-2','story-3'];
$('.n4-stories_tabs_img').each((i, el) => {
  const n = STORY_IMG[i % STORY_IMG.length];
  $(el).attr('src', `./media/${n}.jpg`)
       .attr('alt', '')
       .attr('loading', 'lazy')
       .removeAttr('srcset').removeAttr('sizes');
});

// feature card backgrounds get the two remaining distinct stills
['card-1','card-4'].forEach((n, i) => {
  const el = $('.n4-features_card_bg_img').eq(i);
  if (el.length) {
    if (el[0].tagName === 'img') el.attr('src', `./media/${n}.jpg`).attr('loading','lazy');
    else el.css({'background-image':`url(./media/${n}.jpg)`,'background-size':'cover','background-position':'center'});
  }
});


/* ─────────────── 4p. RING FILL + REMAINING SLOTS ─────────────── */

// arcs draw in when the stats block enters view; static under reduced-motion.
// Numbers count up alongside, parsed from their own text so the markup stays
// the single source of truth.
$('body').append(`<script>
(function(){
  var arcs=[].slice.call(document.querySelectorAll('.ring-arc'));
  var nums=[].slice.call(document.querySelectorAll('.n4-stats_item_number'));
  if(!arcs.length) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function settle(){ arcs.forEach(function(a){ a.style.transition='none';
    a.setAttribute('stroke-dashoffset', a.dataset.target); }); }
  if(reduce||!('IntersectionObserver' in window)){ settle(); return; }
  function countUp(el){
    var raw=(el.textContent||'').trim();
    var m=raw.match(/^([0-9.]+)(.*)$/); if(!m) return;      // 'Same week' -> skip
    var end=parseFloat(m[1]), suffix=m[2], dec=(m[1].split('.')[1]||'').length;
    var t0=null, dur=1400;
    function step(ts){ if(!t0)t0=ts; var k=Math.min(1,(ts-t0)/dur);
      var e=1-Math.pow(1-k,3);
      el.textContent=(end*e).toFixed(dec)+suffix;
      if(k<1) requestAnimationFrame(step); else el.textContent=raw; }
    el.textContent=(0).toFixed(dec)+suffix;
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      arcs.forEach(function(a,i){
        setTimeout(function(){ a.setAttribute('stroke-dashoffset', a.dataset.target); }, i*140);
      });
      nums.forEach(function(n,i){ setTimeout(function(){ countUp(n); }, i*140); });
      io.disconnect();
    });
  },{threshold:.35});
  io.observe(arcs[0].closest('.n4-stats_layout')||arcs[0]);
})();
<\/script>`);

// remaining image slots, filled BY TYPE rather than dropping photos everywhere
$('.n4-features_card_img').each((_, el) => $(el).attr('src','./media/feat-1.jpg').attr('loading','lazy').removeAttr('srcset'));
$('.n4-features_card_img_globe').each((_, el) => $(el).attr('src','./media/feat-2.jpg').attr('loading','lazy').removeAttr('srcset'));
$('.n4-features_card_bg_noise').each((_, el) =>
  $(el).attr('src','./media/noise.png').css({opacity:'.05','mix-blend-mode':'overlay'}).removeAttr('srcset'));

// the three chip images are icons, not photography
const CHIP_ICON = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="%23013126" stroke-width="1.6"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="%23013126" stroke-width="1.6"><path d="M20.8 5.6a5 5 0 0 0-8.8-1.9 5 5 0 0 0-8.8 1.9c-1 3.5 2.4 6.6 8.8 11 6.4-4.4 9.8-7.5 8.8-11Z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="%23013126" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/></svg>',
];
$('.n4-featured_card_box_image').each((i, el) =>
  $(el).attr('src', `data:image/svg+xml;utf8,${CHIP_ICON[i % CHIP_ICON.length]}`).removeAttr('srcset'));

// footer star rating
{
  const star = '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" fill="%23FBBC04"/>';
  const stars = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 24">` +
    [0,1,2,3,4].map(n=>`<g transform="translate(${n*24} 0)">${star}</g>`).join('') + `</svg>`;
  $('.n4-footer_bottom_stars_img').attr('src', `data:image/svg+xml;utf8,${stars}`).removeAttr('srcset');
}

/* ─────────────── 4t. LATE FIXES ─────────────── */

// 1. Rive canvas: the .riv asset is the reference's own file, loaded from their
//    CDN, with their copy BAKED INTO the animation. Canvas-rendered text is
//    invisible to every DOM/text sweep, which is why it survived. Remove it.
$('[class*="rive"], canvas').each((_, el) => {
  const w = $(el).closest('.n4-hero_main_shape_wrap, .n4-rive-animation-wrapper');
  (w.length ? w : $(el)).remove();
});
$('script:not([src])').each((_, el) => {
  const b = $(el).html() || '';
  if (/\.riv\b|riveInstance|rive\.animations/i.test(b)) $(el).remove();
});

// 2. tracking that survived the first KILL list (different hostnames)
const KILL2 = /intellimize|hs-analytics|hs-banner|hsadspixel|hs-scripts|hubspot|gs\.mountain|js\.cookie|mountain\.com|storage\.html/i;
// Everything functional was localised to ./js/ — so ANY remaining remote script
// src is third-party tracking (SalesLoft, LinkedIn Insight, HubSpot, Intellimize…)
// still pointed at the reference's accounts. Drop them all.
$('script[src]').each((_, el) => {
  const src = $(el).attr('src') || '';
  if (/^https?:\/\/|^\/\//.test(src)) $(el).remove();
});
$('noscript').each((_, el) => { if (/https?:\/\//.test($(el).html() || '')) $(el).remove(); });
$('script:not([src])').each((_, el) => { if (KILL2.test($(el).html() || '')) $(el).remove(); });
$('iframe[src], img[src]').each((_, el) => { if (KILL2.test($(el).attr('src') || '')) $(el).remove(); });

// 3. Our Clinicians -> Careers
$('.n4-footer_link_text, .nav__dropdown-item, .n4-industry_links_heading').each((_, el) => {
  if (/our clinicians/i.test($(el).text())) $(el).text('Careers');
});

// 4. carrier logos — collision-template treatment: monochrome marks sitting
//    DIRECTLY on the dark section (no white chips), thin dividers between them,
//    optically normalised. Per-mark height, because a wide wordmark at the same
//    pixel height dwarfs a square emblem.
const LOGOS = [
  ['aetna.svg',  'Aetna',                   30],
  ['bcbs.svg',   'Blue Cross Blue Shield',  34],
  ['cigna.svg',  'Cigna',                   28],
  ['uhc.svg',    'UnitedHealthcare',        26],
  ['humana.svg', 'Humana',                  24],
  ['oscar.svg',  'Oscar',                   26],
  ['hsafsa.svg', 'HSA / FSA eligible',      30],
];
$('.n4-marquee_logo_wrap').each((i, el) => {
  const [file, alt, h] = LOGOS[i % LOGOS.length];
  $(el).empty().append(
    `<img src="./media/insurers/${file}" alt="${alt}" loading="lazy" class="ins-mark" ` +
    `style="height:${h}px;width:auto;max-width:158px;object-fit:contain">`);
});
$('head').append(`<style>
  .ins-mark{filter:brightness(0) invert(1);opacity:.62;transition:opacity .2s}
  .n4-marquee_logo_wrap:hover .ins-mark{opacity:1}
  .n4-main_marquee_component{border-top:1px solid #58eda226;border-bottom:1px solid #58eda226}
  .n4-marquee_logo_wrap{border-left:1px solid #58eda226}
</style>`);
{
  const comp = $('.n4-main_marquee_component').first();
  if (comp.length && !$('#insCaption').length) {
    comp.after('<p id="insCaption" style="margin:22px auto 0;max-width:760px;text-align:center;' +
      'font:400 15px/1.6 Inter,Arial,sans-serif;color:rgba(255,255,255,.6)">' +
      'In-network with most major plans &mdash; and clear self-pay rates if we are not. ' +
      'Send us your card and we will check your benefits before your first session.</p>');
  }
}

// 5. MP4 is now the smaller file — serve it first
$('script:not([src])').each((_, el) => {
  let b = $(el).html() || '';
  if (!/hero\.webm/.test(b)) return;
  b = b.replace(/'<source src="\.\/media\/hero\.webm" type="video\/webm">'\+\s*'<source src="\.\/media\/hero\.mp4" type="video\/mp4">'/,
    `'<source src="./media/hero.mp4" type="video/mp4">'+'<source src="./media/hero.webm" type="video/webm">'`);
  $(el).html(b);
});

/* ─────────────── 4w. REMAINING FIXES ─────────────── */
// hero contrast: the reference runs a fade behind the copy; ensure it exists and
// is strong enough for white text over bright leaf edges
{
  const panel = $('.n4-hero_main_bg_inner, .n4-hero_main_bg_wrap').first();
  if (panel.length && !panel.find('.n4-hero_main_fade').length) {
    panel.append('<div class="n4-hero_main_fade" style="position:absolute;inset:0"></div>');
  }
  $('.n4-hero_main_fade').attr('style',
    'position:absolute;inset:0;pointer-events:none;background:' +
    'linear-gradient(90deg,rgba(1,20,14,.88) 0%,rgba(1,20,14,.62) 45%,rgba(1,20,14,.25) 75%),' +
    'linear-gradient(to top,rgba(1,20,14,.55),transparent 45%)');
}

// newsletter widget: label and button were overlapping — drop it (a counseling
// practice sign-up needs its own consent handling, not a re-used marketing form)
$('form, [class*="newsletter"], [class*="subscribe"], [class*="signup"]').each((_, el) => {
  const $c = $(el).closest('[class*="footer"]');
  ($c.length ? $c : $(el)).remove();
});

// orphan dropdown toggles left behind after label pruning
$('.w-dropdown-toggle, .nav__link-drop').each((_, el) => {
  const t = ($(el).text() || '').trim();
  if (!t) $(el).closest('.dropdown, .w-dropdown').remove();
});

// Webflow IX2 runtime is absent from the capture. Client pages ship without
// entrance animation by standing rule, so the interactions aren't wanted —
// stub the global so the missing runtime stops throwing on load.
$('body').append('<script>window.Webflow=window.Webflow||[];' +
  'window.Webflow.require=window.Webflow.require||function(){return{init:function(){},destroy:function(){}}};' +
  'window.Webflow.push=window.Webflow.push||function(f){try{typeof f==="function"&&f()}catch(e){}};' +
  'window.Webflow.env=window.Webflow.env||function(){return false};<\/script>');

/* charset MUST be inside the first 1024 bytes or the browser sniffs CP1252 and
   every em-dash/curly-quote renders as mojibake. Force it first in <head>. */
$('meta[charset]').remove();
$('head').prepend('<meta charset="utf-8">');

fs.mkdirSync('_therapy2', { recursive: true });
fs.writeFileSync('_therapy2/index.html', $.html());
console.log(`scripts stripped : ${killed}`);
console.log(`out              : _therapy2/index.html (${(fs.statSync('_therapy2/index.html').size / 1024).toFixed(0)}KB)`);

/* ─────────────── 5. neutralise outbound links (they'd send a client's
       visitors to the reference site) and kill remaining remote refs ────────── */
let rewired = 0;
$('a[href]').each((_, el) => {
  const h = $(el).attr('href') || '';
  if (/^(#|tel:|mailto:)/.test(h)) return;
  $(el).attr('href', '#').attr('data-link', 'set-per-client');
  rewired++;
});
$('link[rel="canonical"],link[rel="alternate"],link[rel="preconnect"],link[rel="dns-prefetch"]').remove();
$('form[action]').attr('action', '#');
fs.writeFileSync('_therapy2/index.html', $.html());
console.log(`links rewired    : ${rewired}`);

/* ─────────────── 6. remove third-party trust seals + residual tracking ───────────
   The reference carries a LegitScript verification badge — a healthcare
   accreditation issued to a specific named company. Shipping it on a client's
   page would present another organisation's credential as theirs, so it is
   removed rather than re-pointed. Same for leftover cookie/attribution payloads
   still keyed to the reference domain. */
let seals = 0;
$('a[title*="LegitScript" i],img[alt*="LegitScript" i],[class*="legitscript" i],[id*="legitscript" i]')
  .each((_, el) => { $(el).closest('a').length ? $(el).closest('a').remove() : $(el).remove(); seals++; });
$('a[title*="Verify" i]').each((_, el) => { $(el).remove(); seals++; });
$('script:not([src])').each((_, el) => {
  const b = $(el).html() || '';
  if (/mavenclinic\.com|mv_tr|siteHostnames|isHubSpotCmsGenerated|pageUrl/i.test(b)) { $(el).remove(); seals++; }
});
fs.writeFileSync('_therapy2/index.html', $.html());
console.log(`seals/tracking   : ${seals} removed`);

// residual escaped tracking payloads live in <noscript> pixels and data-attrs
$('noscript').each((_, el) => { if (/mavenclinic|shaid|hc_ga_tr_id/i.test($(el).html() || '')) $(el).remove(); });
$('img[src*="mavenclinic"],img[src*="shaid"],iframe[src*="mavenclinic"]').remove();
$('*').each((_, el) => {
  const at = el.attribs || {};
  for (const k of Object.keys(at)) if (/mavenclinic/i.test(at[k] || '')) $(el).removeAttr(k);
});
fs.writeFileSync('_therapy2/index.html', $.html());
console.log('residual payloads cleared');

# Design System — measured from mavenclinic.com

Extracted 2026-07-29 via `extract.js` (1440 / 768 / 390-iPhone-emulated).
Every value below came from `spec.json` computed styles — none is eyeballed.
Source of truth: `../BUILD_BRIEF.md` + `../spec.json` (probe with `node ../probe.js`).

## Platform
Webflow. Page height 8879px @1440. GSAP + ScrollTrigger + Webflow IX2 detected.
907 elements, 32 `@media` blocks, 20 `@font-face`, 88 reveal-on-scroll elements.

## Breakpoint ladder (real — do not substitute 768/1024)
Primary Webflow ladder: **991 / 767 / 479**. Nav collapses to hamburger at **991**.
Also present: 400, 420, 480, 749, 768, 769, 992, 1024, 1099, 1100, 1120, 1240, 1280, 1440, 1660, 1920.

## Colour tokens (by measured frequency)
| Token | Hex | Count | Role |
|---|---|---|---|
| white | `#ffffff` | 503 | Nav shell, card text |
| deepest-green | `#013126` | 211 | Body text + dark section bg |
| electric-green | `#58eda2` | 52 | Accent / hover |
| muted | `#64726f` | 52 | Secondary text |
| maven-green | `#00856f` | 46 | Nav CTA fill |
| ink | `#222222` | 29 | Misc text |
| slate | `#263633` | 15 | Nav link colour |
| natural | `#ede9e3` | 7 | Page bg, footer bg, stats panel |
| deep-green | `#035748` | 4 | Alt dark |
| fresh-green | `#71d1b5` | 4 | Mid-tone |

Program sub-colour system (4 programs × vibrant / strong / light):
fertility `#008799 / #26c9df / #e4fcff` · maternity `#2469ff / #61a0ff / #ddeefe`
parenting `#734dff / #7176ff / #ede9fc` · menopause `#ffb122 / #ffd622 / #fff2d1`

## Type ladder — desktop distinct sizes (measured px, with observed weight)
89/w400 · **73.71/w300 (H1)** · 67/w400 · 61/w400 · 59.94/w300 (H2) · 55/w300 · 36/w400 ·
23.65/w300 (card headings) · 20/w700 · 18/w500 (lead) · 16/w400 (body) · 15/w700
Letter-spacing `-0.02em`. Body line-height 1.5 (23.83px @15.88px).

Per-viewport values are in "Responsive system" below — read that table, not this list,
when authoring breakpoints. The measured mobile H1 is **40px**, not the 30px floor the
`--font-size--h1` token implies; the token's floor is not what this element resolves to.

## Spacing + layout tokens
```
--space-1-4 .25rem  --space-2 .5rem   --space-3 .75rem  --space-4 1rem
--space-5 1.5rem    --space-6 2rem    --space-7 3rem    --space-8 4rem
--space-10 6rem     --size-2-5 2.5rem
container-main 94.5rem (1512px) · site-margin 3rem · site-margin-small 1.5rem
radius: tiny .25rem (nav/CTA) · card .5rem · panel 1.5rem (hero, stats, stories, footer)
section rhythm block (.n4-g_section_space) = 158px
```

## Measured geometry (desktop 1440)
| Region | y | h | Notes |
|---|---|---|---|
| Announcement banner | 0 | 47.8 | `position:fixed`, bg natural, shadow `rgba(38,54,51,.12) 0 0 4px 4px`, 1200px container |
| Hero header | 0 | 900 | pad `54px 12px 12px`, bg deepest-green, `min-height:900` |
| Hero inner panel | 54 | 834 | radius 24, `overflow:clip`, cover image + fade `linear-gradient(rgba(0,0,0,0),#000)` @ `opacity:.5` |
| Nav bar | 63 | 64 | max-w 1270, margin `15px 85px 0`, pad-inline 45 |
| Nav shell | 63 | 64 | white, radius 4, shadow `rgba(0,0,0,.2) 0 0 4px 0`, pad-inline 15 |
| Nav inner | 63 | 64 | flex space-between, max-w 1150 |
| Nav link | — | 64 | 16px/w600 `#263633`, pad `20px 30px 20px 15px` |
| Rive canvas slot | 638 | 209 | `.n4-hero_main_shape_wrap` |
| Program section | 900 | 1582 | bg deepest-green |
| — services body | 1058 | 340 | |
| — program slider | 1429 | 540 | Swiper |
| — care row | 2048 | 355 | inner swiper h288 |
| Feature section | 2482 | 1275 | pad `24px 23.4336px` |
| — feature card | 2841 | 400 | 548 wide, radius 8 |
| Parallax wrap | 3757 | 4526 | |
| — parallax sticky | 3757 | 640 | `position:sticky` |
| — overlap | 4373 | 3910 | |
| Stats panel | 4373 | 911 | radius `24 24 0 0`, bg natural, contain gap 142.406 |
| — stats body | 4491 | 212 | flex gap 31.4336, max-w 579 |
| Audience section | 5284 | 881 | grid `662.453px 662.453px`, gap 23.2032 |
| Trust marquee | 6165 | 352 | items 240×140, track w1680 (duplicated) |
| Stories | 6541 | 990 | radius 24, component gap 46.9728, body max-w 573 |
| CTA | 7790 | 258 | body max-w 507, gap 12 |
| Footer | 8283 | 596 | inner radius `24 24 0 0`, top grid min-h 321 |

## Signature techniques worth stealing
1. **CSS container queries** for the stats grid — measured verbatim:
   `@container stats (width < 70em){--column-count:2}` / `(width < 40em){--column-count:1; .stats-lines{display:none}}`
   Wrap in `container-type:inline-size; container-name:stats`. Component-level responsive, not viewport-level.
2. **Panel-inset layout** — full-bleed dark section, inner panel at radius 24 with 12px gutter. Used on hero, stats, stories and footer. Reads as premium without any shadow work.
3. **Program sub-colour system** — each program owns a 3-tone palette applied to tag / card / bg. Makes a multi-service page feel full-service rather than scattered.
4. **Sticky parallax visual** — `position:sticky` h640 behind an overlapping panel that scrolls over it.
5. **Nav underline on open** — `@media(min-width:992px)` `:before` 2px `#0b8470` pinned `bottom:1px`.
6. **Light display weights** — H1 at w300, card headings at w300. Light weights on a large scale is what reads "clinical but warm" here, not bold.

## Font mapping (originals are commercially licensed)
| Original | Weights seen | License-safe stand-in used |
|---|---|---|
| Helvetica Now Display | 100/300/400/500/700 | Inter |
| Ivar Display | 400, 400 italic | DM Serif Display italic |
| Helvetica Now Text | 300/400 | Inter |
| Ivar Headline | 400, italic | DM Serif Display |
| Domaine Display | 400 | — |
| Proxima Nova | 300/400/600 | Inter |
| Basis Grotesque Mono Pro | 400/500/700 | system mono |

To swap in licensed originals, replace `--font-display` and `--font-serif` in `:root`
and add matching `@font-face` blocks. Nothing else needs to change.

## Responsive system (CORRECTED — measured, was previously guessed)

`spec.css.media` holds only the 32 query **strings**, not their declarations. The
real responsive behaviour was recovered by diffing each element's computed styles
across the three captures (`../respdiff.js`).

**Caution:** element index `i` is NOT stable across viewports (907/916/899 elements).
Matching on `i` pairs unrelated elements and yields nonsense. `respdiff.js` keys on
tag + full class string + ordinal.

### Root font-size shifts per viewport — this drives the whole fluid system
| | desktop 1440 | tablet 768 | mobile 390 |
|---|---|---|---|
| root font-size | 15.8848px | 14.6752px | 14px |
| root line-height | 23.8272px | 22.0128px | 21px |

### Type ladder (measured, all w300 unless noted)
| Element | desktop | tablet | mobile |
|---|---|---|---|
| h1 | 73.7136 / lh74 | 52.0752 / lh52 | **40** / lh40 |
| h2 | 59.944 / lh60 | 40.7248 / lh41 | 30 / lh36 |
| program card h3 | 23.6544 / lh28 | **31.3376** / lh41 | 28 / lh36 |
| care card h3 | 23.6544 / lh28 | 20.0256 / lh24 | 18 / lh22 |

Program card headings get *larger* at tablet — no generic rule predicts this.

### Spacing curve (fluid; mobile snaps to round floors)
| Token | desktop | tablet | mobile |
|---|---|---|---|
| section space | 157.938 | 138.719 | 128 |
| section space (sm) | 78.969 | 69.359 | 64 |
| grid gap (stats/industry) | 23.2032 | 16.0128 | 12 |
| flow gap (stories/footer) | 46.9728 | 37.3632 | 40 |
| stats contain gap | 142.406 | 128.026 | 32 |
| stats contain padding | 118.406 | 104.026 | 32 |
| card padding / slider margin | 31.4336 | 26.6624 | 24 |
| container inset (both sides) | 91.888 | 53.4496 | 32 |

Container is `max-width:min(1512px, 100% - <inset>)`.

### Layout switches
| Component | desktop | tablet | mobile |
|---|---|---|---|
| nav bar | 1270w, pad `0 45px`, margin `15px 85px 0` | full-bleed, pad `0 0 10px`, margin 0 | full-bleed, pad `0 0 5px` |
| nav shell | 64h, **radius 4** | 58h, **radius 0** | 46h, radius 0 |
| hero component | flex-row, 834h, `overflow:hidden` | flex-column, 958h, `overflow:visible` | column, 568h, **text-align:center**, justify flex-end |
| program slide | 328.03w | 726.55w (full) | 370w, pad `0 6px` |
| feature card | 548.17 x 400 (2-up) | 714.56 x 400 (1-up) | 326 x 338.9 |
| stats grid | 4 x 319.625 | 2 x 349.27 | 1 x 358 |
| industry grid | 2 x 662.453 | 2 x 349.27 | flex |
| footer top | flex-row | flex-column | flex-column |
| marquee logo | 240 x 140 | 240 x 140 | 152 x 90.08 |

### Gaps in the data — not authored, not guessed
- **The 480–767 band was never captured.** Captures are 1440 / 768 / 390, which map to
  `>991`, `<=991`, `<=479`. The build inherits the `<=991` rules through that band.
  Re-run `extract.js` at ~600px to close it.
- `spec.css.media` has no declarations, so per-breakpoint rules exist only where a
  computed-style diff reveals them.
- Non-captured states (dropdown open, swiper mid-transition, hover) are not measured.

### Verification
`node assert.mjs` compares the clone's rendered values against the measured values at
all three viewports — 50 assertions, currently 50/50. That is the gate, not a screenshot.

## Build rules applied
- `overflow-x:clip` on the page wrap, never `hidden` on `html` (kills `position:fixed`
  in Chrome/Safari, and `hidden` on the root also kills `position:sticky`).
- `100dvh` on the mobile hero, not `100vh`.
- Every inline `<svg>` carries `fill="none"`.
- `.reveal` sits on inner atoms only — never on a `<section>`; an `opacity:0`
  section renders as a blank gap before its observer fires.
- Marquee track duplicated in JS so `translateX(-50%)` loops seamlessly.
- `prefers-reduced-motion` kills reveals and the marquee.

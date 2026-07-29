# Maven reference extraction → therapy/counseling template

Private working repo. Backup of the extract → digest → build → verify pipeline run
against a live Webflow reference, and the therapy/counseling template built on it.

## Layout

| Path | What |
|---|---|
| `BUILD_BRIEF.md` | digest of `spec.json` — breakpoints, fonts, palette, section outline |
| `spec.json` | full extraction: computed styles at 1440 / 768 / 390 |
| `dom/` | captured DOM per viewport |
| `_clone2/` | structural clone — real DOM, real class names, real Webflow CSS |
| `_clone/DESIGN-SYSTEM.md` | measured design system: tokens, type ladder, responsive curve |
| `_therapy2/` | therapy build on the real structure (current deliverable) |
| `_therapy/` | earlier hand-authored version — superseded, kept for reference |
| `_media/out/` | graded Coverr media (video + stills) |

## Scripts

| Script | Purpose |
|---|---|
| `probe.js` | query spec.json — `range <y0> <y1>` / `cls <sub>` / `text <sub>` |
| `respdiff.js` | recover responsive behaviour by diffing computed styles across viewports |
| `build2.mjs` | build the structural clone from the captured DOM |
| `therapy.mjs` | populate that structure with therapy content |
| `assert.mjs` | assert rendered values equal measured spec values |
| `check2/3/4.mjs` | per-viewport geometry + overflow checks |
| `shots.mjs` | readable page slices for visual review |
| `enc.mjs` | encoding / mojibake check |

## Before this is deployed anywhere public

- **Fonts in `_therapy2/css/page.css` are commercially licensed** (Helvetica Now,
  Ivar, Domaine, Proxima Nova). Re-license or substitute.
- `_therapy2/css/page.css` is the reference's own stylesheet.
- Stat figures are `00%` and client quotes are placeholders **by design** — never
  publish outcome numbers or testimonials a practice cannot evidence.
- Image slots and links are placeholders pending real client assets.

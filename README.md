# Countdown Clock

**Make your time visible.**

An always-on desk display that turns abstract time into something concrete and
glanceable. The hero mode — **just-do-it-mode** — counts a chosen planning
horizon down in raw seconds, so the number on your desk never stops moving.

This repo holds the **web prototype / concept site**: a Three.js simulation of
the physical device, plus the product specs it is built from.

> The horizon is an illustrative, population-based planning range — **not** a
> prediction, a diagnosis, or a death date. See [docs/privacy-safety.md](docs/privacy-safety.md).

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:8437. `npm run build` alone emits the deployable
site into `dist/`.

During development you can also serve `prototype/` directly (it loads Three.js
from `node_modules` via an import map, no build step):

```bash
npx http-server prototype -p 8437
```

## Modes

| # | Mode | Shows |
|---|------|-------|
| 1 | JUST DO IT | Seconds remaining in your horizon (⚡ HYPER → microsecond scale) |
| 2 | HORIZON | The same span as YRS · DAYS · HRS · MIN · SEC |
| 3 | LIFE ELAPSED | Share of the horizon already used, to 3 decimals |
| 4 | TIME LIVED | Exact seconds since birth — no estimate involved |
| 5 | WEEKS | Illustrative weeks remaining |
| 6 | GOAL · NEW YEAR | Milestone countdown |
| 7 | COFFEES | Cups remaining at your stated rate |

Modes 4 and 6 need no horizon at all, so the clock stays useful with no
personal estimate configured.

## Controls

- **◀ / ▶** or arrow keys / space — change mode
- **⚡ HYPER** or `H` — microsecond scale (JUST DO IT only)
- **FX** or `F` — transition style: `DECRYPT` (per-digit scramble and lock) or
  `WILD` (full-frame glitch)
- **⚙ SETUP** — birth date, horizon, coffees per day, render quality, idle
  auto-cycle. Everything stays in `localStorage` on the visitor's own device.

After ~14 s idle the clock cycles modes on its own, so the page demos itself.

## Rendering

Two quality tiers keep it running everywhere:

- **HIGH** — bloom post-processing, device pixel ratio capped at 1.25
- **LITE** — no post-processing at all; one direct render at DPR 1
- **AUTO** (default) starts HIGH and drops to LITE if measured FPS stays low,
  remembering the result

Deliberately avoided: `mix-blend-mode` over the WebGL canvas (slow compositing
in Chrome) and render-to-texture reflections.

## Layout

```
prototype/     source — index.html is the single source of truth for markup
  main.js      the whole clock: modes, 7-segment display, transitions
docs/          product brief, estimation method, privacy & safety, campaign
scripts/       build (esbuild bundle + HTML rewrite) and a static dev server
dist/          build output (generated, not committed)
```

## Deploy

Vercel reads [vercel.json](vercel.json): build with `npm run build`, serve
`dist/`. Any static host works the same way.

## Audio

`prototype/assets/` is **git-ignored on purpose**. The local prototype plays a
copyrighted track under HYPER mode for feel; it is never committed or
deployed. Where the file is absent (every public deploy), an **original
synthesized cue** plays instead — a soft clock tick each second under a
slow-breathing minor drone, generated live in Web Audio. Nothing to license,
nothing to download.

## Mobile

Portrait phones get a dismissible "rotate your phone" prompt (the clock is a
wide desk display; dismissal is remembered per session). Chrome compacts below
700 px wide / 450 px tall, and the fog wall tracks the camera so portrait
framing no longer swallows the digits.

## Status

Early prototype. The 90-year default is a placeholder — a real product must
derive its horizon from the life-table method in
[docs/estimation-method.md](docs/estimation-method.md).

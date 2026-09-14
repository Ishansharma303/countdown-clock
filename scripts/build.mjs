// Builds the deployable site into dist/:
//   - bundles prototype/main.js + three.js into dist/app.js
//   - rewrites prototype/index.html to load the bundle instead of the importmap
//   - copies the static pages
// prototype/index.html stays the single source of truth for markup.

import { build } from 'esbuild';
import { mkdir, readFile, writeFile, copyFile, rm, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'prototype');
const out = resolve(root, 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: [resolve(src, 'main.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  outfile: resolve(out, 'app.js'),
  logLevel: 'info',
});

let html = await readFile(resolve(src, 'index.html'), 'utf8');

// swap the dev importmap + module entry for the single bundled file
html = html.replace(
  /\s*<script type="importmap">[\s\S]*?<\/script>\s*<script type="module" src="\.\/main\.js"><\/script>/,
  '\n  <script type="module" src="./app.js"></script>'
);
if (html.includes('importmap')) {
  throw new Error('build: failed to strip the dev importmap from index.html');
}
if (!html.includes('./app.js')) {
  throw new Error('build: bundled script tag was not injected into index.html');
}

await writeFile(resolve(out, 'index.html'), html);
await copyFile(resolve(src, 'get-your-clock.html'), resolve(out, 'get-your-clock.html'));

// deployable-track slot: assets/hyper.mp3 ships if (and only if) it exists.
// This must only ever hold audio with publication rights (e.g. NCS).
let shippedTrack = false;
try {
  await access(resolve(src, 'assets', 'hyper.mp3'));
  await mkdir(resolve(out, 'assets'), { recursive: true });
  await copyFile(resolve(src, 'assets', 'hyper.mp3'), resolve(out, 'assets', 'hyper.mp3'));
  shippedTrack = true;
} catch { /* no deployable track — the synth cue covers hyper mode */ }

console.log(`built -> dist/ (index.html, app.js, get-your-clock.html${shippedTrack ? ', assets/hyper.mp3' : ''})`);

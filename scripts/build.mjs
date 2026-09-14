// Builds the deployable site into dist/:
//   - bundles prototype/main.js + three.js into dist/app.js
//   - rewrites prototype/index.html to load the bundle instead of the importmap
//   - copies the static pages
// prototype/index.html stays the single source of truth for markup.

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile, rename, rm, access } from 'node:fs/promises';
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

// content-hash the bundle name so browsers never serve a stale cached build
// (the immutable cache header in vercel.json is only safe on a changing URL)
const bundleBytes = await readFile(resolve(out, 'app.js'));
const bundleName = `app-${createHash('md5').update(bundleBytes).digest('hex').slice(0, 8)}.js`;
await rename(resolve(out, 'app.js'), resolve(out, bundleName));

let html = await readFile(resolve(src, 'index.html'), 'utf8');

// swap the dev importmap + module entry for the single bundled file
html = html.replace(
  /\s*<script type="importmap">[\s\S]*?<\/script>\s*<script type="module" src="\.\/main\.js"><\/script>/,
  `\n  <script type="module" src="./${bundleName}"></script>`
);
if (html.includes('importmap')) {
  throw new Error('build: failed to strip the dev importmap from index.html');
}
if (!html.includes(`./${bundleName}`)) {
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

console.log(`built -> dist/ (index.html, ${bundleName}, get-your-clock.html${shippedTrack ? ', assets/hyper.mp3' : ''})`);

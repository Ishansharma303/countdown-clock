import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------------------------------------------------------------- settings

const STORAGE_KEY = 'countdown-clock-proto';
const DEFAULTS = {
  birth: '1996-06-15',
  horizonYears: 90,
  coffees: 2,        // cups per day
  fx: 'decrypt',     // 'decrypt' | 'wild'
  hyper: false,      // microsecond scale on JUST DO IT
  autoCycle: true,   // idle attract cycle
  quality: 'auto',   // 'auto' | 'high' | 'lite'
  detectedLite: false, // auto mode measured a slow device before
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // hyper is deliberately not restored: every visit boots at normal scale
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw), hyper: false };
  } catch (_) { /* private mode etc. */ }
  return { ...DEFAULTS };
}
function saveSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
}

let settings = loadSettings();
let birthDate, horizonDate;

function recomputeDates() {
  // unknown birth time -> local noon, per product brief
  birthDate = new Date(settings.birth + 'T12:00:00');
  if (isNaN(birthDate)) birthDate = new Date('1996-06-15T12:00:00');
  horizonDate = new Date(birthDate);
  // calendar semantics, not decimal-year multiplication
  horizonDate.setFullYear(horizonDate.getFullYear() + Number(settings.horizonYears || 90));
}
recomputeDates();

// ---------------------------------------------------------------- time math

const pad = (n, l) => String(Math.max(0, Math.floor(n))).padStart(l, '0');
const groupThousands = n =>
  String(Math.max(0, Math.floor(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const remSec = now => Math.max(0, (horizonDate - now) / 1000);
const remDays = now => remSec(now) / 86400;

function calendarBreakdown(from, to) {
  if (to <= from) return { y: 0, d: 0, h: 0, m: 0, s: 0 };
  let y = 0;
  const cursor = new Date(from);
  while (true) {
    const next = new Date(cursor);
    next.setFullYear(next.getFullYear() + 1);
    if (next.getTime() <= to.getTime()) { cursor.setFullYear(cursor.getFullYear() + 1); y++; }
    else break;
  }
  let secs = Math.floor((to - cursor) / 1000);
  const d = Math.floor(secs / 86400); secs -= d * 86400;
  const h = Math.floor(secs / 3600);  secs -= h * 3600;
  const m = Math.floor(secs / 60);    secs -= m * 60;
  return { y, d, h, m, s: secs };
}

function dhmsTo(target, now) {
  let secs = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(secs / 86400); secs -= d * 86400;
  const h = Math.floor(secs / 3600);  secs -= h * 3600;
  const m = Math.floor(secs / 60);    secs -= m * 60;
  return `${pad(d, 3)} ${pad(h, 2)} ${pad(m, 2)} ${pad(secs, 2)}`;
}

function nextNewYear(now) {
  return new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
}

// ---------------------------------------------------------------- modes

const MODES = [
  {
    id: 'justdoit',
    title: 'JUST DO IT',
    sub: () => settings.hyper
      ? 'EVERY MICROSECOND IS REAL — GO'
      : 'TIME REMAINING TO MAKE THE MOST OUT OF LIFE',
    est: true,
    hue: 0.075, sat: 1.0, light: 0.55,
    labels: () => settings.hyper ? 'SECONDS · MICROSECOND SCALE' : 'SECONDS REMAINING',
    text(now) {
      if (!settings.hyper) return groupThousands(remSec(now));
      const remMs = horizonDate.getTime() - (performance.timeOrigin + performance.now());
      const secs = Math.max(0, Math.floor(remMs / 1000));
      const frac = Math.max(0, Math.min(0.999999, remMs / 1000 - secs));
      const us = String(Math.floor(frac * 1e6)).padStart(6, '0');
      return groupThousands(secs) + '.' + us.replace(/(\d{3})(?=\d)/g, '$1 ');
    },
  },
  {
    id: 'horizon',
    title: 'HORIZON',
    sub: 'REMAINING · CENTRAL ESTIMATE',
    est: true,
    hue: 0.058, sat: 1.0, light: 0.55,
    labels: ['YRS', 'DAYS', 'HRS', 'MIN', 'SEC'],
    text(now) {
      const b = calendarBreakdown(now, horizonDate);
      return `${pad(b.y, 2)} ${pad(b.d, 3)} ${pad(b.h, 2)} ${pad(b.m, 2)} ${pad(b.s, 2)}`;
    },
  },
  {
    id: 'lifepct',
    title: 'LIFE ELAPSED',
    sub: 'SHARE OF HORIZON ALREADY USED',
    est: true,
    hue: 0.11, sat: 0.9, light: 0.5,
    labels: 'OF YOUR HORIZON ELAPSED',
    text(now) {
      const pct = Math.min(99.999,
        Math.max(0, (now - birthDate) / (horizonDate - birthDate) * 100));
      return pct.toFixed(3) + ' %';
    },
  },
  {
    id: 'lived',
    title: 'TIME LIVED',
    sub: 'EXACT TIME SINCE BIRTH · NO ESTIMATE',
    est: false,
    hue: 0.5, sat: 0.85, light: 0.55,
    labels: 'SECONDS ALREADY LIVED',
    text(now) { return groupThousands((now - birthDate) / 1000); },
  },
  {
    id: 'weeks',
    title: 'WEEKS',
    sub: 'ILLUSTRATIVE WEEKS REMAINING',
    est: true,
    hue: 0.13, sat: 0.9, light: 0.55,
    labels: 'WEEKS REMAINING',
    text(now) { return groupThousands(remDays(now) / 7); },
  },
  {
    id: 'goal',
    title: 'GOAL · NEW YEAR',
    sub: 'MILESTONE COUNTDOWN',
    est: false,
    hue: 0.36, sat: 0.85, light: 0.52,
    labels: ['DAYS', 'HRS', 'MIN', 'SEC'],
    text(now) { return dhmsTo(nextNewYear(now), now); },
  },
  {
    id: 'coffees',
    title: 'COFFEES',
    sub: () => `${settings.coffees} CUPS A DAY · SAVOR EACH ONE`,
    est: true,
    hue: 0.08, sat: 0.6, light: 0.48,
    labels: 'COFFEES REMAINING',
    text(now) { return groupThousands(remDays(now) * settings.coffees); },
  },
];

let modeIndex = 0;

// ---------------------------------------------------------------- renderer

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, powerPreference: 'high-performance',
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030304);
scene.fog = new THREE.Fog(0x030304, 26, 70);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
const CAM_BASE = new THREE.Vector3(0, 1.6, 21);
camera.position.copy(CAM_BASE);
camera.lookAt(0, -0.5, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
keyLight.position.set(-4, 8, 10);
scene.add(keyLight);

// ---------------------------------------------------------------- materials

const accent = new THREE.Color().setHSL(MODES[0].hue, MODES[0].sat, MODES[0].light);
const targetAccent = accent.clone();

const onMat = new THREE.MeshStandardMaterial({
  color: 0x050505, emissive: accent.clone(), emissiveIntensity: 1.7,
  roughness: 0.4, metalness: 0.1,
});
const offMat = new THREE.MeshStandardMaterial({
  color: 0x0a0908, emissive: 0x040302, emissiveIntensity: 0.15,
  roughness: 0.7, metalness: 0.05,
});

// ---------------------------------------------------------------- 7-seg display

const SLOTS = 22;            // fits microsecond scale (20 used slots)
const PITCH = 1.45;
const SHEAR = 0.1;
const SEG_LEN = 0.86, SEG_THICK = 0.17, SEG_DEPTH = 0.14;
const DESK_Y = -4.15;

const SEGMAP = {
  '0': [1,1,1,1,1,1,0], '1': [0,1,1,0,0,0,0], '2': [1,1,0,1,1,0,1],
  '3': [1,1,1,1,0,0,1], '4': [0,1,1,0,0,1,1], '5': [1,0,1,1,0,1,1],
  '6': [1,0,1,1,1,1,1], '7': [1,1,1,0,0,0,0], '8': [1,1,1,1,1,1,1],
  '9': [1,1,1,1,0,1,1], '-': [0,0,0,0,0,0,1], ' ': [0,0,0,0,0,0,0],
  '%': [0,0,0,0,0,0,0],
};
// segment positions: A,B,C,D,E,F,G — x,y and vertical flag
const SEG_LAYOUT = [
  [ 0.0,  1.0, false], [ 0.5,  0.5, true ], [ 0.5, -0.5, true ],
  [ 0.0, -1.0, false], [-0.5, -0.5, true ], [-0.5,  0.5, true ],
  [ 0.0,  0.0, false],
];

function segGeometry(vertical) {
  const hl = SEG_LEN / 2, ht = SEG_THICK / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hl, 0); shape.lineTo(-hl + ht, ht); shape.lineTo(hl - ht, ht);
  shape.lineTo(hl, 0);  shape.lineTo(hl - ht, -ht); shape.lineTo(-hl + ht, -ht);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: SEG_DEPTH, bevelEnabled: true,
    bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1,
  });
  geo.translate(0, 0, -SEG_DEPTH / 2);
  if (vertical) geo.rotateZ(Math.PI / 2);
  const shear = new THREE.Matrix4().set(
    1, SHEAR, 0, 0,
    0, 1,     0, 0,
    0, 0,     1, 0,
    0, 0,     0, 1);
  geo.applyMatrix4(shear);
  return geo;
}
const horizGeo = segGeometry(false);
const vertGeo = segGeometry(true);
const dotGeo = new THREE.BoxGeometry(0.21, 0.21, 0.12);
const pctDotGeo = new THREE.BoxGeometry(0.3, 0.3, 0.12);
const pctBarGeo = new THREE.BoxGeometry(0.15, 1.5, 0.12);
pctBarGeo.rotateZ(-0.42);

const displayGroup = new THREE.Group();       // scaled to fit
const rowGroup = new THREE.Group();           // shifted for centering
displayGroup.add(rowGroup);
displayGroup.position.y = 0.25;
scene.add(displayGroup);

const slots = [];
for (let i = 0; i < SLOTS; i++) {
  const g = new THREE.Group();
  g.position.x = (i - (SLOTS - 1) / 2) * PITCH;
  const segs = SEG_LAYOUT.map(([x, y, vert]) => {
    const mesh = new THREE.Mesh(vert ? vertGeo : horizGeo, offMat);
    mesh.position.set(x + y * SHEAR, y, 0);
    g.add(mesh);
    return mesh;
  });
  // decimal point + percent glyph always use the lit material
  const dot = new THREE.Mesh(dotGeo, onMat);
  dot.position.set(0.74, -1.04, 0.08);
  dot.visible = false;
  g.add(dot);
  const pct = new THREE.Group();
  const pdot1 = new THREE.Mesh(pctDotGeo, onMat);
  pdot1.position.set(-0.34, 0.66, 0);
  const pdot2 = new THREE.Mesh(pctDotGeo, onMat);
  pdot2.position.set(0.42, -0.66, 0);
  const bar = new THREE.Mesh(pctBarGeo, onMat);
  bar.position.set(0.04, 0, 0);
  pct.add(pdot1, pdot2, bar);
  pct.visible = false;
  g.add(pct);
  rowGroup.add(g);
  slots.push({ group: g, segs, dot, pct, char: ' ', pulse: 0, scrChar: null, wasScrambled: false });
}

const SCRAMBLE_CHARS = '0123456789';

function setSlot(slot, ch, dp, scrambled) {
  let map;
  if (scrambled) {
    if (!slot.scrChar || Math.random() < 0.38) {
      slot.scrChar = SCRAMBLE_CHARS[(Math.random() * 10) | 0];
    }
    map = SEGMAP[slot.scrChar];
    slot.dot.visible = false;
    slot.pct.visible = false;
    slot.wasScrambled = true;
  } else {
    map = SEGMAP[ch] || SEGMAP[' '];
    slot.pct.visible = ch === '%';
    slot.dot.visible = !!dp;
    if (slot.wasScrambled) {
      if (ch !== ' ') slot.pulse = 1;       // lock-in pop for decrypt reveal
      slot.wasScrambled = false;
      slot.scrChar = null;
    } else if (ch !== slot.char && ch !== ' ' && slot.char !== ' ') {
      slot.pulse = 1;                        // ordinary tick pop
    }
    slot.char = ch;
  }
  for (let s = 0; s < 7; s++) {
    slot.segs[s].material = map[s] ? onMat : offMat;
  }
}

// parse a display string into centered tokens; '.' attaches to previous slot
// scramble: null | {type:'prob', p} | {type:'reveal', t, lockAt[]}
let currentGroups = [];
let groupSignature = '';
let usedCount = 0;

function setDisplayString(str, scramble = null) {
  const tokens = [];
  for (const ch of str) {
    if (ch === '.') { if (tokens.length) tokens[tokens.length - 1].dp = true; continue; }
    tokens.push({ ch, dp: false });
  }
  const n = Math.min(tokens.length, SLOTS);
  const startSlot = Math.floor((SLOTS - n) / 2);
  const usedCenter = startSlot + (n - 1) / 2;
  rowGroup.position.x = -(usedCenter - (SLOTS - 1) / 2) * PITCH;

  const groups = [];
  let inG = false, gs = 0;
  tokens.forEach((t, i) => {
    if (t.ch !== ' ' && !inG) { inG = true; gs = i; }
    if (t.ch === ' ' && inG) { inG = false; groups.push({ start: gs + startSlot, len: i - gs }); }
  });
  if (inG) groups.push({ start: gs + startSlot, len: tokens.length - gs });

  usedCount = n;
  currentGroups = groups;
  const sig = groups.map(g => `${g.start}:${g.len}`).join('|');
  if (sig !== groupSignature) {
    groupSignature = sig;
    fitDisplay();
    rebuildLabels();
  }

  for (let i = 0; i < SLOTS; i++) {
    const slot = slots[i];
    const k = i - startSlot;
    const tok = (k >= 0 && k < n) ? tokens[k] : null;
    // ghost slots beyond the backdrop are hidden
    const worldX = (slot.group.position.x + rowGroup.position.x) * targetScale;
    slot.group.visible = !!tok || Math.abs(worldX) < 12.3;
    if (!tok) { setSlot(slot, ' ', false, false); continue; }
    let scr = false;
    if (scramble && tok.ch !== ' ') {
      if (scramble.type === 'prob') scr = Math.random() < scramble.p;
      else if (scramble.type === 'reveal') scr = scramble.t < scramble.lockAt[k];
    }
    setSlot(slot, tok.ch, tok.dp, scr);
  }
}

// ---------------------------------------------------------------- labels (canvas planes)

let labelMeshes = [];

function makeLabelMesh(text, color) {
  const font = '600 42px "Share Tech Mono", monospace';
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = font;
  const spaced = text.split('').join(' ');
  const tw = Math.ceil(meas.measureText(spaced).width) + 40;
  const canvas2d = document.createElement('canvas');
  canvas2d.width = tw; canvas2d.height = 64;
  const ctx = canvas2d.getContext('2d');
  ctx.font = font;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(spaced, tw / 2, 34);
  const tex = new THREE.CanvasTexture(canvas2d);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const h = 0.4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry((tw / 64) * h, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85, depthWrite: false })
  );
  return mesh;
}

function rebuildLabels() {
  for (const m of labelMeshes) {
    rowGroup.remove(m);
    m.material.map.dispose(); m.material.dispose(); m.geometry.dispose();
  }
  labelMeshes = [];
  const mode = MODES[modeIndex];
  const spec = typeof mode.labels === 'function' ? mode.labels() : mode.labels;
  const col = '#' + accentCSS();
  const slotX = i => (i - (SLOTS - 1) / 2) * PITCH;

  if (Array.isArray(spec)) {
    currentGroups.forEach((g, i) => {
      if (!spec[i]) return;
      const mesh = makeLabelMesh(spec[i], col);
      mesh.position.set((slotX(g.start) + slotX(g.start + g.len - 1)) / 2, -1.95, 0.02);
      rowGroup.add(mesh);
      labelMeshes.push(mesh);
    });
  } else if (typeof spec === 'string' && currentGroups.length) {
    const first = currentGroups[0];
    const last = currentGroups[currentGroups.length - 1];
    const mesh = makeLabelMesh(spec, col);
    mesh.position.set((slotX(first.start) + slotX(last.start + last.len - 1)) / 2, -1.95, 0.02);
    rowGroup.add(mesh);
    labelMeshes.push(mesh);
  }
}

function accentCSS() {
  return targetAccent.clone().offsetHSL(0, 0, 0.05).getHexString();
}

// ---------------------------------------------------------------- fit / scale

let targetScale = 1;
function fitDisplay() {
  const maxWidth = 21.5;
  const used = usedCount * PITCH;
  targetScale = Math.min(1.35, maxWidth / used);
}

// ---------------------------------------------------------------- backdrop + desk

// soft gradient backdrop instead of a hard-edged slab — no visible seams
function radialCanvas(inner, mid, midStop) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.translate(128, 64);
  ctx.scale(1, 0.5);
  const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, 126);
  grad.addColorStop(0, inner);
  grad.addColorStop(midStop, mid);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(-128, -128, 256, 256);
  return new THREE.CanvasTexture(c);
}

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 16),
  new THREE.MeshBasicMaterial({
    map: radialCanvas('rgba(9,9,12,0.85)', 'rgba(5,5,7,0.5)', 0.55),
    transparent: true, depthWrite: false,
  })
);
backdrop.position.set(0, -0.35, -0.9);
backdrop.renderOrder = -1;
scene.add(backdrop);

// accent line: thick enough to stay solid at any laptop/phone pixel density
const stripMat = new THREE.MeshStandardMaterial({
  color: 0x000000, emissive: accent.clone(), emissiveIntensity: 0.9,
});
const strip = new THREE.Mesh(new THREE.BoxGeometry(25.4, 0.14, 0.14), stripMat);
strip.position.set(0, -4.0, -0.18);
scene.add(strip);

// subtle static accent underglow on the desk
const glowMat = new THREE.MeshBasicMaterial({
  map: radialCanvas('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.12)', 0.45),
  color: accent.clone(), transparent: true, opacity: 0.09,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const glow = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), glowMat);
glow.rotateX(-Math.PI / 2);
glow.position.set(0, DESK_Y + 0.02, 4);
scene.add(glow);

// halo behind the digits — stands in for bloom when running in LITE quality
const haloMat = new THREE.MeshBasicMaterial({
  map: radialCanvas('rgba(255,255,255,0.55)', 'rgba(255,255,255,0.16)', 0.5),
  color: accent.clone(), transparent: true, opacity: 0.45,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const halo = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), haloMat);
halo.position.set(0, 0.1, -0.5);
halo.visible = false;
scene.add(halo);

const grid = new THREE.GridHelper(220, 90, 0x2a2016, 0x18120b);
grid.position.y = DESK_Y;
grid.material.transparent = true;
grid.material.opacity = 0.4;
scene.add(grid);

const particleCount = 350;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 90;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
  pPos[i * 3 + 2] = -8 - Math.random() * 50;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  color: 0xffc884, size: 0.09, transparent: true, opacity: 0.4,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ---------------------------------------------------------------- post-processing

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.62, 0.35, 0.5);
composer.addPass(bloom);
const glitchPass = new GlitchPass();
glitchPass.enabled = false;
composer.addPass(glitchPass);
composer.addPass(new OutputPass());

// composer.setSize would push bloom back to full resolution — keep it at half
function sizeComposer(w, h) {
  // EffectComposer captures the pixel ratio at construction time — sync it or
  // every post-processing target renders at 1x and the digits blur on hidpi
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  bloom.setSize(w / 2, h / 2);
}

// ---------------------------------------------------------------- quality tiers

// HIGH: bloom post-processing, DPR up to 1.25
// LITE: no post-processing at all — plain render at DPR 1 with a halo plane
// 'auto' starts HIGH and drops to LITE if measured FPS is poor.
let tier = 'high';
let usesComposer = true;

// phones have small canvases on 2–3x screens: render at (near-)native ratio
// there or the digits blur; big desktop canvases keep the cheaper cap
function dprCap() {
  const phone = window.innerWidth <= 900 || window.innerHeight <= 500;
  if (tier === 'high') return phone ? 3 : 1.25;
  return phone ? 2 : 1;
}

function applyTier(t) {
  tier = t;
  usesComposer = t === 'high';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap()));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (usesComposer) sizeComposer(window.innerWidth, window.innerHeight);
  halo.visible = !usesComposer;
  if (!usesComposer) { glitchPass.enabled = false; }
}

function initialTier() {
  if (settings.quality === 'lite') return 'lite';
  if (settings.quality === 'high') return 'high';
  return settings.detectedLite ? 'lite' : 'high';
}
applyTier(initialTier());

// rolling FPS check for auto quality (real wall-clock, not debug steps)
const fpsMon = { warm: 0, acc: 0, frames: 0, last: performance.now() };
function fpsSample() {
  const nowMs = performance.now();
  const dt = Math.min(0.25, (nowMs - fpsMon.last) / 1000);
  fpsMon.last = nowMs;
  if (document.hidden) return;
  if (fpsMon.warm < 5) { fpsMon.warm += dt; return; }
  fpsMon.acc += dt;
  fpsMon.frames++;
  if (fpsMon.acc >= 2.5) {
    const fps = fpsMon.frames / fpsMon.acc;
    fpsMon.acc = 0; fpsMon.frames = 0;
    if (settings.quality === 'auto' && tier === 'high' && fps < 42) {
      applyTier('lite');
      settings.detectedLite = true;
      saveSettings(settings);
    }
  }
}

// ---------------------------------------------------------------- hyper music
// Where the licensed local mp3 exists (dev only — it is gitignored and never
// deployed), it plays while HYPER is on in JUST DO IT mode. Everywhere else an
// ORIGINAL synthesized cue plays instead: a soft clock tick each second under
// a slow-breathing minor drone. No files, nothing to license.

// single source: assets/hyper.mp3. If it is absent the synthesized cue below
// takes over, so a deploy without a track still has audio.
const MUSIC_SRC = './assets/hyper.mp3';
const hyperMusic = new Audio(MUSIC_SRC);
hyperMusic.loop = true;
hyperMusic.preload = 'none';     // upgraded to a real fetch on first gesture
hyperMusic.volume = 0;
// iOS ignores the volume property (hardware volume only): no fades there,
// and pause must not wait for a fade that will never happen
const volumeControllable = (() => {
  try { hyperMusic.volume = 0.5; const ok = hyperMusic.volume === 0.5; hyperMusic.volume = 0; return ok; }
  catch (_) { return false; }
})();
let musicTarget = 0;
let musicAvailable = true;       // flips false when every source is absent

let synth = null;
let synthTarget = 0;

function buildSynth() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // drone: detuned triangle pairs on a D minor stack through a breathing lowpass
  const padLp = ctx.createBiquadFilter();
  padLp.type = 'lowpass';
  padLp.frequency.value = 520;
  padLp.Q.value = 0.4;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.22;
  padLp.connect(padGain).connect(master);
  for (const [freq, level] of [[73.42, 0.5], [110, 0.34], [146.83, 0.26], [220, 0.13]]) {
    for (const det of [-4, 4]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.value = level / 2;
      o.connect(g).connect(padLp);
      o.start();
    }
  }
  const lfo = ctx.createOscillator();          // one slow breath every ~26 s
  lfo.frequency.value = 1 / 26;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 420;
  lfo.connect(lfoGain).connect(padLp.frequency);
  lfo.start();

  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  return { ctx, master, noise, nextTick: 0 };
}

function synthTick(at) {
  const { ctx, master, noise } = synth;
  // felt-hammer thump
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(180, at);
  o.frequency.exponentialRampToValueAtTime(70, at + 0.09);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, at);
  og.gain.exponentialRampToValueAtTime(0.5, at + 0.006);
  og.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
  o.connect(og).connect(master);
  o.start(at); o.stop(at + 0.2);
  // quiet mechanism click
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 2;
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.12, at);
  sg.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  s.connect(bp).connect(sg).connect(master);
  s.start(at);
}

function startSynth() {
  if (!synth) synth = buildSynth();
  if (!synth) return;
  if (synth.ctx.state === 'suspended') synth.ctx.resume();
  synth.nextTick = Math.ceil(synth.ctx.currentTime + 0.05);
}

// no track deployed (or it failed to load) -> hand over to the synth cue
hyperMusic.addEventListener('error', () => {
  musicAvailable = false;
  syncHyperMusic();
});

function syncHyperMusic() {
  const want = settings.hyper && MODES[modeIndex].id === 'justdoit';
  musicTarget = want && musicAvailable ? 0.65 : 0;
  synthTarget = want && !musicAvailable ? 0.55 : 0;
  if (want && musicAvailable && hyperMusic.paused) hyperMusic.play().catch(() => {});
  if (synthTarget > 0) startSynth();
}

// The first real gesture is the only moment mobile browsers allow audio to
// start, so use it to both begin buffering the track and retry any playback
// an autoplay policy rejected earlier.
let musicWarmed = false;
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
  window.addEventListener(ev, () => {
    if (!musicWarmed && musicAvailable) {
      musicWarmed = true;
      hyperMusic.preload = 'auto';
      hyperMusic.load();
    }
    if (musicTarget > 0 && musicAvailable && hyperMusic.paused) {
      hyperMusic.play().catch(() => {});
    }
    if (synthTarget > 0) startSynth();
  }, { passive: true }));

// ---------------------------------------------------------------- HTML wiring

const el = {
  title: document.getElementById('modeTitle'),
  sub: document.getElementById('modeSub'),
  counter: document.getElementById('modeCounter'),
  prev: document.getElementById('prevBtn'),
  next: document.getElementById('nextBtn'),
  hyper: document.getElementById('hyperBtn'),
  fx: document.getElementById('fxBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsPanel: document.getElementById('settingsPanel'),
  birthInput: document.getElementById('birthInput'),
  horizonInput: document.getElementById('horizonInput'),
  coffeesInput: document.getElementById('coffeesInput'),
  autoCycleInput: document.getElementById('autoCycleInput'),
  qualityInput: document.getElementById('qualityInput'),
  applyBtn: document.getElementById('applyBtn'),
};

function syncInputs() {
  el.birthInput.value = settings.birth;
  el.horizonInput.value = settings.horizonYears;
  el.coffeesInput.value = settings.coffees;
  el.autoCycleInput.checked = !!settings.autoCycle;
  el.qualityInput.value = settings.quality;
}
syncInputs();

function applyModeChrome() {
  const mode = MODES[modeIndex];
  el.title.textContent = mode.title;
  el.sub.textContent = typeof mode.sub === 'function' ? mode.sub() : mode.sub;
  el.counter.textContent = `MODE ${pad(modeIndex + 1, 2)} / ${pad(MODES.length, 2)}`;
  el.hyper.style.display = mode.id === 'justdoit' ? '' : 'none';
  el.hyper.textContent = `⚡ HYPER ${settings.hyper ? 'ON' : 'OFF'}`;
  el.hyper.classList.toggle('active', settings.hyper);
  el.fx.textContent = `FX ${settings.fx === 'wild' ? 'WILD' : 'DECRYPT'}`;
  document.documentElement.style.setProperty('--accent', '#' + accentCSS());
}

// ---------------------------------------------------------------- transitions

const trans = {
  active: false, style: 'decrypt', t: 0, dur: 0.75,
  nextIndex: 0, swapped: false, durSet: false, lockAt: [],
};

function swapNow(i) {
  modeIndex = i;
  targetAccent.setHSL(MODES[modeIndex].hue, MODES[modeIndex].sat, MODES[modeIndex].light);
  groupSignature = '';        // force label + fit rebuild
  applyModeChrome();
  syncHyperMusic();
}

function beginTransition(nextIdx) {
  if (trans.active) return;
  trans.active = true;
  trans.t = 0;
  trans.swapped = false;
  trans.durSet = false;
  trans.nextIndex = nextIdx;
  trans.style = settings.fx;
  trans.lockAt = Array.from({ length: SLOTS }, (_, k) => 0.18 + k * 0.05 + Math.random() * 0.28);
  if (trans.style === 'wild') {
    trans.dur = 0.75;
    if (usesComposer) {
      glitchPass.enabled = true;
      glitchPass.goWild = true;
    }
  } else {
    trans.dur = 1.8;          // refined once usedCount is known
  }
  document.body.classList.add('glitching');
}

function endTransition() {
  trans.active = false;
  glitchPass.enabled = false;
  glitchPass.goWild = false;
  document.body.classList.remove('glitching');
}

function switchMode(dir) {
  beginTransition((modeIndex + dir + MODES.length) % MODES.length);
}

// ---------------------------------------------------------------- idle attract cycle

const attract = { idleFor: 0, threshold: 14, interval: 8, sinceSwitch: 0, active: false };

function setAttract(on) {
  attract.active = on;
}
function pokeUser() {
  attract.idleFor = 0;
  attract.sinceSwitch = 0;
  setAttract(false);
}
['pointerdown', 'keydown', 'wheel', 'pointermove', 'touchstart'].forEach(ev =>
  window.addEventListener(ev, pokeUser, { passive: true }));

// ---------------------------------------------------------------- controls

el.prev.addEventListener('click', () => switchMode(-1));
el.next.addEventListener('click', () => switchMode(1));

el.hyper.addEventListener('click', () => {
  settings.hyper = !settings.hyper;
  saveSettings(settings);
  applyModeChrome();
  // build the fallback AudioContext inside this gesture so it is allowed to
  // run even if the mp3 404s a moment later
  if (settings.hyper && !musicAvailable) startSynth();
  syncHyperMusic();                // music in, music out — with the fade
  beginTransition(modeIndex);      // re-decode in place
});
el.fx.addEventListener('click', () => {
  settings.fx = settings.fx === 'wild' ? 'decrypt' : 'wild';
  saveSettings(settings);
  applyModeChrome();
  beginTransition(modeIndex);   // demo the newly selected style
});

window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === 'Escape') { el.settingsPanel.classList.remove('open'); return; }
  if (e.key === 'ArrowRight' || e.key === ' ') switchMode(1);
  if (e.key === 'ArrowLeft') switchMode(-1);
  if (e.key === 'h' || e.key === 'H') { if (modeIndex === 0) el.hyper.click(); }
  if (e.key === 'f' || e.key === 'F') el.fx.click();
});

// portrait prompt on phones: dismissal remembered for the session
const rotateDismiss = document.getElementById('rotateDismiss');
if (rotateDismiss) {
  try {
    if (sessionStorage.getItem('cc-rotate-dismissed')) {
      document.body.classList.add('rotate-dismissed');
    }
  } catch (_) {}
  rotateDismiss.addEventListener('click', () => {
    document.body.classList.add('rotate-dismissed');
    try { sessionStorage.setItem('cc-rotate-dismissed', '1'); } catch (_) {}
  });
}

el.settingsBtn.addEventListener('click', () =>
  el.settingsPanel.classList.toggle('open'));
// tapping anywhere outside the panel closes it (phones have no stray cursor
// to move away, so a sticky panel hides the whole display)
window.addEventListener('pointerdown', e => {
  if (!el.settingsPanel.classList.contains('open')) return;
  if (el.settingsPanel.contains(e.target) || el.settingsBtn.contains(e.target)) return;
  el.settingsPanel.classList.remove('open');
}, { capture: true });
el.applyBtn.addEventListener('click', () => {
  const newQuality = ['auto', 'high', 'lite'].includes(el.qualityInput.value)
    ? el.qualityInput.value : 'auto';
  settings = {
    ...settings,
    birth: el.birthInput.value || settings.birth,
    horizonYears: Math.min(120, Math.max(1, Number(el.horizonInput.value) || 90)),
    coffees: Math.min(20, Math.max(0, Number(el.coffeesInput.value) || 0)),
    autoCycle: el.autoCycleInput.checked,
    quality: newQuality,
    // manual choice resets the auto measurement
    detectedLite: newQuality === 'auto' ? settings.detectedLite : false,
  };
  saveSettings(settings);
  recomputeDates();
  syncInputs();
  applyTier(settings.quality === 'lite' ? 'lite'
    : settings.quality === 'high' ? 'high'
    : (settings.detectedLite ? 'lite' : 'high'));
  if (!settings.autoCycle) setAttract(false);
  el.settingsPanel.classList.remove('open');
  applyModeChrome();
  beginTransition(modeIndex);
});

// ---------------------------------------------------------------- ambient micro-glitch

let microT = 0;
let microNext = 5 + Math.random() * 8;
let microActive = 0;

// ---------------------------------------------------------------- mouse parallax

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', e => {
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------------------------------------------------------------- resize

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap()));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (usesComposer) sizeComposer(window.innerWidth, window.innerHeight);
  fitCamera();
});

function fitCamera() {
  const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
  const aspect = Math.min(Math.max(camera.aspect, 0.44), 2.4);
  const needed = 15 / (Math.tan(halfFov) * aspect);
  CAM_BASE.z = Math.max(19, needed);
  // portrait phones push the camera far back — keep the fog wall behind the
  // clock at any distance (fixed fog used to swallow the digits on mobile)
  scene.fog.near = CAM_BASE.z + 5;
  scene.fog.far = CAM_BASE.z + 49;
}
fitCamera();

// ---------------------------------------------------------------- boot + main loop

applyModeChrome();
let bootT = 0;
const BOOT_DUR = 2.0;
const clock = new THREE.Clock();
let elapsed = 0;

function stepFrame(dt) {
  elapsed += dt;
  const t = elapsed;
  const now = new Date();

  // -------- transition state machine
  let scramble = null;
  if (trans.active) {
    trans.t += dt;
    if (trans.style === 'wild') {
      scramble = { type: 'prob', p: 0.65 * (1 - trans.t / trans.dur) + 0.25 };
      if (!trans.swapped && trans.t > trans.dur * 0.45) {
        trans.swapped = true;
        swapNow(trans.nextIndex);
      }
      if (trans.t >= trans.dur) { endTransition(); scramble = null; }
    } else {
      // decrypt: swap immediately, digits lock in left-to-right
      if (!trans.swapped) { trans.swapped = true; swapNow(trans.nextIndex); }
      scramble = { type: 'reveal', t: trans.t, lockAt: trans.lockAt };
      if (!trans.durSet && usedCount > 0) {
        trans.dur = 0.25 + usedCount * 0.05 + 0.35;
        trans.durSet = true;
      }
      if (trans.t > 0.3) document.body.classList.remove('glitching');
      if (trans.t >= trans.dur) { endTransition(); scramble = null; }
    }
  }

  // -------- idle attract cycle (website hero)
  if (settings.autoCycle) {
    attract.idleFor += dt;
    const settingsOpen = el.settingsPanel.classList.contains('open');
    if (!attract.active && attract.idleFor > attract.threshold && !settingsOpen) {
      setAttract(true);
      attract.sinceSwitch = attract.interval - 1.5;   // first auto-switch soon after
    }
    if (attract.active && !settingsOpen) {
      attract.sinceSwitch += dt;
      if (attract.sinceSwitch >= attract.interval && !trans.active) {
        attract.sinceSwitch = 0;
        switchMode(1);
      }
    }
  }

  // -------- boot resolve
  if (bootT < BOOT_DUR) {
    bootT += dt;
    if (!scramble) scramble = { type: 'prob', p: 0.9 * (1 - bootT / BOOT_DUR) };
  }

  // -------- ambient micro flicker
  microT += dt;
  if (microActive > 0) microActive -= dt;
  if (microT > microNext) {
    microT = 0;
    microNext = 6 + Math.random() * 9;
    microActive = 0.1;
  }
  if (!scramble && microActive > 0) scramble = { type: 'prob', p: 0.12 };

  // -------- display update
  const mode = MODES[modeIndex];
  setDisplayString(mode.text(now), scramble);

  // -------- hyper music fade (mp3 where present, synth cue elsewhere)
  if (!volumeControllable) {
    // no software volume on this platform: plain play/pause
    if (musicAvailable && musicTarget === 0 && !hyperMusic.paused) hyperMusic.pause();
  } else {
    const dv = musicAvailable ? musicTarget - hyperMusic.volume : 0;
    if (Math.abs(dv) > 0.005) {
      hyperMusic.volume = Math.max(0, Math.min(1, hyperMusic.volume + dv * Math.min(1, dt * 2)));
    } else if (musicTarget === 0 && !hyperMusic.paused) {
      hyperMusic.pause();
    }
  }
  if (synth) {
    if (synthTarget > 0 && synth.ctx.state === 'running') {
      const ct = synth.ctx.currentTime;
      while (synth.nextTick < ct + 0.12) {
        if (synth.nextTick > ct - 0.05) synthTick(Math.max(synth.nextTick, ct + 0.001));
        synth.nextTick += 1;
      }
    }
    const g = synth.master.gain;
    const ds = synthTarget - g.value;
    if (Math.abs(ds) > 0.004) {
      g.value = Math.max(0, Math.min(1, g.value + ds * Math.min(1, dt * 2)));
    } else if (synthTarget === 0 && g.value < 0.01 && synth.ctx.state === 'running') {
      synth.ctx.suspend();
    }
  }

  // -------- pulses on changed digits
  for (const slot of slots) {
    if (slot.pulse > 0) {
      slot.pulse = Math.max(0, slot.pulse - dt * 3.5);
      const p = slot.pulse;
      slot.group.scale.setScalar(1 + 0.045 * p);
      slot.group.position.z = 0.22 * p;
    } else {
      slot.group.scale.setScalar(1);
      slot.group.position.z = 0;
    }
  }

  // -------- accent color lerp
  accent.lerp(targetAccent, Math.min(1, dt * 4));
  onMat.emissive.copy(accent);
  stripMat.emissive.copy(accent);
  glowMat.color.copy(accent);
  haloMat.color.copy(accent);
  pMat.color.copy(accent).offsetHSL(0, -0.2, 0.15);

  // -------- emissive flicker (subtle, calm); lower base without bloom so the
  // tone mapper keeps the accent color instead of washing digits to white
  const base = usesComposer ? 1.7 : 1.45;
  onMat.emissiveIntensity = base + Math.sin(t * 31) * 0.04 + Math.random() * 0.05;

  // -------- display scale lerp
  const s = displayGroup.scale.x + (targetScale - displayGroup.scale.x) * Math.min(1, dt * 6);
  displayGroup.scale.setScalar(s);

  // -------- camera float + parallax
  mouse.x += (mouse.tx - mouse.x) * dt * 3;
  mouse.y += (mouse.ty - mouse.y) * dt * 3;
  camera.position.x = CAM_BASE.x + mouse.x * 1.4 + Math.sin(t * 0.35) * 0.25;
  camera.position.y = CAM_BASE.y - mouse.y * 0.8 + Math.sin(t * 0.22) * 0.18;
  camera.position.z = CAM_BASE.z;
  if (trans.active) {
    // in LITE, wild has no glitch pass — lean on a stronger shake instead
    const wildAmp = usesComposer ? 0.25 : 0.4;
    const amp = trans.style === 'wild' ? wildAmp : (trans.t < 0.25 ? 0.09 : 0);
    camera.position.x += (Math.random() - 0.5) * amp;
    camera.position.y += (Math.random() - 0.5) * amp;
  }
  camera.lookAt(0, -0.5, 0);

  // -------- particles drift
  const pos = pGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3 + 1] += dt * 0.35;
    if (pos[i * 3 + 1] > 22) pos[i * 3 + 1] = -22;
  }
  pGeo.attributes.position.needsUpdate = true;

  if (usesComposer) composer.render();
  else renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  if (window.innerWidth === 0 || window.innerHeight === 0) return;
  if (renderer.domElement.width === 0 || renderer.domElement.height === 0) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (usesComposer) sizeComposer(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    fitCamera();
  }
  fpsSample();
  stepFrame(Math.min(clock.getDelta(), 0.1));
}
animate();

// debug handle (prototype only)
window.__cd = {
  step: dt => stepFrame(dt),
  switchMode,
  setMode(i) { swapNow(((i % MODES.length) + MODES.length) % MODES.length); accent.copy(targetAccent); },
  set(patch) { Object.assign(settings, patch); saveSettings(settings); applyModeChrome(); },
  beginTransition,
  attract,
  applyTier,
  get tier() { return tier; },
  get res() {
    const rt = composer.renderTarget1;
    return { canvas: renderer.domElement.width + 'x' + renderer.domElement.height,
      composer: rt.width + 'x' + rt.height, dpr: renderer.getPixelRatio() };
  },
  get music() {
    return { musicTarget, synthTarget, musicAvailable,
      mp3paused: hyperMusic.paused, mp3time: hyperMusic.currentTime,
      mp3src: hyperMusic.currentSrc, synthState: synth ? synth.ctx.state : 'none' };
  },
  forceSize(w, h) {
    renderer.setSize(w, h, false);
    if (usesComposer) sizeComposer(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  },
  snapshot: (q = 0.55) => renderer.domElement.toDataURL('image/jpeg', q),
};

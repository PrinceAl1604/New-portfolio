// Generate kassirh design-system CSS from the Figma token export.
// Resolves {alias.paths}, flattens primitives + semantic color roles, type scale, radius, elevation.
const fs = require('fs');
const SRC = process.argv[2];
const t = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// ---- build a flat lookup of every leaf by dotted path (Figma alias form) ----
const leaves = {}; // "primary.grey.lightmode.50" -> "#fafafaff"
function index(o, path) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object') {
      const val = v.value !== undefined ? v.value : v.$value;
      if (val !== undefined) leaves[path.concat(k).join('.')] = val;
      else index(v, path.concat(k));
    }
  }
}
index(t, []);

const isAlias = (v) => typeof v === 'string' && /^\{.+\}$/.test(v);
function resolve(v, depth = 0) {
  if (depth > 12) return v;
  if (isAlias(v)) {
    const key = v.slice(1, -1);
    if (leaves[key] === undefined) return v; // unresolved
    return resolve(leaves[key], depth + 1);
  }
  return v;
}
// strip Figma 8-digit hex alpha when it's fully opaque (#rrggbbff -> #rrggbb)
function hex(v) {
  if (typeof v === 'string' && /^#([0-9a-f]{8})$/i.test(v)) {
    if (v.slice(7).toLowerCase() === 'ff') return v.slice(0, 7);
  }
  return v;
}
const slug = (s) => s.toLowerCase()
  .replace(/primary color/g, 'primary')
  .replace(/secondary color/g, 'secondary')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- 1. PRIMITIVE PALETTES ----------
const palette = {
  primary: t.primary['primary color'],
  grey: t.primary.grey.lightmode,
  red: t.primary.red,
  green: t.primary.green,
  amber: t.primary.orangedark,
  blue: t.primary.blue,
  teal: t.primary.teal,
  yellow: t.primary.yellow,
  pink: t.primary.pink,
};
let prim = [];
for (const [name, scale] of Object.entries(palette)) {
  for (const step of Object.keys(scale)) {
    const val = hex(resolve(scale[step].value !== undefined ? scale[step].value : scale[step].$value));
    if (typeof val === 'string') prim.push(`  --kx-${name}-${step}: ${val};`);
  }
}
prim.push(`  --kx-white: ${hex(resolve('{primary.base.white}'))};`);
prim.push(`  --kx-black: ${hex(resolve('{primary.base.black}'))};`);

// ---------- 2. SEMANTIC COLOR ROLES ----------
// walk color/* -> --kx-<slugged path minus "color">
const sem = [];
function walkColor(o, path) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object') {
      const raw = v.value !== undefined ? v.value : v.$value;
      if (raw !== undefined) {
        const val = hex(resolve(raw));
        if (typeof val === 'string') {
          const name = ['kx', ...path.map(slug), slug(k)].filter(Boolean).join('-');
          sem.push([name, val, path.map(slug).join('/') + '/' + k]);
        }
      } else walkColor(v, path.concat(k));
    }
  }
}
// skip the huge transparent ramp except a couple useful ones
for (const group of Object.keys(t.color)) {
  if (group === 'transperent') continue;
  walkColor(t.color[group], [group]);
}
// a few overlay/scrim helpers from transparent
const scrim = hex(resolve('{primary.grey.lightmode.950}'));

// ---------- 3. RADIUS ----------
const radMap = {}; // name -> px
for (const [k, node] of Object.entries(t['sizing tokens'].radius)) {
  const val = resolve(node.value !== undefined ? node.value : node.$value);
  radMap[k] = typeof val === 'number' ? val : val;
}

// ---------- 4. TYPE SCALE ----------
const g = (n) => (n && n.value !== undefined) ? n.value : n;
const tiers = ['h1','h2','h3','h4','headline','body','subtitle','caption','footnote'];
const type = [];
for (const tier of tiers) {
  const node = t.typography[tier];
  const reg = node.regular || node[Object.keys(node)[0]];
  type.push({ tier, size: g(reg.fontSize), lh: g(reg.lineHeight), weights: Object.keys(node) });
}

// ---------- 5. ELEVATION ----------
// effect.elevation.* each has {0,1} shadow layers; combine to a CSS box-shadow
function shadowCss(node) {
  const layers = [];
  for (const idx of Object.keys(node)) {
    if (!/^\d+$/.test(idx)) continue; // skip "extensions"
    const s = g(node[idx]) || node[idx].value || node[idx];
    if (s && s.offsetX !== undefined) {
      const r = Math.round(s.radius);
      layers.push(`${s.offsetX}px ${s.offsetY}px ${r}px ${s.spread||0}px ${s.color}`);
    }
  }
  return layers.join(', ');
}
const elev = [];      // light: [name, css]
const elevDark = [];  // dark:  [name, css]
for (const [modeKey, bucket] of [['light', elev], ['dark', elevDark]]) {
  const mode = t.effect.elevation[modeKey];
  if (!mode) continue;
  for (const shadowName of Object.keys(mode)) {
    const n = shadowName.replace(/[^0-9]/g, ''); // "shadow 02" -> "02"
    bucket.push([n, shadowCss(mode[shadowName])]);
  }
}

// =================== EMIT CSS ===================
let out = `/* ============================================================
   kassirh — Design Tokens  (generated from design-tokens.tokens.json)
   Architecture: Fluent 2 semantic roles · Zinc neutrals · #f76626 primary
   Do NOT edit by hand — regenerate with scratchpad/gen-tokens.js
   ============================================================ */

:root {
  /* -------- Primitive palettes -------- */
${prim.join('\n')}

  /* -------- Radius ramp -------- */
${Object.entries(radMap).map(([k,v]) => `  --kx-radius-${k}: ${typeof v==='number'?v+'px':v};`).join('\n')}

  /* -------- Elevation (drop shadows) -------- */
${elev.map(([k,v]) => `  --kx-shadow-${k}: ${v};`).join('\n')}

  /* -------- Type: family + scale -------- */
  --kx-font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
${type.map(x => `  --kx-fs-${x.tier}: ${x.size}px;  --kx-lh-${x.tier}: ${x.lh}px;`).join('\n')}
  --kx-fw-extralight: 200; --kx-fw-light: 300; --kx-fw-regular: 400; --kx-fw-medium: 500; --kx-fw-semibold: 600; --kx-fw-bold: 700;

  /* -------- Semantic color roles (light) -------- */
${sem.map(([n,v]) => `  --${n}: ${v};`).join('\n')}

  /* -------- Overlay / scrim -------- */
  --kx-scrim: ${scrim};
}
`;

fs.writeFileSync(process.argv[3], out);
// also dump a JSON summary for the doc + style guide
fs.writeFileSync(process.argv[4], JSON.stringify({
  primitives: palette && Object.keys(palette),
  primVars: prim.map(s => s.trim().split(':')[0]),
  semantic: sem.map(([n,v,path]) => ({ var: '--'+n, value: v, path })),
  radius: radMap,
  type,
  elevation: elev.map((e)=>({name:'--kx-shadow-'+e[0], value:e[1]})),
  elevationDark: elevDark.map((e)=>({name:'--kx-shadow-'+e[0], value:e[1]})),
}, null, 2));
console.log('primitives:', prim.length, 'semantic:', sem.length, 'radius:', Object.keys(radMap).length, 'type:', type.length, 'elevation:', elev.length);

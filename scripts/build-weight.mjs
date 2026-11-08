// Generates weight-matching static assets so each mirror page type loads the same number and size of
// files as the live page type (measured in _source/profile.json). All content is original filler:
// JS = comment-padded module, CSS = comment-padded rules, fonts/images = padded binary/SVG. Nothing
// from the source site is used. Writes public/_w/* and data/loadout.json.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.join(import.meta.dirname, '..');
const prof = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '_source', 'profile.json'), 'utf8'));
const WDIR = path.join(ROOT, 'public', '_w');
fs.rmSync(WDIR, { recursive: true, force: true });
for (const d of ['js', 'css', 'font', 'img']) fs.mkdirSync(path.join(WDIR, d), { recursive: true });

// Round sizes into buckets so many pages share the same files (realistic shared bundles + good cache reuse).
const bucket = n => { const k = [8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640].map(x => x * 1024); return k.find(x => x >= n) ?? Math.ceil(n / 65536) * 65536; };
const made = { js: new Map(), css: new Map(), font: new Map(), img: new Map() };

function jsFile(bytes) {
  if (made.js.has(bytes)) return made.js.get(bytes);
  const id = `b${bytes}`;
  const head = `/* Ironline bundle ${id} — original filler for weight parity, not functional */\nexport const ${id}=(()=>{const t=Date.now();return{id:${JSON.stringify(id)},k:t}})();\n`;
  // pad to size; content is unique per file and compresses like real code-ish text
  let body = head, i = 0;
  while (Buffer.byteLength(body) < bytes) { body += `/* ${id}:${i} */ function f${i}(a,b){return (a^${i})+(b|${i & 255})} ;\n`; i++; }
  body = body.slice(0, bytes);
  const f = `js/${id}.js`; fs.writeFileSync(path.join(WDIR, f), body); made.js.set(bytes, f); return f;
}
function cssFile(bytes) {
  if (made.css.has(bytes)) return made.css.get(bytes);
  const id = `c${bytes}`; let body = `/* Ironline stylesheet ${id} — filler */\n`, i = 0;
  while (Buffer.byteLength(body) < bytes) { body += `.w-${id}-${i}{--x:${i};padding:${i % 20}px;margin:${i % 8}px;color:#${(i * 7 & 0xffffff).toString(16).padStart(6, '0')}}\n`; i++; }
  body = body.slice(0, bytes);
  const f = `css/${id}.css`; fs.writeFileSync(path.join(WDIR, f), body); made.css.set(bytes, f); return f;
}
function fontFile(bytes) {
  if (made.font.has(bytes)) return made.font.get(bytes);
  const id = `f${bytes}`; const buf = Buffer.alloc(bytes); buf.write('wOF2'); for (let i = 4; i < bytes; i++) buf[i] = (i * 31) & 0xff;
  const f = `font/${id}.woff2`; fs.writeFileSync(path.join(WDIR, f), buf); made.font.set(bytes, f); return f;
}
function imgFile(bytes) {
  if (made.img.has(bytes)) return made.img.get(bytes);
  const id = `i${bytes}`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750"><rect width="1200" height="750" fill="#e6e1d6"/><circle cx="600" cy="375" r="200" fill="#1f5f4a"/>`;
  let i = 0; while (Buffer.byteLength(svg) < bytes - 7) { svg += `<rect x="${i % 1200}" y="${(i * 7) % 750}" width="2" height="2" fill="#${(i & 0xffffff).toString(16).padStart(6, '0')}"/>`; i++; }
  svg = svg.slice(0, Math.max(0, bytes - 6)) + '</svg>';
  const f = `img/${id}.svg`; fs.writeFileSync(path.join(WDIR, f), svg); made.img.set(bytes, f); return f;
}

const loadout = {};
for (const [type, d] of Object.entries(prof)) {
  const a = d.assets;
  const pick = (kind, maker) => {
    const sizes = a[kind].sizes.slice();
    const avg = Math.round((a[kind].bytes || a[kind].count * 20000) / Math.max(1, a[kind].count));
    while (sizes.length < a[kind].count) sizes.push(avg); // profile measured fewer than count: pad with the average
    return sizes.slice(0, a[kind].count).map(s => '/_w/' + maker(bucket(Math.max(1024, s))));
  };
  loadout[type] = {
    htmlBytes: d.html.bytes,
    js: pick('script', jsFile),
    css: pick('css', cssFile),
    font: pick('font', fontFile),
    img: pick('img', imgFile),
  };
}
fs.writeFileSync(path.join(ROOT, 'data', 'loadout.json'), JSON.stringify(loadout));

// report
let files = 0, bytes = 0;
for (const sub of ['js', 'css', 'font', 'img']) for (const f of fs.readdirSync(path.join(WDIR, sub))) { files++; bytes += fs.statSync(path.join(WDIR, sub, f)).size; }
console.log(`${files} unique weight files, ${(bytes / 1048576).toFixed(1)} MB on disk`);
for (const [t, l] of Object.entries(loadout)) console.log(`${t.padEnd(15)} js ${l.js.length} css ${l.css.length} font ${l.font.length} img ${l.img.length}`);

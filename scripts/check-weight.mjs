// Compares each mirror page's asset counts + total bytes against the live profile.
// Usage: node scripts/check-weight.mjs [baseUrl]
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:3000';
const prof = JSON.parse(fs.readFileSync(new URL('../../_source/profile.json', import.meta.url), 'utf8'));
const SAMPLE = {
  home: '/us/en/index.html', plp: '/us/en/shop/c/3-in-1-helmets',
  pdp: '/us/en/shop/1-1-4-in-ratchet-tie-down-straps/p/94704-10',
  'dealer-detail': '/us/en/tools/find-a-dealer/3-state-harley-davidson/4533',
  motorcycle: '/us/en/motorcycles/street-glide.html', 'bike-builder': '/us/en/motorcycles/build-custom-motorcycle.html',
  marketplace: '/us/en/marketplace.html', kids: '/us/en/shop/c/kids', parts: '/us/en/shop/c/motorcycle-parts',
  'goods-gifts': '/us/en/shop/c/goods-gifts', 'discover-hd': '/us/en/discover-h-d.html', 'content-hub': '/us/en/content/stories.html',
};
const attr = (t, n) => t.match(new RegExp(`\\b${n}="([^"]+)"`))?.[1];
async function size(u) { try { const r = await fetch(base + u); return (await r.arrayBuffer()).byteLength; } catch { return 0; } }

for (const [type, path] of Object.entries(SAMPLE)) {
  const html = await (await fetch(base + path)).text();
  const js = [...html.matchAll(/<script[^>]+src="(\/_w\/[^"]+)"/g)].map(m => m[1]);
  const css = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/_w\/[^"]+)"/g)].map(m => m[1]);
  const font = [...html.matchAll(/<link[^>]+as="font"[^>]+href="(\/_w\/[^"]+)"/g)].map(m => m[1]);
  const img = [...html.matchAll(/<img[^>]+src="(\/_w\/[^"]+)"/g)].map(m => m[1]);
  const bytesOf = async list => (await Promise.all([...new Set(list)].map(size))).reduce((a, b) => a + b, 0);
  const [jsB, cssB, imgB] = await Promise.all([bytesOf(js), bytesOf(css), bytesOf(img)]);
  const P = prof[type].assets;
  const kb = n => (n / 1024).toFixed(0);
  console.log(`${type.padEnd(14)} js ${js.length}/${P.script.count} (${kb(jsB)}/${kb(P.script.bytes)}KB)  css ${css.length}/${P.css.count}  font ${font.length}/${P.font.count}  img ${img.length}/${P.img.count} (${kb(imgB)}/${kb(P.img.bytes)}KB)  html ${kb(Buffer.byteLength(html))}/${kb(prof[type].html.bytes)}KB`);
}

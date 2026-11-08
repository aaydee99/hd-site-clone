// Measures real SSR HTML size per loadout key (run against a server started with WEIGHT_NOPAD=1).
// Writes data/real-html.json. Usage: node scripts/measure-html.mjs [baseUrl]
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:3001';
const SAMPLE = {
  home: '/us/en/index.html', plp: '/us/en/shop/c/3-in-1-helmets', pdp: '/us/en/shop/1-1-4-in-ratchet-tie-down-straps/p/94704-10',
  'dealer-locator': '/us/en/tools/find-a-dealer/dealership-directory.html', 'dealer-detail': '/us/en/tools/find-a-dealer/3-state-harley-davidson/4533',
  motorcycle: '/us/en/motorcycles/street-glide.html', 'bike-builder': '/us/en/motorcycles/build-custom-motorcycle.html',
  content: '/us/en/content/rent-a-bike.html', marketplace: '/us/en/marketplace.html', kids: '/us/en/shop/c/kids',
  parts: '/us/en/shop/c/motorcycle-parts', 'goods-gifts': '/us/en/shop/c/goods-gifts', 'discover-hd': '/us/en/discover-h-d.html', 'content-hub': '/us/en/content/stories.html',
};
const out = {};
for (const [key, path] of Object.entries(SAMPLE)) {
  const html = await (await fetch(base + path)).text();
  out[key] = Buffer.byteLength(html);
}
fs.writeFileSync(new URL('../data/real-html.json', import.meta.url), JSON.stringify(out, null, 1));
console.log('real HTML sizes (bytes):', out);

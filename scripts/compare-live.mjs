// Compares the mirror's status codes + redirect targets with responses recorded from the live site
// (curl probes, 2026-11-07). Run against a server started with ORIGIN_REDIRECTS=1 (emulates the
// Cloudflare redirect rules) or against the Cloudflare-fronted test hostname.
// Usage: node scripts/compare-live.mjs [baseUrl]
const base = process.argv[2] || 'http://localhost:3100';

// [path, expected status, expected Location path (no query)]
const LIVE = [
  ['/', 302, '/locale/index.html'],
  ['/locale/index.html', 302, '/us/en/index.html'],
  ['/us', 301, '/us/en/index.html'],
  ['/us/en', 301, '/us/en/index.html'],
  ['/us/en/', 301, '/us/en/index.html'],
  ['/us/en/index.html', 200],
  ['/us/en/index.html/', 308, '/us/en/index.html'],
  ['/us/en/motorcycles/index.html', 200],
  ['/us/en/motorcycles/', 308, '/us/en/motorcycles'],
  ['/us/en/motorcycles', 307, '/us/en/motorcycles.html'],
  ['/us/en/motorcycles.html', 302, '/us/en/errors/404.html'],
  ['/US/EN/index.html', 301, '/us/EN/index.html'],
  ['/us/en/shop/c/3-in-1-helmets', 200],
  ['/us/en/shop/c/3-in-1-helmets/', 308, '/us/en/shop/c/3-in-1-helmets'],
  ['/us/en/shop/C/3-in-1-helmets', 307, '/us/en/shop/C/3-in-1-helmets.html'],
  ['/us/en/shop/c/nope', 307, '/us/en/not-found.html'],
  ['/us/en/shop/t/nope', 307, '/us/en/shop/t/nope.html'],
  ['/us/en/shop/p/123', 307, '/us/en/shop/p/123.html'],
  ['/us/en/shop/nope/p/123', 302, '/us/en/errors/404.html'],
  ['/us/en/shop/cart', 307, '/us/en/shop/cart.html'],
  ['/us/en/shop/cart.html', 302, '/us/en/errors/404.html'],
  ['/us/en/shop/search.html', 302, '/us/en/errors/404.html'],
  ['/us/en/shop', 307, '/us/en/shop.html'],
  ['/us/en/shop.html', 302, '/us/en/errors/404.html'],
  ['/us/en/shop/checkout.html', 302, '/us/en/errors/404.html'],
  ['/us/en/nope.html', 302, '/us/en/errors/404.html'],
  ['/us/en/sitemap.html', 302, '/us/en/errors/404.html'],
  ['/us/en/errors/404.html', 404],
  ['/us/en/not-found.html', 404],
  ['/us/en/errors/500.html', 500],
  ['/de/de/errors/404.html', 404],
  ['/us/en/tools/find-a-dealer.html', 200],
  ['/us/en/tools/find-a-dealer/3-state-harley-davidson/4533', 200],
  ['/us/en/tools/find-a-dealer/nope/9999', 200],
  ['/us/en/motorcycles/build-custom-motorcycle.html', 200],
  ['/de/de/motorcycles/build-custom-motorcycle.html', 302, '/de/de/motorcycles/h-d-sprint.html'],
  ['/de/de/index.html', 200],
  ['/jp/ja/index.html', 200],
  ['/gr/en/index.html', 302, '/us/en/index.html'],
  ['/ru/ru/index.html', 301, '/eu/en/index.html'],
  ['/cn/zh/index.html', 301, 'https://www.harley-davidson.cn/cn/zh/index.html'],
  ['/ca', 307, '/ca.html'],
  ['/ch', 307, '/ch.html'],
  ['/us/en/sitemap.xml', 200],
  ['/us/en/store/sitemap.xml', 200],
  ['/robots.txt', 200],
  ['/us/en/shop/c/3-in-1-helmets?x=1', 200],
  // locale + country variants (probed 2026-11-08)
  ['/aa/en.html', 301, '/aa/en/index.html'],
  ['/us/en.html', 301, '/us/en/index.html'],
  ['/de/de.html', 301, '/de/de/index.html'],
  ['/zz/en.html', 302, '/us/en/errors/404.html'],
  ['/gr/en.html', 302, '/us/en/errors/404.html'],
  ['/ru/ru.html', 302, '/us/en/errors/404.html'],
  ['/aa/EN.html', 302, '/us/en/errors/404.html'],
  ['/AA/en.html', 301, '/aa/en.html'],
  ['/aa/en.html/', 308, '/aa/en.html'],
  ['/aa/en.htm', 302, '/us/en/errors/404.html'],
  ['/aa/en/index.htm', 200],
  ['/aa/en/index', 307, '/aa/en/index.html'],
  ['/aa/en/', 301, '/aa/en/index.html'],
  ['/aa/en/shop.html', 302, '/aa/en/errors/404.html'],
  ['/aa', 301, '/aa/en/index.html'],
  ['/at', 301, '/at/de/index.html'],
  ['/nz', 301, '/nz/en/index.html'],
  ['/be', 307, '/be.html'],
  ['/ca.html', 301, '/ca/en/index.html'],
  ['/ch.html', 302, '/us/en/errors/404.html'],
  ['/de.html', 302, '/us/en/errors/404.html'],
  ['/aa.html', 302, '/us/en/errors/404.html'],
  ['/us.html', 302, '/us/en/errors/404.html'],
  ['/index.html', 302, '/us/en/errors/404.html'],
  ['/locale.html', 302, '/us/en/errors/404.html'],
  ['/us/en/index', 307, '/us/en/index.html'],
  ['/us/en/index.html?x=1', 200],
];

let pass = 0;
const fails = [];
for (const [p, status, loc] of LIVE) {
  const r = await fetch(base + p, { redirect: 'manual' });
  await r.arrayBuffer();
  let got = r.headers.get('location') ?? undefined;
  if (got) { const u = new URL(got, base); got = u.origin === new URL(base).origin ? u.pathname : u.origin + u.pathname; }
  const ok = r.status === status && (loc === undefined || got === loc);
  if (ok) pass++; else fails.push(`${p}\n    live:   ${status} ${loc ?? ''}\n    mirror: ${r.status} ${got ?? ''}`);
}
console.log(`${pass}/${LIVE.length} match the live site`);
if (fails.length) console.log('Mismatches:\n  ' + fails.join('\n  '));
process.exitCode = fails.length ? 1 : 0;

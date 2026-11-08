// Requests every manifest URL against a running server and reports status counts.
// Usage: node scripts/verify.mjs [baseUrl] [limit]
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:3000';
let paths = fs.readFileSync(new URL('../data/urls.txt', import.meta.url), 'utf8').split('\n').filter(Boolean);
if (process.argv[3]) { const n = +process.argv[3]; paths = paths.filter((_, i) => i % Math.ceil(paths.length / n) === 0); }
const counts = {}, bad = []; let i = 0, done = 0; const t = Date.now();
async function worker() {
  while (i < paths.length) {
    const p = paths[i++];
    try { const r = await fetch(base + p); await r.arrayBuffer(); counts[r.status] = (counts[r.status] || 0) + 1; if (r.status !== 200) bad.push([r.status, p]); }
    catch { counts.err = (counts.err || 0) + 1; bad.push(['err', p]); }
    if (++done % 5000 === 0) console.log(done, 'checked');
  }
}
await Promise.all(Array.from({ length: 16 }, worker));
console.log(`${paths.length} URLs in ${((Date.now() - t) / 1000).toFixed(1)}s`, counts);
if (bad.length) console.log(bad.slice(0, 20));
console.log('unknown path ->', (await fetch(base + '/us/en/not-a-real-page')).status);

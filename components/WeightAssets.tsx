import fs from 'node:fs';
import path from 'node:path';

// Emits the same number + size of script/style/font/image requests as the matching live page type,
// so page weight and caching behaviour match. Files are original filler under /_w/ (see scripts/build-weight.mjs).
type Loadout = { htmlBytes: number; js: string[]; css: string[]; font: string[]; img: string[] };
const LOADOUT: Record<string, Loadout> = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'loadout.json'), 'utf8'));

// Map a page (type + path) to a profiled live page type.
function loadoutKey(pageType: string, p: string): string {
  if (/\/marketplace\.html$/.test(p)) return 'marketplace';
  if (/\/discover-h-d\.html$/.test(p)) return 'discover-hd';
  if (/\/content\/stories\.html$/.test(p)) return 'content-hub';
  if (/\/shop\/c\/kids$/i.test(p)) return 'kids';
  if (/\/shop\/c\/(motorcycle-)?parts$/.test(p)) return 'parts';
  if (/\/shop\/c\/goods-gifts$/.test(p)) return 'goods-gifts';
  const byType: Record<string, string> = {
    home: 'home', product: 'pdp', category: 'plp', topic: 'plp', shop: 'plp',
    dealer: 'dealer-detail', 'dealer-directory': 'dealer-locator', motorcycle: 'motorcycle',
    'bike-builder': 'bike-builder', experience: 'content', service: 'content', content: 'content', root: 'home',
  };
  return byType[pageType] ?? 'content';
}

export function WeightHead({ type, path: p }: { type: string; path: string }) {
  const l = LOADOUT[loadoutKey(type, p)];
  if (!l) return null;
  return (
    <>
      {l.css.map(h => <link key={h} rel="stylesheet" href={h} />)}
      {l.font.map(h => <link key={h} rel="preload" as="font" type="font/woff2" href={h} crossOrigin="anonymous" />)}
      {l.js.map(h => <script key={h} src={h} defer />)}
    </>
  );
}


// Hidden images matching the live page's image count + total byte size (the cache-relevant part).
// HTML markup byte-padding is intentionally NOT faked: the real SSR markup stands on its own.
export function WeightBody({ type, path: p }: { type: string; path: string }) {
  const l = LOADOUT[loadoutKey(type, p)];
  if (!l) return null;
  return (
    <div aria-hidden style={{ display: 'none' }}>
      {l.img.map(src => <img key={src} src={src} alt="" width={1} height={1} />)}
    </div>
  );
}

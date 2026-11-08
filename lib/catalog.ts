import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

// URL manifest: the exact path list from the source sitemaps. Page content is generated placeholder
// text under a fictional brand; nothing from the source site (copy, images, styles, logos) is used.
export const BRAND = 'Ironline Motor Co.';

const DATA = path.join(process.cwd(), 'data');
export const PATHS: string[] = fs.readFileSync(path.join(DATA, 'urls.txt'), 'utf8').split('\n').filter(Boolean);
const ROUTES_FILE = path.join(DATA, 'routes.json');
/** Extra 200 pages found by crawling links (not in any sitemap). */
export const CRAWLED: string[] = fs.existsSync(ROUTES_FILE) ? JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8')).pages : [];
export const UNSUPPORTED_LOCALES = new Set<string>(fs.existsSync(ROUTES_FILE) ? JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8')).unsupportedLocales ?? [] : []);
export const PATH_SET = new Set([...PATHS, ...CRAWLED]);
export const SITEMAPS: Record<string, { kind: 'urlset' | 'index'; locs: string[] }> =
  JSON.parse(fs.readFileSync(path.join(DATA, 'sitemaps.json'), 'utf8'));

export type PageType =
  | 'sitemap' | 'category' | 'topic' | 'product' | 'shop' | 'dealer' | 'dealer-directory'
  | 'motorcycle' | 'experience' | 'service' | 'content';

export interface Classified { locale: string | null; segs: string[]; type: PageType }

const LOCALE_RE = /^\/([a-z]{2})\/([a-z]{2})(\/.*)?$/;
export function classify(p: string): Classified {
  const m = p.match(LOCALE_RE);
  const locale = m ? `${m[1]}/${m[2]}` : null;
  const segs = (m ? m[3] || '/' : p).split('/').filter(Boolean);
  const [a, b, , d] = segs;
  let type: PageType = 'content';
  if (p.endsWith('.xml')) type = 'sitemap';
  else if (a === 'shop' && b === 'c') type = 'category';
  else if (a === 'shop' && b === 't') type = 'topic';
  else if (a === 'shop' && segs[2] === 'p') type = 'product';
  else if (a === 'shop') type = 'shop';
  else if (a === 'tools' && b === 'find-a-dealer' && d) type = 'dealer';
  else if (a === 'tools' && b === 'find-a-dealer') type = 'dealer-directory';
  else if (a === 'motorcycles') type = 'motorcycle';
  else if (a === 'experiences' || a === 'book-your-event' || a === 'plan.html') type = 'experience';
  else if (a === 'customer-service') type = 'service';
  return { locale, segs, type };
}

type Index = Partial<Record<PageType, string[]>>;
const BY_LOCALE = new Map<string, Index>();
for (const p of [...PATHS, ...CRAWLED]) {
  const { locale, type } = classify(p);
  if (!locale || UNSUPPORTED_LOCALES.has(locale)) continue;
  const idx = BY_LOCALE.get(locale) ?? {};
  (idx[type] ??= []).push(p);
  BY_LOCALE.set(locale, idx);
}
export const LOCALES = [...BY_LOCALE.keys()].sort();
export const localeIndex = (l: string | null): Index => (l && BY_LOCALE.get(l)) || {};
export const hasLocale = (l: string) => BY_LOCALE.has(l);

// ---- text + deterministic placeholder helpers ----
const BRAND_SWAPS: [RegExp, string][] = [
  [/harley[- ]?davidson/gi, 'ironline'], [/\bharley\b/gi, 'ironline'], [/\bh[- ]d\b/gi, 'IL'], [/\bhd\b/gi, 'IL'],
  [/screamin[- ]eagle/gi, 'apex performance'], [/willie[- ]g/gi, 'signature'], [/milwaukee[- ]eight/gi, 'v-twin'],
  [/\bhog\b/gi, 'riders club'],
];
export function humanize(slug = ''): string {
  let s: string;
  try { s = decodeURIComponent(slug); } catch { s = slug; }
  s = s.replace(/\.html$/, '').replace(/[{}]/g, '').replace(/[-_]+/g, ' ').trim();
  for (const [re, w] of BRAND_SWAPS) s = s.replace(re, w);
  return s.replace(/\b\w/g, c => c.toUpperCase()) || 'Page';
}
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function pick(list: string[] = [], seed: string, n: number): string[] {
  if (!list.length) return [];
  const start = hash(seed) % list.length;
  const out = new Set<string>();
  for (let i = 0; i < Math.min(n, list.length); i++) out.add(list[(start + i * 7919) % list.length]);
  return [...out];
}
export const price = (seed: string) => `$${(20 + (hash(seed) % 98000) / 100).toFixed(2)}`;
export const lastSeg = (p: string) => classify(p).segs.at(-1) ?? '';
export const productName = (p: string) => humanize(classify(p).segs[1]);

export const COPY = [
  'Built for long days in the saddle and short trips across town alike.',
  'Engineered and tested to hold up to weather, vibration and years of use.',
  'Designed to fit cleanly with the rest of the lineup and install with standard tools.',
  'Pick a finish, choose your fitment and check availability at a nearby dealer.',
];

// ---- images: original SVG illustrations served by app/img/[...p]/route.ts ----
import { kindFor, type ArtKind } from './art';
import { makeT, type Key } from './i18n';
export function imgFor(p: string, override?: ArtKind): string {
  const c = classify(p);
  let kind: ArtKind = override ?? 'hero';
  if (!override) {
    if (c.type === 'product') kind = kindFor(c.segs[1]);
    else if (c.type === 'category' || c.type === 'topic' || c.type === 'shop') kind = kindFor(c.segs.at(-1) ?? '');
    else if (c.type === 'dealer') kind = 'dealer';
    else if (c.type === 'motorcycle') kind = 'bike';
  }
  return `/img/${kind}/${hash(p).toString(36)}.svg`;
}

// ---- well-known URLs ----
export const homeHref = (l: string | null) => (l ? `/${l}/index.html` : '/');
/** Bike builder lives at the source site's builder URL; only linked where that URL is a real page. */
export const builderHref = (l: string | null) => { const p = `/${l}/motorcycles/build-custom-motorcycle.html`; return l && PATH_SET.has(p) ? p : undefined; };

// ---- primary navigation ----
// Top-level sections mirror the source site's information architecture (factual category structure):
// same sections, same target URLs. Brand-specific labels use the Ironline brand, not the source trademark.
// Each section's mega-menu columns are derived from that locale's own category URLs.
type NavDef = { key: Key; hcol?: Key[]; href: (l: string) => string; cols?: { h: Key; match: RegExp; take?: number }[]; promo?: boolean };
const NAV: NavDef[] = [
  { key: 'motorcycles', href: l => firstExisting(l, [`/${l}/motorcycles/index.html`, `/${l}/products/bikes.html`]),
    cols: [{ h: 'lineup', match: /\/motorcycles\/[^/]+\.html$/, take: 8 }], promo: true },
  { key: 'marketplace', href: l => firstExisting(l, [`/${l}/marketplace.html`]),
    cols: [{ h: 'shopAll', match: /\/shop\/c\/(certified|used|pre-owned|marketplace)/, take: 6 }] },
  { key: 'parts', href: l => firstExisting(l, [`/${l}/shop/c/motorcycle-parts`, `/${l}/shop/c/parts`]),
    cols: [{ h: 'parts', match: /\/shop\/c\/(motorcycle-parts|.*-parts|parts-|oil|exhaust|wheel|seat|brake|light)/, take: 7 }] },
  { key: 'men', href: l => firstExisting(l, [`/${l}/shop/c/mens-motorcycle-clothes`, `/${l}/shop/c/mens-new-arrivals`]),
    cols: [{ h: 'men', match: /\/shop\/c\/mens?-/, take: 8 }] },
  { key: 'women', href: l => firstExisting(l, [`/${l}/shop/c/womens-motorcycle-clothes`, `/${l}/shop/c/womens-new-arrivals`]),
    cols: [{ h: 'women', match: /\/shop\/c\/womens?-/, take: 8 }] },
  { key: 'kids', href: l => firstExisting(l, [`/${l}/shop/c/kids`]),
    cols: [{ h: 'kids', match: /\/shop\/c\/(kids|baby|toddler|youth)/i, take: 8 }] },
  { key: 'goodsGifts', href: l => firstExisting(l, [`/${l}/shop/c/goods-gifts`]),
    cols: [{ h: 'goodsGifts', match: /\/shop\/c\/(goods-|gifts?-)/, take: 10 }] },
  { key: 'discover', href: l => firstExisting(l, [`/${l}/discover-h-d.html`, `/${l}/content/stories.html`]),
    cols: [{ h: 'explore', match: /\/(content|experiences)\//, take: 8 }] },
];
const UTILITY: NavDef[] = [
  { key: 'learnToRide', href: l => firstExisting(l, [`/${l}/content/motorcycle-training.html`, `/${l}/content/motorcycle-training/learn-to-ride.html`]) },
  { key: 'testRide', href: l => firstExisting(l, [`/${l}/tools/test-ride.html`, `/${l}/tools/find-a-dealer.html`]) },
  { key: 'dealerLocator', href: l => firstExisting(l, [`/${l}/tools/find-a-dealer.html`, `/${l}/tools/find-a-dealer/dealership-directory.html`]) },
  { key: 'trackOrder', href: l => firstExisting(l, [`/${l}/customer-service/shipping-and-delivery.html`, `/${l}/customer-service/contact-us.html`, `/${l}/customer-service/faq.html`]) },
];

function firstExisting(l: string, candidates: string[]): string {
  return candidates.find(p => PATH_SET.has(p)) ?? candidates[0];
}

export type NavItem = { key: string; label: string; href: string; promo?: boolean; cols: { h: string; items: string[] }[] };
export function navFor(locale: string | null): { primary: NavItem[]; utility: NavItem[] } {
  if (!locale) return { primary: [], utility: [] };
  const tr = makeT(locale);
  const idx = localeIndex(locale);
  const pool = [...(idx.category ?? []), ...(idx.topic ?? []), ...(idx.motorcycle ?? []), ...(idx.content ?? []), ...(idx.experience ?? [])];
  const discover = `${tr('discover')} ${BRAND.split(' ')[0]}`;
  const build = (defs: NavDef[]): NavItem[] => defs.map(d => ({
    key: d.key, label: d.key === 'discover' ? discover : tr(d.key), href: d.href(locale), promo: d.promo,
    cols: (d.cols ?? []).map(c => ({ h: tr(c.h), items: pool.filter(p => c.match.test(p)).slice(0, c.take ?? 6) })).filter(c => c.items.length),
  }));
  return { primary: build(NAV), utility: build(UTILITY) };
}

export function search(locale: string, q: string, limit = 60): string[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const all = Object.values(localeIndex(locale)).flat() as string[];
  const out: string[] = [];
  for (const p of all) {
    if (p.endsWith('.xml')) continue;
    const s = humanize(classify(p).segs.join(' ')).toLowerCase();
    if (terms.every(t => s.includes(t))) { out.push(p); if (out.length >= limit) break; }
  }
  return out;
}

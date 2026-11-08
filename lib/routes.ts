// Routing engine that mirrors the source site's URL behaviour (status codes + redirect targets).
// Shared by proxy.ts and the catch-all page.
//
// Split of responsibilities:
//   Cloudflare (../cloudflare/): pattern redirects + exact crawled redirects (Bulk Redirects), caching, cookies, headers.
//   Origin (here): rules that need the page list -- unknown path -> 404/not-found redirects, error pages, dynamic dealers.
// Set ORIGIN_REDIRECTS=1 to have the origin also apply the Cloudflare redirect rules (local testing without Cloudflare).
//
// Data:
//   data/urls.txt     every URL in the source sitemaps (served 200)
//   data/routes.json  crawl results: extra 200 pages + recorded redirects/404s per path
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(process.cwd(), 'data');
const urls = fs.readFileSync(path.join(DATA, 'urls.txt'), 'utf8').split('\n').filter(Boolean);
type Routes = { pages: string[]; redirects: Record<string, [number, string]>; missing: string[]; unsupportedLocales?: string[] };
const routes: Routes = fs.existsSync(path.join(DATA, 'routes.json'))
  ? JSON.parse(fs.readFileSync(path.join(DATA, 'routes.json'), 'utf8'))
  : { pages: [], redirects: {}, missing: [] };

const UNSUPPORTED = new Set(routes.unsupportedLocales ?? []);
const MISSING = new Set(routes.missing);
const localeOf = (p: string) => p.match(/^\/([a-z]{2}\/[a-z]{2})\//)?.[1];
// Sitemap URLs + every sitemap file itself (store/sitemap.xml indexes are listed only in robots.txt).
const sitemapFiles = Object.keys(JSON.parse(fs.readFileSync(path.join(DATA, 'sitemaps.json'), 'utf8')));
export const SITEMAP_PATHS = new Set([...urls, ...sitemapFiles].filter(p => !MISSING.has(p) && !UNSUPPORTED.has(localeOf(p) ?? '')));
export const CRAWLED_PAGES = new Set(routes.pages);
export const LOCALE_SET = new Set(
  [...SITEMAP_PATHS, ...routes.pages].map(localeOf).filter((x): x is string => !!x && !UNSUPPORTED.has(x)),
);
const DEFAULT_HOME = '/us/en/index.html';

/** Countries whose bare /{cc} 307s to /{cc}.html on the live site (multi-language countries). */
const COUNTRY_TO_HTML = new Set((routes as Routes & { countryToHtml?: string[] }).countryToHtml ?? []);

export type Decision =
  | { kind: 'page'; path: string; source: 'sitemap' | 'crawl' | 'dynamic' }
  | { kind: 'redirect'; status: 301 | 302 | 307 | 308; location: string }
  | { kind: 'error'; status: 404 | 500; locale: string | null };

const isDealer = (p: string) => /^\/[a-z]{2}\/[a-z]{2}\/tools\/find-a-dealer\/[^/]+\/[^/]+$/.test(p);

export function decide(p: string): Decision {
  // exact matches first
  if (SITEMAP_PATHS.has(p)) return { kind: 'page', path: p, source: 'sitemap' };
  if (CRAWLED_PAGES.has(p)) return { kind: 'page', path: p, source: 'crawl' };
  const cf = EMULATE_CF ? cloudflareRedirect(p) : null;
  if (cf) return cf;
  return originDecide(p);
}

const EMULATE_CF = process.env.ORIGIN_REDIRECTS === '1';

/** Redirects that Cloudflare handles (mirrors ../cloudflare/ rules). Only used when ORIGIN_REDIRECTS=1. */
export function cloudflareRedirect(p: string): Decision | null {
  const rec = routes.redirects[p];
  if (rec) return { kind: 'redirect', status: rec[0] as 301 | 302 | 307 | 308, location: rec[1] };

  // root + locale chooser
  if (p === '/') return { kind: 'redirect', status: 302, location: '/locale/index.html' };
  if (p === '/locale/index.html') return { kind: 'redirect', status: 302, location: DEFAULT_HOME };

  // locale root (/us/en, /us/en/) -> /us/en/index.html (301); checked before the trailing-slash rule,
  // same order as the Cloudflare rules
  const lr = p.match(/^\/([a-z]{2}\/[a-z]{2})\/?$/);
  if (lr && LOCALE_SET.has(lr[1])) return { kind: 'redirect', status: 301, location: `/${lr[1]}/index.html` };

  // trailing slash -> strip (308)
  if (p.length > 1 && p.endsWith('/')) return { kind: 'redirect', status: 308, location: p.replace(/\/+$/, '') };

  const segs = p.split('/').filter(Boolean);
  // uppercase country segment -> lowercase (301)
  if (segs[0] && segs[0] !== segs[0].toLowerCase() && /^[A-Za-z]{2}$/.test(segs[0]))
    return { kind: 'redirect', status: 301, location: '/' + [segs[0].toLowerCase(), ...segs.slice(1)].join('/') };

  // multi-language countries: /be, /ca, /ch -> /{cc}.html (307). Other bare countries are exact 301s above.
  if (segs.length === 1 && COUNTRY_TO_HTML.has(segs[0])) return { kind: 'redirect', status: 307, location: `/${segs[0]}.html` };

  // /{cc}/{ll}.html -> /{cc}/{ll}/index.html (301) for supported locales
  const lh = p.match(/^\/([a-z]{2}\/[a-z]{2})\.html$/);
  if (lh && LOCALE_SET.has(lh[1])) return { kind: 'redirect', status: 301, location: `/${lh[1]}/index.html` };

  const locale = segs.length >= 2 ? `${segs[0]}/${segs[1]}` : null;
  if (locale && !LOCALE_SET.has(locale) && /^[a-z]{2}\/[a-z]{2}$/.test(locale) && segs.length > 2)
    return { kind: 'redirect', status: 302, location: DEFAULT_HOME };                           // unsupported locale: /gr/en/...
  if (locale && LOCALE_SET.has(locale) && segs.length === 2)
    return { kind: 'redirect', status: 301, location: `/${locale}/index.html` };               // /us/en -> /us/en/index.html
  return null;
}

/** Origin-side decisions: need the page list, so they can't be Cloudflare rules. */
function originDecide(p: string): Decision {
  if (p === '/') return { kind: 'page', path: p, source: 'dynamic' };                           // region chooser (Cloudflare 302s / first)
  const segs = p.split('/').filter(Boolean);
  const locale = segs.length >= 3 ? `${segs[0]}/${segs[1]}` : null;
  // anything outside a supported locale folder (/index.html, /de.html, /gr/en.html, /aa/EN.html) -> US 404 page
  if (!locale || !LOCALE_SET.has(locale)) return { kind: 'redirect', status: 302, location: `${DEFAULT_HOME.replace('index.html', '')}errors/404.html` };
  const L = `/${locale}`;
  const rest = segs.slice(2).join('/');
  if (rest === 'index.html' || rest === 'index.htm') return { kind: 'page', path: p, source: 'dynamic' }; // locale home (.htm also 200 live)
  if (rest === 'errors/404.html' || rest === 'not-found.html') return { kind: 'error', status: 404, locale };
  if (rest === 'errors/500.html') return { kind: 'error', status: 500, locale };
  if (isDealer(p)) return { kind: 'page', path: p, source: 'dynamic' };                         // any dealer slug/id renders
  if (MISSING.has(p)) return { kind: 'redirect', status: 302, location: `${L}/errors/404.html` };

  if (/^shop\/c\/[^/]+$/.test(rest)) return { kind: 'redirect', status: 307, location: `${L}/not-found.html` };
  if (/^shop\/[^/]+\/p\/[^/]+$/.test(rest)) return { kind: 'redirect', status: 302, location: `${L}/errors/404.html` };
  const last = segs.at(-1)!;
  if (!last.includes('.')) return { kind: 'redirect', status: 307, location: `${p}.html` };     // extensionless -> .html
  return { kind: 'redirect', status: 302, location: `${L}/errors/404.html` };                    // unknown .html
}


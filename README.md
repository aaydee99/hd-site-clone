# Ironline mirror-architecture test site (Next.js 16)

This site copies the **URL architecture** of the source site: the same sitemap URLs, the same locales, the same sitemap files, and the same redirect and error behaviour (status codes and targets). All content (text, illustrations, logo, design) is original placeholder material under the fictional brand "Ironline Motor Co.".

## Run

```bash
npm install
npm run build
npm start                                   # behind Cloudflare: origin rules only
ORIGIN_REDIRECTS=1 npx next start -p 3100   # local, no Cloudflare: also applies the Cloudflare redirect rules
node scripts/compare-live.mjs http://localhost:3100        # 47 recorded live responses
node scripts/verify.mjs http://localhost:3100 5000         # sample of sitemap URLs (omit 5000 for all)
```

## Who does what

| Concern | Where |
|---|---|
| Pattern redirects (`/`, `/us/en/`, trailing slash, uppercase, bare country, unsupported locale) | Cloudflare Redirect Rules (`../cloudflare/`) |
| One-off redirects seen on the live site | Cloudflare Bulk Redirects (`../cloudflare/bulk-redirects.template.csv`) |
| Caching, Cache-Control, cookies, header cleanup | Cloudflare Cache Rules and Transform Rules (`../cloudflare/RULES.md`) |
| Redirects that need the page list (unknown `.html` -> `errors/404.html`, unknown `shop/c/*` -> `not-found.html`, extensionless -> `.html`) | `proxy.ts` + `lib/routes.ts` |
| Pages, sitemaps, robots.txt | Next.js |

The origin sets no Cache-Control, cookie or cache-tag headers. The one exception is Next's own ISR `Cache-Control`, which the Cloudflare cache and header rules override.

## Files

| Piece | File |
|---|---|
| Sitemap URL manifest | `data/urls.txt` |
| Which URLs each sitemap file lists | `data/sitemaps.json` |
| Extra pages, exact redirects and unsupported locales (from home-page links, probes, crawl) | `data/routes.json` |
| Routing engine | `lib/routes.ts` |
| Catch-all page and templates | `app/[...slug]/page.tsx`, `components/templates.tsx` |
| Bike builder at `/us/en/motorcycles/build-custom-motorcycle.html` | `components/BikeBuilder.tsx` |
| Cart (drawer) and search (dropdown): the source site has no URL for either | `components/interactive.tsx` |
| Original SVG illustrations, `/img/{kind}/{seed}.svg` | `lib/art.ts`, `app/img/[...p]/route.ts` |

## Regenerating

```bash
cd ../_source && node build-routes.mjs      # rebuild data/routes.json (reads crawl.jsonl if present)
cd .. && node cloudflare/generate.mjs your.test.hostname
```

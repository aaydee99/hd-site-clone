import { NextRequest } from 'next/server';
import { PATH_SET, SITEMAPS } from '@/lib/catalog';

// Serves every *.xml URL from the source sitemaps (rewritten to /sitemap-xml by proxy.ts), with the same
// urlset / sitemapindex structure and the same child URLs, pointed at this site's origin.
export async function GET(req: NextRequest) {
  const p = req.headers.get('x-sitemap-path') ?? req.nextUrl.searchParams.get('p') ?? '';
  const sm = SITEMAPS[p];
  if (!sm && !PATH_SET.has(p)) return new Response('404 Not Found', { status: 404 });
  const origin = req.nextUrl.origin;
  const kind = sm?.kind ?? 'urlset';
  const tag = kind === 'index' ? 'sitemapindex' : 'urlset';
  const item = kind === 'index' ? 'sitemap' : 'url';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = (sm?.locs ?? []).map(l => `  <${item}><loc>${esc(origin + l)}</loc></${item}>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<${tag} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</${tag}>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
}

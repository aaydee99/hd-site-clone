import { NextRequest } from 'next/server';
import { SITEMAPS } from '@/lib/catalog';

// Same sitemap list as the source robots.txt, but crawling is disallowed: this is a test site.
export async function GET(req: NextRequest) {
  const roots = Object.keys(SITEMAPS).filter(k => /^\/[a-z]{2}\/[a-z]{2}\/(store\/)?sitemap\.xml$/.test(k)).sort();
  const body = `User-agent: *\nDisallow: /\n\n${roots.map(r => `Sitemap: ${req.nextUrl.origin}${r}`).join('\n')}\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

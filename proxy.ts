import { NextRequest, NextResponse } from 'next/server';
import { decide } from '@/lib/routes';

// Origin-side routing only for rules that need the page list (Cloudflare can't know which pages exist):
// unknown paths -> the source site's 404 / not-found redirects, error pages, *.xml sitemaps.
// Pattern redirects, caching, cookies and headers are Cloudflare rules (../cloudflare/). No headers are set here.
const INTERNAL = /^\/(_next|_w|img|api|sitemap-xml|icon\.svg|favicon\.ico|mirror-404|mirror-500)(\/|$)/;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (INTERNAL.test(pathname) || pathname === '/robots.txt') return NextResponse.next();

  const d = decide(pathname);
  if (d.kind === 'redirect') return NextResponse.redirect(new URL(d.location, req.nextUrl.origin), d.status);
  if (d.kind === 'error') {
    const url = req.nextUrl.clone();
    url.pathname = d.status === 500 ? '/mirror-500' : '/mirror-404';
    url.search = '';
    return NextResponse.rewrite(url);
  }
  if (pathname.endsWith('.xml')) {
    const url = req.nextUrl.clone();
    url.pathname = '/sitemap-xml';
    const headers = new Headers(req.headers);
    headers.set('x-sitemap-path', pathname);
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };

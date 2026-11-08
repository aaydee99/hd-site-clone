import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/chrome';
import { BuilderPage, LocaleHome, TEMPLATES, titleFor } from '@/components/templates';
import { classify } from '@/lib/catalog';
import { decide } from '@/lib/routes';

// Pages render on first request, then are cached by ISR. Redirects/errors are decided in proxy.ts
// (origin rules) and Cloudflare (pattern rules); anything that reaches here and isn't a page is a 404.
export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

type Params = { params: Promise<{ slug: string[] }> };

// Next decodes params; re-encode so lookups match the manifest's encoded form (e.g. %7Bproduct-name%7D).
const toPath = (slug: string[]) => '/' + slug.map(s => encodeURIComponent(decodeURIComponent(s))).join('/');

function resolve(slug: string[]) {
  const path = toPath(slug);
  const d = decide(path);
  if (d.kind !== 'page') return null;
  const c = classify(path);
  const rest = c.segs.join('/');
  if (rest === 'index.html' || rest === 'index.htm') return { kind: 'home' as const, path, locale: c.locale! };
  if (rest === 'motorcycles/build-custom-motorcycle.html') return { kind: 'builder' as const, path, locale: c.locale! };
  if (c.type === 'sitemap') return null; // *.xml is rewritten to /sitemap-xml by proxy.ts
  return { kind: 'page' as const, path, c };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = resolve((await params).slug);
  if (!r) return {};
  if (r.kind === 'home') return { title: `Home (${r.locale.toUpperCase()})` };
  if (r.kind === 'builder') return { title: 'Bike Builder' };
  return { title: titleFor({ path: r.path, c: r.c }), alternates: { canonical: r.path } };
}

export default async function Page({ params }: Params) {
  const r = resolve((await params).slug);
  if (!r) notFound();
  if (r.kind === 'home') return <Shell path={r.path} locale={r.locale} type="home"><LocaleHome locale={r.locale} /></Shell>;
  if (r.kind === 'builder') return <Shell path={r.path} locale={r.locale} type="bike-builder"><BuilderPage locale={r.locale} /></Shell>;
  const T = TEMPLATES[r.c.type as keyof typeof TEMPLATES] ?? TEMPLATES.content;
  return <Shell path={r.path} locale={r.c.locale} type={r.c.type}><T path={r.path} c={r.c} /></Shell>;
}

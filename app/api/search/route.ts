import { NextRequest } from 'next/server';
import { classify, hasLocale, humanize, imgFor, lastSeg, price, productName, search } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  const l = req.nextUrl.searchParams.get('l') ?? '', q = req.nextUrl.searchParams.get('q') ?? '';
  if (!hasLocale(l)) return Response.json({ items: [] }, { status: 400 });
  const items = search(l, q).map(p => {
    const product = classify(p).type === 'product';
    return { path: p, product, name: product ? productName(p) : humanize(lastSeg(p)), price: product ? price(p) : undefined, img: imgFor(p) };
  });
  return Response.json({ items });
}

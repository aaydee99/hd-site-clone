import { ART_KINDS, ArtKind, drawArt } from '@/lib/art';

// /img/{kind}/{seed}.svg -> original procedurally drawn illustration (deterministic per seed).
export async function GET(_req: Request, { params }: { params: Promise<{ p: string[] }> }) {
  const [kind, file] = (await params).p;
  if (!ART_KINDS.includes(kind as ArtKind) || !file?.endsWith('.svg')) return new Response('Not found', { status: 404 });
  return new Response(drawArt(kind as ArtKind, file.slice(0, -4)), {
    headers: { 'content-type': 'image/svg+xml' },
  });
}

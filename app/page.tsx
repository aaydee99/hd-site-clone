import { Shell } from '@/components/chrome';
import { RegionChooser } from '@/components/templates';

export const dynamic = 'force-dynamic'; // SSR on every request; Cloudflare does the caching

export default function Home() {
  return <Shell path="/" locale={null} type="root"><RegionChooser /></Shell>;
}

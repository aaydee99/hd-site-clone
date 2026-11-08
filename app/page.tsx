import { Shell } from '@/components/chrome';
import { RegionChooser } from '@/components/templates';

export const revalidate = 3600;

export default function Home() {
  return <Shell path="/" locale={null} type="root"><RegionChooser /></Shell>;
}

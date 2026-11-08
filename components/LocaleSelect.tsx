'use client';
import { useRouter } from 'next/navigation';

export default function LocaleSelect({ locales, current }: { locales: string[]; current: string | null }) {
  const router = useRouter();
  return (
    <select className="locale" aria-label="Region" value={current ? `/${current}` : ''} onChange={e => router.push(e.target.value)}>
      {!current && <option value="">Region</option>}
      {locales.map(l => <option key={l} value={`/${l}`}>{l.toUpperCase()}</option>)}
    </select>
  );
}

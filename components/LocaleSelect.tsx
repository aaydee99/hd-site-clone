'use client';
import { flag, regionLabel } from '@/lib/i18n';

// Region picker showing flag + localised "Country - Language" label, matching the source site's structure.
export default function LocaleSelect({ locales, current }: { locales: string[]; current: string | null }) {
  return (
    <span className="region">
      {current && <span className="region-flag" aria-hidden>{flag(current.split('/')[0])}</span>}
      <select className="locale" aria-label="Region"
        value={current ? `/${current}` : ''} onChange={e => { window.location.href = e.target.value; }}>
        {!current && <option value="">Region</option>}
        {locales.map(l => <option key={l} value={`/${l}`}>{flag(l.split('/')[0])}  {regionLabel(l)}</option>)}
      </select>
    </span>
  );
}

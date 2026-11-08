'use client';

export default function LocaleSelect({ locales, current }: { locales: string[]; current: string | null }) {
  return (
    <select className="locale" aria-label="Region" value={current ? `/${current}` : ''} onChange={e => { window.location.href = e.target.value; }}>
      {!current && <option value="">Region</option>}
      {locales.map(l => <option key={l} value={`/${l}`}>{l.toUpperCase()}</option>)}
    </select>
  );
}

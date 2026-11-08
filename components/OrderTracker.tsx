'use client';
import { useEffect, useMemo, useState } from 'react';
import type { TrackerLabels } from '@/lib/i18n';

// Order tracker drawer. Like the source site, "Track Order" is a button that opens a drawer
// (no URL of its own). All logic and data here are original demo data derived from the order number.

type Product = { name: string; img: string; price: string; path: string };

export function TrackOrderButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className ?? 'linkish'} onClick={() => window.dispatchEvent(new Event('open-track-order'))}>
      {label}
    </button>
  );
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const CARRIERS = ['Ironline Express', 'RoadRunner Freight', 'Northbound Parcel', 'Coastline Courier'];
const ORDER_RE = /^IL-?\d{6}$/i;

type Result = {
  order: string; stage: number; carrier: string; tracking: string;
  dates: Date[]; eta: Date; items: (Product & { qty: number })[];
};

function lookup(order: string, contact: string, catalog: Product[]): Result | null {
  const o = order.trim().toUpperCase().replace(/^IL-?/, 'IL-');
  if (!ORDER_RE.test(o) || contact.trim().length < 3) return null;
  const h = hash(o + '|' + contact.trim().toLowerCase());
  if (h % 17 === 0) return null; // a small share of lookups "not found", so the error path is testable
  const stage = 1 + (h % 4); // 1 processing .. 4 delivered
  const placed = new Date(Date.now() - (2 + (h % 9)) * 86400000);
  const dates = [0, 1, 2, 4, 5].map(d => new Date(placed.getTime() + d * 86400000));
  const n = 1 + (h % 3);
  const items = Array.from({ length: n }, (_, i) => ({ ...catalog[(h + i * 7919) % Math.max(1, catalog.length)], qty: 1 + ((h >> (i + 3)) % 2) }))
    .filter(x => x.name);
  return {
    order: o, stage, carrier: CARRIERS[h % CARRIERS.length],
    tracking: `1Z${(h % 1e9).toString().padStart(9, '0')}${(hash(o) % 1e7).toString().padStart(7, '0')}`,
    dates, eta: dates[4], items,
  };
}

export function TrackOrderDrawer({ labels: L, locale, catalog }: { labels: TrackerLabels; locale: string; catalog: Product[] }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const lang = locale.split('/')[1] ?? 'en';
  const fmt = useMemo(() => {
    try { return new Intl.DateTimeFormat(`${lang}-${locale.split('/')[0].toUpperCase()}`, { weekday: 'short', month: 'short', day: 'numeric' }); }
    catch { return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
  }, [lang, locale]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('open-track-order', onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('open-track-order', onOpen); window.removeEventListener('keydown', onKey); };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const o = order.trim().toUpperCase().replace(/^IL-?/, 'IL-');
    if (!ORDER_RE.test(o) || contact.trim().length < 3) { setError(L.invalid); setResult(null); return; }
    const r = lookup(order, contact, catalog);
    if (!r) { setError(L.notFound); setResult(null); return; }
    setError(null); setResult(r);
  };

  const steps = [L.placed, L.processing, L.shipped, L.outForDelivery, L.delivered];

  return (
    <div className={`drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer-panel tracker" role="dialog" aria-label={L.title}>
        <div className="drawer-head">
          <h3>{L.title}</h3>
          <button type="button" className="icon-btn" aria-label={L.close} onClick={() => setOpen(false)}>&#x2715;</button>
        </div>
        <div className="drawer-body">
          {!result ? (
            <form className="tracker-form" onSubmit={submit} noValidate>
              <p className="muted">{L.intro}</p>
              <label>{L.orderNumber}
                <input value={order} onChange={e => setOrder(e.target.value)} placeholder="IL-123456" autoComplete="off" />
              </label>
              <label>{L.emailOrPostal}
                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="name@example.com" autoComplete="off" />
              </label>
              {error && <p className="warn">{error}</p>}
              <button type="submit" className="btn wide">{L.track}</button>
              <p className="muted small">{L.hint}</p>
            </form>
          ) : (
            <div className="tracker-result">
              <div className="tracker-summary">
                <span className="eyebrow">{result.order}</span>
                <h4>{steps[result.stage]}</h4>
                <p className="muted">
                  {result.stage === 4 ? `${L.deliveredOn} ${fmt.format(result.dates[4])}` : `${L.estDelivery}: ${fmt.format(result.eta)}`}
                </p>
              </div>
              <ol className="tracker-steps">
                {steps.map((s, i) => (
                  <li key={s} className={i <= result.stage ? 'done' : ''}>
                    <i aria-hidden />
                    <div><b>{s}</b>{i <= result.stage && <small>{fmt.format(result.dates[i])}</small>}</div>
                  </li>
                ))}
              </ol>
              {result.stage >= 2 && (
                <dl className="tracker-meta">
                  <dt>{L.carrier}</dt><dd>{result.carrier}</dd>
                  <dt>{L.trackingNumber}</dt><dd><code>{result.tracking}</code></dd>
                </dl>
              )}
              {result.items.length > 0 && (
                <>
                  <h4 className="tracker-h">{L.items}</h4>
                  {result.items.map(it => (
                    <a key={it.path} className="cart-line" href={it.path}>
                      <img src={it.img} alt="" width={96} height={60} />
                      <div><span>{it.name}</span><small>{L.qty} {it.qty}</small></div>
                      <b>{it.price}</b>
                    </a>
                  ))}
                </>
              )}
              <button type="button" className="btn ghost wide" onClick={() => { setResult(null); setOrder(''); setContact(''); }}>{L.another}</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

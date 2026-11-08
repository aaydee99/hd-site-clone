'use client';
import { useEffect, useState } from 'react';
import Link from '@/components/PlainLink';

// ---------- cart (per-browser, localStorage) ----------
type Item = { path: string; name: string; price: number; qty: number; img: string; option?: string };
const KEY = 'ironline-cart';
const read = (): Item[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const write = (items: Item[]) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* blocked */ } window.dispatchEvent(new Event('cart')); };
function useCart() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { const f = () => setItems(read()); f(); window.addEventListener('cart', f); window.addEventListener('storage', f); return () => { window.removeEventListener('cart', f); window.removeEventListener('storage', f); }; }, []);
  return items;
}
const usd = (n: number) => `$${n.toFixed(2)}`;

export function CartButton() {
  const n = useCart().reduce((s, i) => s + i.qty, 0);
  return (
    <button type="button" className="icon-btn" aria-label={`Cart, ${n} items`} onClick={() => window.dispatchEvent(new Event('open-cart'))}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>
      {n > 0 && <span className="badge">{n}</span>}
    </button>
  );
}

export function AddToCart({ item, options }: { item: Omit<Item, 'qty' | 'option'>; options?: string[] }) {
  const [opt, setOpt] = useState(options?.[0] ?? '');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = () => {
    const items = read();
    const ex = items.find(i => i.path === item.path && i.option === opt);
    if (ex) ex.qty += qty; else items.push({ ...item, qty, option: opt || undefined });
    write(items); setAdded(true); setTimeout(() => setAdded(false), 2200); window.dispatchEvent(new Event('open-cart'));
  };
  return (
    <div className="atc">
      {options && <div className="chips">{options.map(o => <button key={o} type="button" className={`chip${o === opt ? ' on' : ''}`} onClick={() => setOpt(o)}>{o}</button>)}</div>}
      <div className="atc-row">
        <div className="qty"><button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button><span>{qty}</span><button type="button" onClick={() => setQty(q => q + 1)} aria-label="Increase">+</button></div>
        <button type="button" className="btn wide" onClick={add}>{added ? 'Added ✓' : 'Add to cart'}</button>
      </div>
    </div>
  );
}

/** Slide-out cart (the source site has no cart URL; its cart is in-page). */
export function CartDrawer({ shopHref }: { shopHref: string }) {
  const items = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => { const f = () => setOpen(true); window.addEventListener('open-cart', f); return () => window.removeEventListener('open-cart', f); }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub > 75 || sub === 0 ? 0 : 9.95;
  const upd = (k: number, q: number) => { const it = read(); if (q <= 0) it.splice(k, 1); else it[k].qty = q; write(it); };
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <div className={`drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer-panel" role="dialog" aria-label="Cart">
        <div className="drawer-head">
          <h3>Cart ({count})</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}>&#x2715;</button>
        </div>
        {!items.length ? (
          <div className="empty"><p>Your cart is empty.</p><Link className="btn" href={shopHref} onClick={() => setOpen(false)}>Start shopping</Link></div>
        ) : (
          <>
            <div className="drawer-body">
              {items.map((i, k) => (
                <div className="cart-line" key={i.path + (i.option ?? '')}>
                  <img src={i.img} alt="" width={96} height={60} />
                  <div>
                    <Link href={i.path} onClick={() => setOpen(false)}>{i.name}</Link>
                    {i.option && <small>{i.option}</small>}
                    <div className="qty"><button type="button" onClick={() => upd(k, i.qty - 1)}>&minus;</button><span>{i.qty}</span><button type="button" onClick={() => upd(k, i.qty + 1)}>+</button></div>
                  </div>
                  <b>{usd(i.price * i.qty)}</b>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <p><span>Subtotal</span><span>{usd(sub)}</span></p>
              <p><span>Shipping</span><span>{ship ? usd(ship) : 'Free'}</span></p>
              <p className="tot"><span>Total</span><span>{usd(sub + ship)}</span></p>
              <button type="button" className="btn wide" onClick={() => alert('Checkout is disabled on this test site.')}>Checkout</button>
              <p className="muted small">Demo only. No orders are placed and no payment details are collected.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ---------- payment estimator ----------
export function PaymentCalculator() {
  const [price, setPrice] = useState(22000), [down, setDown] = useState(2500), [apr, setApr] = useState(6.9), [term, setTerm] = useState(60);
  const P = Math.max(0, price - down), r = apr / 100 / 12;
  const pay = r ? (P * r) / (1 - Math.pow(1 + r, -term)) : P / term;
  const row = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, fmt: (n: number) => string) => (
    <label className="calc-row"><span>{label}<b>{fmt(v)}</b></span><input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} /></label>
  );
  return (
    <div className="calc">
      <div>
        {row('Vehicle price', price, setPrice, 5000, 50000, 250, n => `$${n.toLocaleString()}`)}
        {row('Down payment', down, setDown, 0, 20000, 250, n => `$${n.toLocaleString()}`)}
        {row('APR', apr, setApr, 0, 20, 0.1, n => `${n.toFixed(1)}%`)}
        {row('Term', term, setTerm, 12, 84, 12, n => `${n} months`)}
      </div>
      <div className="calc-out"><span>Estimated monthly payment</span><b>${pay.toFixed(2)}</b><small>Total of payments ${(pay * term).toLocaleString(undefined, { maximumFractionDigits: 0 })} · illustrative only</small></div>
    </div>
  );
}

// ---------- recall lookup (demo) ----------
export function RecallLookup() {
  const [vin, setVin] = useState(''), [res, setRes] = useState<string | null>(null);
  const ok = /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
  return (
    <form className="lookup" onSubmit={e => { e.preventDefault(); setRes(ok ? 'No open recalls found for this VIN (demo data).' : 'Enter a valid 17-character VIN.'); }}>
      <label>Vehicle Identification Number<input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} maxLength={17} placeholder="17 characters" /></label>
      <button className="btn" type="submit">Check recalls</button>
      {res && <p className={ok ? 'note' : 'warn'}>{res}</p>}
    </form>
  );
}

// ---------- search (dropdown; the source site has no search URL) ----------
type Hit = { path: string; product: boolean; name: string; price?: string; img: string };
export function SearchBox({ locale }: { locale: string }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?l=${encodeURIComponent(locale)}&q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal })
        .then(r => r.json()).then(d => setHits(d.items)).catch(() => {});
    }, 180);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [q, locale]);
  return (
    <div className="search-wrap" onFocus={() => setOpen(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <form className="search" role="search" onSubmit={e => { e.preventDefault(); if (hits[0]) window.location.href = hits[0].path; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search parts, gear, dealers" aria-label="Search" />
      </form>
      {open && hits.length > 0 && (
        <div className="search-drop">
          {hits.slice(0, 8).map(h => (
            <Link key={h.path} href={h.path} className="search-hit" prefetch={false} onClick={() => setOpen(false)}>
              <img src={h.img} alt="" width={64} height={40} />
              <span><b>{h.name}</b>{h.price && <small>{h.price}</small>}</span>
            </Link>
          ))}
          <p className="muted small">{hits.length >= 60 ? '60+' : hits.length} matches</p>
        </div>
      )}
    </div>
  );
}

// ---------- mobile menu toggle ----------
export function MenuToggle() {
  return <button type="button" className="icon-btn menu-toggle" aria-label="Menu" onClick={() => document.body.classList.toggle('nav-open')}>
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>;
}

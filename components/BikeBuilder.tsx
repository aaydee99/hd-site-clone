'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from '@/components/PlainLink';

// Original configurator: fictional models, options and prices.
type Opt = { id: string; label: string; price: number; color?: string };
const MODELS: (Opt & { style: 'cruiser' | 'touring' | 'sport' | 'adventure'; engine: string; tag: string })[] = [
  { id: 'drifter', label: 'Drifter 114', price: 18999, style: 'cruiser', engine: '1,868 cc V-twin', tag: 'Low, long cruiser' },
  { id: 'meridian', label: 'Meridian Tour', price: 27499, style: 'touring', engine: '1,923 cc V-twin', tag: 'Full-dress touring' },
  { id: 'vector', label: 'Vector S', price: 15999, style: 'sport', engine: '1,252 cc liquid-cooled', tag: 'Street performance' },
  { id: 'ranger', label: 'Ranger X', price: 21299, style: 'adventure', engine: '1,252 cc liquid-cooled', tag: 'Go-anywhere adventure' },
];
const PAINT: Opt[] = [
  { id: 'ink', label: 'Gunmetal Ink', price: 0, color: '#2b2e33' }, { id: 'forest', label: 'Racing Forest', price: 450, color: '#1f5f4a' },
  { id: 'ox', label: 'Oxblood', price: 450, color: '#7a2e2e' }, { id: 'navy', label: 'Deep Harbor', price: 450, color: '#2b4c7e' },
  { id: 'brass', label: 'Brass Sunset', price: 750, color: '#a8842a' }, { id: 'bone', label: 'Bone White', price: 750, color: '#e7e1d3' },
];
const WHEELS: Opt[] = [{ id: 'spoke', label: 'Laced spoke', price: 0 }, { id: 'cast', label: 'Cast 9-spoke', price: 899 }, { id: 'disc', label: 'Solid disc', price: 1299 }];
const FINISH: Opt[] = [{ id: 'chrome', label: 'Chrome', price: 0 }, { id: 'black', label: 'Gloss black', price: 699 }];
const EXHAUST: Opt[] = [{ id: 'stock', label: 'Factory dual', price: 0 }, { id: 'slip', label: 'Slip-on performance', price: 1149 }, { id: 'high', label: 'High-mount 2-into-1', price: 1599 }];
const SEAT: Opt[] = [{ id: 'solo', label: 'Solo', price: 0 }, { id: 'two', label: 'Two-up touring', price: 549 }, { id: 'stitch', label: 'Diamond-stitch', price: 699 }];
const BARS: Opt[] = [{ id: 'pull', label: 'Pullback', price: 0 }, { id: 'ape', label: 'Mini ape', price: 499 }, { id: 'drag', label: 'Drag bar', price: 399 }];
const ACCESS: Opt[] = [
  { id: 'shield', label: 'Windshield', price: 399 }, { id: 'bags', label: 'Hard saddlebags', price: 1899 },
  { id: 'trunk', label: 'Tour trunk', price: 1199 }, { id: 'lights', label: 'Aux LED lights', price: 349 }, { id: 'guard', label: 'Engine guard', price: 299 },
];

type Build = { model: string; paint: string; wheels: string; finish: string; exhaust: string; seat: string; bars: string; access: string[] };
const DEFAULT: Build = { model: 'drifter', paint: 'ink', wheels: 'spoke', finish: 'chrome', exhaust: 'stock', seat: 'solo', bars: 'pull', access: [] };
const find = (list: Opt[], id: string) => list.find(o => o.id === id) ?? list[0];
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Wheel({ cx, cy, r, style, metal }: { cx: number; cy: number; r: number; style: string; metal: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#17191c" />
      <circle cx={cx} cy={cy} r={r * 0.8} fill={style === 'disc' ? metal : 'none'} stroke={metal} strokeWidth="5" />
      {style === 'spoke' && Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.78} y2={cy + Math.sin(a) * r * 0.78} stroke={metal} strokeWidth="1.5" />;
      })}
      {style === 'cast' && Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.78} y2={cy + Math.sin(a) * r * 0.78} stroke={metal} strokeWidth="7" strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.16} fill={metal} stroke="#17191c" strokeWidth="3" />
    </g>
  );
}

function Preview({ b }: { b: Build }) {
  const m = MODELS.find(x => x.id === b.model)!;
  const paint = find(PAINT, b.paint).color!;
  const metal = b.finish === 'black' ? '#3a3d42' : 'url(#bbChrome)';
  const has = (id: string) => b.access.includes(id);
  const rx = 190, fx = m.style === 'touring' ? 560 : 545, wy = 330, wr = m.style === 'adventure' ? 82 : 76;
  const tankY = m.style === 'cruiser' ? 210 : m.style === 'sport' ? 195 : 200;
  const barY = b.bars === 'ape' ? tankY - 95 : b.bars === 'drag' ? tankY - 40 : tankY - 62;
  return (
    <svg viewBox="0 0 760 460" className="bb-svg" role="img" aria-label={`${m.label} preview`}>
      <defs>
        <linearGradient id="bbChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f5f6" /><stop offset=".5" stopColor="#9aa2aa" /><stop offset="1" stopColor="#5d646b" /></linearGradient>
        <radialGradient id="bbShadow"><stop offset="0" stopColor="#000" stopOpacity=".3" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={(rx + fx) / 2} cy={wy + wr} rx="300" ry="18" fill="url(#bbShadow)" />
      {has('bags') && <path d={`M${rx - 40} ${wy - 70} h120 v70 q0 22 -22 22 h-76 q-22 0 -22 -22 z`} fill={paint} stroke="#111" strokeWidth="3" />}
      {has('trunk') && <rect x={rx - 70} y={tankY - 30} width="90" height="70" rx="16" fill={paint} stroke="#111" strokeWidth="3" />}
      <Wheel cx={rx} cy={wy} r={wr} style={b.wheels} metal={metal} />
      <Wheel cx={fx} cy={wy} r={wr} style={b.wheels} metal={metal} />
      <path d={`M${rx} ${wy} L${rx + 120} ${wy - 40} L${fx - 95} ${tankY + 30}`} stroke="#25282c" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={`M${fx} ${wy} L${fx - 72} ${tankY - 30}`} stroke={metal} strokeWidth="12" strokeLinecap="round" />
      <path d={`M${fx - 78} ${tankY - 30} C ${fx - 80} ${barY + 20}, ${fx - 100} ${barY}, ${fx - 130} ${barY}`} stroke={metal} strokeWidth="7" fill="none" strokeLinecap="round" />
      {has('shield') && <path d={`M${fx - 70} ${tankY - 40} C ${fx - 90} ${tankY - 110}, ${fx - 70} ${tankY - 140}, ${fx - 40} ${tankY - 150} L ${fx - 30} ${tankY - 40} Z`} fill="#bcd3dc" fillOpacity=".55" stroke="#6b7a80" strokeWidth="2" />}
      {m.style === 'touring' && <path d={`M${fx - 110} ${tankY - 20} C ${fx - 90} ${tankY - 70}, ${fx - 20} ${tankY - 70}, ${fx - 10} ${tankY - 10} L ${fx - 60} ${tankY + 20} Z`} fill={paint} stroke="#111" strokeWidth="3" />}
      <circle cx={fx - 44} cy={tankY - 18} r="15" fill={metal} stroke="#111" strokeWidth="3" /><circle cx={fx - 40} cy={tankY - 18} r="8" fill="#fff6d8" />
      {has('lights') && <><circle cx={fx - 60} cy={tankY + 12} r="7" fill="#fff6d8" stroke="#111" strokeWidth="2" /><circle cx={fx - 28} cy={tankY + 12} r="7" fill="#fff6d8" stroke="#111" strokeWidth="2" /></>}
      <g transform={`translate(${rx + 125} ${wy - 105})`}>
        <path d="M0 70 L-18 0 L22 -6 L40 64 Z" fill={metal} stroke="#3a3f44" strokeWidth="3" />
        <path d="M50 66 L70 -4 L108 4 L88 70 Z" fill={metal} stroke="#3a3f44" strokeWidth="3" />
        <rect x="-10" y="66" width="110" height="38" rx="12" fill="#25282c" />
      </g>
      {has('guard') && <path d={`M${fx - 120} ${wy - 90} C ${fx - 90} ${wy - 60}, ${fx - 90} ${wy - 20}, ${fx - 120} ${wy}`} stroke={metal} strokeWidth="6" fill="none" />}
      {b.exhaust === 'high'
        ? <path d={`M${rx + 140} ${wy - 40} C ${rx + 90} ${wy - 70}, ${rx} ${wy - 80}, ${rx - 60} ${wy - 100}`} stroke={metal} strokeWidth="14" fill="none" strokeLinecap="round" />
        : <>
          <path d={`M${rx + 120} ${wy + 10} C ${rx + 60} ${wy + 30}, ${rx - 40} ${wy + 20}, ${rx - (b.exhaust === 'slip' ? 90 : 70)} ${wy - 6}`} stroke={metal} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d={`M${rx + 120} ${wy - 4} C ${rx + 60} ${wy + 12}, ${rx - 40} ${wy + 2}, ${rx - (b.exhaust === 'slip' ? 90 : 70)} ${wy - 24}`} stroke={metal} strokeWidth="11" fill="none" strokeLinecap="round" />
        </>}
      <path d={`M${rx + 70} ${tankY + 24} C ${rx + 90} ${tankY - 12}, ${fx - 150} ${tankY - 30}, ${fx - 90} ${tankY - 8} C ${fx - 100} ${tankY + 30}, ${rx + 150} ${tankY + 40}, ${rx + 70} ${tankY + 24} Z`} fill={paint} stroke="#111" strokeWidth="3" />
      <path d={`M${rx + 110} ${tankY + 2} C ${rx + 150} ${tankY - 14}, ${fx - 160} ${tankY - 20}, ${fx - 112} ${tankY - 8}`} stroke="#fff" strokeOpacity=".35" strokeWidth="5" fill="none" />
      <path d={b.seat === 'two'
        ? `M${rx - 50} ${tankY + 30} C ${rx - 30} ${tankY}, ${rx + 10} ${tankY + 6}, ${rx + 30} ${tankY + 16} C ${rx + 50} ${tankY + 4}, ${rx + 70} ${tankY + 10}, ${rx + 84} ${tankY + 26} L ${rx + 70} ${tankY + 44} C ${rx + 20} ${tankY + 44}, ${rx - 20} ${tankY + 50}, ${rx - 50} ${tankY + 50} Z`
        : `M${rx - 10} ${tankY + 40} C ${rx + 20} ${tankY + 18}, ${rx + 50} ${tankY + 14}, ${rx + 84} ${tankY + 26} L ${rx + 70} ${tankY + 44} C ${rx + 40} ${tankY + 42}, ${rx + 10} ${tankY + 48}, ${rx - 10} ${tankY + 54} Z`}
        fill="#211d1a" />
      {b.seat === 'stitch' && <path d={`M${rx + 5} ${tankY + 36} l14 -8 l14 8 l14 -8 l14 8 l14 -8`} stroke={paint === '#e7e1d3' ? '#a8842a' : '#e7e1d3'} strokeWidth="2" fill="none" />}
      <path d={`M${rx - 60} ${wy - 60} C ${rx - 40} ${wy - 110}, ${rx + 40} ${wy - 120}, ${rx + 60} ${wy - 80}`} stroke={paint} strokeWidth="14" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Choice({ title, list, value, onPick }: { title: string; list: Opt[]; value: string; onPick: (id: string) => void }) {
  return (
    <fieldset className="bb-group">
      <legend>{title}</legend>
      <div className="bb-opts">
        {list.map(o => (
          <button key={o.id} type="button" className={`bb-opt${o.id === value ? ' on' : ''}`} onClick={() => onPick(o.id)} aria-pressed={o.id === value}>
            {o.color && <i className="swatch" style={{ background: o.color }} />}
            <span>{o.label}</span><small>{o.price ? `+${usd(o.price)}` : 'Included'}</small>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function BikeBuilder({ locale, dealerHref }: { locale: string; dealerHref?: string }) {
  const [b, setB] = useState<Build>(DEFAULT);
  const [saved, setSaved] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const set = <K extends keyof Build>(k: K, v: Build[K]) => setB(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    const fromHash = typeof window !== 'undefined' && window.location.hash.slice(1);
    try {
      if (fromHash) setB({ ...DEFAULT, ...JSON.parse(atob(fromHash)) });
      else { const s = localStorage.getItem('ironline-build'); if (s) setB({ ...DEFAULT, ...JSON.parse(s) }); }
    } catch { /* ignore bad saved state */ }
  }, []);

  const model = MODELS.find(m => m.id === b.model)!;
  const lines = useMemo(() => [
    [model.label, model.price], [find(PAINT, b.paint).label + ' paint', find(PAINT, b.paint).price],
    [find(WHEELS, b.wheels).label + ' wheels', find(WHEELS, b.wheels).price], [find(FINISH, b.finish).label + ' finish', find(FINISH, b.finish).price],
    [find(EXHAUST, b.exhaust).label + ' exhaust', find(EXHAUST, b.exhaust).price], [find(SEAT, b.seat).label + ' seat', find(SEAT, b.seat).price],
    [find(BARS, b.bars).label + ' bars', find(BARS, b.bars).price], ...b.access.map(a => [find(ACCESS, a).label, find(ACCESS, a).price]),
  ] as [string, number][], [b, model]);
  const total = lines.reduce((s, [, p]) => s + p, 0);
  const monthly = (total * 0.069 / 12) / (1 - Math.pow(1 + 0.069 / 12, -60));

  const save = () => {
    const code = btoa(JSON.stringify(b));
    try { localStorage.setItem('ironline-build', JSON.stringify(b)); } catch { /* storage blocked */ }
    const url = `${window.location.origin}${window.location.pathname}#${code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    window.history.replaceState(null, '', `#${code}`);
    setSaved(url);
  };

  const STEPS = ['Model', 'Paint', 'Wheels', 'Performance', 'Comfort', 'Accessories'];
  return (
    <div className="bb">
      <div className="bb-stage">
        <div className="bb-head"><span className="eyebrow">Bike Builder</span><h1>{model.label}</h1><p>{model.tag} · {model.engine}</p></div>
        <Preview b={b} />
        <ol className="bb-steps">{STEPS.map((s, i) => <li key={s}><button type="button" className={i === step ? 'on' : ''} onClick={() => setStep(i)}>{i + 1}. {s}</button></li>)}</ol>
      </div>
      <div className="bb-panel">
        {step === 0 && (
          <fieldset className="bb-group"><legend>Choose a model</legend>
            <div className="bb-models">{MODELS.map(m => (
              <button key={m.id} type="button" className={`bb-model${m.id === b.model ? ' on' : ''}`} onClick={() => set('model', m.id)}>
                <b>{m.label}</b><span>{m.tag}</span><small>from {usd(m.price)}</small>
              </button>))}</div>
          </fieldset>
        )}
        {step === 1 && <Choice title="Paint" list={PAINT} value={b.paint} onPick={v => set('paint', v)} />}
        {step === 2 && <><Choice title="Wheels" list={WHEELS} value={b.wheels} onPick={v => set('wheels', v)} /><Choice title="Finish" list={FINISH} value={b.finish} onPick={v => set('finish', v)} /></>}
        {step === 3 && <Choice title="Exhaust" list={EXHAUST} value={b.exhaust} onPick={v => set('exhaust', v)} />}
        {step === 4 && <><Choice title="Seat" list={SEAT} value={b.seat} onPick={v => set('seat', v)} /><Choice title="Handlebars" list={BARS} value={b.bars} onPick={v => set('bars', v)} /></>}
        {step === 5 && (
          <fieldset className="bb-group"><legend>Accessories</legend>
            <div className="bb-opts">{ACCESS.map(o => {
              const on = b.access.includes(o.id);
              return <button key={o.id} type="button" className={`bb-opt${on ? ' on' : ''}`} aria-pressed={on}
                onClick={() => set('access', on ? b.access.filter(x => x !== o.id) : [...b.access, o.id])}><span>{o.label}</span><small>+{usd(o.price)}</small></button>;
            })}</div>
          </fieldset>
        )}
        <div className="bb-nav">
          <button type="button" className="btn ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</button>
          {step < STEPS.length - 1 ? <button type="button" className="btn" onClick={() => setStep(s => s + 1)}>Next: {STEPS[step + 1]}</button>
            : <button type="button" className="btn" onClick={save}>Save build</button>}
        </div>
        <div className="bb-summary">
          <h3>Your build</h3>
          <ul>{lines.map(([l, p]) => <li key={l}><span>{l}</span><span>{p ? usd(p) : '—'}</span></li>)}</ul>
          <div className="bb-total"><span>Estimated MSRP</span><b>{usd(total)}</b></div>
          <p className="muted">or about {usd(monthly)}/mo for 60 months at 6.9% APR (illustrative only)</p>
          {saved && <p className="note">Build saved. Share link copied to clipboard.</p>}
          <div className="bb-cta">
            <button type="button" className="btn" onClick={save}>Save &amp; share</button>
            {dealerHref && <Link className="btn ghost" href={dealerHref}>Find a dealer</Link>}
          </div>
          <p className="muted small">Fictional models and prices for a test site.</p>
        </div>
      </div>
    </div>
  );
}

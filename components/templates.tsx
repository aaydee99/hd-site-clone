import Link from 'next/link';
import { BRAND, COPY, Classified, LOCALES, PATHS, builderHref, hash, homeHref, humanize, imgFor, lastSeg, localeIndex, pick, price, productName } from '@/lib/catalog';
import { kindFor } from '@/lib/art';
import { Card, LinkGrid, ProductGrid } from './chrome';
import BikeBuilder from './BikeBuilder';
import { AddToCart, PaymentCalculator, RecallLookup } from './interactive';

type Props = { path: string; c: Classified };
const segLabel = (p: string) => humanize(lastSeg(p) === 'index.html' ? p.split('/').at(-2) : lastSeg(p));

export function titleFor({ path, c }: Props): string {
  switch (c.type) {
    case 'product': return humanize(c.segs[1]);
    case 'category': case 'topic': case 'dealer': return humanize(c.segs[2]);
    case 'dealer-directory': return 'Dealer Directory';
    default: return segLabel(path);
  }
}

function Hero({ img, eyebrow, title, text, cta }: { img: string; eyebrow?: string; title: string; text?: string; cta?: [string, string][] }) {
  return (
    <section className="hero">
      <img src={img} alt="" />
      <div className="hero-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>{text && <p>{text}</p>}
        {cta && <div className="hero-cta">{cta.map(([t, h], i) => <Link key={h + t} className={`btn${i ? ' ghost light' : ''}`} href={h}>{t}</Link>)}</div>}
      </div>
    </section>
  );
}

const Section = ({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) => (
  <section className="section"><div className="section-head"><h2>{title}</h2>{href && <Link href={href} prefetch={false}>View all →</Link>}</div>{children}</section>
);

// ---------- product detail ----------
export function Product({ path, c }: Props) {
  const idx = localeIndex(c.locale);
  const name = titleFor({ path, c });
  const kind = kindFor(c.segs[1]);
  const apparel = ['tee', 'jacket', 'gloves', 'boots', 'helmet'].includes(kind);
  const imgs = [0, 1, 2, 3].map(i => `/img/${kind}/${(hash(path) + i).toString(36)}.svg`);
  const rating = 3.6 + (hash(path) % 14) / 10, reviews = 4 + (hash(path) % 380);
  return (
    <>
      <section className="pdp">
        <div className="gallery">
          <img className="gallery-main" src={imgs[0]} alt={name} width={800} height={500} />
          <div className="thumbs">{imgs.map(s => <img key={s} src={s} alt="" width={200} height={125} />)}</div>
        </div>
        <div className="pdp-info">
          <span className="eyebrow">{humanize(kind === 'part' ? 'Parts & accessories' : kind)}</span>
          <h1>{name}</h1>
          <p className="rating" aria-label={`${rating.toFixed(1)} out of 5`}><span style={{ width: `${(rating / 5) * 100}%` }} />{rating.toFixed(1)} · {reviews} reviews</p>
          <p className="price">{price(path)}</p>
          <p className="sku">Part no. {c.segs[3]}</p>
          <AddToCart item={{ path, name, price: parseFloat(price(path).slice(1)), img: imgs[0] }}
            options={apparel ? ['XS', 'S', 'M', 'L', 'XL', '2XL'] : ['2026 models', '2025 models', '2024 models', '2023 & earlier']} />
          <ul className="perks"><li>Free shipping over $75</li><li>Free pickup at participating dealers</li><li>30-day returns</li></ul>
          <details open><summary>Description</summary><p>{COPY[hash(path) % 4]} {COPY[(hash(path) + 1) % 4]}</p></details>
          <details><summary>Specifications</summary><dl className="spec-list"><dt>Finish</dt><dd>{['Chrome', 'Gloss black', 'Satin', 'Natural'][hash(path) % 4]}</dd><dt>Weight</dt><dd>{(0.3 + (hash(path) % 90) / 10).toFixed(1)} lb</dd><dt>Warranty</dt><dd>2 years</dd></dl></details>
          <details><summary>Fitment</summary><p>Select your motorcycle in the options above to confirm fit.</p></details>
        </div>
      </section>
      <Section title="Frequently bought together"><ProductGrid items={pick(idx.product, path + 'fbt', 4)} /></Section>
      <Section title="You may also like"><ProductGrid items={pick(idx.product, path, 8)} /></Section>
    </>
  );
}

// ---------- listing (category / topic) ----------
export function Listing({ path, c }: Props) {
  const idx = localeIndex(c.locale);
  const related = pick([...(idx.category ?? []), ...(idx.topic ?? [])], path, 14);
  const items = pick(idx.product, path, 24);
  const name = titleFor({ path, c });
  return (
    <>
      <section className="plp-head">
        <img src={imgFor(path)} alt="" />
        <div><span className="eyebrow">{c.type === 'topic' ? 'Collection' : 'Shop'}</span><h1>{name}</h1><p>{items.length} of {(idx.product?.length ?? 0).toLocaleString()} products</p></div>
      </section>
      <div className="plp">
        <aside className="filters">
          <h3>Filter</h3>
          {[['Size', ['S', 'M', 'L', 'XL']], ['Color', ['Black', 'Brown', 'Gray', 'Green']], ['Price', ['Under $50', '$50–$150', '$150–$500', '$500+']], ['Fit', ['2026', '2025', '2024']]].map(([f, opts]) => (
            <details key={f as string} open={f === 'Size'}><summary>{f as string}</summary>{(opts as string[]).map(o => <label key={o} className="check"><input type="checkbox" />{o}</label>)}</details>
          ))}
          <h3>Related</h3>
          {related.map(p => <Link key={p} href={p} prefetch={false}>{segLabel(p)}</Link>)}
        </aside>
        <div>
          <div className="toolbar"><span>Sort by</span><select defaultValue="f"><option value="f">Featured</option><option>Newest</option><option>Price: low to high</option><option>Price: high to low</option></select></div>
          <ProductGrid items={items} />
        </div>
      </div>
    </>
  );
}

// ---------- dealers ----------
export function Dealer({ path, c }: Props) {
  const idx = localeIndex(c.locale);
  const name = titleFor({ path, c });
  return (
    <>
      <Hero img={imgFor(path)} eyebrow={`Authorized dealer · ID ${c.segs[3]}`} title={name} text="Sales, service, parts, apparel and rentals."
        cta={[['Get directions', '#map']]} />
      <div className="two" id="map">
        <div className="panel">
          <h3>Hours</h3><table className="hours"><tbody>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <tr key={d}><td>{d}</td><td>9:00–18:00</td></tr>)}<tr><td>Sat</td><td>9:00–17:00</td></tr><tr><td>Sun</td><td>Closed</td></tr></tbody></table>
          <h3>Services</h3><div className="chips">{['Sales', 'Service', 'Parts', 'Apparel', 'Rentals', 'Rider training'].map(s => <span className="chip" key={s}>{s}</span>)}</div>
          <p className="muted">Phone (555) 0{(hash(path) % 900 + 100)}-{hash(path + 'x') % 9000 + 1000}</p>
        </div>
        <img className="map" src={imgFor(path, 'map')} alt="Map" />
      </div>
      <Section title="Nearby dealers"><LinkGrid items={pick(idx.dealer, path, 4)} label={p => humanize(p.split('/')[5])} /></Section>
    </>
  );
}

export function DealerDirectory({ path, c }: Props) {
  const dealers = localeIndex(c.locale).dealer ?? [];
  const byLetter = new Map<string, string[]>();
  for (const p of dealers) { const k = humanize(p.split('/')[5])[0]?.toUpperCase() || '#'; byLetter.set(k, [...(byLetter.get(k) ?? []), p]); }
  return (
    <>
      <Hero img={imgFor(path, 'map')} eyebrow="Find a dealer" title="Dealer Directory" text={`${dealers.length.toLocaleString()} dealers in this region.`} />
      <div className="az">{[...byLetter.keys()].sort().map(k => <a key={k} href={`#l-${k}`}>{k}</a>)}</div>
      {[...byLetter.entries()].sort().map(([k, list]) => (
        <section key={k} id={`l-${k}`} className="az-group"><h2>{k}</h2><ul className="cols">{list.map(p => <li key={p}><Link href={p} prefetch={false}>{humanize(p.split('/')[5])}</Link></li>)}</ul></section>
      ))}
    </>
  );
}

// ---------- motorcycles ----------
export function Motorcycle({ path, c }: Props) {
  const idx = localeIndex(c.locale);
  const name = titleFor({ path, c });
  const L = `/${c.locale}`;
  const lineup = pick(idx.motorcycle, path, 8);
  return (
    <>
      <Hero img={imgFor(path, 'road')} eyebrow="Motorcycles" title={name === 'Motorcycles' ? 'The 2026 Lineup' : name} text={COPY[hash(path) % 4]}
        cta={[...(builderHref(c.locale) ? [['Build yours', builderHref(c.locale)!] as [string, string]] : []), ['Find a dealer', idx['dealer-directory']?.[0] ?? homeHref(c.locale)]]} />
      <div className="families">{['Cruiser', 'Touring', 'Sport', 'Adventure'].map((f, i) => (
        <Link key={f} className="family" href={builderHref(c.locale) ?? idx.motorcycle?.[0] ?? homeHref(c.locale)}><img src={`/img/bike/${f.toLowerCase()}${i}.svg`} alt="" /><b>{f}</b><span>From ${(15999 + i * 3500).toLocaleString()}</span></Link>
      ))}</div>
      <div className="specs">{[['Engine', '1,868 cc'], ['Torque', '155 Nm'], ['Seat height', '680 mm'], ['Fuel', '18.9 L'], ['Weight', '317 kg']].map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
      {lineup.length > 0 && <Section title="Explore more"><LinkGrid items={lineup} label={segLabel} /></Section>}
    </>
  );
}

// ---------- editorial / service / experience ----------
export function Content({ path, c }: Props) {
  const idx = localeIndex(c.locale);
  const name = titleFor({ path, c });
  const slug = path.toLowerCase();
  const tool = /estimate-payment|financing/.test(slug) ? <PaymentCalculator /> : /service-recalls/.test(slug) ? <RecallLookup /> : null;
  return (
    <>
      <Hero img={imgFor(path)} eyebrow={humanize(c.segs[0] ?? '')} title={name} text={COPY[hash(path) % 4]} />
      <div className="article">
        <div>
          {tool && <div className="panel tool">{tool}</div>}
          {COPY.map(t => <p key={t}>{t}</p>)}
          <blockquote>Placeholder pull quote for layout testing.</blockquote>
          <p>{COPY[(hash(path) + 2) % 4]}</p>
        </div>
        <aside className="panel"><h3>In this section</h3>{pick([...(idx.content ?? []), ...(idx.service ?? [])], path, 8).map(p => <Link key={p} href={p} prefetch={false}>{segLabel(p)}</Link>)}</aside>
      </div>
      <Section title="More to explore"><LinkGrid items={pick([...(idx.content ?? []), ...(idx.experience ?? [])], path, 4)} label={segLabel} /></Section>
    </>
  );
}

// ---------- extra pages ----------
export function LocaleHome({ locale }: { locale: string }) {
  const idx = localeIndex(locale);
  const cats = pick(idx.category, locale, 6);
  const builder = builderHref(locale);
  return (
    <>
      <Hero img={`/img/hero/${locale.replace('/', '-')}.svg`} eyebrow="New for 2026" title="Ride further. Build it your way."
        text="Configure a motorcycle, find gear that fits, and book a test ride at a dealer near you."
        cta={[...(builder ? [['Build your bike', builder] as [string, string]] : []), ['Shop new arrivals', idx.category?.[0] ?? homeHref(locale)]]} />
      <Section title="Shop by category"><div className="tiles">{cats.map(p => (
        <Link key={p} className="tile" href={p} prefetch={false}><img src={imgFor(p)} alt="" /><b>{segLabel(p)}</b></Link>))}</div></Section>
      {builder && <section className="promo">
        <img src="/img/bike/promo-builder.svg" alt="" />
        <div><span className="eyebrow">Bike Builder</span><h2>Make it yours, down to the bolts.</h2><p>Pick a model, paint, wheels, exhaust and accessories, then see the price as you go.</p><Link className="btn" href={builder}>Start building</Link></div>
      </section>}
      <Section title="Trending now" href={idx.category?.[0]}><ProductGrid items={pick(idx.product, locale, 8)} /></Section>
      <Section title="Experiences"><LinkGrid items={(idx.experience ?? []).slice(0, 4)} label={segLabel} /></Section>
      <section className="stats">{Object.entries(idx).map(([t, l]) => <div key={t}><b>{l!.length.toLocaleString()}</b><span>{t}</span></div>)}</section>
    </>
  );
}

export function BuilderPage({ locale }: { locale: string }) {
  return <BikeBuilder locale={locale} dealerHref={localeIndex(locale)['dealer-directory']?.[0]} />;
}

export function RegionChooser() {
  return (
    <>
      <Hero img="/img/hero/root.svg" eyebrow={BRAND} title="Choose your region" text={`${PATHS.length.toLocaleString()} pages across ${LOCALES.length} locales.`} />
      <div className="regions">{LOCALES.map(l => <Link key={l} href={homeHref(l)}><b>{l.split('/')[0].toUpperCase()}</b><span>{l.split('/')[1]}</span></Link>)}</div>
    </>
  );
}

export const TEMPLATES = {
  product: Product, category: Listing, topic: Listing, shop: Listing, dealer: Dealer,
  'dealer-directory': DealerDirectory, motorcycle: Motorcycle, experience: Content, service: Content, content: Content,
} as const;

export { Card };

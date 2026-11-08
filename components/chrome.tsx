import Link from '@/components/PlainLink';
import { BRAND, LOCALES, PATH_SET, builderHref, classify, homeHref, humanize, imgFor, lastSeg, localeIndex, pick, price, productName } from '@/lib/catalog';
import LocaleSelect from './LocaleSelect';
import { Logo } from './Logo';
import { CartButton, CartDrawer, MenuToggle, SearchBox } from './interactive';
import { WeightBody, WeightHead } from './WeightAssets';

const label = (p: string) => humanize(lastSeg(p) === 'index.html' ? classify(p).segs.at(-2) : lastSeg(p));

export function Shell({ path, locale, type, children }: { path: string; locale: string | null; type: string; children: React.ReactNode }) {
  const L = locale ? `/${locale}` : '';
  const idx = localeIndex(locale);
  const cats = idx.category ?? [];
  const men = cats.filter(p => /\/mens?-|\/men-/i.test(p)).slice(0, 6);
  const women = cats.filter(p => /womens?-/i.test(p)).slice(0, 6);
  const parts = cats.filter(p => /part|seat|exhaust|light|wheel|handlebar|brake|engine/i.test(p)).slice(0, 6);
  const menus: { title: string; href?: string; cols: { h: string; items: string[] }[]; promo?: { href: string; img: string; t: string } }[] = [
    { title: 'Motorcycles', href: idx.motorcycle?.[0], cols: [{ h: 'Lineup', items: (idx.motorcycle ?? []).slice(0, 8) }],
      promo: builderHref(locale) ? { href: builderHref(locale)!, img: '/img/bike/builder.svg', t: 'Build your bike' } : undefined },
    { title: 'Parts & Accessories', href: parts[0] ?? cats[0], cols: [{ h: 'Popular', items: parts.length ? parts : cats.slice(0, 6) }, { h: 'Explore', items: (idx.topic ?? []).slice(0, 6) }] },
    { title: 'Apparel', href: men[0] ?? cats[0], cols: [{ h: 'Men', items: men }, { h: 'Women', items: women }] },
    { title: 'Experiences', href: idx.experience?.[0], cols: [{ h: 'Visit & Ride', items: (idx.experience ?? []).slice(0, 8) }] },
    { title: 'Find a Dealer', href: idx['dealer-directory']?.[0], cols: [{ h: 'Dealers', items: pick(idx.dealer, 'nav', 6) }] },
  ];
  return (
    <div className="site" data-page-type={type} data-locale={locale ?? ''}>
      <div className="banner">Test environment · fictional brand · placeholder content</div>
      <header className="top">
        <div className="top-inner">
          <MenuToggle />
          <Link className="logo" href={homeHref(locale)} aria-label={`${BRAND} home`}><Logo /></Link>
          <nav className="mega">
            {menus.filter(m => m.href).map(m => (
              <div className="mega-item" key={m.title}>
                <Link href={m.href!} prefetch={false} className="mega-top">{m.title}</Link>
                {m.cols.some(c => c.items.length) && (
                  <div className="mega-panel">
                    {m.cols.filter(c => c.items.length).map(c => (
                      <div key={c.h}><h4>{c.h}</h4>{c.items.map(p => <Link key={p} href={p} prefetch={false}>{label(p)}</Link>)}</div>
                    ))}
                    {m.promo && <Link className="mega-promo" href={m.promo.href}><img src={m.promo.img} alt="" /><b>{m.promo.t} →</b></Link>}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="top-tools">
            {locale && <SearchBox locale={locale} />}
            <LocaleSelect locales={LOCALES} current={locale} />
            {locale && <CartButton />}
          </div>
        </div>
      </header>
      <WeightHead type={type} path={path} />
      <Breadcrumbs path={path} locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} path={path} type={type} />
      {locale && <CartDrawer shopHref={localeIndex(locale).category?.[0] ?? homeHref(locale)} />}
      <WeightBody type={type} path={path} />
    </div>
  );
}

function Footer({ locale, path, type }: { locale: string | null; path: string; type: string }) {
  const idx = localeIndex(locale);
  const L = locale ? `/${locale}` : '';
  const cols: [string, string[]][] = [
    ['Shop', (idx.category ?? []).slice(0, 5)],
    ['Owners', [...(idx.service ?? []), ...(idx.content ?? []).filter(p => /tools\//.test(p))].slice(0, 6)],
    ['Company', (idx.content ?? []).filter(p => /about-us|careers|patent/.test(p)).slice(0, 5)],
    ['Visit', (idx.experience ?? []).slice(0, 5)],
  ];
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand"><Logo /><p>Ride further. Build it your way. A fictional motorcycle brand for testing site architecture.</p>
          {builderHref(locale) && <Link className="btn ghost light" href={builderHref(locale)!}>Open the Bike Builder</Link>}</div>
        {cols.filter(([, l]) => l.length).map(([h, l]) => (
          <div key={h}><h4>{h}</h4>{l.map(p => <Link key={p} href={p} prefetch={false}>{label(p)}</Link>)}</div>
        ))}
      </div>
      <div className="foot-meta">
        <span>© {new Date().getFullYear()} {BRAND} (fictional)</span>
        <span>path <code>{path}</code> · type <code>{type}</code> · rendered <code>{new Date().toISOString()}</code></span>
      </div>
    </footer>
  );
}

function Breadcrumbs({ path, locale }: { path: string; locale: string | null }) {
  const L = locale ? `/${locale}` : '';
  const segs = locale ? classify(path).segs : [];
  if (!segs.length) return null;
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href={homeHref(locale)}>Home</Link>
      {segs.map((s, i) => {
        const href = `${L}/${segs.slice(0, i + 1).join('/')}`;
        return <span key={href}><i>/</i>{PATH_SET.has(href) && i < segs.length - 1 ? <Link href={href} prefetch={false}>{humanize(s)}</Link> : humanize(s)}</span>;
      })}
    </nav>
  );
}

export function Card({ href, label, sub, img, tag }: { href: string; label: string; sub?: string; img: string; tag?: string }) {
  return (
    <Link className="card" href={href} prefetch={false}>
      <div className="card-img"><img src={img} alt="" loading="lazy" width={800} height={500} />{tag && <em>{tag}</em>}</div>
      <div className="card-body"><b>{label}</b>{sub && <span>{sub}</span>}</div>
    </Link>
  );
}

export function ProductGrid({ items }: { items: string[] }) {
  return <div className="grid">{items.map((p, i) => <Card key={p} href={p} label={productName(p)} sub={price(p)} img={imgFor(p)} tag={i % 7 === 0 ? 'New' : undefined} />)}</div>;
}

export function LinkGrid({ items, label: lab }: { items: string[]; label: (p: string) => string }) {
  return <div className="grid">{items.map(p => <Card key={p} href={p} label={lab(p)} img={imgFor(p)} />)}</div>;
}

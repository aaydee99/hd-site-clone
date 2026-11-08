import Link from '@/components/PlainLink';
import { BRAND, LOCALES, PATH_SET, builderHref, classify, homeHref, humanize, imgFor, lastSeg, localeIndex, navFor, pick, price, productName } from '@/lib/catalog';
import { dirOf, langOf, trackerLabels } from '@/lib/i18n';
import { TrackOrderButton, TrackOrderDrawer } from './OrderTracker';
import LocaleSelect from './LocaleSelect';
import { Logo } from './Logo';
import { CartButton, CartDrawer, MenuToggle, SearchBox } from './interactive';
import { WeightBody, WeightHead } from './WeightAssets';

const label = (p: string) => humanize(lastSeg(p) === 'index.html' ? classify(p).segs.at(-2) : lastSeg(p));

export function Shell({ path, locale, type, children }: { path: string; locale: string | null; type: string; children: React.ReactNode }) {
  const { primary, utility } = navFor(locale);
  const builder = builderHref(locale);
  return (
    <div className="site" data-page-type={type} data-locale={locale ?? ''} lang={locale ? langOf(locale) : 'en'} dir={dirOf(locale)}>
      <div className="banner">Test environment · fictional brand · placeholder content</div>
      {locale && (
        <div className="utility">
          <div className="utility-inner">
            <nav>{utility.map(u => u.key === 'trackOrder'
              ? <TrackOrderButton key={u.key} label={u.label} />
              : <Link key={u.key} href={u.href} prefetch={false}>{u.label}</Link>)}</nav>
            <LocaleSelect locales={LOCALES} current={locale} />
          </div>
        </div>
      )}
      <header className="top">
        <div className="top-inner">
          <MenuToggle />
          <Link className="logo" href={homeHref(locale)} aria-label={`${BRAND} home`}><Logo /></Link>
          <nav className="mega">
            {primary.map(m => (
              <div className="mega-item" key={m.label}>
                <Link href={m.href} prefetch={false} className="mega-top">{m.label}</Link>
                {(m.cols.length > 0 || m.promo) && (
                  <div className="mega-panel">
                    {m.cols.map(c => (
                      <div key={c.h}><h4>{c.h}</h4>{c.items.map(p => <Link key={p} href={p} prefetch={false}>{label(p)}</Link>)}</div>
                    ))}
                    {m.promo && builder && <Link className="mega-promo" href={builder}><img src="/img/bike/builder.svg" alt="" /><b>Build your bike →</b></Link>}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="top-tools">
            {locale && <SearchBox locale={locale} />}
            {!locale && <LocaleSelect locales={LOCALES} current={locale} />}
            {locale && <CartButton />}
          </div>
        </div>
      </header>
      <WeightHead type={type} path={path} />
      <Breadcrumbs path={path} locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} path={path} type={type} />
      {locale && <CartDrawer shopHref={localeIndex(locale).category?.[0] ?? homeHref(locale)} />}
      {locale && <TrackOrderDrawer labels={trackerLabels(locale)} locale={locale}
        catalog={pick(localeIndex(locale).product, `track:${locale}`, 24).map(p => ({ path: p, name: productName(p), price: price(p), img: imgFor(p) }))} />}
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

// Original, procedurally drawn SVG illustrations. Deterministic per seed so the same URL
// always yields the same image (useful for cache testing). No third-party artwork.

export type ArtKind = 'bike' | 'helmet' | 'jacket' | 'tee' | 'gloves' | 'boots' | 'part' | 'seat' | 'dealer' | 'hero' | 'map' | 'road';
export const ART_KINDS: ArtKind[] = ['bike', 'helmet', 'jacket', 'tee', 'gloves', 'boots', 'part', 'seat', 'dealer', 'hero', 'map', 'road'];

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

const PAINTS = ['#1f5f4a', '#2b4c7e', '#7a2e2e', '#3d3d45', '#8a6d1f', '#4f2f5c', '#2f6b73', '#a33b2a', '#55606b', '#0f3d3a'];
const BG = [['#e9e4d8', '#d9d1bf'], ['#dfe5e8', '#c8d2d8'], ['#ebe2d6', '#d8c8b4'], ['#e4e6df', '#cfd4c7']];

/** Pick an illustration kind from a URL slug. */
export function kindFor(slug: string, fallback: ArtKind = 'part'): ArtKind {
  const s = slug.toLowerCase();
  const rules: [RegExp, ArtKind][] = [
    [/helmet/, 'helmet'], [/jacket|vest|hoodie|fleece|coat|pullover|rain/, 'jacket'],
    [/shirt|tee|tank|henley|top|polo|dress|sweat|kid|baby|toddler|girl|boy|onesie/, 'tee'],
    [/glove/, 'gloves'], [/boot|shoe|sneaker|footwear|sock/, 'boots'],
    [/seat|saddle|backrest|pillion/, 'seat'],
    [/motorcycle|touring|cruiser|sport|trike|adventure|glide|softail|road|street|bike|model/, 'bike'],
  ];
  for (const [re, k] of rules) if (re.test(s)) return k;
  return fallback;
}

const wrap = (w: number, h: number, bg: string[], inner: string, id: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
<radialGradient id="sh${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="chrome${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f6"/><stop offset=".5" stop-color="#9aa2aa"/><stop offset="1" stop-color="#5d646b"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg${id})"/>${inner}</svg>`;

function wheel(cx: number, cy: number, r: number, id: string) {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r * 0.78).toFixed(1)}" y2="${(cy + Math.sin(a) * r * 0.78).toFixed(1)}"/>`;
  }).join('');
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1d20"/><circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="none" stroke="url(#chrome${id})" stroke-width="5"/>
<g stroke="#b9c0c6" stroke-width="1.6">${spokes}</g><circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="url(#chrome${id})"/><circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="#6b7177" stroke-width="2" stroke-dasharray="4 6"/></g>`;
}

function bike(r: () => number, id: string, paint: string) {
  const wb = 330 + r() * 50, fx = 200 + wb, rx = 200, wy = 330, wr = 78 + r() * 10;
  const low = r() > 0.5;
  const tankY = low ? 205 : 190;
  return `<ellipse cx="${(rx + fx) / 2}" cy="${wy + wr - 4}" rx="${wb / 2 + 110}" ry="16" fill="url(#sh${id})"/>
${wheel(rx, wy, wr, id)}${wheel(fx, wy, wr, id)}
<path d="M${rx} ${wy} L${rx + 120} ${wy - 40} L${fx - 90} ${tankY + 30} M${rx + 120} ${wy - 40} L${rx + 70} ${tankY + 20}" stroke="#2a2c30" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M${fx} ${wy} L${fx - 70} ${tankY - 30}" stroke="url(#chrome${id})" stroke-width="12" stroke-linecap="round"/>
<path d="M${fx - 78} ${tankY - 34} q -10 -30 -40 -36" stroke="#2a2c30" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="${fx - 48}" cy="${tankY - 22}" r="16" fill="url(#chrome${id})" stroke="#2a2c30" stroke-width="3"/><circle cx="${fx - 44}" cy="${tankY - 22}" r="9" fill="#fff6d8"/>
<g transform="translate(${rx + 125} ${wy - 105})"><path d="M0 70 L-18 0 L22 -6 L40 64 Z" fill="url(#chrome${id})" stroke="#3a3f44" stroke-width="3"/><path d="M50 66 L70 -4 L108 4 L88 70 Z" fill="url(#chrome${id})" stroke="#3a3f44" stroke-width="3"/>
${Array.from({ length: 5 }, (_, i) => `<line x1="${-14 + i * 2}" y1="${10 + i * 12}" x2="${26 + i * 2}" y2="${4 + i * 12}" stroke="#5d646b" stroke-width="2"/><line x1="${66 - i * 2}" y1="${6 + i * 12}" x2="${102 - i * 2}" y2="${12 + i * 12}" stroke="#5d646b" stroke-width="2"/>`).join('')}
<rect x="-10" y="66" width="110" height="38" rx="12" fill="#2a2c30"/><circle cx="16" cy="85" r="13" fill="url(#chrome${id})"/></g>
<path d="M${rx + 120} ${wy + 10} C ${rx + 60} ${wy + 30}, ${rx - 40} ${wy + 20}, ${rx - 70} ${wy - 6}" stroke="url(#chrome${id})" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M${rx + 70} ${tankY + 24} C ${rx + 90} ${tankY - 12}, ${fx - 150} ${tankY - 30}, ${fx - 86} ${tankY - 8} C ${fx - 96} ${tankY + 30}, ${rx + 150} ${tankY + 40}, ${rx + 70} ${tankY + 24} Z" fill="${paint}" stroke="#15171a" stroke-width="3"/>
<path d="M${rx + 110} ${tankY + 2} C ${rx + 150} ${tankY - 14}, ${fx - 160} ${tankY - 20}, ${fx - 110} ${tankY - 8}" stroke="#ffffff" stroke-opacity=".35" stroke-width="5" fill="none"/>
<path d="M${rx - 30} ${tankY + 40} C ${rx + 10} ${tankY + 20}, ${rx + 50} ${tankY + 18}, ${rx + 82} ${tankY + 28} L ${rx + 70} ${tankY + 44} C ${rx + 30} ${tankY + 40}, ${rx} ${tankY + 48}, ${rx - 30} ${tankY + 54} Z" fill="#221f1c"/>
<path d="M${rx - 60} ${wy - 60} C ${rx - 40} ${wy - 110}, ${rx + 40} ${wy - 120}, ${rx + 60} ${wy - 80}" stroke="${paint}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
}

function helmet(r: () => number, id: string, paint: string) {
  const stripe = r() > 0.4;
  return `<ellipse cx="400" cy="440" rx="200" ry="22" fill="url(#sh${id})"/>
<path d="M230 360 C 220 210, 330 140, 430 150 C 540 160, 600 250, 590 330 L 585 390 C 520 420, 330 420, 240 400 Z" fill="${paint}" stroke="#15171a" stroke-width="4"/>
${stripe ? `<path d="M410 152 C 470 160, 540 210, 560 280" stroke="#f1ede4" stroke-width="22" fill="none"/>` : ''}
<path d="M300 250 C 380 225, 500 230, 580 270 L 588 330 C 500 300, 380 300, 296 320 Z" fill="#16191d"/>
<path d="M330 262 C 400 245, 480 248, 560 276" stroke="#ffffff" stroke-opacity=".3" stroke-width="6" fill="none"/>
<path d="M260 200 C 300 170, 350 160, 400 160" stroke="#fff" stroke-opacity=".35" stroke-width="10" fill="none" stroke-linecap="round"/>
<rect x="236" y="384" width="350" height="22" rx="10" fill="#2a2c30"/>`;
}

function jacket(r: () => number, id: string, paint: string) {
  const zip = r() > 0.5 ? 400 : 420;
  return `<ellipse cx="400" cy="470" rx="220" ry="18" fill="url(#sh${id})"/>
<path d="M300 110 L250 130 C 200 150, 180 200, 170 260 L 150 430 L 215 440 L 240 290 L 250 460 L 550 460 L 560 290 L 585 440 L 650 430 L 630 260 C 620 200, 600 150, 550 130 L 500 110 C 470 140, 330 140, 300 110 Z" fill="${paint}" stroke="#15171a" stroke-width="4"/>
<path d="M300 110 C 330 160, 370 170, ${zip} 175 C 430 170, 470 160, 500 110" fill="#1d1f22"/>
<line x1="${zip}" y1="175" x2="${zip}" y2="460" stroke="url(#chrome${id})" stroke-width="5"/>
<path d="M270 300 h70 M460 300 h70" stroke="#15171a" stroke-width="4"/><rect x="250" y="400" width="300" height="24" fill="#000" fill-opacity=".18"/>
<path d="M190 250 C 200 200, 220 170, 250 150" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none"/>`;
}

function tee(r: () => number, id: string, paint: string) {
  const graphic = Math.floor(r() * 3);
  const g = [`<circle cx="400" cy="270" r="55" fill="none" stroke="#f1ede4" stroke-width="8"/><path d="M360 270 h80 M400 230 v80" stroke="#f1ede4" stroke-width="8"/>`,
    `<path d="M340 300 L400 220 L460 300 Z" fill="none" stroke="#f1ede4" stroke-width="8"/><rect x="350" y="310" width="100" height="10" fill="#f1ede4"/>`,
    `<rect x="345" y="230" width="110" height="80" rx="10" fill="none" stroke="#f1ede4" stroke-width="8"/><path d="M360 270 h80" stroke="#f1ede4" stroke-width="6"/>`][graphic];
  return `<ellipse cx="400" cy="470" rx="210" ry="18" fill="url(#sh${id})"/>
<path d="M320 110 L220 150 L170 240 L235 270 L260 230 L260 460 L540 460 L540 230 L565 270 L630 240 L580 150 L480 110 C 460 150, 340 150, 320 110 Z" fill="${paint}" stroke="#15171a" stroke-width="4"/>
<path d="M320 110 C 340 150, 460 150, 480 110" fill="none" stroke="#15171a" stroke-width="6"/>${g}`;
}

function gloves(_r: () => number, id: string, paint: string) {
  const one = (x: number, flip: number) => `<g transform="translate(${x} 0) scale(${flip} 1)"><path d="M-70 440 L-80 250 C -82 230, -60 225, -55 245 L -50 170 C -48 150, -22 150, -22 170 L -20 150 C -18 130, 10 130, 10 150 L 12 165 C 14 145, 40 145, 40 168 L 42 240 L 60 215 C 72 200, 95 210, 85 230 L 50 330 L 50 440 Z" fill="${paint}" stroke="#15171a" stroke-width="4"/>
<rect x="-74" y="400" width="126" height="40" rx="8" fill="#1d1f22"/><path d="M-50 260 h70" stroke="#fff" stroke-opacity=".3" stroke-width="5"/></g>`;
  return `<ellipse cx="400" cy="460" rx="230" ry="18" fill="url(#sh${id})"/>${one(300, 1)}${one(500, -1)}`;
}

function boots(_r: () => number, id: string, paint: string) {
  return `<ellipse cx="400" cy="460" rx="250" ry="20" fill="url(#sh${id})"/>
<path d="M260 110 L380 110 L390 330 C 470 340, 560 360, 600 400 L 600 440 L 250 440 L 255 300 Z" fill="${paint === '#8a6d1f' ? paint : '#3b2a1e'}" stroke="#15171a" stroke-width="4"/>
<rect x="245" y="430" width="360" height="22" rx="6" fill="#141414"/><path d="M270 150 h100 M268 190 h104 M266 230 h106" stroke="#000" stroke-opacity=".35" stroke-width="4"/>
<rect x="300" y="330" width="30" height="20" rx="4" fill="url(#chrome${id})"/><path d="M280 130 C 300 260, 300 330, 290 420" stroke="#fff" stroke-opacity=".2" stroke-width="10" fill="none"/>`;
}

function part(r: () => number, id: string, paint: string) {
  const t = Math.floor(r() * 4);
  const shapes = [
    `<circle cx="400" cy="270" r="160" fill="url(#chrome${id})" stroke="#3a3f44" stroke-width="4"/><circle cx="400" cy="270" r="60" fill="#2a2c30"/>${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return `<circle cx="${(400 + Math.cos(a) * 110).toFixed(1)}" cy="${(270 + Math.sin(a) * 110).toFixed(1)}" r="14" fill="#2a2c30"/>`; }).join('')}`,
    `<path d="M200 340 C 260 250, 400 230, 600 200" stroke="url(#chrome${id})" stroke-width="60" fill="none" stroke-linecap="round"/><ellipse cx="610" cy="198" rx="30" ry="34" fill="#1d1f22"/>`,
    `<rect x="250" y="150" width="300" height="240" rx="30" fill="url(#chrome${id})" stroke="#3a3f44" stroke-width="4"/>${Array.from({ length: 6 }, (_, i) => `<line x1="270" y1="${180 + i * 36}" x2="530" y2="${180 + i * 36}" stroke="#5d646b" stroke-width="4"/>`).join('')}<rect x="250" y="370" width="300" height="20" fill="${paint}"/>`,
    `<path d="M180 300 C 180 200, 300 200, 400 240 C 500 200, 620 200, 620 300" stroke="#1d1f22" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="150" y="280" width="70" height="40" rx="14" fill="${paint}"/><rect x="580" y="280" width="70" height="40" rx="14" fill="${paint}"/>`,
  ][t];
  return `<ellipse cx="400" cy="450" rx="220" ry="18" fill="url(#sh${id})"/>${shapes}`;
}

function seat(_r: () => number, id: string, paint: string) {
  return `<ellipse cx="400" cy="420" rx="260" ry="18" fill="url(#sh${id})"/>
<path d="M150 330 C 170 250, 300 230, 420 260 C 500 280, 560 230, 640 220 C 680 220, 690 260, 660 300 C 600 360, 300 390, 170 370 Z" fill="#1f1b18" stroke="#0d0d0d" stroke-width="4"/>
<path d="M190 320 C 250 280, 360 275, 430 290" stroke="${paint}" stroke-width="6" fill="none" stroke-dasharray="10 8"/>
<path d="M200 300 C 260 265, 330 262, 400 272" stroke="#fff" stroke-opacity=".15" stroke-width="10" fill="none"/>
<rect x="250" y="370" width="300" height="14" rx="6" fill="url(#chrome${id})"/>`;
}

function dealer(r: () => number, id: string, paint: string) {
  const n = 3 + Math.floor(r() * 3);
  return `<rect x="0" y="380" width="800" height="120" fill="#5b5f63"/><path d="M0 430 h800" stroke="#f1ede4" stroke-width="4" stroke-dasharray="40 30"/>
<rect x="110" y="140" width="580" height="240" fill="#e8e1d3" stroke="#2a2c30" stroke-width="4"/><rect x="110" y="120" width="580" height="44" fill="${paint}"/>
<rect x="300" y="128" width="200" height="28" rx="4" fill="#f1ede4"/><rect x="320" y="138" width="160" height="8" fill="${paint}"/>
${Array.from({ length: n }, (_, i) => `<rect x="${140 + i * (520 / n)}" y="190" width="${520 / n - 24}" height="150" fill="#9fb3bf" stroke="#2a2c30" stroke-width="3"/><path d="M${150 + i * (520 / n)} 200 l40 40" stroke="#fff" stroke-opacity=".5" stroke-width="6"/>`).join('')}
<rect x="370" y="270" width="60" height="110" fill="#2a2c30"/><circle cx="120" cy="120" r="0"/>`;
}

function hero(r: () => number, id: string, paint: string) {
  const sun = 120 + r() * 560;
  const layers = [['#c9b99c', 300], ['#a8977a', 340], ['#7d6f5a', 380]] as const;
  return `<circle cx="${sun}" cy="190" r="70" fill="#f6e7c4" opacity=".9"/>
${layers.map(([c, y], i) => `<path d="M0 ${y} ${Array.from({ length: 9 }, (_, k) => `L${k * 100} ${y - 40 - r() * 90 + i * 10}`).join(' ')} L800 ${y} L800 500 L0 500 Z" fill="${c}"/>`).join('')}
<path d="M-20 500 C 250 420, 420 420, 820 380 L 820 500 Z" fill="#3a3a3c"/><path d="M60 480 C 300 430, 450 425, 800 400" stroke="#f1ede4" stroke-width="4" stroke-dasharray="26 20" fill="none"/>
<g transform="translate(300 300) scale(.42)">${bike(r, id, paint)}</g>`;
}

function map(r: () => number, _id: string, paint: string) {
  const roads = Array.from({ length: 8 }, () => `<path d="M${r() * 800} 0 C ${r() * 800} ${r() * 500}, ${r() * 800} ${r() * 500}, ${r() * 800} 500" stroke="#fff" stroke-width="${6 + r() * 8}" fill="none"/>`).join('');
  return `<rect width="800" height="500" fill="#dfe6da"/><path d="M0 380 C 200 340, 300 460, 520 420 C 650 400, 720 440, 800 430 L800 500 L0 500 Z" fill="#b9d3de"/>${roads}
<path d="M400 250 c -30 -50, -50 -70, -50 -95 a 50 50 0 1 1 100 0 c 0 25 -20 45 -50 95 z" fill="${paint}" stroke="#15171a" stroke-width="3"/><circle cx="400" cy="155" r="18" fill="#f1ede4"/>`;
}

function road(r: () => number, id: string, paint: string) { return hero(r, id, paint); }

const DRAW: Record<ArtKind, (r: () => number, id: string, paint: string) => string> = { bike, helmet, jacket, tee, gloves, boots, part, seat, dealer, hero, map, road };

export function drawArt(kind: ArtKind, seed: string): string {
  const r = rng(kind + ':' + seed);
  const id = Math.floor(r() * 1e6).toString(36);
  const paint = PAINTS[Math.floor(r() * PAINTS.length)];
  const bg = BG[Math.floor(r() * BG.length)];
  const wide = kind === 'hero' || kind === 'road' || kind === 'dealer' || kind === 'map';
  const inner = DRAW[kind](r, id, paint);
  // Product art is drawn on an 800x500 canvas; bikes are wider, so scale them into frame.
  const body = kind === 'bike' ? `<g transform="translate(-40 -20) scale(.95)">${inner}</g>` : inner;
  return wrap(800, wide ? 500 : 500, bg, body, id);
}

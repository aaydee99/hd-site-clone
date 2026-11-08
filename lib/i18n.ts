// UI localisation for the chrome (nav, utility bar, buttons, headings). Structure mirrors the source
// site; strings are original translations of generic commerce terms. Country/language display names
// come from Intl.DisplayNames (localised per language). Product/category names stay as their URL slug.

export const RTL = new Set(['ar', 'he', 'fa', 'ur']);
export const langOf = (locale: string) => locale.split('/')[1] ?? 'en';
export const countryOf = (locale: string) => locale.split('/')[0] ?? 'us';
export const dirOf = (locale: string | null) => (locale && RTL.has(langOf(locale)) ? 'rtl' : 'ltr');

/** Flag emoji from a 2-letter country code (regional indicator symbols; Unicode, not an image). */
export function flag(cc: string): string {
  const up = cc.toUpperCase();
  if (!/^[A-Z]{2}$/.test(up)) return '🏳️';
  return String.fromCodePoint(...[...up].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "United States - English", localised to the locale's own language (e.g. de/de -> "Deutschland - Deutsch"). */
export function regionLabel(locale: string): string {
  const ll = langOf(locale), cc = countryOf(locale).toUpperCase();
  try {
    const country = new Intl.DisplayNames([ll], { type: 'region' }).of(cc) ?? cc;
    const language = new Intl.DisplayNames([ll], { type: 'language' }).of(ll) ?? ll;
    return `${country} - ${cap(language)}`;
  } catch {
    return `${cc} - ${ll.toUpperCase()}`;
  }
}

export type Key =
  | 'motorcycles' | 'marketplace' | 'parts' | 'men' | 'women' | 'kids' | 'goodsGifts' | 'discover'
  | 'learnToRide' | 'testRide' | 'dealerLocator' | 'trackOrder'
  | 'search' | 'addToCart' | 'cart' | 'findDealer' | 'buildBike' | 'home' | 'menu' | 'region'
  | 'lineup' | 'explore' | 'youMayLike' | 'related' | 'shopAll' | 'checkout' | 'subtotal' | 'emptyCart';

const EN: Record<Key, string> = {
  motorcycles: 'Motorcycles', marketplace: 'Marketplace', parts: 'Parts', men: 'Men', women: 'Women',
  kids: 'Kids', goodsGifts: 'Goods & Gifts', discover: 'Discover', learnToRide: 'Learn to Ride',
  testRide: 'Test Ride', dealerLocator: 'Dealer Locator', trackOrder: 'Track Order', search: 'Search',
  addToCart: 'Add to cart', cart: 'Cart', findDealer: 'Find a dealer', buildBike: 'Build your bike',
  home: 'Home', menu: 'Menu', region: 'Region', lineup: 'Lineup', explore: 'Explore',
  youMayLike: 'You may also like', related: 'Related', shopAll: 'Shop all', checkout: 'Checkout',
  subtotal: 'Subtotal', emptyCart: 'Your cart is empty',
};

// Translations of the above generic terms. Languages not listed fall back to English per missing key.
const DICT: Partial<Record<string, Partial<Record<Key, string>>>> = {
  de: { motorcycles: 'Motorräder', marketplace: 'Marktplatz', parts: 'Teile', men: 'Herren', women: 'Damen', kids: 'Kinder', goodsGifts: 'Artikel & Geschenke', discover: 'Entdecken', learnToRide: 'Fahren lernen', testRide: 'Probefahrt', dealerLocator: 'Händlersuche', trackOrder: 'Bestellung verfolgen', search: 'Suchen', addToCart: 'In den Warenkorb', cart: 'Warenkorb', findDealer: 'Händler finden', buildBike: 'Bike konfigurieren', home: 'Startseite', menu: 'Menü', region: 'Region', lineup: 'Modelle', explore: 'Entdecken', youMayLike: 'Das könnte dir gefallen', related: 'Ähnlich', shopAll: 'Alle ansehen', checkout: 'Zur Kasse', subtotal: 'Zwischensumme', emptyCart: 'Dein Warenkorb ist leer' },
  fr: { motorcycles: 'Motos', marketplace: 'Place de marché', parts: 'Pièces', men: 'Homme', women: 'Femme', kids: 'Enfants', goodsGifts: 'Articles & Cadeaux', discover: 'Découvrir', learnToRide: 'Apprendre à conduire', testRide: 'Essai', dealerLocator: 'Concessionnaires', trackOrder: 'Suivre la commande', search: 'Rechercher', addToCart: 'Ajouter au panier', cart: 'Panier', findDealer: 'Trouver un concessionnaire', buildBike: 'Configurez votre moto', home: 'Accueil', menu: 'Menu', region: 'Région', lineup: 'Gamme', explore: 'Explorer', youMayLike: 'Vous aimerez aussi', related: 'Similaires', shopAll: 'Tout voir', checkout: 'Paiement', subtotal: 'Sous-total', emptyCart: 'Votre panier est vide' },
  es: { motorcycles: 'Motos', marketplace: 'Mercado', parts: 'Piezas', men: 'Hombre', women: 'Mujer', kids: 'Niños', goodsGifts: 'Artículos y Regalos', discover: 'Descubrir', learnToRide: 'Aprende a conducir', testRide: 'Prueba de conducción', dealerLocator: 'Concesionarios', trackOrder: 'Seguir pedido', search: 'Buscar', addToCart: 'Añadir al carrito', cart: 'Carrito', findDealer: 'Buscar concesionario', buildBike: 'Configura tu moto', home: 'Inicio', menu: 'Menú', region: 'Región', lineup: 'Gama', explore: 'Explorar', youMayLike: 'También te puede gustar', related: 'Relacionados', shopAll: 'Ver todo', checkout: 'Pagar', subtotal: 'Subtotal', emptyCart: 'Tu carrito está vacío' },
  it: { motorcycles: 'Moto', marketplace: 'Marketplace', parts: 'Ricambi', men: 'Uomo', women: 'Donna', kids: 'Bambini', goodsGifts: 'Articoli e Regali', discover: 'Scopri', learnToRide: 'Impara a guidare', testRide: 'Prova su strada', dealerLocator: 'Concessionari', trackOrder: 'Traccia ordine', search: 'Cerca', addToCart: 'Aggiungi al carrello', cart: 'Carrello', findDealer: 'Trova un concessionario', buildBike: 'Configura la tua moto', home: 'Home', menu: 'Menu', region: 'Regione', lineup: 'Gamma', explore: 'Esplora', youMayLike: 'Potrebbe piacerti', related: 'Correlati', shopAll: 'Vedi tutto', checkout: 'Cassa', subtotal: 'Subtotale', emptyCart: 'Il carrello è vuoto' },
  pt: { motorcycles: 'Motos', marketplace: 'Mercado', parts: 'Peças', men: 'Homem', women: 'Mulher', kids: 'Crianças', goodsGifts: 'Produtos e Presentes', discover: 'Descobrir', learnToRide: 'Aprenda a pilotar', testRide: 'Test Ride', dealerLocator: 'Concessionárias', trackOrder: 'Rastrear pedido', search: 'Buscar', addToCart: 'Adicionar ao carrinho', cart: 'Carrinho', findDealer: 'Encontrar concessionária', buildBike: 'Monte sua moto', home: 'Início', menu: 'Menu', region: 'Região', lineup: 'Linha', explore: 'Explorar', youMayLike: 'Você também pode gostar', related: 'Relacionados', shopAll: 'Ver tudo', checkout: 'Finalizar', subtotal: 'Subtotal', emptyCart: 'Seu carrinho está vazio' },
  nl: { motorcycles: 'Motoren', marketplace: 'Marktplaats', parts: 'Onderdelen', men: 'Heren', women: 'Dames', kids: 'Kinderen', goodsGifts: 'Goederen & Cadeaus', discover: 'Ontdek', learnToRide: 'Leer rijden', testRide: 'Proefrit', dealerLocator: 'Dealers', trackOrder: 'Bestelling volgen', search: 'Zoeken', addToCart: 'In winkelwagen', cart: 'Winkelwagen', findDealer: 'Vind een dealer', buildBike: 'Stel je motor samen', home: 'Home', menu: 'Menu', region: 'Regio', lineup: 'Modellen', explore: 'Ontdek', youMayLike: 'Misschien vind je dit ook leuk', related: 'Gerelateerd', shopAll: 'Alles bekijken', checkout: 'Afrekenen', subtotal: 'Subtotaal', emptyCart: 'Je winkelwagen is leeg' },
  ja: { motorcycles: 'オートバイ', marketplace: 'マーケットプレイス', parts: 'パーツ', men: 'メンズ', women: 'レディース', kids: 'キッズ', goodsGifts: '用品・ギフト', discover: '見る', learnToRide: '乗り方を学ぶ', testRide: '試乗', dealerLocator: 'ディーラー検索', trackOrder: '注文状況', search: '検索', addToCart: 'カートに追加', cart: 'カート', findDealer: 'ディーラーを探す', buildBike: 'バイクを構成する', home: 'ホーム', menu: 'メニュー', region: '地域', lineup: 'ラインアップ', explore: '見る', youMayLike: 'おすすめ', related: '関連', shopAll: 'すべて見る', checkout: 'レジに進む', subtotal: '小計', emptyCart: 'カートは空です' },
  zh: { motorcycles: '摩托车', marketplace: '商城', parts: '配件', men: '男士', women: '女士', kids: '儿童', goodsGifts: '商品与礼品', discover: '探索', learnToRide: '学习骑行', testRide: '试驾', dealerLocator: '经销商查询', trackOrder: '订单追踪', search: '搜索', addToCart: '加入购物车', cart: '购物车', findDealer: '查找经销商', buildBike: '定制你的摩托车', home: '首页', menu: '菜单', region: '地区', lineup: '车系', explore: '探索', youMayLike: '你可能还喜欢', related: '相关', shopAll: '查看全部', checkout: '结账', subtotal: '小计', emptyCart: '购物车是空的' },
};

export function t(locale: string | null, key: Key): string {
  if (!locale) return EN[key];
  return DICT[langOf(locale)]?.[key] ?? EN[key];
}
export const makeT = (locale: string | null) => (key: Key) => t(locale, key);

// ---- order tracker strings ----
export type TrackerLabels = {
  title: string; intro: string; orderNumber: string; emailOrPostal: string; track: string; close: string;
  invalid: string; notFound: string; status: string; placed: string; processing: string; shipped: string;
  outForDelivery: string; delivered: string; carrier: string; trackingNumber: string; estDelivery: string;
  deliveredOn: string; items: string; qty: string; hint: string; another: string;
};
const TRACKER_EN: TrackerLabels = {
  title: 'Track Order', intro: 'Enter your order number and the email or postal code used at checkout.',
  orderNumber: 'Order number', emailOrPostal: 'Email or postal code', track: 'Track order', close: 'Close',
  invalid: 'Enter an order number like IL-123456 and an email or postal code.', notFound: 'We could not find that order. Check the details and try again.',
  status: 'Status', placed: 'Order placed', processing: 'Processing', shipped: 'Shipped', outForDelivery: 'Out for delivery',
  delivered: 'Delivered', carrier: 'Carrier', trackingNumber: 'Tracking number', estDelivery: 'Estimated delivery',
  deliveredOn: 'Delivered on', items: 'Items', qty: 'Qty', hint: 'Demo: any order number like IL-123456 works.', another: 'Track another order',
};
const TRACKER: Partial<Record<string, Partial<TrackerLabels>>> = {
  de: { title: 'Bestellung verfolgen', intro: 'Gib deine Bestellnummer und die beim Kauf verwendete E-Mail oder Postleitzahl ein.', orderNumber: 'Bestellnummer', emailOrPostal: 'E-Mail oder Postleitzahl', track: 'Bestellung verfolgen', close: 'Schließen', invalid: 'Gib eine Bestellnummer wie IL-123456 und eine E-Mail oder Postleitzahl ein.', notFound: 'Bestellung nicht gefunden. Bitte prüfe die Angaben.', status: 'Status', placed: 'Bestellt', processing: 'In Bearbeitung', shipped: 'Versandt', outForDelivery: 'In Zustellung', delivered: 'Zugestellt', carrier: 'Versanddienst', trackingNumber: 'Sendungsnummer', estDelivery: 'Voraussichtliche Lieferung', deliveredOn: 'Zugestellt am', items: 'Artikel', qty: 'Menge', hint: 'Demo: Jede Bestellnummer wie IL-123456 funktioniert.', another: 'Weitere Bestellung verfolgen' },
  fr: { title: 'Suivre la commande', intro: 'Saisissez votre numéro de commande et l\'e-mail ou le code postal utilisé.', orderNumber: 'Numéro de commande', emailOrPostal: 'E-mail ou code postal', track: 'Suivre', close: 'Fermer', invalid: 'Saisissez un numéro comme IL-123456 et un e-mail ou code postal.', notFound: 'Commande introuvable. Vérifiez les informations.', status: 'Statut', placed: 'Commande passée', processing: 'En préparation', shipped: 'Expédiée', outForDelivery: 'En cours de livraison', delivered: 'Livrée', carrier: 'Transporteur', trackingNumber: 'Numéro de suivi', estDelivery: 'Livraison estimée', deliveredOn: 'Livrée le', items: 'Articles', qty: 'Qté', hint: 'Démo : tout numéro comme IL-123456 fonctionne.', another: 'Suivre une autre commande' },
  es: { title: 'Seguir pedido', intro: 'Introduce tu número de pedido y el correo o código postal usado al comprar.', orderNumber: 'Número de pedido', emailOrPostal: 'Correo o código postal', track: 'Seguir pedido', close: 'Cerrar', invalid: 'Introduce un número como IL-123456 y un correo o código postal.', notFound: 'No encontramos ese pedido. Revisa los datos.', status: 'Estado', placed: 'Pedido realizado', processing: 'En preparación', shipped: 'Enviado', outForDelivery: 'En reparto', delivered: 'Entregado', carrier: 'Transportista', trackingNumber: 'Número de seguimiento', estDelivery: 'Entrega estimada', deliveredOn: 'Entregado el', items: 'Artículos', qty: 'Cant.', hint: 'Demo: cualquier número como IL-123456 funciona.', another: 'Seguir otro pedido' },
  it: { title: 'Traccia ordine', intro: 'Inserisci il numero d\'ordine e l\'e-mail o il CAP usati per l\'acquisto.', orderNumber: 'Numero ordine', emailOrPostal: 'E-mail o CAP', track: 'Traccia ordine', close: 'Chiudi', invalid: 'Inserisci un numero come IL-123456 e un\'e-mail o CAP.', notFound: 'Ordine non trovato. Controlla i dati.', status: 'Stato', placed: 'Ordine effettuato', processing: 'In lavorazione', shipped: 'Spedito', outForDelivery: 'In consegna', delivered: 'Consegnato', carrier: 'Corriere', trackingNumber: 'Numero di tracciamento', estDelivery: 'Consegna prevista', deliveredOn: 'Consegnato il', items: 'Articoli', qty: 'Qtà', hint: 'Demo: qualsiasi numero come IL-123456 funziona.', another: 'Traccia un altro ordine' },
  pt: { title: 'Rastrear pedido', intro: 'Informe o número do pedido e o e-mail ou CEP usado na compra.', orderNumber: 'Número do pedido', emailOrPostal: 'E-mail ou CEP', track: 'Rastrear pedido', close: 'Fechar', invalid: 'Informe um número como IL-123456 e um e-mail ou CEP.', notFound: 'Pedido não encontrado. Confira os dados.', status: 'Status', placed: 'Pedido feito', processing: 'Em processamento', shipped: 'Enviado', outForDelivery: 'Saiu para entrega', delivered: 'Entregue', carrier: 'Transportadora', trackingNumber: 'Código de rastreio', estDelivery: 'Entrega prevista', deliveredOn: 'Entregue em', items: 'Itens', qty: 'Qtd', hint: 'Demo: qualquer número como IL-123456 funciona.', another: 'Rastrear outro pedido' },
  nl: { title: 'Bestelling volgen', intro: 'Vul je bestelnummer en het e-mailadres of de postcode van je bestelling in.', orderNumber: 'Bestelnummer', emailOrPostal: 'E-mail of postcode', track: 'Bestelling volgen', close: 'Sluiten', invalid: 'Vul een nummer zoals IL-123456 en een e-mail of postcode in.', notFound: 'Bestelling niet gevonden. Controleer de gegevens.', status: 'Status', placed: 'Besteld', processing: 'In behandeling', shipped: 'Verzonden', outForDelivery: 'Onderweg', delivered: 'Bezorgd', carrier: 'Vervoerder', trackingNumber: 'Trackingnummer', estDelivery: 'Verwachte levering', deliveredOn: 'Bezorgd op', items: 'Artikelen', qty: 'Aantal', hint: 'Demo: elk nummer zoals IL-123456 werkt.', another: 'Andere bestelling volgen' },
  ja: { title: '注文状況', intro: 'ご注文番号と、購入時のメールアドレスまたは郵便番号を入力してください。', orderNumber: '注文番号', emailOrPostal: 'メールアドレスまたは郵便番号', track: '注文を追跡', close: '閉じる', invalid: 'IL-123456 のような注文番号と、メールアドレスまたは郵便番号を入力してください。', notFound: 'ご注文が見つかりません。入力内容をご確認ください。', status: 'ステータス', placed: 'ご注文受付', processing: '準備中', shipped: '発送済み', outForDelivery: '配達中', delivered: '配達完了', carrier: '配送業者', trackingNumber: '追跡番号', estDelivery: 'お届け予定日', deliveredOn: '配達日', items: '商品', qty: '数量', hint: 'デモ：IL-123456 のような番号で動作します。', another: '別の注文を追跡' },
  zh: { title: '订单追踪', intro: '请输入订单号以及下单时使用的邮箱或邮编。', orderNumber: '订单号', emailOrPostal: '邮箱或邮编', track: '追踪订单', close: '关闭', invalid: '请输入类似 IL-123456 的订单号及邮箱或邮编。', notFound: '未找到该订单，请检查信息。', status: '状态', placed: '已下单', processing: '处理中', shipped: '已发货', outForDelivery: '派送中', delivered: '已送达', carrier: '承运商', trackingNumber: '运单号', estDelivery: '预计送达', deliveredOn: '送达日期', items: '商品', qty: '数量', hint: '演示：任意类似 IL-123456 的订单号均可使用。', another: '追踪其他订单' },
};
export function trackerLabels(locale: string | null): TrackerLabels {
  return { ...TRACKER_EN, ...(locale ? TRACKER[langOf(locale)] ?? {} : {}) };
}

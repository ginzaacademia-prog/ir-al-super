'use strict';
/* Ir al Super — toda la app vive acá. Los datos se guardan en el celular (IndexedDB). */

/* ================= Datos fijos ================= */
const CATS = [
  { id: 'almacen', name: 'Almacén', icon: '🥫' },
  { id: 'verduleria', name: 'Verdulería', icon: '🥬' },
  { id: 'carniceria', name: 'Carnicería', icon: '🥩' },
  { id: 'fiambreria', name: 'Fiambrería', icon: '🧀' },
  { id: 'lacteos', name: 'Lácteos', icon: '🥛' },
  { id: 'panaderia', name: 'Panadería', icon: '🥖' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'congelados', name: 'Congelados', icon: '🧊' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧽' },
  { id: 'perfumeria', name: 'Perfumería', icon: '🧴' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐾' },
  { id: 'bebes', name: 'Bebés', icon: '🍼' },
  { id: 'otros', name: 'Otros', icon: '📦' },
];
const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c]));
const cat = id => CAT_BY_ID[id] || CAT_BY_ID.otros;
const catOrder = id => CATS.findIndex(c => c.id === cat(id).id);

const PROMOS = [
  { id: 'none', name: 'Sin promoción' },
  { id: '2x1', name: '2x1' },
  { id: '3x2', name: '3x2' },
  { id: '2da', name: '2da unidad con descuento', pct: true, def: 70 },
  { id: 'pct', name: 'Descuento en %', pct: true, def: 10 },
];

const ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  barcode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
};

/* ================= Utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const round2 = n => Math.round((n || 0) * 100) / 100;
const nowISO = () => new Date().toISOString();

const M0 = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const M2 = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = n => { const r = round2(n); return Number.isInteger(r) ? M0.format(r) : M2.format(r); };
const COMPACT = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 });
const compact = n => '$' + COMPACT.format(n || 0);
const NUM = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 });
const PCT = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

// Precio escrito como "1.250,50", "1250.5" o "$ 1.250" → número
function parseMoney(v) {
  if (typeof v === 'number') return v;
  let s = String(v || '').replace(/[\s$]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/\./g) || []).length > 1 || /^\d{1,3}\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
  return parseFloat(s);
}
// Cantidad: la coma o el punto son decimales ("1,250" kg = 1.25)
const parseQty = v => (typeof v === 'number' ? v : parseFloat(String(v || '').replace(',', '.')));

const pad = n => String(n).padStart(2, '0');
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const monthKey = iso => { const d = new Date(iso); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
const monthLabel = k => { const [y, m] = k.split('-'); return cap1(MONTHS[m - 1]) + ' ' + y; };
const monthShort = k => cap1(MONTHS[k.split('-')[1] - 1].slice(0, 3));
const shiftMonth = (k, d) => { let [y, m] = k.split('-').map(Number); m += d; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return y + '-' + pad(m); };
const fmtDate = iso => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
const fmtDay = iso => cap1(new Date(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
const fmtTime = iso => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
const toDateInput = iso => { const d = new Date(iso); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const fromDateInput = v => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d, 12).toISOString(); };

/* ================= Base de datos (IndexedDB) ================= */
let dbPromise;
function openDB() {
  if (!dbPromise) dbPromise = new Promise((res, rej) => {
    const r = indexedDB.open('ir-al-super', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('photos'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbPromise;
}
function tx(store, mode, fn) {
  return openDB().then(db => new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  }));
}
const idbGet = (s, k) => tx(s, 'readonly', st => st.get(k));
const idbPut = (s, k, v) => tx(s, 'readwrite', st => st.put(v, k));
const idbDel = (s, k) => tx(s, 'readwrite', st => st.delete(k));
const idbClear = s => tx(s, 'readwrite', st => st.clear());
async function idbEntries(s) {
  const keys = await tx(s, 'readonly', st => st.getAllKeys());
  const vals = await tx(s, 'readonly', st => st.getAll());
  return keys.map((k, i) => [k, vals[i]]);
}

/* ================= Estado ================= */
const freshState = () => ({ v: 1, products: [], purchases: [], settings: { theme: 'auto', monthBudget: 0 } });
let S = freshState();
const ui = { tab: 'compra', compraCat: 'all', catCat: 'all', catQ: '', catSort: 'az', month: monthKey(nowISO()) };

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 120);
}
function flush() {
  clearTimeout(saveTimer);
  return idbPut('kv', 'state', JSON.parse(JSON.stringify(S))).catch(() => {
    try { localStorage.setItem('ias-state', JSON.stringify(S)); } catch { toast('No se pudo guardar en el celular'); }
  });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

async function load() {
  let data = null;
  try { data = await idbGet('kv', 'state'); } catch {}
  if (!data) { try { data = JSON.parse(localStorage.getItem('ias-state') || 'null'); } catch {} }
  if (data && data.v) S = Object.assign(freshState(), data, { settings: Object.assign(freshState().settings, data.settings) });
  try { navigator.storage?.persist?.(); } catch {}
}

/* ================= Fotos ================= */
const photoCache = new Map();
async function photoURL(id) {
  if (photoCache.has(id)) return photoCache.get(id);
  let blob = null;
  try { blob = await idbGet('photos', id); } catch {}
  if (!blob) return null;
  const u = URL.createObjectURL(blob);
  photoCache.set(id, u);
  return u;
}
function hydratePhotos(root) {
  $$('img[data-photo]', root).forEach(async img => {
    const u = await photoURL(img.dataset.photo);
    if (u) img.src = u; else img.closest('.photo-slot, .thumb')?.classList.add('broken');
  });
}
function pickFile(capture, accept = 'image/*') {
  return new Promise(res => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = accept;
    if (capture) i.setAttribute('capture', 'environment');
    i.onchange = () => res(i.files[0] || null);
    i.click();
  });
}
async function loadBitmap(file) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch {}
  }
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
async function shrinkImage(file, max = 1100, q = 0.82) {
  const bmp = await loadBitmap(file);
  const w = bmp.width, h = bmp.height, k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/jpeg', q));
}
async function addPhoto(capture) {
  const f = await pickFile(capture);
  if (!f) return null;
  try {
    const blob = await shrinkImage(f);
    const id = uid();
    await idbPut('photos', id, blob);
    return id;
  } catch { toast('No se pudo cargar la foto'); return null; }
}
function dropPhoto(id) {
  idbDel('photos', id).catch(() => {});
  const u = photoCache.get(id);
  if (u) { URL.revokeObjectURL(u); photoCache.delete(id); }
}

/* ================= Cálculos ================= */
const prod = id => S.products.find(p => p.id === id);
const sortedPrices = p => [...(p?.prices || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
const lastPrice = p => { const s = sortedPrices(p); return s[s.length - 1] || null; };
function prevPrice(p) {
  const s = sortedPrices(p), last = s[s.length - 1];
  for (let i = s.length - 2; i >= 0; i--) if (s[i].price !== last.price) return s[i];
  return null;
}
function storePrices(p) {
  const m = new Map();
  for (const e of sortedPrices(p)) if (e.store) m.set(norm(e.store), e);
  return [...m.values()].sort((a, b) => a.price - b.price);
}
const openPurchase = () => S.purchases.find(p => p.status === 'open');
const donePurchases = () => S.purchases.filter(p => p.status === 'done');
const whenOf = pu => pu.finishedAt || pu.date;

function itemInfo(it) {
  const p = prod(it.productId);
  return { p, name: p?.name || it.name || 'Producto', category: p?.category || it.category || 'otros' };
}
function lineTotal(it) {
  const p = +it.price || 0, q = +it.qty || 0, d = it.discount || { type: 'none' };
  const v = Math.min(100, Math.max(0, +d.value || 0));
  let t;
  switch (d.type) {
    case '2x1': t = it.unit === 'kg' ? q * p : Math.ceil(q / 2) * p; break;
    case '3x2': t = it.unit === 'kg' ? q * p : (q - Math.floor(q / 3)) * p; break;
    case '2da': t = it.unit === 'kg' ? q * p : Math.floor(q / 2) * (p + p * (1 - v / 100)) + (q % 2) * p; break;
    case 'pct': t = q * p * (1 - v / 100); break;
    default: t = q * p;
  }
  return round2(t);
}
function totals(pu) {
  let sub = 0, list = 0, pending = 0, count = 0, pendingCount = 0;
  for (const it of pu.items) {
    const lt = lineTotal(it);
    if (it.checked) { sub += lt; list += (+it.qty || 0) * (+it.price || 0); count++; }
    else { pending += lt; pendingCount++; }
  }
  let bank = 0;
  const d = pu.discount;
  if (d && d.pct > 0) { bank = sub * d.pct / 100; if (d.cap > 0) bank = Math.min(bank, d.cap); }
  sub = round2(sub); bank = round2(bank); list = round2(list);
  return { sub, list, promo: round2(list - sub), bank, total: round2(sub - bank), pending: round2(pending), count, pendingCount, savings: round2(list - sub + bank) };
}
// Mantiene el historial de precios: una entrada por producto por compra (solo lo que está en el carrito).
function syncPrices(pu) {
  const price = new Map();
  for (const it of pu.items) if (it.checked && it.productId) price.set(it.productId, +it.price || 0);
  for (const p of S.products) {
    p.prices = p.prices || [];
    const idx = p.prices.findIndex(e => e.purchaseId === pu.id);
    if (price.has(p.id)) {
      if (idx >= 0) Object.assign(p.prices[idx], { price: price.get(p.id), store: pu.store || '' });
      else p.prices.push({ id: uid(), date: pu.status === 'done' ? whenOf(pu) : nowISO(), price: price.get(p.id), store: pu.store || '', purchaseId: pu.id });
    } else if (idx >= 0) p.prices.splice(idx, 1);
  }
}
function groupItems(items) {
  const m = new Map();
  for (const it of items) {
    const c = itemInfo(it).category;
    if (!m.has(c)) m.set(c, []);
    m.get(c).push(it);
  }
  return [...m.entries()].sort((a, b) => catOrder(a[0]) - catOrder(b[0])).map(([c, list]) => ({
    cat: c, items: list, subtotal: round2(list.filter(i => i.checked).reduce((s, i) => s + lineTotal(i), 0)),
  }));
}
function stores() {
  const set = new Map();
  for (const p of S.purchases) if (p.store) set.set(norm(p.store), p.store);
  for (const p of S.products) for (const e of p.prices || []) if (e.store) set.set(norm(e.store), e.store);
  return [...set.values()].sort((a, b) => a.localeCompare(b, 'es'));
}
function freqMap() {
  const m = new Map();
  for (const pu of donePurchases()) for (const id of new Set(pu.items.map(i => i.productId))) m.set(id, (m.get(id) || 0) + 1);
  return m;
}
function monthPurchases(k) {
  return donePurchases().filter(p => monthKey(whenOf(p)) === k).sort((a, b) => (whenOf(a) < whenOf(b) ? 1 : -1));
}
function monthStats(k) {
  const ps = monthPurchases(k);
  let total = 0, savings = 0, items = 0;
  const byCat = new Map(), byStore = new Map(), byProd = new Map();
  for (const pu of ps) {
    const t = totals(pu);
    total += t.total; savings += t.savings;
    const f = t.sub > 0 ? t.total / t.sub : 0; // reparte el descuento bancario entre los productos
    const sk = pu.store || 'Sin súper';
    const s = byStore.get(norm(sk)) || { name: sk, amount: 0, count: 0 };
    s.amount += t.total; s.count++; byStore.set(norm(sk), s);
    for (const it of pu.items) {
      if (!it.checked) continue;
      const info = itemInfo(it), amt = lineTotal(it) * f;
      items++;
      const c = byCat.get(info.category) || { id: info.category, amount: 0, prods: new Map() };
      c.amount += amt;
      const pk = it.productId || norm(info.name);
      const pr = byProd.get(pk) || { key: pk, id: it.productId, name: info.name, category: info.category, unit: it.unit, qty: 0, amount: 0, times: 0, minP: Infinity, maxP: 0 };
      pr.qty += +it.qty || 0; pr.amount += amt; pr.times++;
      pr.minP = Math.min(pr.minP, +it.price || 0); pr.maxP = Math.max(pr.maxP, +it.price || 0);
      byProd.set(pk, pr); c.prods.set(pk, pr); byCat.set(info.category, c);
    }
  }
  const desc = (a, b) => b.amount - a.amount;
  return { ps, total: round2(total), savings: round2(savings), items, cats: [...byCat.values()].sort(desc), stores: [...byStore.values()].sort(desc), prods: [...byProd.values()].sort(desc) };
}
const monthTotal = k => round2(monthPurchases(k).reduce((s, p) => s + totals(p).total, 0));

/* ================= Piezas de interfaz ================= */
function thumb(p, catId, cls = 'thumb') {
  const ph = p?.photos?.[0];
  return `<span class="${cls}">${ph ? `<img data-photo="${esc(ph)}" alt="">` : cat(catId || p?.category).icon}</span>`;
}
function deltaHtml(cur, prev) {
  if (!prev || cur == null || prev === cur) return '';
  const d = (cur - prev) / prev * 100, up = d > 0;
  return `<span class="delta ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${PCT.format(Math.abs(d))}%</span>`;
}
function promoLabel(d) {
  if (!d || d.type === 'none') return '';
  if (d.type === '2da') return `2da al ${d.value}%`;
  if (d.type === 'pct') return `${d.value}% off`;
  return d.type;
}
function qtyLabel(it) {
  return it.unit === 'kg' ? `${NUM.format(it.qty)} kg × ${fmt(it.price)}/kg` : `${NUM.format(it.qty)} × ${fmt(it.price)}`;
}
function budgetBar(spent, budget, dark) {
  if (!(budget > 0)) return '';
  const r = spent / budget, cls = r > 1 ? 'over' : r > 0.85 ? 'warn' : '';
  const left = budget - spent;
  return `<div class="${dark ? 'bar' : 'pbar'} ${cls}"><span style="width:${Math.min(100, r * 100).toFixed(1)}%"></span></div>
    <div class="bar-legend ${dark ? '' : 'muted'}"><span>Presupuesto ${fmt(budget)}</span><span>${left >= 0 ? 'Te quedan ' + fmt(left) : 'Te pasaste ' + fmt(-left)}</span></div>`;
}
function barChart(data) { // [{label, value, key, on}]
  const W = 320, H = 150, top = 18, bottom = 22, n = data.length, gap = 10;
  const bw = (W - gap * (n - 1)) / n, max = Math.max(1, ...data.map(d => d.value));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gasto por mes">${data.map((d, i) => {
    const h = Math.max(d.value > 0 ? 3 : 0, (H - top - bottom) * d.value / max), x = i * (bw + gap), y = H - bottom - h;
    return `<g data-act="month" data-k="${d.key}" style="cursor:pointer">
      <rect x="${x}" y="0" width="${bw}" height="${H}" fill="transparent"/>
      <rect class="bar-rect ${d.on ? 'on' : ''}" x="${x}" y="${y}" width="${bw}" height="${h}" rx="6"/>
      ${d.value > 0 ? `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" class="${d.on ? 'lbl-on' : ''}">${compact(d.value)}</text>` : ''}
      <text x="${x + bw / 2}" y="${H - 5}" text-anchor="middle" class="${d.on ? 'lbl-on' : ''}">${d.label}</text></g>`;
  }).join('')}</svg>`;
}
function lineChart(entries) {
  if (entries.length < 2) return '';
  const W = 320, H = 140, l = 62, r = 8, t = 16, b = 22;
  const ts = entries.map(e => +new Date(e.date)), vs = entries.map(e => e.price);
  const t0 = Math.min(...ts), t1 = Math.max(...ts), v0 = Math.min(...vs), v1 = Math.max(...vs);
  const sameT = t1 === t0, sameV = v1 === v0;
  const X = (tt, i) => l + (W - l - r) * (sameT ? i / (entries.length - 1) : (tt - t0) / (t1 - t0));
  const Y = v => t + (H - t - b) * (sameV ? 0.5 : 1 - (v - v0) / (v1 - v0));
  const pts = entries.map((e, i) => [X(ts[i], i), Y(e.price)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${pts[pts.length - 1][0].toFixed(1)} ${H - b} L${pts[0][0].toFixed(1)} ${H - b} Z`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del precio">
    <line class="grid" x1="0" x2="${W}" y1="${Y(v1)}" y2="${Y(v1)}"/><line class="grid" x1="0" x2="${W}" y1="${Y(v0)}" y2="${Y(v0)}"/>
    <path class="area" d="${area}" opacity=".6"/><path class="line" d="${path}"/>
    ${pts.map(p => `<circle class="pt" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5"/>`).join('')}
    <text x="2" y="${Y(v1) - 4}">${fmt(v1)}</text>${sameV ? '' : `<text x="2" y="${Y(v0) - 4}">${fmt(v0)}</text>`}
    <text x="${l}" y="${H - 5}">${fmtDate(entries[0].date)}</text>
    <text x="${W - r}" y="${H - 5}" text-anchor="end">${fmtDate(entries[entries.length - 1].date)}</text></svg>`;
}
function hbars(rows, total) { // [{label, amount, extra}]
  return `<div class="hbars">${rows.map(r => {
    const p = total > 0 ? r.amount / total * 100 : 0;
    return `<div class="hbar"><span>${r.label}</span><span class="v">${fmt(Math.round(r.amount))} <small>${PCT.format(p)}%</small></span><div class="track"><span style="width:${p.toFixed(1)}%"></span></div></div>`;
  }).join('')}</div>`;
}
function storeOptions() { return `<datalist id="storeList">${stores().map(s => `<option value="${esc(s)}">`).join('')}</datalist>`; }

/* ================= Aviso ================= */
let toastTimer;
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
  if (action) t.querySelector('button').onclick = () => { t.classList.remove('show'); action.fn(); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2400);
}

/* ================= Hojas (pantallas que suben desde abajo) ================= */
const stack = [];
let afterPop = [], closing = false;
const topSheet = () => stack[stack.length - 1];
function openSheet(def) {
  stack.push(def);
  history.pushState({ sheet: stack.length }, '');
  showTop(true);
}
function closeSheet(then) {
  if (then) afterPop.push(then);
  if (closing || !stack.length) return;
  closing = true;
  history.back();
}
function closeAllSheets(then) {
  if (then) afterPop.push(then);
  if (closing || !stack.length) return;
  closing = true;
  history.go(-stack.length);
}
window.addEventListener('popstate', e => {
  closing = false;
  const target = e.state?.sheet || 0;
  while (stack.length > target) stack.pop().onClose?.();
  if (stack.length) showTop(); else hideSheet();
  const fns = afterPop; afterPop = [];
  fns.forEach(f => f());
});
function showTop(isNew) {
  const def = topSheet();
  const wrap = $('#sheetWrap'), body = $('#sheetBody');
  const r = def.render();
  $('#sheetTitle').textContent = r.title || '';
  $('#sheetBack').style.visibility = stack.length > 1 ? 'visible' : 'hidden';
  const keep = isNew ? 0 : body.scrollTop;
  body.innerHTML = r.body || '';
  $('#sheetFoot').innerHTML = r.foot || '';
  body.scrollTop = keep;
  hydratePhotos(body);
  clearTimeout(hideTimer);
  if (wrap.hidden) {
    wrap.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  } else wrap.classList.add('open');
  document.body.style.overflow = 'hidden';
  def.mounted?.(body);
  if (isNew) { const af = $('[data-autofocus]', body); if (af) setTimeout(() => af.focus(), 260); }
}
const refreshSheet = () => { if (stack.length) showTop(); };
let hideTimer;
function hideSheet() {
  const wrap = $('#sheetWrap');
  wrap.classList.remove('open');
  document.body.style.overflow = '';
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { if (!stack.length) { wrap.hidden = true; $('#sheetBody').innerHTML = ''; $('#sheetFoot').innerHTML = ''; } }, 260);
  render();
}
// Escribe lo que se tipea en los campos de la hoja en su estado (data-f="campo")
function onSheetField(e) {
  const el = e.target.closest('[data-f]');
  const def = topSheet();
  if (!el || !def || !def.st) return;
  const isToggle = el.type === 'checkbox' || el.tagName === 'SELECT';
  if (e.type === 'input' && isToggle) return;
  if (e.type === 'change' && !isToggle && el.type !== 'date') return;
  def.st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value;
  def.onField?.(el.dataset.f, el, e);
}
$('#sheetBody').addEventListener('input', onSheetField);
$('#sheetBody').addEventListener('change', onSheetField);

/* ================= Vistas principales ================= */
function render() {
  const views = { compra: viewCompra, productos: viewProductos, meses: viewMeses, ajustes: viewAjustes };
  const v = $('#view');
  v.innerHTML = views[ui.tab]();
  hydratePhotos(v);
  $$('.tab').forEach(t => t.dataset.tab === ui.tab ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current'));
  const pu = openPurchase();
  $('#openDot').hidden = !pu || ui.tab === 'compra';
  const fab = $('#fab');
  if (ui.tab === 'compra' && pu) { fab.hidden = false; fab.innerHTML = ICON.plus + 'Agregar'; }
  else if (ui.tab === 'productos') { fab.hidden = false; fab.innerHTML = ICON.plus + 'Nuevo'; }
  else fab.hidden = true;
  const subs = { compra: pu ? 'Compra en curso' : 'Tu compra', productos: 'Tus productos y precios', meses: 'Gastos por mes', ajustes: 'Ajustes' };
  $('#subtitle').textContent = subs[ui.tab];
  $('#topActions').innerHTML = (ui.tab === 'compra' && pu) || ui.tab === 'productos'
    ? `<button class="icon-btn" type="button" data-act="scan-global" aria-label="Escanear código de barras">${ICON.barcode}</button>` : '';
}

/* ---------- Compra ---------- */
function viewCompra() {
  const pu = openPurchase();
  if (!pu) {
    const last = donePurchases().sort((a, b) => (whenOf(a) < whenOf(b) ? 1 : -1))[0];
    return `<div class="empty"><div class="big">🛒</div><strong>¿Salís a comprar?</strong>
      <span>Empezá una compra y andá cargando cada producto a medida que lo metés al carrito. El total se suma solo.</span>
      <button class="btn primary" type="button" data-act="start">${ICON.plus}Empezar compra</button>
      ${last ? `<button class="btn ghost" type="button" data-act="repeat" data-id="${last.id}">Repetir la última (${esc(last.store || fmtDate(whenOf(last)))})</button>` : ''}</div>
      ${monthMini()}`;
  }
  const t = totals(pu);
  const groups = groupItems(pu.items);
  if (ui.compraCat !== 'all' && !groups.some(g => g.cat === ui.compraCat)) ui.compraCat = 'all';
  const shown = ui.compraCat === 'all' ? groups : groups.filter(g => g.cat === ui.compraCat);
  const d = pu.discount;
  return `
  <section class="total-card">
    <div class="tc-top">
      <button class="store-btn" type="button" data-act="edit-open">${ICON.pin}${esc(pu.store || 'Elegir súper')}</button>
      <span>${fmtDay(pu.date)}</span>
    </div>
    <div class="tc-label">Total en el carrito</div>
    <div class="tc-total">${fmt(t.total)}</div>
    <div class="tc-sub">${t.count} ${t.count === 1 ? 'producto' : 'productos'}${t.savings > 0 ? ` · ahorrás ${fmt(t.savings)}` : ''}</div>
    ${(t.promo > 0 || t.bank > 0 || t.pending > 0) ? `<div class="tc-lines">
      ${t.promo > 0 ? `<div><span>Promociones</span><span>−${fmt(t.promo)}</span></div>` : ''}
      ${t.bank > 0 ? `<div><span>${esc(d.label || 'Descuento')} ${PCT.format(d.pct)}%${d.cap > 0 ? ' (tope ' + fmt(d.cap) + ')' : ''}</span><span>−${fmt(t.bank)}</span></div>` : ''}
      ${t.pending > 0 ? `<div><span>Falta agarrar (${t.pendingCount})</span><span>${fmt(t.pending)}</span></div>` : ''}
    </div>` : ''}
    ${budgetBar(t.total, pu.budget, true)}
    <div class="tc-actions">
      <button class="btn" type="button" data-act="bank">% ${d ? 'Desc.' : 'Banco'}</button>
      <button class="btn" type="button" data-act="share-list" aria-label="Compartir lista">${ICON.share}</button>
      <button class="btn finish" type="button" data-act="finish">Finalizar</button>
    </div>
  </section>
  ${pu.items.length ? `<div class="chips" role="group" aria-label="Filtrar por categoría">
      <button class="chip" type="button" data-act="ccat" data-c="all" aria-pressed="${ui.compraCat === 'all'}">Todo <span class="n">${pu.items.length}</span></button>
      ${groups.map(g => `<button class="chip" type="button" data-act="ccat" data-c="${g.cat}" aria-pressed="${ui.compraCat === g.cat}">${cat(g.cat).icon} ${cat(g.cat).name} <span class="n">${g.items.length}</span></button>`).join('')}
    </div>
    ${shown.map(g => `<section class="group">
      <div class="group-head"><span>${cat(g.cat).icon} ${cat(g.cat).name}</span><span class="money">${fmt(g.subtotal)}</span></div>
      <ul class="list">${g.items.map(itemRow).join('')}</ul></section>`).join('')}`
  : `<div class="empty"><div class="big">🧺</div><strong>El carrito está vacío</strong><span>Tocá <b>Agregar</b> para cargar el primer producto, o escaneá su código de barras.</span></div>`}`;
}
function itemRow(it) {
  const info = itemInfo(it), lt = lineTotal(it), full = round2(it.qty * it.price);
  const sub = [qtyLabel(it), info.p?.brand].filter(Boolean).join(' · ');
  return `<li class="row ${it.checked ? '' : 'pending'}">
    <button class="check" type="button" data-act="toggle" data-id="${it.id}" aria-pressed="${!!it.checked}" aria-label="${it.checked ? 'En el carrito' : 'Falta agarrar'}">${ICON.check}</button>
    <button class="row-main" type="button" data-act="edit-item" data-id="${it.id}">
      ${thumb(info.p, info.category)}
      <span class="row-text"><b>${esc(info.name)}</b><small>${esc(sub)}${promoLabel(it.discount) ? `<span class="badge">${esc(promoLabel(it.discount))}</span>` : ''}</small></span>
      <span class="row-end"><b>${fmt(lt)}</b>${lt < full ? `<s>${fmt(full)}</s>` : ''}</span>
    </button></li>`;
}
function monthMini() {
  const k = monthKey(nowISO()), tot = monthTotal(k), n = monthPurchases(k).length;
  if (!n) return '';
  return `<div class="card" style="margin-top:8px"><h3>${monthLabel(k)}</h3>
    <div class="inline"><div class="grow"><b style="font-family:var(--font-display);font-size:1.6rem">${fmt(tot)}</b><div class="muted" style="font-size:.88rem">${n} ${n === 1 ? 'compra' : 'compras'} este mes</div></div>
    <button class="btn soft small" type="button" data-act="tab" data-tab="meses">Ver gastos</button></div>
    ${S.settings.monthBudget > 0 ? '<div style="margin-top:12px">' + budgetBar(tot, S.settings.monthBudget) + '</div>' : ''}</div>`;
}

/* ---------- Productos ---------- */
function viewProductos() {
  const counts = {};
  for (const p of S.products) counts[p.category] = (counts[p.category] || 0) + 1;
  return `
  <div class="search-row">
    <label class="search">${ICON.search}<input id="catSearch" type="search" placeholder="Buscar producto, marca o código" value="${esc(ui.catQ)}" autocomplete="off"></label>
  </div>
  <div class="chips" role="group" aria-label="Filtrar por categoría">
    <button class="chip" type="button" data-act="pcat" data-c="all" aria-pressed="${ui.catCat === 'all'}">Todas <span class="n">${S.products.length}</span></button>
    ${CATS.map(c => `<button class="chip" type="button" data-act="pcat" data-c="${c.id}" aria-pressed="${ui.catCat === c.id}">${c.icon} ${c.name}${counts[c.id] ? ` <span class="n">${counts[c.id]}</span>` : ''}</button>`).join('')}
  </div>
  <div id="catList">${catalogList()}</div>`;
}
function catalogList() {
  if (!S.products.length) return `<div class="empty"><div class="big">🏷️</div><strong>Todavía no hay productos</strong><span>Los productos que cargues en tus compras quedan guardados acá, con su foto y su historial de precios.</span></div>`;
  const q = norm(ui.catQ), freq = freqMap();
  let list = S.products.filter(p => (ui.catCat === 'all' || p.category === ui.catCat) &&
    (!q || norm(p.name).includes(q) || norm(p.brand).includes(q) || (p.barcode || '').includes(q)));
  const sorters = {
    az: (a, b) => a.name.localeCompare(b.name, 'es'),
    freq: (a, b) => (freq.get(b.id) || 0) - (freq.get(a.id) || 0) || a.name.localeCompare(b.name, 'es'),
    recent: (a, b) => ((lastPrice(b)?.date || b.created || '') > (lastPrice(a)?.date || a.created || '') ? 1 : -1),
  };
  list.sort(sorters[ui.catSort] || sorters.az);
  const pu = openPurchase();
  return `<div class="toolbar"><span>${list.length} ${list.length === 1 ? 'producto' : 'productos'}</span>
    <label>Ordenar: <select id="catSort"><option value="az" ${ui.catSort === 'az' ? 'selected' : ''}>A–Z</option><option value="freq" ${ui.catSort === 'freq' ? 'selected' : ''}>Más comprados</option><option value="recent" ${ui.catSort === 'recent' ? 'selected' : ''}>Recientes</option></select></label></div>
  ${list.length ? `<ul class="list">${list.map(p => {
    const lp = lastPrice(p), pp = prevPrice(p);
    return `<li class="row"><button class="row-main" type="button" data-act="product" data-id="${p.id}">
      ${thumb(p)}
      <span class="row-text"><b>${esc(p.name)}</b><small>${esc([p.brand, p.size, lp?.store].filter(Boolean).join(' · ') || cat(p.category).name)}</small></span>
      <span class="row-end"><b>${lp ? fmt(lp.price) + (p.unit === 'kg' ? '<small class="muted">/kg</small>' : '') : '—'}</b>${lp && pp ? deltaHtml(lp.price, pp.price) : ''}</span></button>
      ${pu ? `<button class="add-btn" type="button" data-act="quick-add" data-id="${p.id}" aria-label="Agregar ${esc(p.name)} a la compra">${ICON.plus}</button>` : ''}</li>`;
  }).join('')}</ul>` : `<div class="empty"><span>No encontré productos con ese filtro.</span></div>`}`;
}

/* ---------- Mis gastos (por mes) ---------- */
function viewMeses() {
  const k = ui.month, st = monthStats(k), prevTot = monthTotal(shiftMonth(k, -1));
  const isCurrent = k === monthKey(nowISO());
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(k, i - 5));
  const pu = openPurchase();
  const budget = S.settings.monthBudget;
  return `
  <div class="month-nav">
    <button class="icon-btn" type="button" data-act="month-shift" data-d="-1" aria-label="Mes anterior">${ICON.left}</button>
    <h2>${monthLabel(k)}</h2>
    <button class="icon-btn" type="button" data-act="month-shift" data-d="1" aria-label="Mes siguiente" ${isCurrent ? 'disabled style="opacity:.35"' : ''}>${ICON.right}</button>
  </div>
  <div class="stats">
    <div class="stat wide"><small>Gastaste en ${MONTHS[k.split('-')[1] - 1]}</small><b>${fmt(st.total)}</b>
      <span>${st.ps.length} ${st.ps.length === 1 ? 'compra' : 'compras'}${prevTot > 0 ? ' · ' + (st.total >= prevTot ? '▲ ' : '▼ ') + PCT.format(Math.abs((st.total - prevTot) / prevTot * 100)) + '% vs. mes anterior' : ''}</span>
      ${budget > 0 ? `<div style="margin-top:10px">${budgetBar(st.total, budget)}</div>` : ''}</div>
    <div class="stat"><small>Ticket promedio</small><b>${fmt(st.ps.length ? st.total / st.ps.length : 0)}</b></div>
    <div class="stat"><small>Ahorraste</small><b style="color:var(--accent)">${fmt(st.savings)}</b><span>en promos y descuentos</span></div>
  </div>
  <button class="btn primary block" type="button" data-act="breakdown" data-k="${k}" ${st.ps.length ? '' : 'disabled'}>Ver desglose del mes</button>
  ${pu && isCurrent ? `<div class="note" style="margin-top:12px">Tenés una compra en curso de <b>${fmt(totals(pu).total)}</b>. Se suma al mes cuando la finalices.</div>` : ''}
  <h3 class="section-title">Últimos meses</h3>
  <div class="card">${barChart(months.map(m => ({ key: m, label: monthShort(m), value: monthTotal(m), on: m === k })))}</div>
  ${st.cats.length ? `<h3 class="section-title">Por categoría</h3><div class="card">${hbars(st.cats.map(c => ({ label: cat(c.id).icon + ' ' + cat(c.id).name, amount: c.amount })), st.total)}</div>` : ''}
  <h3 class="section-title">Compras del mes <small>${st.ps.length}</small></h3>
  ${st.ps.length ? `<ul class="list">${st.ps.map(purchaseRow).join('')}</ul>` : `<div class="empty"><div class="big">📅</div><span>No hay compras finalizadas en ${monthLabel(k).toLowerCase()}.</span></div>`}`;
}
function purchaseRow(pu) {
  const t = totals(pu);
  return `<li class="row"><button class="row-main" type="button" data-act="purchase" data-id="${pu.id}">
    <span class="thumb">🧾</span>
    <span class="row-text"><b>${esc(pu.store || 'Compra')}</b><small>${fmtDate(whenOf(pu))} · ${t.count} ${t.count === 1 ? 'producto' : 'productos'}</small></span>
    <span class="row-end"><b>${fmt(t.total)}</b>${pu.ticketTotal > 0 && Math.abs(pu.ticketTotal - t.total) >= 1 ? '<span class="badge">ticket distinto</span>' : ''}</span></button></li>`;
}

/* ---------- Ajustes ---------- */
function viewAjustes() {
  const th = S.settings.theme;
  const nItems = S.purchases.reduce((s, p) => s + p.items.length, 0);
  return `<div class="settings">
  <h3 class="section-title">Apariencia</h3>
  <div class="card"><div class="set-row"><div class="t"><b>Tema</b><small>Claro, oscuro o como el celular</small></div>
    <div class="seg">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button type="button" data-act="theme" data-v="${v}" aria-pressed="${th === v}">${l}</button>`).join('')}</div></div></div>
  <h3 class="section-title">Presupuesto</h3>
  <div class="card"><div class="set-row"><div class="t"><b>Presupuesto mensual</b><small>Te avisa cuánto te queda en el mes</small></div>
    <div class="affix"><span>$</span><input class="input" id="monthBudget" inputmode="decimal" placeholder="Sin tope" value="${S.settings.monthBudget > 0 ? esc(String(S.settings.monthBudget)) : ''}"></div></div></div>
  <h3 class="section-title">Tus datos</h3>
  <div class="card">
    <div class="set-row"><div class="t"><b>Guardar una copia</b><small>Descarga un archivo con todo (incluye fotos)</small></div><button class="btn soft small" type="button" data-act="export">Exportar</button></div>
    <div class="set-row"><div class="t"><b>Recuperar una copia</b><small>Reemplaza lo que hay por el archivo</small></div><button class="btn ghost small" type="button" data-act="import">Importar</button></div>
    <div class="set-row"><div class="t"><b>Borrar todo</b><small>Productos, compras, precios y fotos</small></div><button class="btn danger small" type="button" data-act="wipe">Borrar</button></div>
  </div>
  <p class="hint center" style="margin-top:18px">${S.products.length} productos · ${donePurchases().length} compras · ${nItems} renglones cargados<br>Todo queda guardado solo en este celular. Hacé una copia de vez en cuando.</p>
  <p class="hint center">Ir al Super · versión 1.0</p></div>`;
}

/* ================= Hojas: compra ================= */
function startSheet(prefill) {
  const st = { store: prefill?.store || '', budget: '' };
  return {
    st,
    render: () => ({
      title: 'Nueva compra',
      body: `<div class="field"><label for="f-store">¿Dónde comprás?</label>
        <input id="f-store" data-f="store" list="storeList" placeholder="Ej: Coto, Día, el chino de la esquina" value="${esc(st.store)}" autocomplete="off" data-autofocus>${storeOptions()}
        <small>Así después podés comparar precios entre súpers.</small></div>
        <div class="field"><label for="f-budget">Presupuesto para esta compra (opcional)</label>
        <div class="affix"><span>$</span><input id="f-budget" data-f="budget" inputmode="decimal" placeholder="Sin tope" value="${esc(st.budget)}"></div></div>`,
      foot: `<button class="btn primary" type="button" data-act="go">Empezar</button>`,
    }),
    acts: {
      go() {
        const budget = parseMoney(st.budget);
        const pu = { id: uid(), date: nowISO(), store: st.store.trim(), budget: budget > 0 ? budget : 0, items: [], status: 'open', discount: null };
        if (prefill?.items) pu.items = prefill.items;
        S.purchases.push(pu);
        syncPrices(pu);
        save();
        ui.tab = 'compra'; ui.compraCat = 'all';
        closeAllSheets(() => { render(); if (!pu.items.length) openSheet(itemSheet()); });
      },
    },
  };
}

function editOpenSheet() {
  const pu = openPurchase();
  const st = { store: pu.store || '', budget: pu.budget > 0 ? String(pu.budget) : '' };
  return {
    st,
    render: () => ({
      title: 'Datos de la compra',
      body: `<div class="field"><label for="f-store">Súper</label><input id="f-store" data-f="store" list="storeList" value="${esc(st.store)}" autocomplete="off">${storeOptions()}</div>
        <div class="field"><label for="f-budget">Presupuesto</label><div class="affix"><span>$</span><input id="f-budget" data-f="budget" inputmode="decimal" placeholder="Sin tope" value="${esc(st.budget)}"></div></div>
        <p class="hint">Empezaste ${fmtDay(pu.date).toLowerCase()} a las ${fmtTime(pu.date)}.</p>`,
      foot: `<button class="btn danger" type="button" data-act="cancel">Descartar</button><button class="btn primary" type="button" data-act="ok">Guardar</button>`,
    }),
    acts: {
      ok() {
        pu.store = st.store.trim();
        const b = parseMoney(st.budget); pu.budget = b > 0 ? b : 0;
        syncPrices(pu); save(); closeSheet(); toast('Guardado');
      },
      cancel() {
        if (!confirm('¿Descartar esta compra? Se borran los productos cargados en ella (el catálogo queda).')) return;
        S.purchases = S.purchases.filter(p => p !== pu);
        for (const p of S.products) p.prices = (p.prices || []).filter(e => e.purchaseId !== pu.id);
        save(); closeSheet(); toast('Compra descartada');
      },
    },
  };
}

function bankSheet() {
  const pu = openPurchase(), d = pu.discount || {};
  const st = { label: d.label || '', pct: d.pct ? String(d.pct) : '', cap: d.cap ? String(d.cap) : '' };
  return {
    st,
    render: () => ({
      title: 'Descuento en el total',
      body: `<p class="hint" style="margin-top:0">Para descuentos de banco, billetera virtual o día de la semana que se aplican al total.</p>
        <div class="field"><label for="f-l">Nombre</label><input id="f-l" data-f="label" placeholder="Ej: Banco Nación, Mercado Pago, Jubilados" value="${esc(st.label)}"></div>
        <div class="grid2">
          <div class="field"><label for="f-p">Descuento %</label><input id="f-p" data-f="pct" inputmode="decimal" placeholder="20" value="${esc(st.pct)}"></div>
          <div class="field"><label for="f-c">Tope de reintegro</label><div class="affix"><span>$</span><input id="f-c" data-f="cap" inputmode="decimal" placeholder="Sin tope" value="${esc(st.cap)}"></div></div>
        </div>`,
      foot: `${pu.discount ? '<button class="btn danger" type="button" data-act="remove">Quitar</button>' : ''}<button class="btn primary" type="button" data-act="ok">Aplicar</button>`,
    }),
    acts: {
      ok() {
        const pct = parseQty(st.pct), capv = parseMoney(st.cap);
        if (!(pct > 0 && pct <= 100)) return toast('Poné un % entre 1 y 100');
        pu.discount = { label: st.label.trim(), pct, cap: capv > 0 ? capv : 0 };
        save(); closeSheet(); toast('Descuento aplicado');
      },
      remove() { pu.discount = null; save(); closeSheet(); },
    },
  };
}

function finishSheet() {
  const pu = openPurchase();
  const st = { ticket: '' };
  return {
    st,
    render: () => {
      const t = totals(pu);
      return {
        title: 'Finalizar compra',
        body: `<div class="card center"><div class="muted">Total de la compra</div>
          <div style="font-family:var(--font-display);font-weight:700;font-size:2.4rem;letter-spacing:-.03em">${fmt(t.total)}</div>
          <div class="muted">${t.count} productos · ${esc(pu.store || 'sin súper')}${t.savings > 0 ? ' · ahorraste ' + fmt(t.savings) : ''}</div></div>
          ${t.pendingCount ? `<div class="note">Hay <b>${t.pendingCount}</b> ${t.pendingCount === 1 ? 'producto sin tildar' : 'productos sin tildar'}. No se van a contar y se sacan de la compra.</div>` : ''}
          ${t.count === 0 ? `<div class="note bad">No hay nada tildado en el carrito.</div>` : ''}
          <div class="field"><label for="f-t">¿Cuánto dice el ticket? (opcional)</label>
            <div class="affix"><span>$</span><input id="f-t" data-f="ticket" inputmode="decimal" placeholder="${esc(String(t.total))}" value="${esc(st.ticket)}"></div>
            <small id="ticketDiff">Sirve para ver si te cobraron bien.</small></div>`,
        foot: `<button class="btn primary" type="button" data-act="ok" ${t.count ? '' : 'disabled'}>Guardar compra</button>`,
      };
    },
    onField(f) { if (f === 'ticket') $('#ticketDiff').innerHTML = ticketDiffHtml(parseMoney(st.ticket), totals(pu).total) || 'Sirve para ver si te cobraron bien.'; },
    acts: {
      ok() {
        const tk = parseMoney(st.ticket);
        pu.items = pu.items.filter(i => i.checked);
        pu.status = 'done';
        pu.finishedAt = nowISO();
        pu.ticketTotal = tk > 0 ? tk : 0;
        syncPrices(pu);
        for (const p of S.products) for (const e of p.prices || []) if (e.purchaseId === pu.id) e.date = pu.finishedAt;
        save();
        ui.month = monthKey(pu.finishedAt); ui.compraCat = 'all';
        closeAllSheets(() => { ui.tab = 'meses'; render(); toast('¡Compra guardada! ' + fmt(totals(pu).total)); openSheet(purchaseSheet(pu.id)); });
      },
    },
  };
}
function ticketDiffHtml(ticket, total) {
  if (!(ticket > 0)) return '';
  const d = round2(ticket - total);
  if (Math.abs(d) < 1) return '<span style="color:var(--accent);font-weight:600">✓ Coincide con lo que calculaste</span>';
  return d > 0 ? `<span style="color:var(--danger);font-weight:600">Te cobraron ${fmt(d)} de más</span>` : `<span style="color:var(--warn);font-weight:600">Te cobraron ${fmt(-d)} de menos</span>`;
}

/* ================= Hoja: agregar / editar producto de la compra ================= */
function itemSheet(itemId, opts = {}) {
  const pu = openPurchase();
  const it = itemId ? pu.items.find(i => i.id === itemId) : null;
  const p0 = it ? prod(it.productId) : opts.productId ? prod(opts.productId) : null;
  const st = {};
  const created = []; // fotos nuevas (se borran si se cancela)
  let saved = false;
  function loadProduct(p) {
    Object.assign(st, {
      productId: p?.id || null, name: p?.name || it?.name || st.name || '', category: p?.category || it?.category || st.category || 'almacen',
      unit: p?.unit || it?.unit || st.unit || 'u', brand: p?.brand || '', size: p?.size || '', notes: p?.notes || '',
      barcode: p?.barcode || st.barcode || opts.barcode || '', photos: [...(p?.photos || [])],
    });
    if (!it || it.productId !== p?.id) st.price = p ? (lastPrice(p)?.price ?? '') : st.price ?? '';
  }
  loadProduct(p0);
  Object.assign(st, {
    qty: it ? String(it.qty) : '1',
    price: it ? String(it.price) : st.price === '' || st.price == null ? '' : String(st.price),
    promo: it?.discount?.type || 'none', promoVal: it?.discount?.value != null ? String(it.discount.value) : '',
    checked: it ? !!it.checked : true,
  });
  const qtyN = () => parseQty(st.qty), priceN = () => parseMoney(st.price);
  const draft = () => ({ qty: qtyN() || 0, price: priceN() || 0, unit: st.unit, discount: { type: st.promo, value: parseQty(st.promoVal) || 0 } });

  function suggHtml() {
    const q = norm(st.name);
    const inPurchase = new Set(pu.items.map(i => i.productId));
    if (!q) {
      if (it) return '';
      const freq = freqMap();
      const top = S.products.filter(p => !inPurchase.has(p.id)).sort((a, b) => (freq.get(b.id) || 0) - (freq.get(a.id) || 0)).slice(0, 10);
      return top.length ? `<div class="label" style="margin-top:6px">Lo que comprás seguido</div><div class="freq">${top.map(p => `<button class="chip" type="button" data-act="pick" data-id="${p.id}">${cat(p.category).icon} ${esc(p.name)}</button>`).join('')}</div>` : '';
    }
    if (st.productId && norm(prod(st.productId)?.name) === q) return '';
    const m = S.products.filter(p => norm(p.name).includes(q) || norm(p.brand).includes(q)).slice(0, 5);
    return m.length ? `<div class="sugg">${m.map(p => {
      const lp = lastPrice(p);
      return `<button type="button" data-act="pick" data-id="${p.id}">${thumb(p)}<span class="t"><b>${esc(p.name)}</b><small>${esc([p.brand, p.size].filter(Boolean).join(' · ') || cat(p.category).name)}</small></span><b class="num">${lp ? fmt(lp.price) : ''}</b></button>`;
    }).join('')}</div>` : '';
  }
  function priceHint() {
    const p = st.productId && prod(st.productId);
    const lp = p && sortedPrices(p).filter(e => e.purchaseId !== pu.id).pop();
    if (!lp) return st.unit === 'kg' ? 'Precio por kilo' : 'Precio por unidad';
    const cur = priceN();
    return `Antes: <b>${fmt(lp.price)}</b>${lp.store ? ' en ' + esc(lp.store) : ''} (${fmtDate(lp.date)}) ${cur > 0 ? deltaHtml(cur, lp.price) : ''}`;
  }
  function updateLive() {
    const d = draft(), lt = lineTotal(d), full = round2(d.qty * d.price);
    const h = $('#priceHint'); if (h) h.innerHTML = priceHint();
    const lp = $('#linePreview');
    if (lp) lp.innerHTML = `<span>${d.qty > 0 && d.price > 0 ? esc(qtyLabel(d)) : 'Subtotal'}</span><span>${lt < full ? `<s class="muted" style="font-weight:500;margin-right:6px">${fmt(full)}</s>` : ''}<b>${fmt(lt)}</b></span>`;
  }
  const promoDef = () => PROMOS.find(x => x.id === st.promo) || PROMOS[0];

  return {
    st,
    onClose() { if (!saved) created.forEach(dropPhoto); },
    render() {
      const promos = st.unit === 'kg' ? PROMOS.filter(x => x.id === 'none' || x.id === 'pct') : PROMOS;
      if (!promos.some(x => x.id === st.promo)) st.promo = 'none';
      return {
        title: it ? 'Editar producto' : 'Agregar a la compra',
        body: `
        <div class="field"><label for="f-name">Producto</label>
          <div class="inline"><input class="grow big-input" id="f-name" data-f="name" value="${esc(st.name)}" placeholder="Ej: Leche entera" autocomplete="off" ${!it && !st.productId ? 'data-autofocus' : ''}>
          <button class="icon-btn" type="button" data-act="scan" aria-label="Escanear código de barras">${ICON.barcode}</button></div>
          <div id="sugg">${suggHtml()}</div></div>
        <div class="photos">
          ${st.photos.map((ph, i) => `<div class="photo-slot"><img data-photo="${esc(ph)}" alt="Foto ${i + 1}"><button class="x" type="button" data-act="rm-photo" data-i="${i}" aria-label="Quitar foto">✕</button></div>`).join('')}
          <button class="photo-add" type="button" data-act="photo" data-cam="1">${ICON.camera}Sacar foto</button>
          <button class="photo-add" type="button" data-act="photo">${ICON.image}Galería</button>
        </div>
        <div class="field"><label for="f-cat">Categoría</label>
          <select id="f-cat" data-f="category">${CATS.map(c => `<option value="${c.id}" ${st.category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}</select></div>
        <div class="field"><span class="label">Se vende</span><div class="seg">
          <button type="button" data-act="unit" data-v="u" aria-pressed="${st.unit === 'u'}">Por unidad</button>
          <button type="button" data-act="unit" data-v="kg" aria-pressed="${st.unit === 'kg'}">Por kilo</button></div></div>
        <div class="grid2">
          <div class="field"><label for="f-qty">${st.unit === 'kg' ? 'Kilos' : 'Cantidad'}</label>
            <div class="stepper"><button type="button" data-act="qty" data-d="-1" aria-label="Menos">−</button><input id="f-qty" data-f="qty" inputmode="decimal" value="${esc(st.qty)}"><button type="button" data-act="qty" data-d="1" aria-label="Más">+</button></div></div>
          <div class="field"><label for="f-price">Precio${st.unit === 'kg' ? ' x kg' : ''}</label>
            <div class="inline"><div class="affix grow"><span>$</span><input id="f-price" data-f="price" inputmode="decimal" placeholder="0" value="${esc(st.price)}"></div>
            <button class="icon-btn" type="button" data-act="ocr" aria-label="Leer el precio con la cámara">${ICON.camera}</button></div></div>
        </div>
        <p class="hint" id="priceHint" style="margin:-6px 2px 14px">${priceHint()}</p>
        <div class="field"><label for="f-promo">Promoción</label>
          <div class="inline"><select class="grow" id="f-promo" data-f="promo">${promos.map(x => `<option value="${x.id}" ${st.promo === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
          ${promoDef().pct ? `<div class="affix" style="width:110px"><input data-f="promoVal" inputmode="decimal" placeholder="${promoDef().def}" value="${esc(st.promoVal)}" style="padding-left:14px!important;padding-right:30px" aria-label="Porcentaje"><span style="left:auto;right:14px">%</span></div>` : ''}</div></div>
        <label class="switch-row">Ya está en el carrito <input type="checkbox" data-f="checked" ${st.checked ? 'checked' : ''}></label>
        <details class="more" ${st.brand || st.size || st.notes || st.barcode ? 'open' : ''}><summary>Detalles del producto</summary><div class="inner">
          <div class="grid2"><div class="field"><label for="f-brand">Marca</label><input id="f-brand" data-f="brand" value="${esc(st.brand)}" placeholder="Ej: La Serenísima"></div>
          <div class="field"><label for="f-size">Presentación</label><input id="f-size" data-f="size" value="${esc(st.size)}" placeholder="Ej: 1 L, 500 g"></div></div>
          <div class="field"><label for="f-bc">Código de barras</label><input id="f-bc" data-f="barcode" inputmode="numeric" value="${esc(st.barcode)}"></div>
          <div class="field"><label for="f-notes">Notas</label><textarea id="f-notes" data-f="notes" placeholder="Ej: la descremada de caja azul, sin TACC…">${esc(st.notes)}</textarea></div>
        </div></details>
        <div class="line-preview" id="linePreview"></div>`,
        foot: `${it ? '<button class="btn danger" type="button" data-act="delete">Borrar</button>' : ''}<button class="btn primary" type="button" data-act="save">${it ? 'Guardar' : 'Agregar'}</button>`,
      };
    },
    mounted() { updateLive(); },
    onField(f) {
      if (f === 'name') {
        if (!it && st.productId && norm(prod(st.productId)?.name) !== norm(st.name)) { st.productId = null; st.photos = []; }
        $('#sugg').innerHTML = suggHtml(); hydratePhotos($('#sugg'));
      }
      if (f === 'promo') { if (promoDef().pct && !st.promoVal) st.promoVal = String(promoDef().def); refreshSheet(); return; }
      updateLive();
    },
    acts: {
      pick(ds) { loadProduct(prod(ds.id)); refreshSheet(); $('#f-price')?.focus(); },
      unit(ds) {
        st.unit = ds.v;
        if (ds.v === 'u') st.qty = String(Math.max(1, Math.round(qtyN() || 1)));
        refreshSheet();
      },
      qty(ds) {
        const step = st.unit === 'kg' ? 0.1 : 1, min = st.unit === 'kg' ? 0.05 : 1;
        const v = Math.max(min, round2((qtyN() || 0) + step * +ds.d));
        st.qty = st.unit === 'kg' ? String(v).replace('.', ',') : String(v);
        $('#f-qty').value = st.qty;
        updateLive();
      },
      async photo(ds) {
        const id = await addPhoto(!!ds.cam);
        if (id) { created.push(id); st.photos.push(id); refreshSheet(); }
      },
      'rm-photo'(ds) { st.photos.splice(+ds.i, 1); refreshSheet(); },
      scan() {
        openSheet(scannerSheet(code => {
          st.barcode = code;
          const p = S.products.find(x => x.barcode && x.barcode === code);
          if (p) { loadProduct(p); toast('Encontré: ' + p.name); } else toast('Código guardado: ' + code);
          refreshSheet();
        }));
      },
      ocr() { openSheet(ocrSheet(v => { st.price = String(v).replace('.', ','); refreshSheet(); })); },
      delete() {
        const idx = pu.items.indexOf(it);
        pu.items.splice(idx, 1); syncPrices(pu); save();
        closeSheet(() => toast('Producto quitado', { label: 'Deshacer', fn: () => { pu.items.splice(idx, 0, it); syncPrices(pu); save(); render(); } }));
      },
      save() {
        const name = st.name.trim(), qty = qtyN(), price = priceN();
        if (!name) { toast('Escribí el nombre del producto'); $('#f-name')?.focus(); return; }
        if (!(qty > 0)) { toast('La cantidad tiene que ser mayor a 0'); return; }
        if (!(price >= 0) || st.price === '') { toast('Poné el precio'); $('#f-price')?.focus(); return; }
        let p = st.productId && prod(st.productId);
        if (!p) p = S.products.find(x => norm(x.name) === norm(name) && (!st.brand || norm(x.brand) === norm(st.brand)));
        if (!p) { p = { id: uid(), created: nowISO(), prices: [], photos: [] }; S.products.push(p); }
        const removed = (p.photos || []).filter(x => !st.photos.includes(x));
        removed.forEach(dropPhoto);
        Object.assign(p, { name, category: st.category, unit: st.unit, brand: st.brand.trim(), size: st.size.trim(), notes: st.notes.trim(), barcode: st.barcode.trim(), photos: [...st.photos] });
        const data = { productId: p.id, name, category: st.category, unit: st.unit, qty: Math.round(qty * 1000) / 1000, price: round2(price), discount: st.promo === 'none' ? null : { type: st.promo, value: parseQty(st.promoVal) || 0 }, checked: !!st.checked };
        if (it) Object.assign(it, data);
        else pu.items.push({ id: uid(), addedAt: nowISO(), ...data });
        syncPrices(pu);
        saved = true;
        save();
        closeSheet(() => toast(it ? 'Guardado' : `${name} · ${fmt(lineTotal(data))}`));
      },
    },
  };
}

/* ================= Hoja: escanear código de barras ================= */
function scannerSheet(cb) {
  let stream, timer, stopped = false;
  const st = { code: '' };
  const supported = 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
  const stop = () => { stopped = true; clearInterval(timer); stream?.getTracks().forEach(t => t.stop()); };
  return {
    st,
    onClose: stop,
    render: () => ({
      title: 'Escanear código',
      body: `${supported ? `<div class="scan-box"><video playsinline muted></video><div class="scan-line"></div></div><p class="muted center" id="scanMsg">Apuntá la cámara al código de barras</p>`
        : `<div class="note">Este navegador no puede leer códigos con la cámara (pasa en iPhone y en algunos celulares). Podés escribir los números que están abajo de las barras.</div>`}
        <div class="field"><label for="f-code">O escribilo a mano</label><input id="f-code" data-f="code" inputmode="numeric" placeholder="7790000000000" value="${esc(st.code)}"></div>`,
      foot: `<button class="btn primary" type="button" data-act="use">Usar este código</button>`,
    }),
    async mounted(body) {
      if (!supported || stream) return;
      try {
        let formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'];
        try { const ok = await BarcodeDetector.getSupportedFormats(); formats = formats.filter(f => ok.includes(f)); } catch {}
        const det = new BarcodeDetector({ formats });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) { stop(); return; }
        const v = $('video', body);
        v.srcObject = stream;
        await v.play();
        timer = setInterval(async () => {
          if (stopped || v.readyState < 2) return;
          try {
            const r = await det.detect(v);
            if (r.length && !stopped) { stop(); navigator.vibrate?.(60); closeSheet(() => cb(r[0].rawValue)); }
          } catch {}
        }, 280);
      } catch {
        const m = $('#scanMsg', body);
        if (m) m.textContent = 'No pude abrir la cámara. Revisá el permiso o escribí el código.';
      }
    },
    acts: {
      use() {
        const c = st.code.replace(/\s/g, '');
        if (!c) return toast('Escribí el código');
        stop(); closeSheet(() => cb(c));
      },
    },
  };
}

/* ================= Hoja: leer el precio con la cámara (OCR) ================= */
let tessPromise;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  if (!tessPromise) tessPromise = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    s.onload = res;
    s.onerror = () => { tessPromise = null; rej(new Error('load')); };
    document.head.appendChild(s);
  });
  return tessPromise;
}
function priceCandidates(text) {
  const out = new Map();
  const re = /\$?\s*(\d{1,3}(?:[.\s]\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[1].replace(/\s/g, '.');
    const v = parseMoney(raw);
    if (v >= 1 && v < 10000000) out.set(v, (out.get(v) || 0) + (m[0].includes('$') ? 10 : 1));
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]).slice(0, 8).map(e => e[0]);
}
function ocrSheet(cb) {
  const st = { phase: 'idle', progress: 0, img: null, cands: [], manual: '', error: '' };
  let alive = true;
  return {
    st,
    onClose() { alive = false; if (st.img) URL.revokeObjectURL(st.img); },
    render: () => ({
      title: 'Leer precio',
      body: `${st.img ? `<div class="scan-box"><img src="${st.img}" alt="Foto del precio"></div>` : `<p class="hint" style="margin-top:0">Sacale una foto de cerca al cartel del precio en la góndola. La app busca los números y vos elegís el correcto.</p>`}
        ${st.phase === 'work' ? `<div class="progress"><span style="width:${Math.round(st.progress * 100)}%"></span></div><p class="hint center">Leyendo números… (la primera vez descarga el lector, necesita internet)</p>` : ''}
        ${st.error ? `<div class="note bad">${esc(st.error)}</div>` : ''}
        ${st.phase === 'done' ? (st.cands.length ? `<div class="label">Tocá el precio correcto</div><div class="cands">${st.cands.map(v => `<button class="chip" type="button" data-act="use" data-v="${v}">${fmt(v)}</button>`).join('')}</div>` : `<div class="note">No encontré números claros. Probá otra foto más de cerca.</div>`) : ''}
        <button class="btn soft block" type="button" data-act="shoot" ${st.phase === 'work' ? 'disabled' : ''}>${ICON.camera}${st.img ? 'Sacar otra foto' : 'Sacar foto del precio'}</button>`,
    }),
    acts: {
      async shoot() {
        const f = await pickFile(true);
        if (!f || !alive) return;
        if (st.img) URL.revokeObjectURL(st.img);
        Object.assign(st, { img: URL.createObjectURL(f), phase: 'work', progress: 0, cands: [], error: '' });
        refreshSheet();
        try {
          const blob = await shrinkImage(f, 1600, 0.9);
          await loadTesseract();
          const res = await Tesseract.recognize(blob, 'eng', {
            logger: m => { if (m.status === 'recognizing text' && alive) { st.progress = m.progress; const b = $('.progress span'); if (b) b.style.width = Math.round(m.progress * 100) + '%'; } },
          });
          if (!alive) return;
          st.cands = priceCandidates(res.data.text || '');
          st.phase = 'done';
        } catch {
          st.phase = 'idle';
          st.error = 'No pude leer la foto. Revisá tu conexión a internet y probá de nuevo.';
        }
        if (alive && topSheet()?.st === st) refreshSheet();
      },
      use(ds) { closeSheet(() => cb(+ds.v)); },
    },
  };
}

/* ================= Hojas: catálogo ================= */
function productSheet(id) {
  return {
    render() {
      const p = prod(id);
      if (!p) return { title: 'Producto', body: '<div class="empty">Este producto ya no existe.</div>' };
      const prices = sortedPrices(p), lp = prices[prices.length - 1], pp = prevPrice(p);
      const sp = storePrices(p);
      let times = 0, spent = 0;
      for (const pu of donePurchases()) for (const it of pu.items) if (it.productId === p.id && it.checked) { times++; spent += lineTotal(it); }
      const per = p.unit === 'kg' ? '/kg' : '';
      return {
        title: p.name,
        body: `<div class="gallery">${p.photos?.length ? p.photos.map((ph, i) => `<img data-photo="${esc(ph)}" alt="Foto ${i + 1} de ${esc(p.name)}">`).join('') : `<div class="ph">${cat(p.category).icon}</div>`}</div>
        <div class="pd-head"><span class="pill">${cat(p.category).icon} ${cat(p.category).name}</span><h3>${esc(p.name)}</h3>
          ${p.brand || p.size || p.barcode || p.notes ? `<dl class="kv">${p.brand ? `<dt>Marca</dt><dd>${esc(p.brand)}</dd>` : ''}${p.size ? `<dt>Presentación</dt><dd>${esc(p.size)}</dd>` : ''}${p.barcode ? `<dt>Código</dt><dd class="num">${esc(p.barcode)}</dd>` : ''}${p.notes ? `<dt>Notas</dt><dd>${esc(p.notes)}</dd>` : ''}</dl>` : ''}</div>
        <div class="stats" style="margin-top:16px">
          <div class="stat"><small>Último precio</small><b>${lp ? fmt(lp.price) + per : '—'}</b><span>${lp ? esc([lp.store, fmtDate(lp.date)].filter(Boolean).join(' · ')) : 'Sin precio'}</span></div>
          <div class="stat"><small>Precio anterior</small><b>${pp ? fmt(pp.price) + per : '—'}</b><span>${pp ? deltaHtml(lp.price, pp.price) + ' ' + fmtDate(pp.date) : 'Sin cambios'}</span></div>
          <div class="stat"><small>Veces comprado</small><b>${times}</b></div>
          <div class="stat"><small>Gastaste en total</small><b>${fmt(spent)}</b></div>
        </div>
        ${prices.length >= 2 ? `<h3 class="section-title">Cómo fue cambiando</h3><div class="card">${lineChart(prices)}</div>` : ''}
        ${sp.length >= 2 ? `<h3 class="section-title">Dónde está más barato <small>último precio en cada súper</small></h3>
          <ul class="list">${sp.map((e, i) => `<li class="row"><span class="row-text"><b>${esc(e.store)}${i === 0 ? '<span class="badge ok">más barato</span>' : ''}</b><small>${fmtDate(e.date)}</small></span><span class="row-end"><b>${fmt(e.price)}${per}</b>${i > 0 ? `<span class="delta up">+${fmt(e.price - sp[0].price)}</span>` : ''}</span></li>`).join('')}</ul>` : ''}
        <h3 class="section-title">Historial de precios <small>${prices.length}</small></h3>
        ${prices.length ? `<ul class="list">${[...prices].reverse().map((e, i, arr) => {
          const prev = arr[i + 1];
          return `<li class="row"><span class="row-text"><b class="num">${fmt(e.price)}${per} ${prev ? deltaHtml(e.price, prev.price) : ''}</b><small>${fmtDate(e.date)}${e.store ? ' · ' + esc(e.store) : ''}${e.purchaseId ? '' : ' · cargado a mano'}</small></span>
            ${e.purchaseId ? '' : `<button class="icon-btn flat" type="button" data-act="rm-price" data-id="${e.id}" aria-label="Borrar este precio">✕</button>`}</li>`;
        }).join('')}</ul>` : '<p class="hint">Todavía no tiene precios.</p>'}`,
        foot: `<button class="btn ghost" type="button" data-act="edit">Editar</button><button class="btn soft" type="button" data-act="price">Nuevo precio</button>${openPurchase() ? '<button class="btn primary" type="button" data-act="add">Agregar</button>' : ''}`,
      };
    },
    acts: {
      edit() { openSheet(productEditSheet(id)); },
      price() { openSheet(manualPriceSheet(id)); },
      add() { closeAllSheets(() => { ui.tab = 'compra'; render(); openSheet(quickAddSheet(id)); }); },
      'rm-price'(ds) {
        const p = prod(id);
        if (!confirm('¿Borrar este precio del historial?')) return;
        p.prices = p.prices.filter(e => e.id !== ds.id); save(); refreshSheet();
      },
    },
  };
}
function quickAddSheet(id) {
  const pu = openPurchase();
  const existing = pu.items.find(i => i.productId === id);
  return existing ? itemSheet(existing.id) : itemSheet(null, { productId: id });
}

function manualPriceSheet(id) {
  const p = prod(id), lp = lastPrice(p);
  const st = { price: '', store: lp?.store || openPurchase()?.store || '', date: toDateInput(nowISO()) };
  return {
    st,
    render: () => ({
      title: 'Nuevo precio',
      body: `<p class="hint" style="margin-top:0">Si viste que <b>${esc(p.name)}</b> cambió de precio, cargalo acá. El anterior queda en el historial.</p>
        <div class="field"><label for="f-p">Precio${p.unit === 'kg' ? ' por kilo' : ''}</label><div class="affix"><span>$</span><input class="big-input" id="f-p" data-f="price" inputmode="decimal" placeholder="${lp ? esc(String(lp.price)) : '0'}" data-autofocus></div>
          ${lp ? `<small>Antes: ${fmt(lp.price)}${lp.store ? ' en ' + esc(lp.store) : ''}</small>` : ''}</div>
        <div class="grid2"><div class="field"><label for="f-s">Súper</label><input id="f-s" data-f="store" list="storeList" value="${esc(st.store)}">${storeOptions()}</div>
        <div class="field"><label for="f-d">Fecha</label><input id="f-d" type="date" data-f="date" value="${st.date}"></div></div>`,
      foot: `<button class="btn primary" type="button" data-act="ok">Guardar precio</button>`,
    }),
    acts: {
      ok() {
        const v = parseMoney(st.price);
        if (!(v >= 0) || st.price === '') return toast('Poné el precio');
        const d = st.date ? fromDateInput(st.date) : nowISO();
        p.prices.push({ id: uid(), date: st.date === toDateInput(nowISO()) ? nowISO() : d, price: round2(v), store: st.store.trim(), purchaseId: null });
        save(); closeSheet(() => toast('Precio actualizado'));
      },
    },
  };
}

function productEditSheet(id) {
  const p = id ? prod(id) : null;
  const st = {
    name: p?.name || '', category: p?.category || (ui.catCat !== 'all' ? ui.catCat : 'almacen'), unit: p?.unit || 'u',
    brand: p?.brand || '', size: p?.size || '', barcode: p?.barcode || '', notes: p?.notes || '', photos: [...(p?.photos || [])],
    price: '', store: '',
  };
  const created = [];
  let saved = false;
  return {
    st,
    onClose() { if (!saved) created.forEach(dropPhoto); },
    render: () => ({
      title: p ? 'Editar producto' : 'Nuevo producto',
      body: `<div class="field"><label for="f-name">Nombre</label>
          <div class="inline"><input class="grow big-input" id="f-name" data-f="name" value="${esc(st.name)}" placeholder="Ej: Yerba mate" ${p ? '' : 'data-autofocus'}>
          <button class="icon-btn" type="button" data-act="scan" aria-label="Escanear código">${ICON.barcode}</button></div></div>
        <div class="photos">
          ${st.photos.map((ph, i) => `<div class="photo-slot"><img data-photo="${esc(ph)}" alt="Foto ${i + 1}"><button class="x" type="button" data-act="rm-photo" data-i="${i}" aria-label="Quitar foto">✕</button></div>`).join('')}
          <button class="photo-add" type="button" data-act="photo" data-cam="1">${ICON.camera}Sacar foto</button>
          <button class="photo-add" type="button" data-act="photo">${ICON.image}Galería</button></div>
        <div class="field"><label for="f-cat">Categoría</label><select id="f-cat" data-f="category">${CATS.map(c => `<option value="${c.id}" ${st.category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}</select></div>
        <div class="field"><span class="label">Se vende</span><div class="seg">
          <button type="button" data-act="unit" data-v="u" aria-pressed="${st.unit === 'u'}">Por unidad</button>
          <button type="button" data-act="unit" data-v="kg" aria-pressed="${st.unit === 'kg'}">Por kilo</button></div></div>
        <div class="grid2"><div class="field"><label for="f-brand">Marca</label><input id="f-brand" data-f="brand" value="${esc(st.brand)}"></div>
          <div class="field"><label for="f-size">Presentación</label><input id="f-size" data-f="size" value="${esc(st.size)}" placeholder="1 kg, 500 ml"></div></div>
        <div class="field"><label for="f-bc">Código de barras</label><input id="f-bc" data-f="barcode" inputmode="numeric" value="${esc(st.barcode)}"></div>
        <div class="field"><label for="f-notes">Notas y detalles</label><textarea id="f-notes" data-f="notes">${esc(st.notes)}</textarea></div>
        ${p ? '' : `<div class="grid2"><div class="field"><label for="f-p">Precio (opcional)</label><div class="affix"><span>$</span><input id="f-p" data-f="price" inputmode="decimal" value="${esc(st.price)}"></div></div>
          <div class="field"><label for="f-s">Súper</label><input id="f-s" data-f="store" list="storeList" value="${esc(st.store)}">${storeOptions()}</div></div>`}`,
      foot: `${p ? '<button class="btn danger" type="button" data-act="del">Borrar</button>' : ''}<button class="btn primary" type="button" data-act="ok">Guardar</button>`,
    }),
    acts: {
      unit(ds) { st.unit = ds.v; refreshSheet(); },
      async photo(ds) { const ph = await addPhoto(!!ds.cam); if (ph) { created.push(ph); st.photos.push(ph); refreshSheet(); } },
      'rm-photo'(ds) { st.photos.splice(+ds.i, 1); refreshSheet(); },
      scan() { openSheet(scannerSheet(code => { st.barcode = code; refreshSheet(); })); },
      ok() {
        const name = st.name.trim();
        if (!name) return toast('Escribí el nombre');
        const target = p || { id: uid(), created: nowISO(), prices: [], photos: [] };
        (target.photos || []).filter(x => !st.photos.includes(x)).forEach(dropPhoto);
        Object.assign(target, { name, category: st.category, unit: st.unit, brand: st.brand.trim(), size: st.size.trim(), barcode: st.barcode.trim(), notes: st.notes.trim(), photos: [...st.photos] });
        if (!p) {
          const v = parseMoney(st.price);
          if (v >= 0 && st.price !== '') target.prices.push({ id: uid(), date: nowISO(), price: round2(v), store: st.store.trim(), purchaseId: null });
          S.products.push(target);
        }
        saved = true; save();
        closeSheet(() => { render(); toast('Producto guardado'); });
      },
      del() {
        if (!confirm(`¿Borrar "${p.name}" del catálogo? Las compras viejas lo siguen mostrando, pero se pierde su historial de precios y sus fotos.`)) return;
        (p.photos || []).forEach(dropPhoto);
        S.products = S.products.filter(x => x !== p);
        saved = true; save();
        closeAllSheets(() => toast('Producto borrado'));
      },
    },
  };
}

/* ================= Hojas: gastos ================= */
function purchaseSheet(id) {
  const st = { ticket: '' };
  return {
    st,
    render() {
      const pu = S.purchases.find(p => p.id === id);
      if (!pu) return { title: 'Compra', body: '<div class="empty">Esta compra ya no existe.</div>' };
      st.ticket = pu.ticketTotal > 0 ? String(pu.ticketTotal) : st.ticket;
      const t = totals(pu), d = pu.discount;
      return {
        title: pu.store || 'Compra',
        body: `<p class="hint" style="margin-top:0">${fmtDay(whenOf(pu))} · ${fmtTime(whenOf(pu))} · <button class="link" type="button" data-act="meta">Editar súper / fecha</button></p>
        ${groupItems(pu.items).map(g => `<section class="group"><div class="group-head"><span>${cat(g.cat).icon} ${cat(g.cat).name}</span><span class="money">${fmt(g.subtotal)}</span></div>
          <ul class="list">${g.items.map(it => { const info = itemInfo(it); return `<li class="row"><button class="row-main" type="button" ${info.p ? `data-act="product" data-id="${info.p.id}"` : ''}>${thumb(info.p, info.category)}
            <span class="row-text"><b>${esc(info.name)}</b><small>${esc(qtyLabel(it))}${promoLabel(it.discount) ? `<span class="badge">${esc(promoLabel(it.discount))}</span>` : ''}</small></span><span class="row-end"><b>${fmt(lineTotal(it))}</b></span></button></li>`; }).join('')}</ul></section>`).join('')}
        <div class="card totals">
          <div><span>Precio de lista</span><span class="num">${fmt(t.list)}</span></div>
          ${t.promo > 0 ? `<div class="save"><span>Promociones</span><span class="num">−${fmt(t.promo)}</span></div>` : ''}
          ${t.bank > 0 ? `<div class="save"><span>${esc(d.label || 'Descuento')} ${PCT.format(d.pct)}%</span><span class="num">−${fmt(t.bank)}</span></div>` : ''}
          <div class="grand"><span>Total</span><span class="num">${fmt(t.total)}</span></div></div>
        <div class="field"><label for="f-t">Total del ticket</label><div class="affix"><span>$</span><input id="f-t" data-f="ticket" inputmode="decimal" placeholder="Para comparar" value="${esc(st.ticket)}"></div>
          <small id="ticketDiff">${ticketDiffHtml(parseMoney(st.ticket), t.total) || 'Cargalo para ver si te cobraron bien.'}</small></div>`,
        foot: `<button class="btn danger" type="button" data-act="del">Borrar</button><button class="btn ghost" type="button" data-act="reopen">Reabrir</button><button class="btn primary" type="button" data-act="repeat">Repetir</button>`,
      };
    },
    onField(f) {
      const pu = S.purchases.find(p => p.id === id);
      if (f !== 'ticket' || !pu) return;
      const v = parseMoney(st.ticket);
      pu.ticketTotal = v > 0 ? v : 0; save();
      $('#ticketDiff').innerHTML = ticketDiffHtml(v, totals(pu).total) || 'Cargalo para ver si te cobraron bien.';
    },
    acts: {
      product(ds) { openSheet(productSheet(ds.id)); },
      meta() { openSheet(purchaseMetaSheet(id)); },
      repeat() { repeatPurchase(id); },
      reopen() {
        const pu = S.purchases.find(p => p.id === id);
        if (openPurchase()) return toast('Ya tenés una compra en curso. Finalizala primero.');
        pu.status = 'open'; delete pu.finishedAt; save();
        closeAllSheets(() => { ui.tab = 'compra'; render(); toast('Compra reabierta'); });
      },
      del() {
        if (!confirm('¿Borrar esta compra? También se borran sus precios del historial.')) return;
        S.purchases = S.purchases.filter(p => p.id !== id);
        for (const p of S.products) p.prices = (p.prices || []).filter(e => e.purchaseId !== id);
        save(); closeSheet(() => { render(); toast('Compra borrada'); });
      },
    },
  };
}
function purchaseMetaSheet(id) {
  const pu = S.purchases.find(p => p.id === id);
  const st = { store: pu.store || '', date: toDateInput(whenOf(pu)) };
  return {
    st,
    render: () => ({
      title: 'Editar compra',
      body: `<div class="field"><label for="f-s">Súper</label><input id="f-s" data-f="store" list="storeList" value="${esc(st.store)}">${storeOptions()}</div>
        <div class="field"><label for="f-d">Fecha</label><input id="f-d" type="date" data-f="date" value="${st.date}"></div>`,
      foot: `<button class="btn primary" type="button" data-act="ok">Guardar</button>`,
    }),
    acts: {
      ok() {
        pu.store = st.store.trim();
        if (st.date && st.date !== toDateInput(whenOf(pu))) { pu.finishedAt = fromDateInput(st.date); pu.date = pu.finishedAt; }
        syncPrices(pu);
        for (const p of S.products) for (const e of p.prices || []) if (e.purchaseId === pu.id) e.date = whenOf(pu);
        ui.month = monthKey(whenOf(pu));
        save(); closeSheet(() => render());
      },
    },
  };
}
function repeatPurchase(id) {
  const src = S.purchases.find(p => p.id === id);
  const items = src.items.map(it => {
    const p = prod(it.productId);
    return { ...it, id: uid(), addedAt: nowISO(), price: p ? lastPrice(p)?.price ?? it.price : it.price, checked: false };
  });
  const pu = openPurchase();
  if (pu) {
    const have = new Set(pu.items.map(i => i.productId));
    const add = items.filter(i => !have.has(i.productId));
    pu.items.push(...add); save();
    closeAllSheets(() => { ui.tab = 'compra'; render(); toast(`Agregué ${add.length} productos para buscar`); });
  } else {
    closeAllSheets(() => openSheet(startSheet({ store: src.store, items })));
  }
}

function breakdownSheet(k) {
  return {
    render() {
      const st = monthStats(k), prevTot = monthTotal(shiftMonth(k, -1));
      const per = r => r.unit === 'kg' ? `${NUM.format(round2(r.qty))} kg` : `${NUM.format(r.qty)} u.`;
      return {
        title: 'Desglose · ' + monthLabel(k),
        body: `<div class="stats">
          <div class="stat wide"><small>Total del mes</small><b>${fmt(st.total)}</b><span>${st.ps.length} ${st.ps.length === 1 ? 'compra' : 'compras'} · ${st.items} ${st.items === 1 ? 'renglón' : 'renglones'}${prevTot > 0 ? ' · mes anterior ' + fmt(prevTot) : ''}</span></div>
          <div class="stat"><small>Ticket promedio</small><b>${fmt(st.ps.length ? st.total / st.ps.length : 0)}</b></div>
          <div class="stat"><small>Ahorro</small><b style="color:var(--accent)">${fmt(st.savings)}</b></div></div>
        <h3 class="section-title">Por categoría <small>tocá para ver el detalle</small></h3>
        <div class="card breakdown">${st.cats.map(c => {
          const p = st.total > 0 ? c.amount / st.total * 100 : 0;
          return `<details><summary><div class="hbar"><span>${cat(c.id).icon} ${cat(c.id).name}</span><span class="v">${fmt(Math.round(c.amount))} <small>${PCT.format(p)}%</small></span><div class="track"><span style="width:${p.toFixed(1)}%"></span></div></div></summary>
            <div class="sub">${[...c.prods.values()].sort((a, b) => b.amount - a.amount).map(r => `<div class="sub-row"><span>${esc(r.name)} <small>· ${per(r)}</small></span><span class="num">${fmt(Math.round(r.amount))}</span></div>`).join('')}</div></details>`;
        }).join('')}</div>
        ${st.stores.length ? `<h3 class="section-title">Por súper</h3><div class="card">${hbars(st.stores.map(s => ({ label: `${esc(s.name)} <small class="muted">· ${s.count} ${s.count === 1 ? 'compra' : 'compras'}</small>`, amount: s.amount })), st.total)}</div>` : ''}
        <h3 class="section-title">Todos los productos <small>${st.prods.length}</small></h3>
        <ul class="list">${st.prods.map(r => `<li class="row"><button class="row-main" type="button" ${r.id && prod(r.id) ? `data-act="product" data-id="${r.id}"` : ''}>${thumb(prod(r.id), r.category)}
          <span class="row-text"><b>${esc(r.name)}</b><small>${per(r)} · ${r.times} ${r.times === 1 ? 'vez' : 'veces'}${r.maxP > r.minP ? ` · de ${fmt(r.minP)} a ${fmt(r.maxP)}` : ` · ${fmt(r.minP)}`}</small></span>
          <span class="row-end"><b>${fmt(Math.round(r.amount))}</b></span></button></li>`).join('')}</ul>
        <h3 class="section-title">Compras</h3>
        <ul class="list">${st.ps.map(purchaseRow).join('')}</ul>`,
        foot: `<button class="btn soft" type="button" data-act="share">${ICON.share}Compartir resumen</button>`,
      };
    },
    acts: {
      product(ds) { openSheet(productSheet(ds.id)); },
      purchase(ds) { openSheet(purchaseSheet(ds.id)); },
      share() {
        const st = monthStats(k);
        const lines = [`🧾 Gastos de ${monthLabel(k)}`, `Total: ${fmt(st.total)} en ${st.ps.length} compras`, st.savings > 0 ? `Ahorro: ${fmt(st.savings)}` : '', '',
          ...st.cats.map(c => `${cat(c.id).icon} ${cat(c.id).name}: ${fmt(Math.round(c.amount))}`), '', ...st.stores.map(s => `📍 ${s.name}: ${fmt(s.amount)}`)];
        shareText(lines.filter((l, i, a) => l || a[i - 1]).join('\n'));
      },
    },
  };
}

/* ================= Compartir ================= */
async function shareText(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}
function shareList() {
  const pu = openPurchase(), t = totals(pu);
  const lines = [`🛒 Compra${pu.store ? ' en ' + pu.store : ''} · ${fmtDate(pu.date)}`];
  for (const g of groupItems(pu.items)) {
    lines.push('', `${cat(g.cat).icon} ${cat(g.cat).name}`);
    for (const it of g.items) lines.push(`${it.checked ? '✅' : '⬜'} ${itemInfo(it).name} — ${qtyLabel(it)} = ${fmt(lineTotal(it))}`);
  }
  lines.push('', `Total: ${fmt(t.total)}`);
  if (t.pending > 0) lines.push(`Falta agarrar: ${fmt(t.pending)}`);
  shareText(lines.join('\n'));
}

/* ================= Datos: exportar / importar / borrar ================= */
const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
async function exportData() {
  toast('Preparando copia…');
  const photos = {};
  try { for (const [k, b] of await idbEntries('photos')) photos[k] = await blobToDataURL(b); } catch {}
  const blob = new Blob([JSON.stringify({ app: 'ir-al-super', version: 1, exported: nowISO(), state: S, photos })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ir-al-super-${toDateInput(nowISO())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Copia descargada');
}
async function importData() {
  const f = await pickFile(false, 'application/json,.json');
  if (!f) return;
  let data;
  try { data = JSON.parse(await f.text()); } catch { return toast('El archivo no es válido'); }
  if (data?.app !== 'ir-al-super' || !data.state) return toast('Ese archivo no es una copia de Ir al Super');
  if (!confirm(`¿Reemplazar todo por la copia del ${fmtDate(data.exported)}? Lo que tenés ahora se pierde.`)) return;
  try {
    await idbClear('photos');
    photoCache.forEach(u => URL.revokeObjectURL(u)); photoCache.clear();
    for (const [k, d] of Object.entries(data.photos || {})) await idbPut('photos', k, await (await fetch(d)).blob());
  } catch {}
  S = Object.assign(freshState(), data.state);
  await flush(); applyTheme(); render(); toast('Copia recuperada');
}
async function wipe() {
  if (!confirm('¿Borrar TODO? Productos, compras, precios y fotos. No se puede deshacer.')) return;
  if (!confirm('¿Seguro? Si no hiciste una copia, se pierde todo.')) return;
  S = freshState();
  try { await idbClear('photos'); } catch {}
  photoCache.clear();
  await flush(); applyTheme(); render(); toast('Listo, quedó vacía');
}

/* ================= Tema ================= */
function applyTheme() {
  const t = S.settings.theme;
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
}

/* ================= Acciones (botones con data-act) ================= */
function scanGlobal() {
  openSheet(scannerSheet(code => {
    const p = S.products.find(x => x.barcode && x.barcode === code);
    if (ui.tab === 'compra' && openPurchase()) openSheet(p ? quickAddSheet(p.id) : itemSheet(null, { barcode: code }));
    else if (p) openSheet(productSheet(p.id));
    else { const s = productEditSheet(null); s.st.barcode = code; openSheet(s); toast('Producto nuevo: completá los datos'); }
  }));
}
const ACT = {
  tab(ds) { ui.tab = ds.tab; if (ds.tab === 'meses' && !ui.month) ui.month = monthKey(nowISO()); render(); window.scrollTo(0, 0); },
  fab() { if (ui.tab === 'compra') openSheet(itemSheet()); else if (ui.tab === 'productos') openSheet(productEditSheet(null)); },
  start() { openSheet(startSheet()); },
  repeat(ds) { repeatPurchase(ds.id); },
  'edit-open'() { openSheet(editOpenSheet()); },
  bank() { openSheet(bankSheet()); },
  finish() { openSheet(finishSheet()); },
  'share-list'() { shareList(); },
  ccat(ds) { ui.compraCat = ds.c; render(); },
  pcat(ds) { ui.catCat = ds.c; render(); },
  toggle(ds) {
    const pu = openPurchase(), it = pu.items.find(i => i.id === ds.id);
    it.checked = !it.checked; syncPrices(pu); save(); render();
    if (it.checked) navigator.vibrate?.(20);
  },
  'edit-item'(ds) { openSheet(itemSheet(ds.id)); },
  'quick-add'(ds) { openSheet(quickAddSheet(ds.id)); },
  product(ds) { openSheet(productSheet(ds.id)); },
  purchase(ds) { openSheet(purchaseSheet(ds.id)); },
  'scan-global'() { scanGlobal(); },
  'month-shift'(ds) { const n = shiftMonth(ui.month, +ds.d); if (n <= monthKey(nowISO())) { ui.month = n; render(); } },
  month(ds) { ui.month = ds.k; render(); },
  breakdown(ds) { openSheet(breakdownSheet(ds.k)); },
  theme(ds) { S.settings.theme = ds.v; save(); applyTheme(); render(); },
  export() { exportData(); },
  import() { importData(); },
  wipe() { wipe(); },
  'sheet-close'() { closeSheet(); },
  'sheet-close-all'() { closeAllSheets(); },
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  const def = topSheet();
  if (def?.acts?.[act] && b.closest('#sheetWrap')) { e.preventDefault(); def.acts[act](b.dataset, b, e); return; }
  if (ACT[act]) { e.preventDefault(); ACT[act](b.dataset, b, e); }
});

// Campos de la vista principal
$('#view').addEventListener('input', e => {
  if (e.target.id === 'catSearch') { ui.catQ = e.target.value; $('#catList').innerHTML = catalogList(); hydratePhotos($('#catList')); }
});
$('#view').addEventListener('change', e => {
  if (e.target.id === 'catSort') { ui.catSort = e.target.value; $('#catList').innerHTML = catalogList(); hydratePhotos($('#catList')); }
  if (e.target.id === 'monthBudget') { const v = parseMoney(e.target.value); S.settings.monthBudget = v > 0 ? v : 0; save(); toast(v > 0 ? 'Presupuesto: ' + fmt(v) : 'Sin presupuesto mensual'); }
});
// Enter en un campo de la hoja = botón principal
$('#sheetBody').addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || e.target.id === 'f-name' && $('#sugg .sugg')) return;
  const main = $('#sheetFoot .btn.primary');
  if (main && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.blur(); main.click(); }
});

/* ================= Inicio ================= */
(async function init() {
  history.replaceState({ sheet: 0 }, '');
  await load();
  applyTheme();
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();

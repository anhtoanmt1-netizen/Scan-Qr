const V = 'spx-scan-v6';
const SHELL = ['./', 'index.html', 'manifest.json', 'data.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
const EXTRA = [
  'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(async c => {
    await c.addAll(SHELL);
    await Promise.all(EXTRA.map(u => c.add(u).catch(() => {})));
  }));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const own = url.origin === location.origin;
  if (!own && !['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return; // Google Sheet luôn lấy bản mới
  const fresh = own && (url.pathname.endsWith('data.json') || url.pathname.endsWith('index.html') || url.pathname.endsWith('/'));
  const put = r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; };
  if (fresh) { // ưu tiên mạng, mất mạng thì dùng cache
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request, { ignoreSearch: true })));
  } else {     // ưu tiên cache (thư viện, font, icon)
    e.respondWith(caches.match(e.request, { ignoreSearch: own }).then(m => m || fetch(e.request).then(put)));
  }
});

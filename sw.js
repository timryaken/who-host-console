// 離線快取（版本 mv63ae78）：頁面先上網拿新版、拿不到就用存著的；加密大檔由密碼頁自己存在 'who-host-payload'
const SHELL = 'who-host-shell-mv63ae78', KEEP = [SHELL, 'who-host-payload'];
const FILES = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('who-host-') && !KEEP.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      try {
        const r = await Promise.race([fetch(req, { cache: 'no-store' }), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 5000))]);
        if (r.ok) c.put('./', r.clone());
        return r;
      } catch (_) { return (await c.match('./')) || Response.error(); }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

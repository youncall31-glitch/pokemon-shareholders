// 포켓몬 주주 총회 — 인터넷이 잠깐 끊겨도 열리게 이 사이트 파일만 저장해 둬요.
// 게임 파일은 언제나 인터넷에서 먼저 새로 받아요 (그래서 고친 게임이 바로 보여요).
// 움직이는 포켓몬 그림(sprites/)은 한 번 받으면 폰에 저장해 두고 다시 받지 않아요.
const CACHE = 'pokemon-shareholders-3.4';
const SPRITES = 'pokemon-shareholders-sprites-1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== SPRITES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/sprites/') >= 0) {
    e.respondWith(
      caches.open(SPRITES).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      }))),
    );
    return;
  }
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
});

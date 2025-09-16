const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
  '/sanae-abe/taskflow/',
  '/sanae-abe/taskflow/static/js/bundle.js',
  '/sanae-abe/taskflow/static/css/main.css',
  '/sanae-abe/taskflow/manifest.json',
  '/sanae-abe/taskflow/favicon.ico',
  '/sanae-abe/taskflow/logo192.svg',
  '/sanae-abe/taskflow/logo512.svg'
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker のアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }

        // ネットワークからフェッチを試行
        return fetch(event.request).then((response) => {
          // レスポンスが正常でない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // ネットワークが利用できない場合、キャッシュから返す
          return caches.match('/sanae-abe/taskflow/');
        });
      }
    )
  );
});

// オフライン状態の通知
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
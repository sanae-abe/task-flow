const CACHE_NAME = 'taskflow-v2.0.0';
const STATIC_CACHE_NAME = 'taskflow-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'taskflow-dynamic-v2.0.0';

// Critical resources for immediate caching
const urlsToCache = [
  './index.html',
  './static/css/main.css',
  './static/js/main.js',
  './manifest.json',
  './favicon.ico',
  './logo192.svg',
  './logo512.svg'
];

// Static assets patterns
const STATIC_ASSETS = /\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/;
const API_CACHE_DURATION = 5 * 60 * 1000; // 5分

// Service Worker のインストール
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Service Worker のアクティベート
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  const expectedCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // HTML requests - Network First with Cache Fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache First
  if (STATIC_ASSETS.test(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // API requests - Network First with short cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimestamp(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(request));
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache in background if needed
    updateCacheInBackground(request, cache);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed for', request.url);
    throw error;
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for', request.url);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Fallback to offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('./index.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

// Network First with Timestamp for API
async function networkFirstWithTimestamp(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cached = await cache.match(request);

  // Check if cached response is still fresh
  if (cached) {
    const cachedDate = cached.headers.get('sw-cached-date');
    if (cachedDate && (Date.now() - parseInt(cachedDate)) < API_CACHE_DURATION) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseWithTimestamp = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'sw-cached-date': Date.now().toString()
        }
      });
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// メッセージハンドラー
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
    return;
  }

  if (event.data && event.data.type === 'CACHE_NEW_ROUTE') {
    cacheNewRoute(event.data.url);
    return;
  }
});

// 新しいルートのキャッシュ
async function cacheNewRoute(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.add(url);
    console.log('[SW] Cached new route:', url);
  } catch (error) {
    console.log('[SW] Failed to cache new route:', url, error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Performing background sync');
  // ここでオフライン時のアクションを処理
  // 例: ローカルストレージの変更をサーバーに同期
}

// Performance optimization - Cache cleanup
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (!cacheName.includes('v2.0.0')) {
        caches.delete(cacheName);
      }
    });
  });
}, 24 * 60 * 60 * 1000); // 24時間ごと
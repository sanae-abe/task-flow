/* eslint-disable no-restricted-globals */
/**
 * TaskFlow Service Worker
 * Progressive Web App機能を提供
 * - オフラインキャッシング
 * - バックグラウンド同期
 * - プッシュ通知基盤
 */

const CACHE_VERSION = 'v1.1.0'; // Performance optimizations
const CACHE_NAME = `taskflow-${CACHE_VERSION}`;
const RUNTIME_CACHE = `taskflow-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `taskflow-images-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// キャッシュの有効期限設定
const CACHE_EXPIRATION = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30日
  RUNTIME: 7 * 24 * 60 * 60 * 1000, // 7日
  IMAGE: 14 * 24 * 60 * 60 * 1000, // 14日
};

// キャッシュサイズ制限
const CACHE_SIZE_LIMITS = {
  RUNTIME: 50, // 50エントリー
  IMAGE: 30, // 30画像
};

// キャッシュ対象のリソース
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/favicon.svg',
  '/logo192.svg',
  '/logo512.svg',
  '/manifest.json',
];

// キャッシュ戦略の設定
const CACHE_STRATEGIES = {
  // 静的アセット: Cache First (高速読み込み)
  STATIC: ['/', '/index.html', '/manifest.json', '/favicon.ico'],
  // APIやデータ: Network First (最新データ優先)
  DYNAMIC: ['/api/'],
  // 画像やフォント: Cache First with Network Fallback
  ASSETS: ['.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'],
};

// Service Workerのインストール
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        // 新しいService Workerを即座にアクティベート
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Service Workerのアクティベーション
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // 古いキャッシュを削除
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return (
                cacheName.startsWith('taskflow-') &&
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== IMAGE_CACHE
              );
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        // すべてのクライアントを即座に制御下に置く
        return self.clients.claim();
      })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome拡張機能のリクエストは無視
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // GETリクエストのみキャッシュ
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    handleFetchRequest(request)
      .catch(() => {
        // オフライン時のフォールバック
        return caches.match(OFFLINE_URL);
      })
  );
});

/**
 * フェッチリクエストを処理
 * キャッシュ戦略に基づいてレスポンスを返す
 */
async function handleFetchRequest(request) {
  const url = new URL(request.url);

  // 静的リソース: Cache First
  if (isStaticResource(url.pathname)) {
    return cacheFirst(request, CACHE_NAME);
  }

  // 画像: Cache First with expiration
  if (isImageResource(url.pathname)) {
    return cacheFirstWithExpiration(request, IMAGE_CACHE, CACHE_EXPIRATION.IMAGE);
  }

  // アセット（フォント等）: Cache First
  if (isAssetResource(url.pathname)) {
    return cacheFirst(request, CACHE_NAME);
  }

  // JSバンドル: Stale While Revalidate
  if (url.pathname.includes('/assets/js/')) {
    return staleWhileRevalidate(request, RUNTIME_CACHE);
  }

  // 動的コンテンツ: Network First
  return networkFirst(request, RUNTIME_CACHE);
}

/**
 * Cache First戦略
 * キャッシュを優先し、なければネットワークから取得
 */
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // 成功したレスポンスをキャッシュ
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    throw error;
  }
}

/**
 * Cache First with Expiration戦略
 * キャッシュを優先し、期限切れなら再取得
 */
async function cacheFirstWithExpiration(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedDate = cachedResponse.headers.get('sw-cached-date');
    if (cachedDate) {
      const age = Date.now() - parseInt(cachedDate, 10);
      if (age < maxAge) {
        return cachedResponse;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());

      const blob = await responseToCache.blob();
      const newResponse = new Response(blob, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, newResponse);
      await trimCache(cacheName, CACHE_SIZE_LIMITS.IMAGE);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Network First戦略
 * ネットワークを優先し、失敗したらキャッシュを使用
 */
async function networkFirst(request, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    // 成功したレスポンスをキャッシュ
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      await trimCache(cacheName, CACHE_SIZE_LIMITS.RUNTIME);
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate戦略
 * キャッシュを即座に返し、バックグラウンドで更新
 */
async function staleWhileRevalidate(request, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // バックグラウンドで更新
  const fetchPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
        await trimCache(cacheName, CACHE_SIZE_LIMITS.RUNTIME);
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // キャッシュがあればすぐに返す
  return cachedResponse || fetchPromise;
}

/**
 * キャッシュサイズを制限
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // 古いエントリーから削除
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

/**
 * 静的リソースかどうかを判定
 */
function isStaticResource(pathname) {
  return CACHE_STRATEGIES.STATIC.some(pattern => pathname.includes(pattern));
}

/**
 * 画像リソースかどうかを判定
 */
function isImageResource(pathname) {
  return /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(pathname);
}

/**
 * アセットリソースかどうかを判定
 */
function isAssetResource(pathname) {
  return CACHE_STRATEGIES.ASSETS.some(ext => pathname.endsWith(ext));
}

// バックグラウンド同期（将来の機能拡張用）
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

/**
 * タスクの同期処理（将来の実装用）
 */
async function syncTasks() {
  console.log('[SW] Syncing tasks...');
  // 将来的にバックエンドAPIとの同期処理を実装
  return Promise.resolve();
}

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || 'TaskFlowからの通知',
    icon: '/logo192.svg',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TaskFlow', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // すでに開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// メッセージ処理（クライアントからの通信）
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');

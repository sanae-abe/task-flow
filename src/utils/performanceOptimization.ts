// パフォーマンス最適化ユーティリティ

// debounce関数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// throttle関数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

// バンドルサイズ分析
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // webpack-bundle-analyzerはビルド時ツールのため、
    // ランタイムでのimportは不要。開発時はnpm run analyzeを使用
    console.log('Bundle analysis available via: npm run analyze');
  }
};

// メモリリークの検出
export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'memory') {
          console.log('Memory usage:', entry);
        }
      });
    });

    observer.observe({ entryTypes: ['memory'] });
  }
};

// 画像の遅延読み込み
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  }
  return null;
};

// Service Worker登録の最適化
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // 更新チェック
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいコンテンツが利用可能
              console.log('New content is available; please refresh');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Critical Resource Hints
export const addResourceHints = () => {
  const head = document.head;

  // DNS prefetch for external resources
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = 'https://fonts.googleapis.com';
  head.appendChild(dnsPrefetch);

  // Preconnect for critical resources
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.gstatic.com';
  preconnect.crossOrigin = '';
  head.appendChild(preconnect);
};
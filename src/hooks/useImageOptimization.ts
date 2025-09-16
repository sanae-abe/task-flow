import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  loading?: 'lazy' | 'eager';
}

interface OptimizedImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  loading: 'lazy' | 'eager';
  alt: string;
}

export const useImageOptimization = () => {
  const [supportedFormats, setSupportedFormats] = useState<Set<string>>(new Set());

  // ブラウザサポート形式の検出
  useEffect(() => {
    const checkFormats = async () => {
      const formats = new Set<string>();

      // WebPサポートチェック
      if (await checkWebPSupport()) {
        formats.add('webp');
      }

      // AVIFサポートチェック
      if (await checkAVIFSupport()) {
        formats.add('avif');
      }

      setSupportedFormats(formats);
    };

    checkFormats();
  }, []);

  const checkWebPSupport = (): Promise<boolean> => new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });

  const checkAVIFSupport = (): Promise<boolean> => new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });

  const optimizeImage = useCallback((
    originalSrc: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ): OptimizedImage => {
    const {
      width,
      height,
      quality = 80,
      format,
      loading = 'lazy'
    } = options;

    // 最適な形式を選択
    let optimalFormat = format;
    if (!optimalFormat) {
      if (supportedFormats.has('avif')) {
        optimalFormat = 'avif';
      } else if (supportedFormats.has('webp')) {
        optimalFormat = 'webp';
      } else {
        optimalFormat = 'jpeg';
      }
    }

    // srcSetの生成（レスポンシブ画像）
    const generateSrcSet = (baseSrc: string) => {
      const densities = [1, 1.5, 2, 3];
      return densities
        .map(density => {
          const scaledWidth = width ? Math.round(width * density) : undefined;
          const scaledHeight = height ? Math.round(height * density) : undefined;

          // 実際のプロジェクトでは画像変換サービス（Cloudinary、ImageKitなど）のURLを生成
          const optimizedSrc = generateOptimizedUrl(baseSrc, {
            width: scaledWidth,
            height: scaledHeight,
            quality,
            format: optimalFormat
          });

          return `${optimizedSrc} ${density}x`;
        })
        .join(', ');
    };

    // sizesの生成
    const generateSizes = () => {
      if (!width) {return undefined;}
      return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`;
    };

    const optimizedSrc = generateOptimizedUrl(originalSrc, {
      width,
      height,
      quality,
      format: optimalFormat
    });

    return {
      src: optimizedSrc,
      srcSet: width ? generateSrcSet(originalSrc) : undefined,
      sizes: generateSizes(),
      loading,
      alt
    };
  }, [supportedFormats]);

  return {
    optimizeImage,
    supportedFormats
  };
};

// 画像最適化URLの生成（実際のサービスに応じて実装）
const generateOptimizedUrl = (
  originalSrc: string,
  _options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string => {
  // ローカル画像の場合はそのまま返す
  if (!originalSrc.startsWith('http')) {
    return originalSrc;
  }

  // 外部サービス使用例（Cloudinary）
  // const cloudinaryUrl = `https://res.cloudinary.com/your-cloud/image/fetch/`;
  // const params = new URLSearchParams();
  // if (_options.width) params.set('w', _options.width.toString());
  // if (_options.height) params.set('h', _options.height.toString());
  // if (_options.quality) params.set('q', _options.quality.toString());
  // if (_options.format) params.set('f', _options.format);
  // return `${cloudinaryUrl}${params.toString()}/${originalSrc}`;

  return originalSrc;
};

// 遅延読み込み用のIntersection Observer Hook
export const useLazyImage = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageRef) {return;}

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imageRef);

    return () => observer.disconnect();
  }, [imageRef, threshold]);

  return {
    setImageRef,
    isIntersecting
  };
};
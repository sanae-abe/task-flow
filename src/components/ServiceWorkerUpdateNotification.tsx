import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { skipWaiting } from '../utils/serviceWorker';

interface ServiceWorkerUpdateNotificationProps {
  registration?: ServiceWorkerRegistration | null;
}

/**
 * Service Worker更新通知コンポーネント
 * 新しいバージョンが利用可能な時に更新を促す
 */
const ServiceWorkerUpdateNotification: React.FC<
  ServiceWorkerUpdateNotificationProps
> = ({ registration }) => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const controllerChangeHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (registration) {
      setShowUpdate(true);
    }
  }, [registration]);

  // クリーンアップ処理
  useEffect(
    () => () => {
      // コンポーネントアンマウント時にイベントリスナーを削除
      if (controllerChangeHandlerRef.current && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          controllerChangeHandlerRef.current
        );
      }
    },
    []
  );

  const handleUpdate = useCallback(() => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      skipWaiting();

      // Service Workerの制御が変更されたらページをリロード
      if ('serviceWorker' in navigator) {
        const handleControllerChange = () => {
          window.location.reload();
        };

        controllerChangeHandlerRef.current = handleControllerChange;
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange
        );

        // タイムアウト処理（10秒以内に更新されない場合）
        setTimeout(() => {
          if (isUpdating) {
            console.warn('[SW] Update timeout - forcing reload');
            window.location.reload();
          }
        }, 10000);
      }
    } catch (error) {
      console.error('[SW] Error during update:', error);
      setIsUpdating(false);
      // エラー時も一度リロードを試みる
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [isUpdating]);

  const handleDismiss = useCallback(() => {
    if (isUpdating) {
      return;
    }
    setShowUpdate(false);
  }, [isUpdating]);

  if (!showUpdate) {
    return null;
  }

  return (
    <div
      className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4'
      role='alert'
      aria-live='polite'
      aria-atomic='true'
    >
      <div className='bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up'>
        <RefreshCw
          className={`h-5 w-5 flex-shrink-0 ${isUpdating ? 'animate-spin' : ''}`}
          aria-hidden='true'
        />
        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-sm'>
            新しいバージョンが利用可能です
          </p>
          <p className='text-xs opacity-90 mt-0.5'>
            更新して最新機能をお楽しみください
          </p>
        </div>
        <div className='flex gap-2 flex-shrink-0'>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className='px-3 py-1.5 bg-primary-foreground text-primary rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
            aria-busy={isUpdating}
          >
            {isUpdating ? '更新中...' : '更新'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className='p-1.5 hover:bg-primary-foreground/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='閉じる'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ServiceWorkerUpdateNotification;

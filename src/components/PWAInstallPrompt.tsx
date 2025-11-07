import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_DAYS = 7;

/**
 * PWAインストールプロンプトコンポーネント
 * ユーザーにアプリのインストールを促す
 */
const PWAInstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  /**
   * 却下期限が切れているかチェック
   */
  const isDismissExpired = useCallback((): boolean => {
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (!dismissedUntil) {
      return true;
    }

    try {
      const expiryDate = new Date(dismissedUntil);
      return expiryDate <= new Date();
    } catch (error) {
      console.error('[PWA] Invalid dismiss date:', error);
      localStorage.removeItem(DISMISS_KEY);
      return true;
    }
  }, []);

  useEffect(() => {
    // すでにインストール済みかチェック
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    if (isStandalone) {
      return;
    }

    // ユーザーがすでに却下したかチェック
    if (!isDismissExpired()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        // デフォルトの動作を防ぐ
        e.preventDefault();

        // プロンプトを保存
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        // カスタムプロンプトを表示（3秒後）
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      } catch (error) {
        console.error('[PWA] Error handling beforeinstallprompt:', error);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, [isDismissExpired]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return;
    }

    setIsInstalling(true);

    try {
      // インストールプロンプトを表示
      await deferredPrompt.prompt();

      // ユーザーの選択を取得
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
    } catch (error) {
      console.error('[PWA] Error during installation:', error);
    } finally {
      // プロンプトをクリア
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalling(false);
    }
  };

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);

    try {
      // 却下したことを記録（7日間）
      const dismissedUntil = new Date();
      dismissedUntil.setDate(dismissedUntil.getDate() + DISMISS_DURATION_DAYS);
      localStorage.setItem(DISMISS_KEY, dismissedUntil.toISOString());
    } catch (error) {
      console.error('[PWA] Error saving dismiss state:', error);
    }
  }, []);

  if (!showPrompt) {
    return null;
  }

  return (
    <div
      className='fixed bottom-4 right-4 z-50 max-w-sm mx-4'
      role='dialog'
      aria-labelledby='pwa-install-title'
      aria-describedby='pwa-install-description'
    >
      <div className='bg-card text-card-foreground rounded-lg shadow-xl border border-border p-4 animate-slide-in-right'>
        <div className='flex items-start gap-3'>
          <div className='p-2 bg-primary/10 rounded-lg' aria-hidden='true'>
            <Download className='h-5 w-5 text-primary' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 id='pwa-install-title' className='font-semibold text-sm mb-1'>
              {t('pwa.installTitle')}
            </h3>
            <p
              id='pwa-install-description'
              className='text-xs text-muted-foreground mb-3'
            >
              {t('pwa.installDescription')}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className='px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                aria-busy={isInstalling}
              >
                {isInstalling ? t('pwa.installing') : t('pwa.install')}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isInstalling}
                className='px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {t('pwa.later')}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            disabled={isInstalling}
            className='p-1 hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label={t('pwa.close')}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;

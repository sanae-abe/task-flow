import { useState, useEffect, useCallback } from 'react';
import { getServiceWorkerStatus } from '../utils/serviceWorker';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerActive: boolean;
}

/**
 * Windowオブジェクトの拡張（iOS Safari対応）
 */
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * PWA状態を管理するカスタムフック
 */
export const usePWA = () => {
  const [pwaStatus, setPWAStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isServiceWorkerSupported: false,
    isServiceWorkerActive: false,
  });

  const checkPWAStatus = useCallback(async () => {
    try {
      // スタンドアロンモードチェック
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorStandalone).standalone === true;

      // Service Workerステータスチェック
      const swStatus = await getServiceWorkerStatus();

      // インストール済みかチェック
      const isInstalled =
        isStandalone || localStorage.getItem('pwa-installed') === 'true';

      setPWAStatus({
        isInstallable: !isInstalled && swStatus.isSupported,
        isInstalled,
        isStandalone,
        isServiceWorkerSupported: swStatus.isSupported,
        isServiceWorkerActive: swStatus.isActive,
      });
    } catch (error) {
      console.error('[PWA] Error checking PWA status:', error);
      // エラー時もデフォルト状態を設定
      setPWAStatus({
        isInstallable: false,
        isInstalled: false,
        isStandalone: false,
        isServiceWorkerSupported: false,
        isServiceWorkerActive: false,
      });
    }
  }, []);

  useEffect(() => {
    checkPWAStatus();

    // beforeinstallpromptイベントのリスナー
    const handleBeforeInstallPrompt = () => {
      setPWAStatus(prev => ({ ...prev, isInstallable: true }));
    };

    // appinstalledイベントのリスナー
    const handleAppInstalled = () => {
      try {
        localStorage.setItem('pwa-installed', 'true');
        setPWAStatus(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
        }));
      } catch (error) {
        console.error('[PWA] Error saving install state:', error);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkPWAStatus]);

  return pwaStatus;
};

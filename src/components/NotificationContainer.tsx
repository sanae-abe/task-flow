import { CheckCircleIcon, InfoIcon, AlertIcon, XIcon, StopIcon } from '@primer/octicons-react';
import { Text, IconButton, Flash } from '@primer/react';
import React, { useMemo, useCallback, useEffect } from 'react';

import { useNotifications } from '../contexts/NotificationContext';
import type { Notification, NotificationType } from '../types';

// CSS-in-JSスタイル定義
const containerStyles: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1010,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px'
};

const wrapperStyles: React.CSSProperties = {
  pointerEvents: 'auto',
  animation: 'slideInFromTop 0.3s ease-out',
  width: '100%',
  maxWidth: '600px',
  minWidth: '320px'
};

// レスポンシブ用のメディアクエリチェック
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const getNotificationIcon = (type: NotificationType): React.ReactElement => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon size={16} aria-hidden="true" />;
    case 'info':
      return <InfoIcon size={16} aria-hidden="true" />;
    case 'warning':
      return <AlertIcon size={16} aria-hidden="true" />;
    case 'error':
      return <StopIcon size={16} aria-hidden="true" />;
    default:
      return <InfoIcon size={16} aria-hidden="true" />;
  }
};

const getFlashVariant = (type: NotificationType): 'default' | 'warning' | 'danger' | 'success' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    case 'info':
    default:
      return 'default';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ notification, onClose }) => {
  const handleClose = useCallback(() => {
    onClose(notification.id);
  }, [notification.id, onClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  const variant = useMemo(() => getFlashVariant(notification.type), [notification.type]);
  const icon = useMemo(() => getNotificationIcon(notification.type), [notification.type]);

  return (
    <Flash
      variant={variant}
      role="alert"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            display: 'block',
            wordBreak: 'break-word'
          }}
        >
          {notification.message}
        </Text>
      </div>

      <IconButton
        variant="invisible"
        size="small"
        onClick={handleClose}
        aria-label="通知を閉じる"
        style={{
          flexShrink: 0,
          opacity: 0.7
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.opacity = '0.7';
        }}
        icon={XIcon}
      />
    </Flash>
  );
});

const NotificationContainerComponent: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // メモ化されたコールバック
  const handleRemoveNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // ESCキーでの全体閉じる機能
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && notifications.length > 0) {
        // 最新の通知を閉じる
        const latestNotification = notifications[0];
        if (latestNotification) {
          removeNotification(latestNotification.id);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [notifications, removeNotification]);

  // レスポンシブスタイル
  const responsiveContainerStyles: React.CSSProperties = {
    ...containerStyles,
    ...(isMobile && {
      top: '10px',
      left: '10px',
      right: '10px',
      transform: 'none',
      width: 'auto'
    })
  };

  const responsiveWrapperStyles: React.CSSProperties = useMemo(() => ({
    ...wrapperStyles,
    ...(!isMobile && {
      minWidth: '50vw'
    })
  }), [isMobile]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes slideInFromTop {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={responsiveContainerStyles}
        role="region"
        aria-label="通知"
        aria-live="polite"
      >
        {notifications.map((notification) => (
          <div key={notification.id} style={responsiveWrapperStyles}>
            <NotificationItem
              notification={notification}
              onClose={handleRemoveNotification}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// displayNameを設定（デバッグ用）
NotificationItem.displayName = 'NotificationItem';
NotificationContainerComponent.displayName = 'NotificationContainer';

export default NotificationContainerComponent;
import React from 'react';
import { Text } from '@primer/react';
import { CloudOfflineIcon, CheckIcon } from '@primer/octicons-react';
import { useOffline } from '../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOffline();

  if (isOnline && !wasOffline) {
    return null; // オンライン状態で過去にオフラインになったことがない場合は表示しない
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        borderRadius: '6px',
        border: '1px solid',
        borderColor: isOffline ? 'var(--color-severe-emphasis)' : 'var(--color-success-emphasis)',
        backgroundColor: isOffline ? 'var(--color-severe-subtle)' : 'var(--color-success-subtle)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(140, 149, 159, 0.2)',
        transition: 'all 0.3s ease',
        animation: wasOffline && isOnline ? 'slideIn 0.3s ease' : 'none',
      }}
    >
      {isOffline ? (
        <CloudOfflineIcon size={16} />
      ) : (
        <CheckIcon size={16} />
      )}
      <Text
        fontSize={1}
        fontWeight="semibold"
        color={isOffline ? 'severe.fg' : 'success.fg'}
      >
        {isOffline ? 'オフライン' : 'オンラインに復帰しました'}
      </Text>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(OfflineIndicator);
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
        right: '10px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: isOffline ? 'var(--bgColor-severe-emphasis)' : 'var(--fgColor-success)',
        color: isOffline ? 'var(--bgColor-severe-emphasis)' : 'var(--fgColor-onEmphasis)',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '4px',
        transition: 'all 0.3s ease',
        animation: wasOffline && isOnline ? 'slideIn 0.3s ease' : 'none'
      }}
    >
      {isOffline ? (
        <CloudOfflineIcon size={16} />
      ) : (
        <CheckIcon size={16} />
      )}
      <Text
        fontSize={1}
        fontWeight="bold"
        color={isOffline ? 'severeEmphasis.fg' : 'onEmphasis.fg'}
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
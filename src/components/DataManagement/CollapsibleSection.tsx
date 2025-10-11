import { memo, ReactNode } from 'react';

/**
 * 折りたたみ可能なセクションコンポーネント（ネイティブdetails/summaryベース）
 */
interface CollapsibleSectionProps {
  /** セクションのアイコン */
  icon: React.ComponentType<{ size?: number }>;
  /** セクションのタイトル */
  title: string;
  /** アイコンの背景色 */
  iconBg?: string;
  /** アイコンの文字色 */
  iconColor?: string;
  /** 子コンテンツ */
  children: ReactNode;
  /** デフォルトで開いているかどうか */
  defaultOpen?: boolean;
}

export const CollapsibleSection = memo<CollapsibleSectionProps>(({
  icon: Icon,
  title,
  iconBg = 'var(--bgColor-accent-muted)',
  iconColor = 'var(--fgColor-accent)',
  children,
  defaultOpen = false
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <details
      open={defaultOpen}
      style={{
        transition: 'all 0.2s ease'
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          listStyle: 'none',
          outline: 'none',
          marginBottom: 0,
          border: '1px solid var(--borderColor-default)',
          borderRadius: '6px',
          padding: '12px',
          backgroundColor: 'var(--bgColor-default)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: iconBg,
              color: iconColor
            }}
          >
            <Icon size={14} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {title}
          </span>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            transform: 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z" />
        </svg>
      </summary>
      <div style={{
        marginTop: '12px',
        border: '1px solid var(--borderColor-default)',
        borderRadius: '6px',
        padding: '12px'
      }}>
        {children}
      </div>
    </details>
    <style>{`
      details[open] > summary > svg {
        transform: rotate(180deg) !important;
      }
      details > summary::-webkit-details-marker {
        display: none;
      }
      details > summary::marker {
        content: '';
      }
    `}</style>
  </div>
));

CollapsibleSection.displayName = 'CollapsibleSection';
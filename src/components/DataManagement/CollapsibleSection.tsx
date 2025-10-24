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
  iconBg = 'rgb(219 234 254)',
  iconColor = 'rgb(37 99 235)',
  children,
  defaultOpen = false
}) => (
  <div className="flex flex-col gap-3">
    <details
      open={defaultOpen}
      className="transition-all duration-200 ease"
    >
      <summary
        className="flex items-center justify-between cursor-pointer list-none outline-none mb-0 border border-border rounded-md p-3 bg-background"
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-sm"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
            }}
          >
            <Icon size={14} />
          </div>
          <span className="text-base font-bold">
            {title}
          </span>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="rotate-0 transition-transform duration-200 ease"
        >
          <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z" />
        </svg>
      </summary>
      <div className="mt-3 border border-border rounded-md p-3">
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
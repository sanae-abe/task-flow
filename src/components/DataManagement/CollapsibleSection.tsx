import { memo, ReactNode } from 'react';
import { Box, Text } from '@primer/react';
import { ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react';

/**
 * 折りたたみ可能なセクションコンポーネント
 */
interface CollapsibleSectionProps {
  /** セクションのアイコン */
  icon: React.ComponentType<{ size?: number }>;
  /** セクションのタイトル */
  title: string;
  /** セクションの説明文 */
  description: string;
  /** 展開状態 */
  isExpanded: boolean;
  /** 展開/折りたたみ切り替えのコールバック */
  onToggle: () => void;
  /** アイコンの背景色 */
  iconBg?: string;
  /** アイコンの文字色 */
  iconColor?: string;
  /** 展開時の背景色 */
  expandedBg?: string;
  /** 展開時の境界線色 */
  expandedBorderColor?: string;
  /** 子コンテンツ */
  children: ReactNode;
}

export const CollapsibleSection = memo<CollapsibleSectionProps>(({
  icon: Icon,
  title,
  isExpanded,
  onToggle,
  iconBg = 'accent.subtle',
  iconColor = 'accent.fg',
  expandedBorderColor = 'accent.emphasis',
  children
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {/* セクションヘッダー（折りたたみ可能） */}
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: isExpanded ? expandedBorderColor : 'border.default',
        borderRadius: 2,
        bg: 'canvas.default',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={onToggle}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 2,
              bg: iconBg,
              color: iconColor
            }}
          >
            <Icon size={16} />
          </Box>
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            {title}
          </Text>
        </Box>
        {isExpanded ? (
          <ChevronUpIcon size={20} />
        ) : (
          <ChevronDownIcon size={20} />
        )}
      </Box>
      {/* 展開時のコンテンツ */}
      {isExpanded && (
        <Box
          sx={{
            p: 3,
            bg: 'canvas.default'
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  </Box>
));

CollapsibleSection.displayName = 'CollapsibleSection';
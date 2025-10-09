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
  description,
  isExpanded,
  onToggle,
  iconBg = 'accent.subtle',
  iconColor = 'accent.fg',
  expandedBg = 'accent.subtle',
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
        bg: isExpanded ? expandedBg : 'canvas.subtle',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: expandedBorderColor,
          bg: expandedBg
        }
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
              width: '32px',
              height: '32px',
              borderRadius: 2,
              bg: isExpanded ? iconColor : iconBg,
              color: isExpanded ? 'fg.onEmphasis' : iconColor
            }}
          >
            <Icon size={16} />
          </Box>
          <Box>
            <Text sx={{ fontSize: 2, fontWeight: 'bold', mb: 1 }}>
              {title}
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
              {isExpanded ? 'クリックして閉じる' : description}
            </Text>
          </Box>
        </Box>
        {isExpanded ? (
          <ChevronUpIcon size={20} />
        ) : (
          <ChevronDownIcon size={20} />
        )}
      </Box>
    </Box>

    {/* 展開時のコンテンツ */}
    {isExpanded && (
      <Box
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          bg: 'canvas.default'
        }}
      >
        {children}
      </Box>
    )}
  </Box>
));

CollapsibleSection.displayName = 'CollapsibleSection';
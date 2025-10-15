import React from 'react';
import { Text, Box } from '@primer/react';
import { AlertIcon, ClockIcon, StopIcon } from '@primer/octicons-react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { spacing, borderRadius, typography, transitions } from '../styles/designTokens';

interface WarningCardProps {
  item: {
    type: RecycleBinItem['type'];
    canRestore: boolean;
    timeUntilDeletion?: string;
  };
  retentionDays?: number | null;
}

/**
 * Warning Card - 削除やゴミ箱に関する重要な警告を表示するカードコンポーネント
 *
 * 機能:
 * - 削除予定日の警告表示
 * - 復元不可能アイテムの警告
 * - 自動削除設定の情報表示
 * - アクセシブルな警告表示
 * - 視覚的に目立つ重要度別デザイン
 */
export const WarningCard: React.FC<WarningCardProps> = ({ item, retentionDays }) => {
  // 警告レベルと内容を判定
  const getWarningInfo = () => {
    const warnings: Array<{
      level: 'danger' | 'warning' | 'info';
      icon: React.ComponentType<{ size: number; 'aria-hidden'?: boolean; style?: React.CSSProperties }>;
      title: string;
      message: string;
      showTimeUntil?: boolean;
    }> = [];

    // 復元不可能な場合の警告
    if (!item.canRestore) {
      warnings.push({
        level: 'danger',
        icon: StopIcon,
        title: '復元不可',
        message: 'このアイテムは復元できません。関連するデータが見つからないか、破損している可能性があります。',
      });
    }

    // 自動削除の警告
    if (retentionDays !== null && item.timeUntilDeletion) {
      const urgencyLevel = getUrgencyLevel(item.timeUntilDeletion);

      if (urgencyLevel === 'critical') {
        warnings.push({
          level: 'danger',
          icon: AlertIcon,
          title: '緊急: 自動削除間近',
          message: 'このアイテムは間もなく自動的に完全削除されます。復元が必要な場合は至急実行してください。',
          showTimeUntil: true,
        });
      } else if (urgencyLevel === 'warning') {
        warnings.push({
          level: 'warning',
          icon: ClockIcon,
          title: '注意: 自動削除予定',
          message: 'このアイテムは自動削除予定です。必要に応じて復元をご検討ください。',
          showTimeUntil: true,
        });
      } else {
        warnings.push({
          level: 'info',
          icon: ClockIcon,
          title: '自動削除設定',
          message: `このアイテムは${retentionDays}日後に自動的に完全削除されます。`,
          showTimeUntil: true,
        });
      }
    } else if (retentionDays === null) {
      warnings.push({
        level: 'info',
        icon: ClockIcon,
        title: '手動削除のみ',
        message: '自動削除は設定されていません。手動で完全削除するまでゴミ箱に保持されます。',
      });
    }

    return warnings;
  };

  // 時間に基づく緊急度判定
  const getUrgencyLevel = (timeUntil: string) => {
    const timeText = timeUntil.toLowerCase();

    if (timeText.includes('時間') || timeText.includes('分') || timeText === 'たった今') {
      return 'critical';
    } else if (timeText.includes('日')) {
      const days = parseInt(timeText.match(/\d+/)?.[0] || '0');
      if (days <= 3) {
        return 'warning';
      }
    }
    return 'normal';
  };

  // 警告レベルに応じたスタイル
  const getWarningStyles = (level: 'danger' | 'warning' | 'info') => {
    switch (level) {
      case 'danger':
        return {
          bg: 'danger.subtle',
          borderColor: 'danger.muted',
          iconColor: 'var(--fgColor-danger)',
          titleColor: 'danger.fg',
        };
      case 'warning':
        return {
          bg: 'attention.subtle',
          borderColor: 'attention.muted',
          iconColor: 'var(--fgColor-attention)',
          titleColor: 'attention.fg',
        };
      case 'info':
        return {
          bg: 'accent.subtle',
          borderColor: 'accent.muted',
          iconColor: 'var(--fgColor-accent)',
          titleColor: 'accent.fg',
        };
      default:
        return {
          bg: 'neutral.subtle',
          borderColor: 'border.default',
          iconColor: 'var(--fgColor-muted)',
          titleColor: 'fg.default',
        };
    }
  };

  const warnings = getWarningInfo();

  // 警告がない場合は表示しない
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="warning-heading"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
      }}
    >
      {/* 警告一覧 */}
      {warnings.map((warning, index) => {
        const styles = getWarningStyles(warning.level);
        const warningId = `warning-${index}`;

        return (
          <Box
            key={warningId}
            role="alert"
            aria-labelledby={`${warningId}-title`}
            aria-describedby={`${warningId}-message`}
            sx={{
              display: 'flex',
              gap: spacing.sm,
              p: spacing.md,
              bg: styles.bg,
              border: '2px solid',
              borderColor: styles.borderColor,
              borderRadius: borderRadius.medium,
              transition: transitions.default,
              position: 'relative',
              overflow: 'hidden',

              // ホバー効果
              '&:hover': {
                borderColor: styles.titleColor,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              },

              // レスポンシブ対応
              '@media (max-width: 543px)': {
                p: spacing.sm,
                flexDirection: 'column',
                gap: spacing.xs,
              },
            }}
          >
            {/* 左側のアクセント線 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bg: styles.titleColor,
              }}
              aria-hidden="true"
            />

            {/* アイコン */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                pt: '2px', // テキストとの位置調整
                flexShrink: 0,
              }}
            >
              <warning.icon
                size={20}
                aria-hidden
              />
            </Box>

            {/* コンテンツ */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
              }}
            >
              {/* タイトル */}
              <Text
                id={`${warningId}-title`}
                sx={{
                  fontSize: 1,
                  fontWeight: 'bold',
                  color: styles.titleColor,
                  margin: 0,
                  lineHeight: 'condensed',
                }}
              >
                {warning.title}
              </Text>

              {/* メッセージ */}
              <Text
                id={`${warningId}-message`}
                sx={{
                  ...typography.description,
                  margin: 0,
                  color: 'fg.default',
                }}
              >
                {warning.message}
              </Text>

              {/* 削除予定時間 */}
              {warning.showTimeUntil && item.timeUntilDeletion && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    mt: spacing.xs,
                    p: spacing.xs,
                    bg: 'canvas.default',
                    borderRadius: borderRadius.small,
                    border: '1px solid',
                    borderColor: 'border.muted',
                  }}
                >
                  <ClockIcon
                    size={14}
                    aria-hidden
                  />
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: 'semibold',
                      color: 'fg.default',
                      margin: 0,
                    }}
                    aria-label={`削除予定: ${item.timeUntilDeletion}`}
                  >
                    削除予定: {item.timeUntilDeletion}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}

      {/* スクリーンリーダー用の概要 */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {warnings.length > 0 && `${warnings.length}件の重要な警告があります`}
      </Box>
    </Box>
  );
};
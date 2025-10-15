import React from 'react';
import { Text, Box } from '@primer/react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { spacing, borderRadius } from '../styles/designTokens';

interface WarningCardProps {
  item: {
    type: RecycleBinItem['type'];
    canRestore: boolean;
    timeUntilDeletion?: string;
  };
  retentionDays?: number | null;
}

/**
 * Warning Card - 削除やゴミ箱に関する重要な警告をシンプルに表示するカードコンポーネント
 *
 * 機能:
 * - 削除予定日の警告表示
 * - 復元不可能アイテムの警告
 * - 自動削除設定の情報表示
 * - シンプルで読みやすいデザイン
 */
export const WarningCard: React.FC<WarningCardProps> = ({ item, retentionDays }) => {
  // 警告レベルと内容を判定
  const getWarningInfo = () => {
    const warnings: Array<{
      level: 'danger' | 'warning' | 'info';
      title: string;
      message: string;
      showTimeUntil?: boolean;
    }> = [];

    // 復元不可能な場合の警告
    if (!item.canRestore) {
      warnings.push({
        level: 'danger',
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
          title: '緊急: 自動削除間近',
          message: 'このアイテムは間もなく自動的に完全削除されます。復元が必要な場合は至急実行してください。',
          showTimeUntil: true,
        });
      } else if (urgencyLevel === 'warning') {
        warnings.push({
          level: 'warning',
          title: '注意: 自動削除予定',
          message: 'このアイテムは自動削除予定です。必要に応じて復元をご検討ください。',
          showTimeUntil: true,
        });
      } else {
        warnings.push({
          level: 'info',
          title: '自動削除設定',
          message: `このアイテムは${retentionDays}日後に自動的に完全削除されます。`,
          showTimeUntil: true,
        });
      }
    } else if (retentionDays === null) {
      warnings.push({
        level: 'info',
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
      }}
    >
      {/* 警告一覧 */}
      {warnings.map((warning, index) => {
        const styles = getWarningStyles(warning.level);

        return (
          <Box
            key={index}
            role="alert"
            sx={{
              p: spacing.md,
              bg: styles.bg,
              border: '1px solid',
              borderColor: styles.borderColor,
              borderRadius: borderRadius.medium,

              // レスポンシブ対応
              '@media (max-width: 543px)': {
                p: spacing.sm,
              },
            }}
          >
            {/* タイトル */}
            <Text
              sx={{
                fontSize: 1,
                fontWeight: 'bold',
                color: styles.titleColor,
                margin: 0,
                mb: spacing.xs,
                lineHeight: 'condensed',
              }}
            >
              {warning.title}
            </Text>

            {/* メッセージ */}
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.default',
                margin: 0,
                lineHeight: 'default',
              }}
            >
              {warning.message}
            </Text>

            {/* 削除予定時間 */}
            {warning.showTimeUntil && item.timeUntilDeletion && (
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: 'semibold',
                  color: 'fg.muted',
                  margin: 0,
                  mt: spacing.sm,
                }}
              >
                削除予定: {item.timeUntilDeletion}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
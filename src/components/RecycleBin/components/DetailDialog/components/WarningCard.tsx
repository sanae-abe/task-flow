import React from 'react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { spacing } from '../styles/designTokens';
import DialogFlashMessage, { type DialogFlashMessageData, type DialogMessageType } from '../../../../shared/DialogFlashMessage';

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

  // 警告レベルをDialogMessageTypeにマッピング
  const getDialogMessageType = (level: 'danger' | 'warning' | 'info'): DialogMessageType => {
    switch (level) {
      case 'danger':
        return 'critical';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const warnings = getWarningInfo();

  // 警告がない場合は表示しない
  if (warnings.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
      }}
    >
      {/* 警告一覧 */}
      {warnings.map((warning, index) => {
        const messageType = getDialogMessageType(warning.level);

        // DialogFlashMessageData形式のメッセージを作成
        const flashMessage: DialogFlashMessageData = {
          type: messageType,
          title: warning.title,
          text: warning.showTimeUntil && item.timeUntilDeletion
            ? `${warning.message}（削除予定: ${item.timeUntilDeletion}）`
            : warning.message
        };

        return (
          <div key={index} role="alert">
            <DialogFlashMessage
              message={flashMessage}
              showDismiss={false}
              isStatic
            />
          </div>
        );
      })}
    </section>
  );
};
import React from 'react';
import { Button, Box, Spinner } from '@primer/react';
import { ReplyIcon, TrashIcon, XIcon } from '@primer/octicons-react';
import type { RecycleBinItemWithMeta } from '../../../../../types/recycleBin';
import { spacing, borderRadius, responsiveLayout, transitions } from '../styles/designTokens';

interface ActionFooterProps {
  item: RecycleBinItemWithMeta;
  isLoading?: boolean;
  loadingAction?: 'restore' | 'delete' | 'close' | null;
  onRestore: (item: RecycleBinItemWithMeta) => void;
  onDelete: (item: RecycleBinItemWithMeta) => void;
  onClose: () => void;
}

/**
 * Action Footer - ダイアログのアクションボタンエリア
 *
 * 機能:
 * - 復元・削除・閉じるボタンの配置
 * - ローディング状態の適切な表示
 * - レスポンシブ対応のボタン配置
 * - アクセシブルなボタン操作
 * - 復元不可能な場合の適切な無効化
 */
export const ActionFooter: React.FC<ActionFooterProps> = ({
  item,
  isLoading = false,
  loadingAction = null,
  onRestore,
  onDelete,
  onClose,
}) => {
  const itemTypeText = item.type === 'task' ? 'タスク' : item.type === 'board' ? 'ボード' : 'カラム';

  // ボタンの状態を判定
  const isRestoreDisabled = !item.canRestore || isLoading;
  const isDeleteDisabled = isLoading;
  const isCloseDisabled = isLoading;

  // ローディング中のボタンテキスト
  const getButtonText = (action: 'restore' | 'delete' | 'close') => {
    if (!isLoading || loadingAction !== action) {
      switch (action) {
        case 'restore':
          return '復元';
        case 'delete':
          return '完全に削除';
        case 'close':
          return '閉じる';
      }
    }

    switch (action) {
      case 'restore':
        return '復元中...';
      case 'delete':
        return '削除中...';
      case 'close':
        return '処理中...';
    }
  };

  return (
    <Box
      as="footer"
      role="group"
      aria-label="アクション"
      sx={{
        display: 'flex',
        gap: spacing.sm,
        p: spacing.lg,
        borderTop: '1px solid',
        borderColor: 'border.default',
        bg: 'canvas.subtle',
        borderRadius: `0 0 ${borderRadius.medium}px ${borderRadius.medium}px`,
        position: 'sticky',
        bottom: 0,
        zIndex: 1,

        // レスポンシブ対応
        ...responsiveLayout.actionButtons.sm,
        '@media (max-width: 543px)': {
          ...responsiveLayout.actionButtons.xs,
          p: spacing.md,
          gap: spacing.xs,
        },
      }}
    >
      {/* 復元ボタン */}
      <Button
        variant="primary"
        size="medium"
        disabled={isRestoreDisabled}
        onClick={() => onRestore(item)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          flex: 1,
          transition: transitions.default,

          // 復元不可能な場合のスタイル調整
          ...(item.canRestore ? {} : {
            opacity: 0.6,
            cursor: 'not-allowed',
          }),

          '@media (max-width: 543px)': {
            fontSize: 1,
            py: spacing.sm,
          },
        }}
        aria-label={`${itemTypeText}「${item.title}」を復元`}
        aria-describedby={item.canRestore ? undefined : 'restore-disabled-reason'}
      >
        {loadingAction === 'restore' ? (
          <Spinner size="small" />
        ) : (
          <ReplyIcon
            size={16}
            aria-hidden="true"
          />
        )}
        {getButtonText('restore')}
      </Button>

      {/* 完全削除ボタン */}
      <Button
        variant="danger"
        size="medium"
        disabled={isDeleteDisabled}
        onClick={() => onDelete(item)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          flex: 1,
          transition: transitions.default,

          '@media (max-width: 543px)': {
            fontSize: 1,
            py: spacing.sm,
          },
        }}
        aria-label={`${itemTypeText}「${item.title}」を完全に削除`}
      >
        {loadingAction === 'delete' ? (
          <Spinner size="small" />
        ) : (
          <TrashIcon
            size={16}
            aria-hidden="true"
          />
        )}
        {getButtonText('delete')}
      </Button>

      {/* 閉じるボタン */}
      <Button
        variant="invisible"
        size="medium"
        disabled={isCloseDisabled}
        onClick={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          flexShrink: 0,
          transition: transitions.default,
          minWidth: 'auto',

          '@media (max-width: 543px)': {
            fontSize: 1,
            py: spacing.sm,
            px: spacing.md,
          },
        }}
        aria-label="ダイアログを閉じる"
      >
        {loadingAction === 'close' ? (
          <Spinner size="small" />
        ) : (
          <XIcon
            size={16}
            aria-hidden="true"
          />
        )}
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {getButtonText('close')}
        </Box>
      </Button>

      {/* 復元不可能な理由の説明（スクリーンリーダー用） */}
      {!item.canRestore && (
        <Box
          id="restore-disabled-reason"
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          このアイテムは復元できません。関連するデータが見つからないか、破損している可能性があります。
        </Box>
      )}

      {/* ローディング状態のライブリージョン */}
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
        {isLoading && loadingAction && (
          `${loadingAction === 'restore' ? '復元' : loadingAction === 'delete' ? '削除' : '処理'}を実行中です`
        )}
      </Box>

      {/* キーボードナビゲーション用のスキップリンク */}
      <Box
        as="a"
        href="#dialog-close"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          onClose();
        }}
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',

          '&:focus': {
            position: 'static',
            left: 'auto',
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            p: spacing.xs,
            bg: 'accent.emphasis',
            color: 'fg.onEmphasis',
            borderRadius: borderRadius.small,
            textDecoration: 'none',
            fontSize: 0,
            fontWeight: 'bold',
          },
        }}
      >
        ダイアログを閉じる (Escape)
      </Box>
    </Box>
  );
};
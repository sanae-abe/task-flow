import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw, Trash2, X, Loader2 } from 'lucide-react';
import type { RecycleBinItemWithMeta } from '../../../../../types/recycleBin';

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
    <footer
      role="group"
      aria-label="アクション"
      className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-md sticky bottom-0 z-210 max-sm:p-3 max-sm:gap-1"
    >
      {/* 復元ボタン */}
      <Button
        variant="default"
        size="default"
        disabled={isRestoreDisabled}
        onClick={() => onRestore(item)}
        className={cn(
          "flex items-center gap-1 flex-1 transition-all",
          !item.canRestore && "opacity-60 cursor-not-allowed",
          "max-sm:text-sm max-sm:py-2"
        )}
        aria-label={`${itemTypeText}「${item.title}」を復元`}
        aria-describedby={item.canRestore ? undefined : 'restore-disabled-reason'}
      >
        {loadingAction === 'restore' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <RotateCcw
            size={16}
            aria-hidden="true"
          />
        )}
        {getButtonText('restore')}
      </Button>

      {/* 完全削除ボタン */}
      <Button
        variant="destructive"
        size="default"
        disabled={isDeleteDisabled}
        onClick={() => onDelete(item)}
        className="flex items-center gap-1 flex-1 transition-all max-sm:text-sm max-sm:py-2"
        aria-label={`${itemTypeText}「${item.title}」を完全に削除`}
      >
        {loadingAction === 'delete' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2
            size={16}
            aria-hidden="true"
          />
        )}
        {getButtonText('delete')}
      </Button>

      {/* 閉じるボタン */}
      <Button
        variant="ghost"
        size="default"
        disabled={isCloseDisabled}
        onClick={onClose}
        className="flex items-center gap-1 shrink-0 transition-all min-w-auto max-sm:text-sm max-sm:py-2 max-sm:px-3"
        aria-label="ダイアログを閉じる"
      >
        {loadingAction === 'close' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <X
            size={16}
            aria-hidden="true"
          />
        )}
        <span className="hidden sm:block">
          {getButtonText('close')}
        </span>
      </Button>

      {/* 復元不可能な理由の説明（スクリーンリーダー用） */}
      {!item.canRestore && (
        <div
          id="restore-disabled-reason"
          className="absolute -left-[10000px] w-px h-px overflow-hidden"
        >
          このアイテムは復元できません。関連するデータが見つからないか、破損している可能性があります。
        </div>
      )}

      {/* ローディング状態のライブリージョン */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="absolute -left-[10000px] w-px h-px overflow-hidden"
      >
        {isLoading && loadingAction && (
          `${loadingAction === 'restore' ? '復元' : loadingAction === 'delete' ? '削除' : '処理'}を実行中です`
        )}
      </div>

      {/* キーボードナビゲーション用のスキップリンク */}
      <a
        href="#dialog-close"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          onClose();
        }}
        className="absolute -left-[10000px] w-px h-px overflow-hidden focus:static focus:left-auto focus:w-auto focus:h-auto focus:overflow-visible focus:p-1 focus:bg-primary focus:text-white focus:rounded-sm focus:no-underline focus:text-xs focus:font-bold"
      >
        ダイアログを閉じる (Escape)
      </a>
    </footer>
  );
};
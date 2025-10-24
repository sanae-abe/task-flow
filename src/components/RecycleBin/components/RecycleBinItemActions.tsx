import React from 'react';
import { Button } from '@/components/ui/button';
import { HistoryIcon, TrashIcon, EyeIcon } from '@primer/octicons-react';
import { LoadingButton } from '../../shared/LoadingButton';
import type { RecycleBinItemWithMeta } from '../../../types/recycleBin';

interface RecycleBinItemActionsProps {
  item: RecycleBinItemWithMeta;
  isLoading: boolean;
  loadingText?: string;
  onRestore: (item: RecycleBinItemWithMeta) => void;
  onDelete: (item: RecycleBinItemWithMeta) => void;
  onShowDetail: (item: RecycleBinItemWithMeta) => void;
}

/**
 * ゴミ箱アイテムのアクションボタンコンポーネント
 */
export const RecycleBinItemActions: React.FC<RecycleBinItemActionsProps> = ({
  item,
  isLoading,
  loadingText,
  onRestore,
  onDelete,
  onShowDetail,
}) => {
  if (isLoading) {
    return (
      <LoadingButton
        disabled
        isLoading
        loadingText={loadingText || "処理中..."}
        primerSize="small"
      >
        処理中
      </LoadingButton>
    );
  }

  const itemTypeText = item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク';

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${itemTypeText}「${item.title}」の詳細を表示`}
        onClick={() => onShowDetail(item)}
        className="p-1 h-auto min-w-0"
      >
        <EyeIcon size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${itemTypeText}「${item.title}」を復元`}
        onClick={() => onRestore(item)}
        className="p-1 h-auto min-w-0"
      >
        <HistoryIcon size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${itemTypeText}「${item.title}」を完全に削除`}
        onClick={() => onDelete(item)}
        className="p-1 h-auto min-w-0"
      >
        <TrashIcon size={16} />
      </Button>
    </div>
  );
};
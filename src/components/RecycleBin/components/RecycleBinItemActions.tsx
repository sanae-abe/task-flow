import React from 'react';
import { IconButton } from '@primer/react';
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
        size="small"
      >
        処理中
      </LoadingButton>
    );
  }

  const itemTypeText = item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
      <IconButton
        icon={EyeIcon}
        aria-label={`${itemTypeText}「${item.title}」の詳細を表示`}
        size="small"
        variant="invisible"
        onClick={() => onShowDetail(item)}
      />
      <IconButton
        icon={HistoryIcon}
        aria-label={`${itemTypeText}「${item.title}」を復元`}
        size="small"
        variant="invisible"
        onClick={() => onRestore(item)}
      />
      <IconButton
        icon={TrashIcon}
        aria-label={`${itemTypeText}「${item.title}」を完全に削除`}
        size="small"
        variant="invisible"
        onClick={() => onDelete(item)}
      />
    </div>
  );
};
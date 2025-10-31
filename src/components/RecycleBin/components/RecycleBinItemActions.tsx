import React from 'react';
import { RotateCcw, Trash2, Eye } from 'lucide-react';
import { LoadingButton } from '../../shared/LoadingButton';
import type { RecycleBinItemWithMeta } from '../../../types/recycleBin';
import IconButton from '../../shared/IconButton';

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
        loadingText={loadingText || '処理中...'}
        primerSize='small'
      >
        処理中
      </LoadingButton>
    );
  }

  const itemTypeText =
    item.type === 'board'
      ? 'ボード'
      : item.type === 'column'
        ? 'カラム'
        : 'タスク';

  return (
    <div className='flex justify-center'>
      <IconButton
        icon={Eye}
        ariaLabel={`${itemTypeText}「${item.title}」の詳細を表示`}
        onClick={() => onShowDetail(item)}
      />
      <IconButton
        icon={RotateCcw}
        size='icon'
        ariaLabel={`${itemTypeText}「${item.title}」を復元`}
        onClick={() => onRestore(item)}
      />
      <IconButton
        icon={Trash2}
        size='icon'
        ariaLabel={`${itemTypeText}「${item.title}」を完全に削除`}
        onClick={() => onDelete(item)}
      />
    </div>
  );
};

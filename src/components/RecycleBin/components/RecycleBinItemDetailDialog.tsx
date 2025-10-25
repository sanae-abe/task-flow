import React, { useState, useMemo, useCallback } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import UnifiedDialog from '../../shared/Dialog/UnifiedDialog';
import type { RecycleBinItemWithMeta } from '../../../types/recycleBin';
import type { DialogAction } from '../../../types/unified-dialog';
import { useRecycleBinSettingsReadOnly } from '../../../hooks/useRecycleBinSettings';
import { HeroSection } from './DetailDialog/components/HeroSection';
import { DescriptionCard } from './DetailDialog/components/DescriptionCard';
import { MetadataGrid } from './DetailDialog/components/MetadataGrid';
import { WarningCard } from './DetailDialog/components/WarningCard';

interface RecycleBinItemDetailDialogProps {
  item: RecycleBinItemWithMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: RecycleBinItemWithMeta) => void;
  onDelete: (item: RecycleBinItemWithMeta) => void;
}

/**
 * ゴミ箱アイテムの詳細表示ダイアログコンポーネント
 * 新しいモジュラーコンポーネントを使用した改善版UI
 */
export const RecycleBinItemDetailDialog: React.FC<RecycleBinItemDetailDialogProps> = ({
  item,
  isOpen,
  onClose,
  onRestore,
  onDelete,
}) => {
  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'restore' | 'delete' | null>(null);

  // ゴミ箱設定を取得
  const recycleBinSettings = useRecycleBinSettingsReadOnly();

  const itemTypeText = item?.type === 'board' ? 'ボード' : item?.type === 'column' ? 'カラム' : 'タスク';

  // 復元処理
  const handleRestore = useCallback(() => {
    if (!item) { return; }
    setIsLoading(true);
    setLoadingAction('restore');
    try {
      onRestore(item);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('復元に失敗:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [item, onRestore, onClose]);

  // 削除処理
  const handleDelete = useCallback(() => {
    if (!item) { return; }
    setIsLoading(true);
    setLoadingAction('delete');
    try {
      onClose();
      onDelete(item);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('削除に失敗:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [item, onClose, onDelete]);

  // UnifiedDialogのアクション定義
  const actions = useMemo<DialogAction[]>(() => [
    {
      label: loadingAction === 'restore' ? '復元中...' : '復元',
      onClick: handleRestore,
      variant: 'default',
      disabled: !item?.canRestore || isLoading,
      loading: loadingAction === 'restore',
      icon: RotateCcw,
    },
    {
      label: loadingAction === 'delete' ? '削除中...' : '完全に削除',
      onClick: handleDelete,
      variant: 'destructive',
      disabled: isLoading,
      loading: loadingAction === 'delete',
      icon: Trash2,
    },
  ], [handleRestore, handleDelete, item?.canRestore, isLoading, loadingAction]);

  if (!item) {
    return null;
  }

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${itemTypeText}詳細`}
      variant="modal"
      size="large"
      actions={actions}
    >
      <div className="flex flex-col gap-4">
        {/* Hero Section - タイトルエリア */}
        <HeroSection item={item} />

        {/* Description Card - 説明文 */}
        <DescriptionCard item={item} />

        {/* Metadata Grid - 詳細情報 */}
        <MetadataGrid item={item} />

        {/* Warning Card - 警告 */}
        <WarningCard
          item={item}
          retentionDays={recycleBinSettings.retentionDays}
        />
      </div>
    </UnifiedDialog>
  );
};
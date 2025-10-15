import React, { useState } from 'react';
import { Box } from '@primer/react';
import UnifiedDialog from '../../shared/Dialog/UnifiedDialog';
import type { RecycleBinItemWithMeta } from '../../../types/recycleBin';
import { useRecycleBinSettingsReadOnly } from '../../../hooks/useRecycleBinSettings';
import { HeroSection } from './DetailDialog/components/HeroSection';
import { DescriptionCard } from './DetailDialog/components/DescriptionCard';
import { MetadataGrid } from './DetailDialog/components/MetadataGrid';
import { WarningCard } from './DetailDialog/components/WarningCard';
import { ActionFooter } from './DetailDialog/components/ActionFooter';
import { spacing } from './DetailDialog/styles/designTokens';

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

  if (!item) {
    return null;
  }

  const itemTypeText = item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク';

  // 復元処理
  const handleRestore = async () => {
    setIsLoading(true);
    setLoadingAction('restore');
    try {
      await onRestore(item);
      onClose();
    } catch (error) {
      console.error('復元に失敗:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    setIsLoading(true);
    setLoadingAction('delete');
    try {
      onClose();
      await onDelete(item);
    } catch (error) {
      console.error('削除に失敗:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${itemTypeText}詳細`}
      variant="modal"
      size="large"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '70vh',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {/* スクロール可能なメインコンテンツ */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
            p: spacing.lg,
          }}
        >
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
        </Box>

        {/* Action Footer - アクションボタン */}
        <ActionFooter
          item={item}
          isLoading={isLoading}
          loadingAction={loadingAction}
          onRestore={handleRestore}
          onDelete={handleDelete}
          onClose={onClose}
        />
      </Box>
    </UnifiedDialog>
  );
};
import React from 'react';
import { Button, Text } from '@primer/react';
import {
  ProjectIcon,
  ColumnsIcon,
  TasklistIcon,
  HistoryIcon,
  TrashIcon,
  ClockIcon
} from '@primer/octicons-react';
import UnifiedDialog from '../../shared/Dialog/UnifiedDialog';
import type { RecycleBinItemWithMeta } from '../../../types/recycleBin';

interface RecycleBinItemDetailDialogProps {
  item: RecycleBinItemWithMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: RecycleBinItemWithMeta) => void;
  onDelete: (item: RecycleBinItemWithMeta) => void;
}

/**
 * ゴミ箱アイテムの詳細表示ダイアログコンポーネント
 */
export const RecycleBinItemDetailDialog: React.FC<RecycleBinItemDetailDialogProps> = ({
  item,
  isOpen,
  onClose,
  onRestore,
  onDelete,
}) => {
  if (!item) {return null;}

  const itemTypeText = item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク';
  const ItemIcon = item.type === 'board' ? ProjectIcon : item.type === 'column' ? ColumnsIcon : TasklistIcon;
  const bgColor = item.type === 'board' ? "attention.subtle" : item.type === 'column' ? "success.subtle" : "accent.subtle";

  const handleRestore = () => {
    onRestore(item);
    onClose();
  };

  const handleDelete = () => {
    onClose();
    onDelete(item);
  };

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${itemTypeText}詳細`}
      variant="modal"
      size="large"
    >
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* タイトル */}
        <div>
          <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>タイトル</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ItemIcon size={20} />
            <Text sx={{ fontSize: 2, fontWeight: 'semibold' }}>{item.title}</Text>
            <Text
              sx={{
                fontSize: 0,
                color: "fg.default",
                px: 2,
                py: 1,
                bg: bgColor,
                borderRadius: 1,
              }}
            >
              {itemTypeText}
            </Text>
          </div>
        </div>

        {/* 説明文（タスクの場合） */}
        {item.description && item.type === 'task' && (
          <div>
            <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>説明</Text>
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.default',
                p: 2,
                bg: 'canvas.subtle',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'border.default'
              }}
            >
              {item.description.replace(/<[^>]*>/g, "")}
            </Text>
          </div>
        )}

        {/* 元の場所・詳細情報 */}
        <div>
          <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>詳細情報</Text>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px',
            background: 'var(--bgColor-muted)',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: 'var(--borderColor-default)'
          }}>
            {item.type === 'task' ? (
              <>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>所属ボード</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.boardTitle}</Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>所属カラム</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.columnTitle}</Text>
                </div>
              </>
            ) : item.type === 'column' ? (
              <>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>所属ボード</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.boardTitle}</Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>タスク数</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.taskCount}個</Text>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>カラム数</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.columnsCount}個</Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>タスク数</Text>
                  <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{item.taskCount}個</Text>
                </div>
              </>
            )}
            <div>
              <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>削除日時</Text>
              <Text sx={{ fontSize: 1 }}>
                {new Date(item.deletedAt || "").toLocaleString("ja-JP")}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>削除予定</Text>
              {item.timeUntilDeletion ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ClockIcon size={16} />
                  <Text sx={{ fontSize: 1 }}>{item.timeUntilDeletion}</Text>
                </div>
              ) : (
                <Text sx={{ fontSize: 1, color: 'fg.muted' }}>自動削除なし</Text>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          borderTop: '1px solid',
          borderColor: 'var(--borderColor-default)',
          paddingTop: '16px'
        }}>
          <Button onClick={onClose}>閉じる</Button>
          <Button
            variant="primary"
            leadingVisual={HistoryIcon}
            onClick={handleRestore}
          >
            復元
          </Button>
          <Button
            variant="danger"
            leadingVisual={TrashIcon}
            onClick={handleDelete}
          >
            完全に削除
          </Button>
        </div>
      </div>
    </UnifiedDialog>
  );
};
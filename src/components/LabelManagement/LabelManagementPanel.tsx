import React, { useState, useCallback } from 'react';
import { Button, Heading, Text } from '@primer/react';
import { PlusIcon } from '@primer/octicons-react';

import LabelFormDialog from './LabelFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import InlineMessage from '../shared/InlineMessage';
import { EmptyState, SortableHeader, LabelTableRow } from './components';
import { useLabelSort, useLabelDialogs, useLabelData } from './hooks';

interface LabelManagementPanelProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

interface InlineMessageData {
  type: 'success' | 'danger' | 'warning' | 'info';
  text: string;
}

const LabelManagementPanel: React.FC<LabelManagementPanelProps> = ({ onMessage: _onMessage }) => {
  console.log('🚀 LabelManagementPanel: Component mounted');
  const { sortField, sortDirection, handleSort } = useLabelSort();
  const { allLabelsWithInfo } = useLabelData(sortField, sortDirection);

  // InlineMessage管理
  const [inlineMessage, setInlineMessage] = useState<InlineMessageData | null>(null);

  // メッセージ表示とクリア
  const showInlineMessage = useCallback((message: InlineMessageData) => {
    console.log('🎯 showInlineMessage called with:', message);
    setInlineMessage(message);
    console.log('🎯 setInlineMessage called');
    // 3秒後に自動クリア
    setTimeout(() => {
      console.log('🎯 Clearing InlineMessage');
      setInlineMessage(null);
    }, 3000);
  }, []);

  // メッセージコールバック
  const handleMessage = useCallback((message: { type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; text: string } | null) => {
    console.log('📨 handleMessage called with:', message);
    // nullチェックを追加してランタイムエラーを防ぐ
    if (!message) {
      console.log('📨 handleMessage: message is null, returning');
      return;
    }

    // InlineMessageで表示
    if (message.type === 'success' || message.type === 'danger' || message.type === 'warning' || message.type === 'info') {
      console.log('📨 handleMessage: message type matches, calling showInlineMessage');
      showInlineMessage({
        type: message.type,
        text: message.text
      });
    } else {
      console.log('📨 handleMessage: message type does not match:', message.type);
    }

    // DialogFlashMessageは無効化（InlineMessageを使用）
    // if (onMessage) {
    //   onMessage(message);
    // }
  }, [showInlineMessage]);

  console.log('🔌 LabelManagementPanel: About to call useLabelDialogs with handleMessage:', handleMessage);
  const {
    editDialog,
    deleteDialog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSave,
    handleConfirmDelete
  } = useLabelDialogs(handleMessage);
  console.log('✅ LabelManagementPanel: useLabelDialogs returned successfully');

  console.log('🎨 LabelManagementPanel: About to render with inlineMessage:', inlineMessage);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: "16px" }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>
            ラベル管理
          </Heading>
        </div>
        <Button
          variant="primary"
          leadingVisual={PlusIcon}
          onClick={handleCreate}
          size="small"
        >
          ラベルを作成
        </Button>
      </div>

      {/* InlineMessage */}
      {inlineMessage && (
        <InlineMessage
          variant={inlineMessage.type === 'success' ? 'success' : inlineMessage.type === 'danger' ? 'error' : inlineMessage.type === 'warning' ? 'warning' : 'info'}
          message={inlineMessage.text}
        />
      )}

      {/* ラベル一覧 */}
      {allLabelsWithInfo.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          border: '1px solid',
          borderColor: 'var(--borderColor-default)',
          borderRadius: "var(--borderRadius-medium)",
          overflow: 'hidden'
        }}>
          {/* テーブルヘッダー */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px 60px 50px',
            gap: "8px",
            padding: "8px",
            background: 'var(--bgColor-muted)',
            borderBottom: '1px solid',
            borderColor: 'var(--borderColor-default)',
            fontSize: "14px",
            fontWeight: 'bold',
            color: 'var(--fgColor-muted)'
          }}>
            <SortableHeader
              field="name"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              ラベル
            </SortableHeader>
            <SortableHeader
              field="boardName"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              所属ボード
            </SortableHeader>
            <SortableHeader
              field="usageCount"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              使用数
            </SortableHeader>
            <Text sx={{ textAlign: 'center', fontSize: 0 }}>操作</Text>
          </div>

          {/* テーブルボディ */}
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {allLabelsWithInfo.map((label, index) => (
              <LabelTableRow
                key={label.id}
                label={label}
                index={index}
                totalCount={allLabelsWithInfo.length}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* フォームダイアログ */}
      <LabelFormDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSave}
        label={editDialog.label}
        mode={editDialog.mode}
        enableBoardSelection
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="ラベルの削除"
        message={
          deleteDialog.label
            ? `ラベル「${deleteDialog.label.name}」を全ボードから削除しますか？この操作は元に戻せません。${('usageCount' in deleteDialog.label && typeof deleteDialog.label.usageCount === 'number' && deleteDialog.label.usageCount > 0) ? `\n\n${deleteDialog.label.usageCount}個のタスクからも削除されます。` : ''}`
            : ''
        }
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        confirmText="削除"
        cancelText="キャンセル"
        confirmVariant="danger"
      />
    </div>
  );
};

export default LabelManagementPanel;
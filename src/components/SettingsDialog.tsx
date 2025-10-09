import { DatabaseIcon, TagIcon, DownloadIcon, UploadIcon, PlusIcon, TrashIcon, PencilIcon } from '@primer/octicons-react';
import { Box, Button, Text, IconButton, TextInput, FormControl, SplitPageLayout, NavList } from '@primer/react';
import React, { useState, useCallback } from 'react';

import { useLabel } from '../contexts/LabelContext';
import type { Label } from '../types';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import ColorSelector from './ColorSelector';
import LabelChip from './LabelChip';
import { LabelManagementPanel } from './LabelManagement';
import { DataManagementPanel } from './DataManagement';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
  onExportBoard?: () => void;
}

interface LabelFormData {
  name: string;
  color: string;
}

// フィーチャーフラグ - 新しいラベル管理UIの使用
const USE_NEW_LABEL_MANAGEMENT = true;

// フィーチャーフラグ - 新しいデータ管理UIの使用
const USE_NEW_DATA_MANAGEMENT = true;

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onExportData,
  onExportBoard
}) => {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabel();
  const [activeTab, setActiveTab] = useState<'labels' | 'data'>('labels');
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: '#0969da'
  });

  const handleReset = useCallback(() => {
    setFormData({ name: '', color: '#0969da' });
    setEditingLabel(null);
    setIsCreating(false);
  }, []);

  const handleStartCreate = useCallback(() => {
    handleReset();
    setIsCreating(true);
  }, [handleReset]);

  const handleStartEdit = useCallback((label: Label) => {
    setFormData({ name: label.name, color: label.color });
    setEditingLabel(label);
    setIsCreating(false);
  }, []);

  const handleSaveLabel = useCallback(() => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingLabel) {
      updateLabel(editingLabel.id, {
        name: formData.name.trim(),
        color: formData.color
      });
    } else {
      createLabel(formData.name.trim(), formData.color);
    }

    handleReset();
  }, [formData, editingLabel, createLabel, updateLabel, handleReset]);

  const handleDeleteLabel = useCallback((labelId: string) => {
    deleteLabel(labelId);
  }, [deleteLabel]);


  const renderLabelsTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ラベル作成・編集フォーム */}
      <Box sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        bg: 'canvas.subtle'
      }}>
        <Text sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}>
          {editingLabel ? 'ラベルを編集' : 'ラベルを作成'}
        </Text>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormControl.Label>ラベル名</FormControl.Label>
            <TextInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ラベル名を入力"
              sx={{ width: '100%' }}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>色</FormControl.Label>
            <ColorSelector
              selectedColor={formData.color}
              onColorSelect={(color: string) => setFormData(prev => ({ ...prev, color }))}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {(isCreating || editingLabel) && (
              <Button variant="default" onClick={handleReset}>
                キャンセル
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSaveLabel}
              disabled={!formData.name.trim()}
            >
              {editingLabel ? '更新' : '作成'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ラベル一覧 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Text sx={{ fontWeight: 'bold' }}>ラベル一覧</Text>
        {!isCreating && !editingLabel && (
          <Button
            variant="default"
            size="small"
            leadingVisual={PlusIcon}
            onClick={handleStartCreate}
          >
            新規作成
          </Button>
        )}
      </Box>

      {labels.length === 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 4,
          color: 'fg.muted',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2
        }}>
          <Text>ラベルがありません</Text>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {labels.map((label) => (
            <Box
              key={label.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 2,
                '&:hover': {
                  bg: 'canvas.subtle'
                }
              }}
            >
              <LabelChip label={label} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  icon={PencilIcon}
                  aria-label="編集"
                  size="small"
                  variant="invisible"
                  onClick={() => handleStartEdit(label)}
                />
                <IconButton
                  icon={TrashIcon}
                  aria-label="削除"
                  size="small"
                  variant="invisible"
                  onClick={() => handleDeleteLabel(label.id)}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderDataTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Text sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}>
          データのエクスポート
        </Text>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="default"
            leadingVisual={DownloadIcon}
            onClick={onExportData}
            sx={{ justifyContent: 'flex-start' }}
          >
            全データをエクスポート
          </Button>
          <Button
            variant="default"
            leadingVisual={DownloadIcon}
            onClick={onExportBoard}
            sx={{ justifyContent: 'flex-start' }}
          >
            現在のプロジェクトをエクスポート
          </Button>
        </Box>
      </Box>

      <Box>
        <Text sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}>
          データのインポート
        </Text>
        <Button
          variant="default"
          leadingVisual={UploadIcon}
          onClick={() => {/* 新しいDataManagementPanelで処理 */}}
          sx={{ justifyContent: 'flex-start' }}
          disabled
        >
          データをインポート（設定で利用可能）
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <UnifiedDialog
        isOpen={isOpen}
        onClose={onClose}
        title="設定"
        variant="modal"
        size="xl"
      >
        <Box sx={{ height: '500px' }}>
          <SplitPageLayout>
            {/* サイドバー（ナビゲーション） */}
            <SplitPageLayout.Pane
              position="start"
              width={{ min: '150px', max: '150px', default: '150px' }}
              padding="none"
              divider="none"
              sx={{ height: '100%' }}
            >
              <NavList>
                <NavList.Item
                  aria-current={activeTab === 'labels' ? 'page' : undefined}
                  onClick={() => setActiveTab('labels')}
                >
                  <NavList.LeadingVisual>
                    <TagIcon />
                  </NavList.LeadingVisual>
                  ラベル管理
                </NavList.Item>
                <NavList.Item
                  aria-current={activeTab === 'data' ? 'page' : undefined}
                  onClick={() => setActiveTab('data')}
                >
                  <NavList.LeadingVisual>
                    <DatabaseIcon />
                  </NavList.LeadingVisual>
                  データ管理
                </NavList.Item>
              </NavList>
            </SplitPageLayout.Pane>

            {/* メインコンテンツエリア */}
            <SplitPageLayout.Content>
              <Box sx={{ height: '100%', overflow: 'auto' }}>
                {activeTab === 'labels' ? (
                  USE_NEW_LABEL_MANAGEMENT ? (
                    <LabelManagementPanel />
                  ) : (
                    renderLabelsTab()
                  )
                ) : (
                  USE_NEW_DATA_MANAGEMENT ? (
                    <DataManagementPanel
                      onExportAll={onExportData}
                      onExportCurrent={onExportBoard}
                    />
                  ) : (
                    renderDataTab()
                  )
                )}
              </Box>
            </SplitPageLayout.Content>
          </SplitPageLayout>
        </Box>
      </UnifiedDialog>

    </>
  );
};

export default SettingsDialog;

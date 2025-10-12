import React from 'react';
import { Button, Heading, Text } from '@primer/react';
import { PlusIcon } from '@primer/octicons-react';

import type { TemplateFormData, TaskTemplate } from '../../types/template';
import TemplateFormDialog from './TemplateFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import TemplateSearchFilter from './TemplateSearchFilter';
import TemplateTable from './TemplateTable';

// カスタムフック
import { useTemplateManagement } from '../../hooks/useTemplateManagement';
import { useTemplateFiltering } from '../../hooks/useTemplateFiltering';
import { useTemplateDialogs } from '../../hooks/useTemplateDialogs';


/**
 * テンプレート管理パネル
 * テンプレートの一覧表示、作成、編集、削除を行うパネル
 */
const TemplateManagementPanel: React.FC = () => {
  // カスタムフック
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite
  } = useTemplateManagement();

  const {
    searchQuery,
    filterCategory,
    filterFavorite,
    sortField,
    sortDirection,
    filteredTemplates,
    setSearchQuery,
    setFilterCategory,
    setFilterFavorite,
    handleSort,
    clearFilters
  } = useTemplateFiltering(templates);

  const {
    editDialog,
    deleteDialog,
    openCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog
  } = useTemplateDialogs();

  // 保存ハンドラー
  const handleSave = async (data: TemplateFormData) => {
    let success = false;

    if (editDialog.mode === 'create') {
      success = await createTemplate(data) !== null;
    } else if (editDialog.template) {
      success = await updateTemplate(editDialog.template.id, data) !== null;
    }

    if (success) {
      closeEditDialog();
    }
  };

  // 削除確認ハンドラー
  const handleConfirmDelete = async () => {
    if (deleteDialog.template) {
      const success = await deleteTemplate(deleteDialog.template.id);
      if (success) {
        closeDeleteDialog();
      }
    }
  };

  // アクティブなフィルターの有無
  const hasActiveFilters = searchQuery.trim() !== '' || filterCategory !== 'all' || filterFavorite;

  // お気に入りトグルハンドラー（型適合用ラッパー）
  const handleToggleFavorite = (template: TaskTemplate) => {
    toggleFavorite(template.id);
  };

  // ローディングやエラー状態の表示
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Text sx={{ color: 'fg.muted' }}>テンプレートを読み込み中...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <Text sx={{ color: 'danger.fg', fontSize: 1, fontWeight: 'bold' }}>
          {error}
        </Text>
        <Button variant="default" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "12px" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: "8px",
          flexWrap: 'wrap'
        }}
      >
        <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>テンプレート管理</Heading>
        <Button variant="primary" leadingVisual={PlusIcon} onClick={openCreateDialog} size="small">
          テンプレートを作成
        </Button>
      </div>

      {/* 検索・フィルターエリア */}
      <TemplateSearchFilter
        searchQuery={searchQuery}
        filterCategory={filterCategory}
        filterFavorite={filterFavorite}
        onSearchQueryChange={setSearchQuery}
        onFilterCategoryChange={setFilterCategory}
        onFilterFavoriteChange={setFilterFavorite}
        onClearFilters={clearFilters}
      />

      {/* テンプレート一覧テーブル */}
      <TemplateTable
        templates={filteredTemplates}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onToggleFavorite={handleToggleFavorite}
        hasActiveFilters={hasActiveFilters}
      />

      {/* フォームダイアログ */}
      <TemplateFormDialog
        isOpen={editDialog.isOpen}
        onClose={closeEditDialog}
        onSave={handleSave}
        template={editDialog.template}
        mode={editDialog.mode}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="テンプレートの削除"
        message={
          deleteDialog.template
            ? `テンプレート「${deleteDialog.template.name}」を削除しますか？この操作は元に戻せません。`
            : ''
        }
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
        confirmText="削除"
        cancelText="キャンセル"
        confirmVariant="danger"
      />
    </div>
  );
};

export default TemplateManagementPanel;

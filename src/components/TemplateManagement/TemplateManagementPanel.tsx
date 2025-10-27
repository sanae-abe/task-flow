import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import type { TemplateFormData, TaskTemplate } from '../../types/template';
import type { DialogFlashMessageData } from '../shared/DialogFlashMessage';
import TemplateFormDialog from './TemplateFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import TemplateSearchFilter from './TemplateSearchFilter';
import { TemplateDataTable } from './components/TemplateDataTable';

// カスタムフック
import { useTemplateManagement } from '../../hooks/useTemplateManagement';
import { useTemplateFiltering } from '../../hooks/useTemplateFiltering';
import { useTemplateDialogs } from '../../hooks/useTemplateDialogs';

interface TemplateManagementPanelProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

/**
 * テンプレート管理パネル
 * テンプレートの一覧表示、作成、編集、削除を行うパネル
 */
const TemplateManagementPanel: React.FC<TemplateManagementPanelProps> = ({ onMessage }) => {
  // カスタムフック
  const {
    templates,
    loading,
    _error,
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
    let template: TaskTemplate | null = null;

    if (editDialog.mode === 'create') {
      template = await createTemplate(data);
      success = template !== null;
      if (success && template) {
        onMessage?.({ type: 'success', text: `テンプレート「${template.name}」を作成しました` });
      } else {
        onMessage?.({ type: 'danger', text: 'テンプレートの作成に失敗しました' });
      }
    } else if (editDialog.template) {
      template = await updateTemplate(editDialog.template.id, data);
      success = template !== null;
      if (success && template) {
        onMessage?.({ type: 'success', text: `テンプレート「${template.name}」を更新しました` });
      } else {
        onMessage?.({ type: 'danger', text: 'テンプレートの更新に失敗しました' });
      }
    }

    if (success) {
      closeEditDialog();
    }
  };

  // 削除確認ハンドラー
  const handleConfirmDelete = async () => {
    if (deleteDialog.template) {
      const templateName = deleteDialog.template.name;
      const success = await deleteTemplate(deleteDialog.template.id);
      if (success) {
        onMessage?.({ type: 'success', text: `テンプレート「${templateName}」を削除しました` });
        closeDeleteDialog();
      } else {
        onMessage?.({ type: 'danger', text: 'テンプレートの削除に失敗しました' });
      }
    }
  };

  // お気に入りトグルハンドラー（型適合用ラッパー）
  const handleToggleFavorite = async (template: TaskTemplate) => {
    const newFavoriteState = await toggleFavorite(template.id);
    const action = newFavoriteState ? 'お気に入りに追加' : 'お気に入りから削除';
    onMessage?.({ type: 'success', text: `テンプレート「${template.name}」を${action}しました` });
  };

  // アクティブなフィルターの有無
  const hasActiveFilters = searchQuery.trim() !== '' || filterCategory !== 'all' || filterFavorite;

  // ローディングやエラー状態の表示
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-gray-600">テンプレートを読み込み中...</p>
      </div>
    );
  }

  if (_error) {
    return (
      <div className="text-center p-6">
        <p className="text-destructive text-sm font-bold">
          {_error}
        </p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold">テンプレート管理</h2>
        <Button variant="default" size="sm" onClick={openCreateDialog}>
          <Plus size={16} className="mr-2" />
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
      <TemplateDataTable
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
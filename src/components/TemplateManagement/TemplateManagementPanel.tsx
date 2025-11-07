import React from 'react';
import { useTranslation } from 'react-i18next';
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
const TemplateManagementPanel: React.FC<TemplateManagementPanelProps> = ({
  onMessage,
}) => {
  const { t } = useTranslation();

  // カスタムフック
  const {
    templates,
    loading,
    _error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
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
    clearFilters,
  } = useTemplateFiltering(templates);

  const {
    editDialog,
    deleteDialog,
    openCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useTemplateDialogs();

  // 保存ハンドラー
  const handleSave = async (data: TemplateFormData) => {
    let success = false;
    let template: TaskTemplate | null = null;

    if (editDialog.mode === 'create') {
      template = await createTemplate(data);
      success = template !== null;
      if (success && template) {
        onMessage?.({
          type: 'success',
          text: t('template.management.createSuccess', { name: template.name }),
        });
      } else {
        onMessage?.({
          type: 'danger',
          text: t('template.management.createError'),
        });
      }
    } else if (editDialog.template) {
      template = await updateTemplate(editDialog.template.id, data);
      success = template !== null;
      if (success && template) {
        onMessage?.({
          type: 'success',
          text: t('template.management.updateSuccess', { name: template.name }),
        });
      } else {
        onMessage?.({
          type: 'danger',
          text: t('template.management.updateError'),
        });
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
        onMessage?.({
          type: 'success',
          text: t('template.management.deleteSuccess', { name: templateName }),
        });
        closeDeleteDialog();
      } else {
        onMessage?.({
          type: 'danger',
          text: t('template.management.deleteError'),
        });
      }
    }
  };

  // お気に入りトグルハンドラー（型適合用ラッパー）
  const handleToggleFavorite = async (template: TaskTemplate) => {
    const newFavoriteState = await toggleFavorite(template.id);
    const messageKey = newFavoriteState
      ? 'template.management.favoriteAdded'
      : 'template.management.favoriteRemoved';
    onMessage?.({
      type: 'success',
      text: t(messageKey, { name: template.name }),
    });
  };

  // アクティブなフィルターの有無
  const hasActiveFilters =
    searchQuery.trim() !== '' || filterCategory !== 'all' || filterFavorite;

  // ローディングやエラー状態の表示
  if (loading) {
    return (
      <div className='flex justify-center p-6'>
        <p className='text-muted-foreground'>
          {t('template.management.loading')}
        </p>
      </div>
    );
  }

  if (_error) {
    return (
      <div className='text-center p-6'>
        <p className='text-destructive text-sm font-bold'>{_error}</p>
        <Button
          variant='outline'
          className='mt-2'
          onClick={() => window.location.reload()}
        >
          {t('common.reload')}
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* ヘッダー */}
      <div className='flex items-center justify-between gap-2 flex-wrap'>
        <h2 className='text-lg font-bold'>{t('template.management.title')}</h2>
        <Button variant='default' size='sm' onClick={openCreateDialog}>
          <Plus size={16} className='mr-2' />
          {t('template.createTemplate')}
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
        title={t('template.management.deleteConfirmTitle')}
        message={
          deleteDialog.template
            ? t('template.management.deleteConfirmMessage', {
                name: deleteDialog.template.name,
              })
            : ''
        }
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant='danger'
      />
    </div>
  );
};

export default TemplateManagementPanel;

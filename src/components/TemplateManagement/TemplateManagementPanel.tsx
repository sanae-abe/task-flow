import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Box, Heading, Text, IconButton, TextInput, Select } from '@primer/react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  StarIcon,
  StarFillIcon,
  SearchIcon
} from '@primer/octicons-react';

import type {
  TaskTemplate,
  TemplateFormData,
  TemplateSortField,
  TemplateSortDirection,
  TemplateCategory
} from '../../types/template';
import TemplateFormDialog from './TemplateFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';
import { TemplateStorage } from '../../utils/templateStorage';

/**
 * ソート可能なヘッダーコンポーネント
 */
interface SortableHeaderProps {
  field: TemplateSortField;
  currentSortField: TemplateSortField;
  sortDirection: TemplateSortDirection;
  onSort: (field: TemplateSortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'center';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  align = 'left'
}) => {
  const isActive = currentSortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        width: '100%',
        padding: 0,
        color: 'var(--fgColor-muted)',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'inherit'
      }}
      aria-label={`${children}でソート`}
    >
      <span>{children}</span>
      <span style={{ opacity: isActive ? 1 : 0.3, fontSize: '10px' }}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </span>
    </button>
  );
};

/**
 * テンプレート管理パネル
 * テンプレートの一覧表示、作成、編集、削除を行うパネル
 */
const TemplateManagementPanel: React.FC = () => {
  // LocalStorageからテンプレートを読み込み
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  // テンプレートをLocalStorageから読み込み
  useEffect(() => {
    try {
      const loadedTemplates = TemplateStorage.load();
      setTemplates(loadedTemplates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load templates:', error);
      setTemplates([]);
    }
  }, []);

  // ソート状態
  const [sortField, setSortField] = useState<TemplateSortField>('favorite');
  const [sortDirection, setSortDirection] = useState<TemplateSortDirection>('asc');

  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');
  const [filterFavorite, setFilterFavorite] = useState(false);

  // ダイアログ状態
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    template: TaskTemplate | null;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    template: null,
    mode: 'create'
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    template: TaskTemplate | null;
  }>({
    isOpen: false,
    template: null
  });

  // ソートハンドラー
  const handleSort = useCallback(
    (field: TemplateSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // フィルタリング・ソートされたテンプレート
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = [...templates];

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.taskTitle.toLowerCase().includes(query)
      );
    }

    // カテゴリーフィルター
    if (filterCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === filterCategory);
    }

    // お気に入りフィルター
    if (filterFavorite) {
      filtered = filtered.filter((template) => template.isFavorite);
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category': {
          const catA =
            TEMPLATE_CATEGORIES.find((cat) => cat.id === a.category)?.label || a.category;
          const catB =
            TEMPLATE_CATEGORIES.find((cat) => cat.id === b.category)?.label || b.category;
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'favorite':
          // お気に入り優先ソート: お気に入り → 使用回数順
          if (a.isFavorite && !b.isFavorite) {
            comparison = -1;
          } else if (!a.isFavorite && b.isFavorite) {
            comparison = 1;
          } else {
            comparison = b.usageCount - a.usageCount; // 使用回数の多い順
          }
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [templates, searchQuery, filterCategory, filterFavorite, sortField, sortDirection]);

  // テンプレート作成
  const handleCreate = useCallback(() => {
    setEditDialog({
      isOpen: true,
      template: null,
      mode: 'create'
    });
  }, []);

  // テンプレート編集
  const handleEdit = useCallback((template: TaskTemplate) => {
    setEditDialog({
      isOpen: true,
      template,
      mode: 'edit'
    });
  }, []);

  // テンプレート削除
  const handleDelete = useCallback((template: TaskTemplate) => {
    setDeleteDialog({
      isOpen: true,
      template
    });
  }, []);

  // お気に入りトグル
  const handleToggleFavorite = useCallback((template: TaskTemplate) => {
    try {
      const newFavoriteState = TemplateStorage.toggleFavorite(template.id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, isFavorite: newFavoriteState } : t))
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle favorite:', error);
      // エラーハンドリング - 必要に応じて通知を表示
    }
  }, []);

  // ダイアログを閉じる
  const handleCloseEditDialog = useCallback(() => {
    setEditDialog({
      isOpen: false,
      template: null,
      mode: 'create'
    });
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      template: null
    });
  }, []);

  // テンプレート保存
  const handleSave = useCallback(
    (data: TemplateFormData) => {
      try {
        if (editDialog.mode === 'create') {
          const newTemplate = TemplateStorage.create(data);
          setTemplates((prev) => [...prev, newTemplate]);
        } else if (editDialog.template) {
          const updatedTemplate = TemplateStorage.update(editDialog.template.id, data);
          if (updatedTemplate) {
            setTemplates((prev) =>
              prev.map((t) => (t.id === editDialog.template?.id ? updatedTemplate : t))
            );
          }
        }
        handleCloseEditDialog();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to save template:', error);
        // エラーハンドリング - 必要に応じて通知を表示
      }
    },
    [editDialog.mode, editDialog.template, handleCloseEditDialog]
  );

  // テンプレート削除確認
  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.template) {
      try {
        const success = TemplateStorage.delete(deleteDialog.template.id);
        if (success) {
          setTemplates((prev) => prev.filter((t) => t.id !== deleteDialog.template?.id));
        }
        handleCloseDeleteDialog();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete template:', error);
        // エラーハンドリング - 必要に応じて通知を表示
      }
    }
  }, [deleteDialog.template, handleCloseDeleteDialog]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>テンプレート管理</Heading>
        <Button variant="primary" leadingVisual={PlusIcon} onClick={handleCreate} size="small">
          テンプレートを作成
        </Button>
      </Box>


      {/* 検索・フィルターエリア */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          p: 3,
          bg: 'canvas.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        }}
      >
        {/* 検索 */}
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <TextInput
            leadingVisual={SearchIcon}
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* カテゴリーフィルター */}
        <Box>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TemplateCategory | 'all')}
          >
            <Select.Option value="all">すべてのカテゴリー</Select.Option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.label}
              </Select.Option>
            ))}
          </Select>
        </Box>

        {/* お気に入りフィルター */}
        <Button
          variant={filterFavorite ? 'primary' : 'default'}
          leadingVisual={filterFavorite ? StarFillIcon : StarIcon}
          onClick={() => setFilterFavorite(!filterFavorite)}
        >
          お気に入り
        </Button>
      </Box>

      {/* テンプレート一覧 */}
      {filteredAndSortedTemplates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            border: '1px dashed',
            borderColor: 'border.muted',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text sx={{ color: 'fg.muted' }}>
            {searchQuery || filterCategory !== 'all' || filterFavorite
              ? '条件に一致するテンプレートが見つかりません'
              : 'まだテンプレートがありません'}
          </Text>
        </Box>
      ) : (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* テーブルヘッダー */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 80px 100px',
              gap: 2,
              p: 2,
              bg: 'canvas.subtle',
              borderBottom: '1px solid',
              borderColor: 'border.default',
              fontSize: 1,
              fontWeight: 'bold',
              color: 'fg.muted'
            }}
          >
            <SortableHeader
              field="favorite"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              ⭐ おすすめ順
            </SortableHeader>
            <SortableHeader
              field="category"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              カテゴリー
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
          </Box>

          {/* テーブルボディ */}
          <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
            {filteredAndSortedTemplates.map((template, index) => {
              const categoryInfo = TEMPLATE_CATEGORIES.find(
                (cat) => cat.id === template.category
              );

              return (
                <Box
                  key={template.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 80px 100px',
                    gap: 2,
                    p: 2,
                    alignItems: 'center',
                    borderBottom:
                      index < filteredAndSortedTemplates.length - 1 ? '1px solid' : 'none',
                    borderColor: 'border.muted',
                    '&:hover': {
                      bg: 'canvas.subtle',
                      '& .template-actions': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {/* テンプレート名 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {template.isFavorite && (
                        <Box sx={{ color: 'attention.fg' }}>
                          <StarFillIcon size={14} />
                        </Box>
                      )}
                      <Text sx={{ fontWeight: 'semibold', fontSize: 1 }}>{template.name}</Text>
                    </Box>
                    {template.description && (
                      <Text
                        sx={{
                          fontSize: 0,
                          color: 'fg.muted',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {template.description}
                      </Text>
                    )}
                  </Box>

                  {/* カテゴリー */}
                  <Box>
                    <Text
                      sx={{
                        fontSize: 0,
                        color: 'fg.muted',
                        px: 2,
                        py: 1,
                        bg: 'neutral.muted',
                        borderRadius: 2,
                        display: 'inline-block'
                      }}
                    >
                      {categoryInfo?.label || template.category}
                    </Text>
                  </Box>

                  {/* 使用数 */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Text
                      sx={{
                        fontSize: 1,
                        fontWeight: template.usageCount > 0 ? 'bold' : 'normal',
                        color: template.usageCount > 0 ? 'fg.default' : 'fg.muted'
                      }}
                    >
                      {template.usageCount}
                    </Text>
                  </Box>

                  {/* アクションボタン */}
                  <Box
                    className="template-actions"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1,
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <IconButton
                      icon={template.isFavorite ? StarFillIcon : StarIcon}
                      aria-label={
                        template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'
                      }
                      size="small"
                      variant="invisible"
                      onClick={() => handleToggleFavorite(template)}
                      sx={{
                        color: template.isFavorite ? 'attention.fg' : 'fg.muted'
                      }}
                    />
                    <IconButton
                      icon={PencilIcon}
                      aria-label={`テンプレート「${template.name}」を編集`}
                      size="small"
                      variant="invisible"
                      onClick={() => handleEdit(template)}
                    />
                    <IconButton
                      icon={TrashIcon}
                      aria-label={`テンプレート「${template.name}」を削除`}
                      size="small"
                      variant="invisible"
                      onClick={() => handleDelete(template)}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* フォームダイアログ */}
      <TemplateFormDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
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
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        confirmText="削除"
        cancelText="キャンセル"
        confirmVariant="danger"
      />
    </Box>
  );
};

export default TemplateManagementPanel;

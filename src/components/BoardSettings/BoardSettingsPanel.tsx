import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Button,
  TextInput,
  Flash
} from '@primer/react';
import { PlusIcon, TrashIcon, GrabberIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon } from '@primer/octicons-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DefaultColumnConfig } from '../../types/settings';
import { loadSettings, updateDefaultColumns } from '../../utils/settingsStorage';
import { useNotify } from '../../contexts/NotificationContext';
import { v4 as uuidv4 } from 'uuid';

// デバウンス機能
const useDebounce = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: T) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Sortable Column Item コンポーネント
interface SortableColumnItemProps {
  column: DefaultColumnConfig;
  index: number;
  totalColumns: number;
  onUpdateName: (columnId: string, newName: string) => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
  onDeleteColumn: (columnId: string) => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  totalColumns,
  onUpdateName,
  onMoveColumn,
  onDeleteColumn,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [localName, setLocalName] = useState(column.name);

  // カラム名が外部から変更された場合の同期
  useEffect(() => {
    setLocalName(column.name);
  }, [column.name]);

  const handleNameChange = useDebounce((newName: string) => {
    onUpdateName(column.id, newName);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalName(newValue);
    handleNameChange(newValue);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: isDragging ? 'accent.emphasis' : 'border.default',
        borderRadius: 2,
        backgroundColor: isDragging ? 'canvas.inset' : 'canvas.subtle',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <GrabberIcon size={16} />
      </Box>
      <div style={{ flex: 1 }}>
        <TextInput
          value={localName}
          onChange={handleInputChange}
          placeholder="カラム名"
          sx={{ width: '100%' }}
          aria-label={`カラム「${column.name}」の名前`}
        />
      </div>
      <div style={{ display: 'flex', gap: "4px" }}>
        <Button
          variant="invisible"
          size="small"
          leadingVisual={ChevronUpIcon}
          onClick={() => onMoveColumn(column.id, 'up')}
          disabled={index === 0}
          aria-label={`${column.name}を上に移動`}
          sx={{ px: 2 }}
        />
        <Button
          variant="invisible"
          size="small"
          leadingVisual={ChevronDownIcon}
          onClick={() => onMoveColumn(column.id, 'down')}
          disabled={index === totalColumns - 1}
          aria-label={`${column.name}を下に移動`}
          sx={{ px: 2 }}
        />
        <Button
          variant="invisible"
          size="small"
          leadingVisual={TrashIcon}
          onClick={() => onDeleteColumn(column.id)}
          disabled={totalColumns <= 1}
          aria-label={`${column.name}を削除`}
          sx={{ color: 'danger.fg' }}
        />
      </div>
    </Box>
  );
};

export const BoardSettingsPanel: React.FC = () => {
  const [columns, setColumns] = useState<DefaultColumnConfig[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const notify = useNotify();

  // ドラッグ&ドロップ用のsensors設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // カラムIDの配列を取得（memoized）
  const columnIds = useMemo(() => columns.map(col => col.id), [columns]);

  // 設定読み込み
  useEffect(() => {
    try {
      const settings = loadSettings();
      setColumns(settings.defaultColumns);
    } catch (error) {
      notify.error('設定の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  // 自動保存機能
  useEffect(() => {
    if (!isLoading && hasUnsavedChanges && columns.length > 0) {
      const saveTimer = setTimeout(() => {
        try {
          updateDefaultColumns(columns);
          setHasUnsavedChanges(false);
          notify.success('設定を自動保存しました');
        } catch (error) {
          notify.error('自動保存に失敗しました');
        }
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
    return undefined;
  }, [columns, isLoading, hasUnsavedChanges, notify]);

  // ドラッグ終了ハンドラー
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newColumns = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newColumns;
      });
    }
  }, []);

  // 設定保存
  const handleSave = useCallback(async () => {
    if (columns.length === 0) {
      notify.error('最低1つのカラムが必要です');
      return;
    }

    try {
      updateDefaultColumns(columns);
      setHasUnsavedChanges(false);
      notify.success('デフォルトカラム設定を保存しました');
    } catch (error) {
      notify.error('設定の保存に失敗しました');
    }
  }, [columns, notify]);

  // カラム追加
  const handleAddColumn = useCallback(() => {
    if (!newColumnName.trim()) {
      notify.error('カラム名を入力してください');
      return;
    }

    if (columns.some(col => col.name === newColumnName.trim())) {
      notify.error('同じ名前のカラムが既に存在します');
      return;
    }

    const newColumn: DefaultColumnConfig = {
      id: uuidv4(),
      name: newColumnName.trim()
    };

    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setHasUnsavedChanges(true);
  }, [newColumnName, columns, notify]);

  // カラム削除
  const handleDeleteColumn = useCallback((columnId: string) => {
    if (columns.length <= 1) {
      notify.error('最低1つのカラムが必要です');
      return;
    }

    setColumns(prev => prev.filter(col => col.id !== columnId));
    setHasUnsavedChanges(true);
  }, [columns.length, notify]);

  // カラム名更新
  const handleUpdateColumnName = useCallback((columnId: string, newName: string) => {
    if (!newName.trim()) {
      notify.error('カラム名を入力してください');
      return;
    }

    if (columns.some(col => col.id !== columnId && col.name === newName.trim())) {
      notify.error('同じ名前のカラムが既に存在します');
      return;
    }

    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, name: newName.trim() } : col
    ));
    setHasUnsavedChanges(true);
  }, [columns, notify]);

  // カラム順序変更
  const handleMoveColumn = useCallback((columnId: string, direction: 'up' | 'down') => {
    setColumns(prev => {
      const currentIndex = prev.findIndex(col => col.id === columnId);
      if (currentIndex === -1) {return prev;}

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) {return prev;}

      const newColumns = [...prev];
      const currentColumn = newColumns[currentIndex];
      const targetColumn = newColumns[newIndex];
      if (currentColumn && targetColumn) {
        newColumns[currentIndex] = targetColumn;
        newColumns[newIndex] = currentColumn;
      }
      setHasUnsavedChanges(true);
      return newColumns;
    });
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: "12px" }}>
        <Flash>設定を読み込み中...</Flash>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <Heading sx={{ fontSize: 2, mb: 2 }}>デフォルトカラム設定</Heading>
        <div style={{ color: 'var(--fgColor-muted)', fontSize: "14px" }}>
          新しいボード作成時に使用されるデフォルトカラムを設定できます。<br />
          既存のボードには影響しません。
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>

        {/* 現在のカラム一覧 */}
        <div style={{ marginBottom: "20px" }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
              {columns.map((column, index) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  index={index}
                  totalColumns={columns.length}
                  onUpdateName={handleUpdateColumnName}
                  onMoveColumn={handleMoveColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* 新しいカラム追加 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>新しいカラムを追加</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <TextInput
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="カラム名を入力"
              sx={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddColumn();
                }
              }}
              aria-label="新しいカラム名"
            />
            <Button
              variant="primary"
              size="small"
              leadingVisual={PlusIcon}
              onClick={handleAddColumn}
              aria-label="新しいカラムを追加"
            >
              追加
            </Button>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid", borderColor: "var(--borderColor-default)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          {hasUnsavedChanges && (
            <div style={{ fontSize: "14px", color: "var(--fgColor-attention)" }}>
              未保存の変更があります（1秒後に自動保存されます）
            </div>
          )}
          <Button
            variant="primary"
            leadingVisual={CheckIcon}
            onClick={handleSave}
          >
            設定を保存
          </Button>
        </div>
      </div>
    </div>
  );
};
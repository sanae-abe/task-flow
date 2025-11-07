import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';
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
import {
  loadSettings,
  updateDefaultColumns,
} from '../../utils/settingsStorage';
import { useSonnerNotify } from '../../hooks/useSonnerNotify';
import { v4 as uuidv4 } from 'uuid';
import InlineMessage from '../shared/InlineMessage';
import IconButton from '../shared/IconButton';
import { validateColumnName } from './utils/columnValidation';
import { useMessageHandler } from './hooks/useMessageHandler';

// デバウンス機能
const useDebounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: T) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};

// Sortable Column Item コンポーネント
interface SortableColumnItemProps {
  column: DefaultColumnConfig;
  index: number;
  totalColumns: number;
  onUpdateName: (columnId: string, newName: string) => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
  onDeleteColumn: (columnId: string) => void;
  _error?: string | null;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  totalColumns,
  onUpdateName,
  onMoveColumn,
  onDeleteColumn,
  _error,
}) => {
  const { t } = useTranslation();
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 mb-3 border border-border rounded-lg ${
        isDragging
          ? 'border-primary bg-gray-100 cursor-grabbing'
          : 'border-gray-300 bg-gray-50 cursor-grab'
      }`}
    >
      <div
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...attributes}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...listeners}
        className='flex items-center cursor-grab active:cursor-grabbing'
      >
        <GripVertical size={16} />
      </div>
      <div className='flex flex-col flex-1 gap-1'>
        <Input
          value={localName}
          onChange={handleInputChange}
          placeholder={t('column.columnName')}
          className='w-full'
          aria-label={t('column.columnNameLabel', { name: column.name })}
        />
        {_error && (
          <InlineMessage variant='critical' message={_error} size='small' />
        )}
      </div>
      <div className='flex'>
        <IconButton
          icon={ChevronUp}
          size='icon'
          onClick={() => onMoveColumn(column.id, 'up')}
          disabled={index === 0}
          ariaLabel={t('column.moveUp', { name: column.name })}
        />
        <IconButton
          icon={ChevronDown}
          size='icon'
          onClick={() => onMoveColumn(column.id, 'down')}
          disabled={index === totalColumns - 1}
          ariaLabel={t('column.moveDown', { name: column.name })}
        />
        <IconButton
          size='icon'
          icon={Trash2}
          onClick={() => onDeleteColumn(column.id)}
          disabled={totalColumns <= 1}
          ariaLabel={t('column.deleteColumnLabel', { name: column.name })}
        />
      </div>
    </div>
  );
};

export const BoardSettingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const [columns, setColumns] = useState<DefaultColumnConfig[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [addColumnError, setAddColumnError] = useState<string | null>(null);
  const [columnErrors, setColumnErrors] = useState<Record<string, string>>({});
  const [erroredColumnName, setErroredColumnName] = useState<string>('');
  const notify = useSonnerNotify();

  // メッセージ管理
  const {
    message: saveMessage,
    messageType: saveMessageType,
    showMessage,
  } = useMessageHandler();

  // カラムエラー設定用の関数
  const setColumnError = useCallback(
    (columnId: string, _error: string | null) => {
      setColumnErrors(prev => {
        if (_error === null) {
          const { [columnId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [columnId]: _error };
      });
    },
    []
  );

  // ドラッグ&ドロップ用のsensors設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // カラムIDの配列を取得（memoized）
  const columnIds = useMemo(() => columns.map(col => col.id), [columns]);

  // 設定読み込み（初期化時のみ実行）
  useEffect(() => {
    try {
      const settings = loadSettings();
      setColumns(settings.defaultColumns);
    } catch (_error) {
      notify._error(t('settings.boardSettings.loadError'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初期化時のみ実行。notifyは安定した参照ではないため依存配列から除外

  // 自動保存機能
  useEffect(() => {
    if (!isLoading && hasUnsavedChanges && columns.length > 0) {
      const saveTimer = setTimeout(() => {
        try {
          updateDefaultColumns(columns);
          setHasUnsavedChanges(false);
          showMessage(t('settings.boardSettings.autoSaveSuccess'), 'success');
        } catch (_error) {
          showMessage(t('settings.boardSettings.autoSaveError'), '_error');
        }
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
    return undefined;
  }, [columns, isLoading, hasUnsavedChanges, showMessage, t]);

  // カラム名入力変更時のエラークリア
  useEffect(() => {
    if (addColumnError) {
      const currentTrimmed = newColumnName.trim();
      // 空文字エラーの場合：入力があればクリア
      if (
        addColumnError === t('validation.columnNameRequired') &&
        currentTrimmed
      ) {
        setAddColumnError(null);
        setErroredColumnName('');
      }
      // 重複エラーの場合：エラーが発生した値と異なる値を入力した時のみクリア
      else if (
        addColumnError === t('validation.columnNameDuplicate') &&
        currentTrimmed !== erroredColumnName
      ) {
        setAddColumnError(null);
        setErroredColumnName('');
      }
    }
  }, [newColumnName, addColumnError, erroredColumnName, t]);

  // ドラッグ終了ハンドラー
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newColumns = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newColumns;
      });
    }
  }, []);

  // 設定保存
  const handleSave = useCallback(async () => {
    if (columns.length === 0) {
      showMessage(t('settings.boardSettings.minColumnRequired'), '_error');
      return;
    }

    try {
      updateDefaultColumns(columns);
      setHasUnsavedChanges(false);
      showMessage(t('settings.boardSettings.saveSuccess'), 'success');
    } catch (_error) {
      showMessage(t('settings.boardSettings.saveError'), '_error');
    }
  }, [columns, showMessage, t]);

  // カラム追加
  const handleAddColumn = useCallback(() => {
    const trimmedName = newColumnName.trim();
    const validation = validateColumnName(trimmedName, columns);

    if (!validation.isValid) {
      setAddColumnError(validation.error);
      setErroredColumnName(
        validation.error?.includes('既に存在') ? trimmedName : ''
      );
      return;
    }

    // エラーをクリア
    setAddColumnError(null);
    setErroredColumnName('');

    const newColumn: DefaultColumnConfig = {
      id: uuidv4(),
      name: trimmedName,
    };

    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setHasUnsavedChanges(true);
  }, [newColumnName, columns]);

  // カラム削除
  const handleDeleteColumn = useCallback(
    (columnId: string) => {
      if (columns.length <= 1) {
        notify._error(t('settings.boardSettings.minColumnRequired'));
        return;
      }

      setColumns(prev => prev.filter(col => col.id !== columnId));
      setColumnError(columnId, null); // カラム削除時にエラーもクリア
      setHasUnsavedChanges(true);
    },
    [columns.length, notify, setColumnError, t]
  );

  // カラム名更新
  const handleUpdateColumnName = useCallback(
    (columnId: string, newName: string) => {
      const trimmedName = newName.trim();
      const validation = validateColumnName(trimmedName, columns, columnId);

      if (!validation.isValid) {
        setColumnError(columnId, validation.error);
        return;
      }

      // エラーをクリア
      setColumnError(columnId, null);

      setColumns(prev =>
        prev.map(col =>
          col.id === columnId ? { ...col, name: trimmedName } : col
        )
      );
      setHasUnsavedChanges(true);
    },
    [columns, setColumnError]
  );

  // カラム順序変更
  const handleMoveColumn = useCallback(
    (columnId: string, direction: 'up' | 'down') => {
      setColumns(prev => {
        const currentIndex = prev.findIndex(col => col.id === columnId);
        if (currentIndex === -1) {
          return prev;
        }

        const newIndex =
          direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= prev.length) {
          return prev;
        }

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
    },
    []
  );

  if (isLoading) {
    return (
      <div className='p-3'>
        <div className='bg-blue-50 border border-border border-blue-200 rounded-md p-3 text-blue-800'>
          {t('settings.boardSettings.loadingSettings')}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-lg font-bold mb-2'>
        {t('settings.boardSettings.title')}
      </h2>
      <span className='text-sm text-zinc-700 mb-5 block'>
        {t('settings.boardSettings.description')}
      </span>

      {/* カラム追加フォーム */}
      <div className='mb-4'>
        <div className='flex items-center gap-2 mb-2'>
          <Input
            value={newColumnName}
            onChange={e => setNewColumnName(e.target.value)}
            placeholder={t('column.newColumnPlaceholder')}
            className='flex-1'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddColumn();
              }
            }}
            aria-label={t('column.newColumnPlaceholder')}
          />
          <IconButton
            icon={Plus}
            size='icon'
            ariaLabel={t('column.addColumn')}
            onClick={handleAddColumn}
            disabled={!newColumnName.trim()}
            className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground w-10 h-10'
          />
        </div>
        {addColumnError && (
          <InlineMessage
            variant='critical'
            message={addColumnError}
            size='small'
          />
        )}
      </div>

      {/* カラムリスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnIds}
          strategy={verticalListSortingStrategy}
        >
          {columns.map((column, index) => (
            <SortableColumnItem
              key={column.id}
              column={column}
              index={index}
              totalColumns={columns.length}
              onUpdateName={handleUpdateColumnName}
              onMoveColumn={handleMoveColumn}
              onDeleteColumn={handleDeleteColumn}
              _error={columnErrors[column.id]}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* 保存ボタン */}
      <div className='flex justify-end mt-4'>
        <Button
          variant='default'
          onClick={handleSave}
          disabled={!hasUnsavedChanges || columns.length === 0}
          className='gap-2'
        >
          <Check size={16} />
          {t('common.save')}
        </Button>
      </div>

      {/* メッセージ表示 */}
      {saveMessage && (
        <div className='mb-4 flex justify-end mt-2'>
          <InlineMessage
            variant={saveMessageType === 'success' ? 'success' : 'critical'}
            message={saveMessage}
            size='small'
          />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import InlineMessage from '../shared/InlineMessage';

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

// カラム名正規化関数（大文字小文字・全角半角を統一）
const normalizeColumnName = (name: string): string =>
  name.toLowerCase().replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

// Sortable Column Item コンポーネント
interface SortableColumnItemProps {
  column: DefaultColumnConfig;
  index: number;
  totalColumns: number;
  onUpdateName: (columnId: string, newName: string) => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
  onDeleteColumn: (columnId: string) => void;
  error?: string | null;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  totalColumns,
  onUpdateName,
  onMoveColumn,
  onDeleteColumn,
  error,
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 mb-3 border rounded-lg ${
        isDragging
          ? 'border-blue-600 bg-gray-100 cursor-grabbing'
          : 'border-gray-300 bg-gray-50 cursor-grab'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center cursor-grab active:cursor-grabbing"
      >
        <GrabberIcon size={16} />
      </div>
      <div className="flex-1">
        <Input
          value={localName}
          onChange={handleInputChange}
          placeholder="カラム名"
          className="w-full"
          aria-label={`カラム「${column.name}」の名前`}
        />
        {error && (
          <InlineMessage variant="critical" message={error} size="small" />
        )}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveColumn(column.id, 'up')}
          disabled={index === 0}
          aria-label={`${column.name}を上に移動`}
          className="px-2"
        >
          <ChevronUpIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveColumn(column.id, 'down')}
          disabled={index === totalColumns - 1}
          aria-label={`${column.name}を下に移動`}
          className="px-2"
        >
          <ChevronDownIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteColumn(column.id)}
          disabled={totalColumns <= 1}
          aria-label={`${column.name}を削除`}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon size={16} />
        </Button>
      </div>
    </div>
  );
};

export const BoardSettingsPanel: React.FC = () => {
  const [columns, setColumns] = useState<DefaultColumnConfig[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error' | null>(null);
  const [addColumnError, setAddColumnError] = useState<string | null>(null);
  const [columnErrors, setColumnErrors] = useState<Record<string, string>>({});
  const [erroredColumnName, setErroredColumnName] = useState<string>('');
  const notify = useNotify();
  const messageTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // メッセージ表示用の共通関数
  const showMessage = useCallback((message: string, type: 'success' | 'error') => {
    // 既存のタイマーをクリア
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    setSaveMessage(message);
    setSaveMessageType(type);

    // メッセージを自動消去（成功: 3秒、エラー: 5秒）
    const delay = type === 'success' ? 3000 : 5000;
    messageTimerRef.current = setTimeout(() => {
      setSaveMessage(null);
      setSaveMessageType(null);
    }, delay);
  }, []);

  // カラムエラー設定用の関数
  const setColumnError = useCallback((columnId: string, error: string | null) => {
    setColumnErrors(prev => {
      if (error === null) {
        const { [columnId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [columnId]: error };
    });
  }, []);

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
          showMessage('設定を自動保存しました', 'success');
        } catch (error) {
          showMessage('自動保存に失敗しました', 'error');
        }
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
    return undefined;
  }, [columns, isLoading, hasUnsavedChanges, showMessage]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
  }, []);

  // カラム名入力変更時のエラークリア
  useEffect(() => {
    if (addColumnError) {
      const currentTrimmed = newColumnName.trim();
      // 空文字エラーの場合：入力があればクリア
      if (addColumnError === 'カラム名を入力してください' && currentTrimmed) {
        setAddColumnError(null);
        setErroredColumnName('');
      }
      // 重複エラーの場合：エラーが発生した値と異なる値を入力した時のみクリア
      else if (addColumnError === '同じ名前のカラムが既に存在します' && currentTrimmed !== erroredColumnName) {
        setAddColumnError(null);
        setErroredColumnName('');
      }
    }
  }, [newColumnName, addColumnError, erroredColumnName]);

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
      showMessage('最低1つのカラムが必要です', 'error');
      return;
    }

    try {
      updateDefaultColumns(columns);
      setHasUnsavedChanges(false);
      showMessage('設定を保存しました', 'success');
    } catch (error) {
      showMessage('設定の保存に失敗しました', 'error');
    }
  }, [columns, showMessage]);

  // カラム追加
  const handleAddColumn = useCallback(() => {
    const trimmedName = newColumnName.trim();

    if (!trimmedName) {
      setAddColumnError('カラム名を入力してください');
      setErroredColumnName('');
      return;
    }

    // 正規化した名前で重複チェック（大文字小文字・全角半角を無視）
    const normalizedNewName = normalizeColumnName(trimmedName);

    const isDuplicate = columns.some(col => {
      const normalizedExisting = normalizeColumnName(col.name);
      return normalizedExisting === normalizedNewName;
    });

    if (isDuplicate) {
      setAddColumnError('同じ名前のカラムが既に存在します');
      setErroredColumnName(trimmedName);
      return;
    }

    // エラーをクリア
    setAddColumnError(null);
    setErroredColumnName('');

    const newColumn: DefaultColumnConfig = {
      id: uuidv4(),
      name: trimmedName
    };

    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setHasUnsavedChanges(true);
  }, [newColumnName, columns]);

  // カラム削除
  const handleDeleteColumn = useCallback((columnId: string) => {
    if (columns.length <= 1) {
      notify.error('最低1つのカラムが必要です');
      return;
    }

    setColumns(prev => prev.filter(col => col.id !== columnId));
    setColumnError(columnId, null); // カラム削除時にエラーもクリア
    setHasUnsavedChanges(true);
  }, [columns.length, notify, setColumnError]);

  // カラム名更新
  const handleUpdateColumnName = useCallback((columnId: string, newName: string) => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setColumnError(columnId, 'カラム名を入力してください');
      return;
    }

    // 正規化した名前で重複チェック（大文字小文字・全角半角を無視）
    const normalizedNewName = normalizeColumnName(trimmedName);

    const isDuplicate = columns.some(col => {
      if (col.id === columnId) {
         return false; // 自分自身は除外
      }
      const normalizedExisting = normalizeColumnName(col.name);
      return normalizedExisting === normalizedNewName;
    });

    if (isDuplicate) {
      setColumnError(columnId, '同じ名前のカラムが既に存在します');
      return;
    }

    // エラーをクリア
    setColumnError(columnId, null);

    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, name: trimmedName } : col
    ));
    setHasUnsavedChanges(true);
  }, [columns, setColumnError]);

  // カラム順序変更
  const handleMoveColumn = useCallback((columnId: string, direction: 'up' | 'down') => {
    setColumns(prev => {
      const currentIndex = prev.findIndex(col => col.id === columnId);
      if (currentIndex === -1) { return prev; }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) { return prev; }

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
      <div className="p-3">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800">
          設定を読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-4 text-gray-900">デフォルトカラム設定</h2>
        <div style={{ color: 'var(--fgColor-muted)', fontSize: "14px" }}>
          新しいボード作成時に使用されるデフォルトカラムを設定できます。<br />
          既存のボードには影響しません。
        </div>
      </div>

      <div className="mb-4">

        {/* 現在のカラム一覧 */}
        <div className="mb-6">
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
                  error={columnErrors[column.id] || null}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* 新しいカラム追加 */}
        <div className="mb-3">
          <div className="mb-2 text-sm font-bold">新しいカラムを追加</div>
          <div>
            <div className="flex gap-2 w-full">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="カラム名を入力"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddColumn();
                  }
                }}
                aria-label="新しいカラム名"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleAddColumn}
                aria-label="新しいカラムを追加"
              >
                <PlusIcon size={16} className="mr-2" />
                追加
              </Button>
            </div>
            {addColumnError && (
              <InlineMessage variant="critical" message={addColumnError} size="small" />
            )}
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid", borderColor: "var(--borderColor-default)" }}>
        <div className="flex flex-colum items-end justify-center gap-2">
          <Button
            variant="default"
            onClick={handleSave}
          >
            <CheckIcon size={16} className="mr-2" />
            設定を保存
          </Button>
          <div className="flex flex-column gap-1">
            {/* 未保存状態メッセージ */}
            {hasUnsavedChanges ? (
              <InlineMessage variant="warning" message="未保存の変更があります（1秒後に自動保存されます）" size="small" />
            ) : (
              saveMessage && (
                <InlineMessage variant={saveMessageType === 'success' ? 'success' : 'critical'} message={saveMessage} size="small" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
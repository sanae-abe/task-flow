import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Button,
  TextInput,
  Flash
} from '@primer/react';
import { PlusIcon, TrashIcon, GrabberIcon } from '@primer/octicons-react';
import type { DefaultColumnConfig } from '../../types/settings';
import { loadSettings, updateDefaultColumns } from '../../utils/settingsStorage';
import { useNotify } from '../../contexts/NotificationContext';
import { v4 as uuidv4 } from 'uuid';

export const BoardSettingsPanel: React.FC = () => {
  const [columns, setColumns] = useState<DefaultColumnConfig[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const notify = useNotify();

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

  // 設定保存
  const handleSave = useCallback(async () => {
    if (columns.length === 0) {
      notify.error('最低1つのカラムが必要です');
      return;
    }

    try {
      updateDefaultColumns(columns);
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
  }, [newColumnName, columns, notify]);

  // カラム削除
  const handleDeleteColumn = useCallback((columnId: string) => {
    if (columns.length <= 1) {
      notify.error('最低1つのカラムが必要です');
      return;
    }

    setColumns(prev => prev.filter(col => col.id !== columnId));
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
      return newColumns;
    });
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Flash>設定を読み込み中...</Flash>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 2, mb: 2 }}>デフォルトカラム設定</Heading>
        <Box sx={{ color: 'fg.muted', fontSize: 1 }}>
          新しいボード作成時に使用されるデフォルトカラムを設定できます。<br />
          既存のボードには影響しません。
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>

        {/* 現在のカラム一覧 */}
        <Box sx={{ mb: 3 }}>
          {columns.map((column, index) => (
            <Box
              key={column.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 2,
                backgroundColor: 'canvas.subtle'
              }}
            >
              <GrabberIcon size={16} />
              <Box sx={{ flex: 1 }}>
                <TextInput
                  value={column.name}
                  onChange={(e) => handleUpdateColumnName(column.id, e.target.value)}
                  placeholder="カラム名"
                  sx={{ width: '100%' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="invisible"
                  size="small"
                  onClick={() => handleMoveColumn(column.id, 'up')}
                  disabled={index === 0}
                  sx={{ px: 2 }}
                >
                  ↑
                </Button>
                <Button
                  variant="invisible"
                  size="small"
                  onClick={() => handleMoveColumn(column.id, 'down')}
                  disabled={index === columns.length - 1}
                  sx={{ px: 2 }}
                >
                  ↓
                </Button>
                <Button
                  variant="invisible"
                  size="small"
                  leadingVisual={TrashIcon}
                  onClick={() => handleDeleteColumn(column.id)}
                  disabled={columns.length <= 1}
                  sx={{ color: 'danger.fg' }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* 新しいカラム追加 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 2, fontSize: 1, fontWeight: 'bold' }}>新しいカラムを追加</Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            />
            <Button
              variant="primary"
              size="small"
              leadingVisual={PlusIcon}
              onClick={handleAddColumn}
            >
              追加
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 保存ボタン */}
      <Box sx={{ pt: 3, borderTop: '1px solid', borderColor: 'border.default' }}>
        <Button variant="primary" onClick={handleSave}>
          設定を保存
        </Button>
      </Box>
    </div>
  );
};
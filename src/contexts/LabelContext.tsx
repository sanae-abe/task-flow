import React, { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';

import type { Label } from '../types';
import { useBoard } from './BoardContext';
import { useNotify } from './NotificationContext';

interface LabelContextType {
  labels: Label[];
  getAllLabels: () => Label[];
  getLabelUsageCount: (labelId: string) => number;
  createLabel: (name: string, color: string) => void;
  updateLabel: (labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (labelId: string) => void;
}

const LabelContext = createContext<LabelContextType | undefined>(undefined);

interface LabelProviderProps {
  children: ReactNode;
}

export const LabelProvider: React.FC<LabelProviderProps> = ({ children }) => {
  const notify = useNotify();
  const { state: boardState, dispatch: boardDispatch } = useBoard();

  // 現在のボードのラベル
  const labels = useMemo(() => boardState.currentBoard?.labels || [], [boardState.currentBoard]);

  // 全ボードからすべてのラベルを取得
  const getAllLabels = useCallback((): Label[] => {
    const labelMap = new Map<string, Label>();

    // すべてのボードからラベルを収集
    boardState.boards.forEach(board => {
      board.labels?.forEach(label => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label);
        }
      });

      // タスクからもラベルを収集
      board.columns.forEach(column => {
        column.tasks.forEach(task => {
          task.labels?.forEach(label => {
            if (!labelMap.has(label.id)) {
              labelMap.set(label.id, label);
            }
          });
        });
      });
    });

    return Array.from(labelMap.values());
  }, [boardState.boards]);

  // ラベルの使用数を取得
  const getLabelUsageCount = useCallback((labelId: string): number => {
    if (!boardState.currentBoard) {
      return 0;
    }

    let count = 0;
    boardState.currentBoard.columns.forEach(column => {
      column.tasks.forEach(task => {
        if (task.labels?.some(label => label.id === labelId)) {
          count++;
        }
      });
    });

    return count;
  }, [boardState.currentBoard]);

  // ラベル作成
  const createLabel = useCallback((name: string, color: string) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const newLabel: Label = {
      id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      color,
    };

    const updatedLabels = [...(boardState.currentBoard.labels || []), newLabel];

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: {
        boardId: boardState.currentBoard.id,
        updates: { labels: updatedLabels }
      }
    });

    notify.success(`ラベル「${name}」を作成しました`);
  }, [boardState.currentBoard, boardDispatch, notify]);

  // ラベル更新
  const updateLabel = useCallback((labelId: string, updates: Partial<Label>) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const updatedLabels = (boardState.currentBoard.labels || []).map(label =>
      label.id === labelId ? { ...label, ...updates } : label
    );

    // ボードのラベルを更新
    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: {
        boardId: boardState.currentBoard.id,
        updates: { labels: updatedLabels }
      }
    });

    // タスクのラベルも更新
    const updatedColumns = boardState.currentBoard.columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => ({
        ...task,
        labels: (task.labels || []).map(label =>
          label.id === labelId ? { ...label, ...updates } : label
        ),
      })),
    }));

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: {
        boardId: boardState.currentBoard.id,
        updates: { columns: updatedColumns }
      }
    });

    notify.success('ラベルを更新しました');
  }, [boardState.currentBoard, boardDispatch, notify]);

  // ラベル削除
  const deleteLabel = useCallback((labelId: string) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const labelToDelete = (boardState.currentBoard.labels || []).find(label => label.id === labelId);
    if (!labelToDelete) {
      notify.error('ラベルが見つかりません');
      return;
    }

    // ボードからラベルを削除
    const updatedLabels = (boardState.currentBoard.labels || []).filter(label => label.id !== labelId);

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: {
        boardId: boardState.currentBoard.id,
        updates: { labels: updatedLabels }
      }
    });

    // タスクからもラベルを削除
    const updatedColumns = boardState.currentBoard.columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => ({
        ...task,
        labels: (task.labels || []).filter(label => label.id !== labelId),
      })),
    }));

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: {
        boardId: boardState.currentBoard.id,
        updates: { columns: updatedColumns }
      }
    });

    notify.success(`ラベル「${labelToDelete.name}」を削除しました`);
  }, [boardState.currentBoard, boardDispatch, notify]);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(() => ({
    labels,
    getAllLabels,
    getLabelUsageCount,
    createLabel,
    updateLabel,
    deleteLabel,
  }), [
    labels,
    getAllLabels,
    getLabelUsageCount,
    createLabel,
    updateLabel,
    deleteLabel,
  ]);

  return (
    <LabelContext.Provider value={contextValue}>
      {children}
    </LabelContext.Provider>
  );
};

export const useLabel = (): LabelContextType => {
  const context = useContext(LabelContext);
  if (context === undefined) {
    throw new Error('useLabel must be used within a LabelProvider');
  }
  return context;
};

export default LabelContext;
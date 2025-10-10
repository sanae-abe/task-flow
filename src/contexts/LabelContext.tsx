import React, { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';

import type { Label } from '../types';
import { useBoard } from './BoardContext';
import { useNotify } from './NotificationContext';

interface LabelContextType {
  // 現在のボード対象
  labels: Label[];
  getCurrentBoardLabels: () => Label[];
  getCurrentBoardLabelUsageCount: (labelId: string) => number;

  // 全ボード対象
  getAllLabels: () => Label[];

  // ラベル操作
  createLabel: (name: string, color: string) => void;
  updateLabel: (labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (labelId: string) => void;
}

const LabelContext = createContext<LabelContextType | undefined>(undefined);

interface LabelProviderProps {
  children: ReactNode;
}

// 安全なUUID生成（フォールバック付き）
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: より堅牢なランダムID生成
  return `label-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const LabelProvider: React.FC<LabelProviderProps> = ({ children }) => {
  const notify = useNotify();
  const { state: boardState, dispatch: boardDispatch } = useBoard();

  // 現在のボードのラベル
  const labels = useMemo(() => boardState.currentBoard?.labels || [], [boardState.currentBoard]);

  // 現在のボードのラベルを取得
  const getCurrentBoardLabels = useCallback((): Label[] =>
    boardState.currentBoard?.labels || []
  , [boardState.currentBoard]);

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
  }, [boardState.boards, boardState.currentBoard]); // currentBoardも依存配列に追加

  // 現在のボードでのラベル使用数を取得
  const getCurrentBoardLabelUsageCount = useCallback((labelId: string): number => {
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
    console.log('🏷️ [LabelContext] createLabel開始:', { name, color });
    // バリデーション
    if (!boardState.currentBoard) {
      console.log('🏷️ [LabelContext] エラー: ボードが選択されていません');
      notify.error('ボードが選択されていません');
      return;
    }

    const trimmedName = name.trim();
    console.log('🏷️ [LabelContext] trimmedName:', trimmedName);
    if (!trimmedName) {
      console.log('🏷️ [LabelContext] エラー: ラベル名が空です');
      notify.error('ラベル名が空です');
      return;
    }

    if (trimmedName.length > 50) {
      console.log('🏷️ [LabelContext] エラー: ラベル名が長すぎます');
      notify.error('ラベル名は50文字以下で入力してください');
      return;
    }

    // 重複チェック
    const existingLabels = boardState.currentBoard.labels || [];
    console.log('🏷️ [LabelContext] 既存ラベル:', existingLabels.map(l => l.name));
    const isDuplicate = existingLabels.some(label =>
      label.name.toLowerCase() === trimmedName.toLowerCase()
    );
    console.log('🏷️ [LabelContext] 重複チェック結果:', isDuplicate);

    if (isDuplicate) {
      console.log('🏷️ [LabelContext] エラー: 同じ名前のラベルが既に存在します');
      notify.error('同じ名前のラベルが既に存在します');
      return;
    }

    try {
      const newLabel: Label = {
        id: generateId(),
        name: trimmedName,
        color,
      };
      console.log('🏷️ [LabelContext] 新しいラベル:', newLabel);

      const updatedLabels = [...existingLabels, newLabel];
      console.log('🏷️ [LabelContext] 更新後のラベル配列:', updatedLabels);

      console.log('🏷️ [LabelContext] boardDispatch実行中...');
      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: {
          boardId: boardState.currentBoard.id,
          updates: { labels: updatedLabels }
        }
      });
      console.log('🏷️ [LabelContext] boardDispatch完了');

      notify.success(`ラベル「${trimmedName}」を作成しました`);
      console.log('🏷️ [LabelContext] ✅ ラベル作成完了');
    } catch (error) {
      console.error('🏷️ [LabelContext] ラベル作成エラー:', error);
      notify.error('ラベルの作成に失敗しました');
    }
  }, [boardState.currentBoard, boardDispatch, notify]);

  // ラベル更新（原子性を考慮した統合更新）
  const updateLabel = useCallback((labelId: string, updates: Partial<Label>) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    // バリデーション
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        notify.error('ラベル名が空です');
        return;
      }
      if (trimmedName.length > 50) {
        notify.error('ラベル名は50文字以下で入力してください');
        return;
      }

      // 重複チェック（自分自身を除外）
      const existingLabels = boardState.currentBoard.labels || [];
      const isDuplicate = existingLabels.some(label =>
        label.id !== labelId && label.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        notify.error('同じ名前のラベルが既に存在します');
        return;
      }
    }

    try {
      // ボードのラベルを更新
      const updatedLabels = (boardState.currentBoard.labels || []).map(label =>
        label.id === labelId ? { ...label, ...updates } : label
      );

      // タスクのラベルも同時に更新
      const updatedColumns = boardState.currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => ({
          ...task,
          labels: (task.labels || []).map(label =>
            label.id === labelId ? { ...label, ...updates } : label
          ),
        })),
      }));

      // 単一のディスパッチでボードとタスクを同時更新
      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: {
          boardId: boardState.currentBoard.id,
          updates: {
            labels: updatedLabels,
            columns: updatedColumns
          }
        }
      });

      notify.success('ラベルを更新しました');
    } catch (error) {
      console.error('ラベル更新エラー:', error);
      notify.error('ラベルの更新に失敗しました');
    }
  }, [boardState.currentBoard, boardDispatch, notify]);

  // ラベル削除（原子性を考慮した統合削除）
  const deleteLabel = useCallback((labelId: string) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const labelToDelete = (boardState.currentBoard.labels || []).find(label => label.id === labelId);
    if (!labelToDelete) {
      notify.error('削除対象のラベルが見つかりません');
      return;
    }

    // 使用数をチェック
    const usageCount = getCurrentBoardLabelUsageCount(labelId);

    try {
      // ボードからラベルを削除
      const updatedLabels = (boardState.currentBoard.labels || []).filter(label => label.id !== labelId);

      // タスクからもラベルを削除
      const updatedColumns = boardState.currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => ({
          ...task,
          labels: (task.labels || []).filter(label => label.id !== labelId),
        })),
      }));

      // 単一のディスパッチでボードとタスクを同時更新
      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: {
          boardId: boardState.currentBoard.id,
          updates: {
            labels: updatedLabels,
            columns: updatedColumns
          }
        }
      });

      const message = usageCount > 0
        ? `ラベル「${labelToDelete.name}」を削除しました（${usageCount}個のタスクから削除）`
        : `ラベル「${labelToDelete.name}」を削除しました`;

      notify.success(message);
    } catch (error) {
      console.error('ラベル削除エラー:', error);
      notify.error('ラベルの削除に失敗しました');
    }
  }, [boardState.currentBoard, boardDispatch, notify, getCurrentBoardLabelUsageCount]);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(() => ({
    // 現在のボード対象
    labels,
    getCurrentBoardLabels,
    getCurrentBoardLabelUsageCount,

    // 全ボード対象
    getAllLabels,

    // ラベル操作
    createLabel,
    updateLabel,
    deleteLabel,
  }), [
    labels,
    getCurrentBoardLabels,
    getCurrentBoardLabelUsageCount,
    getAllLabels,
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
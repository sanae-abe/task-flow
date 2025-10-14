import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";

import type { Label } from "../types";
import { useBoard } from "./BoardContext";
import { useNotify } from "./NotificationContext";

interface LabelContextType {
  // 現在のボード対象
  labels: Label[];
  getCurrentBoardLabels: () => Label[];
  getCurrentBoardLabelUsageCount: (labelId: string) => number;

  // 全ボード対象
  getAllLabels: () => Label[];
  getAllLabelsWithBoardInfo: () => Array<
    Label & { boardName: string; boardId: string }
  >;
  getLabelUsageCountInBoard: (labelId: string, boardId: string) => number;
  getAllLabelUsageCount: (labelId: string) => number;

  // ラベル操作
  createLabel: (name: string, color: string) => void;
  createLabelInBoard: (name: string, color: string, boardId: string) => void;
  updateLabel: (labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (labelId: string) => void;
  deleteLabelFromAllBoards: (labelId: string) => void;

  // ラベル共通化機能
  copyLabelToCurrentBoard: (label: Label) => void;
  isLabelInCurrentBoard: (labelId: string) => boolean;

  // メッセージコールバック設定
  setMessageCallback: (callback: MessageCallback | null) => void;
}

// メッセージコールバックの型定義
type MessageCallback = (message: { 
  type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; 
  text: string; 
  title?: string;
}) => void;

const LabelContext = createContext<LabelContextType | undefined>(undefined);

interface LabelProviderProps {
  children: ReactNode;
}

// 安全なUUID生成（フォールバック付き）
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: より堅牢なランダムID生成
  return `label-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const LabelProvider: React.FC<LabelProviderProps> = ({ children }) => {
  const notify = useNotify();
  const { state: boardState, dispatch: boardDispatch } = useBoard();

  // メッセージコールバック状態（Hooksの順序を保つため、常に呼び出す）
  const [messageCallback, setMessageCallback] = useState<MessageCallback | null>(null);

  // メッセージ送信のヘルパー関数
  const sendMessage = useCallback((message: { type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; text: string; title?: string }) => {
    // 安全性チェック
    if (!message || typeof message !== 'object' || !message.type || !message.text) {
      // eslint-disable-next-line no-console
      console.error('Invalid message passed to sendMessage:', message);
      return;
    }

    if (messageCallback) {
      messageCallback(message);
    } else if (notify) {
      // フォールバック: notifyを使用
      switch (message.type) {
        case 'success':
          notify.success(message.text);
          break;
        case 'critical':
        case 'danger':
          notify.error(message.text);
          break;
        case 'warning':
          notify.warning(message.text);
          break;
        case 'info':
        default:
          notify.info(message.text);
          break;
      }
    }
  }, [messageCallback, notify]);

  // 現在のボードのラベル
  const labels = useMemo(
    () => boardState?.currentBoard?.labels || [],
    [boardState?.currentBoard],
  );

  // 現在のボードのラベルを取得
  const getCurrentBoardLabels = useCallback(
    (): Label[] => boardState?.currentBoard?.labels || [],
    [boardState?.currentBoard],
  );

  // 全ボードからすべてのラベルを取得
  const getAllLabels = useCallback((): Label[] => {
    const labelMap = new Map<string, Label>();

    // すべてのボードからラベルを収集
    boardState?.boards?.forEach((board) => {
      board.labels?.forEach((label) => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label);
        }
      });

      // タスクからもラベルを収集
      board.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          task.labels?.forEach((label) => {
            if (!labelMap.has(label.id)) {
              labelMap.set(label.id, label);
            }
          });
        });
      });
    });

    return Array.from(labelMap.values());
  }, [boardState?.boards]);

  // 現在のボードでのラベル使用数を取得
  const getCurrentBoardLabelUsageCount = useCallback(
    (labelId: string): number => {
      if (!boardState?.currentBoard) {
        return 0;
      }

      let count = 0;
      boardState.currentBoard.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.labels?.some((label) => label.id === labelId)) {
            count++;
          }
        });
      });

      return count;
    },
    [boardState?.currentBoard],
  );

  // ラベル作成
  const createLabel = useCallback(
    (name: string, color: string) => {
      // 初期化チェック
      if (!boardState?.currentBoard || !boardDispatch) {
        sendMessage({ type: 'critical', text: 'ボードが選択されていません' });
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        sendMessage({ type: 'critical', text: 'ラベル名が空です' });
        return;
      }

      if (trimmedName.length > 50) {
        sendMessage({ type: 'critical', text: 'ラベル名は50文字以下で入力してください' });
        return;
      }

      // 重複チェック
      const existingLabels = boardState.currentBoard.labels || [];
      const isDuplicate = existingLabels.some(
        (label) => label.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (isDuplicate) {
        sendMessage({ type: 'critical', text: '同じ名前のラベルが既に存在します' });
        return;
      }

      try {
        const newLabel: Label = {
          id: generateId(),
          name: trimmedName,
          color,
        };

        const updatedLabels = [...existingLabels, newLabel];

        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: boardState.currentBoard.id,
            updates: { labels: updatedLabels },
          },
        });

        sendMessage({ type: 'success', text: `ラベル「${trimmedName}」を作成しました` });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルの作成に失敗しました' });
      }
    },
    [boardState?.currentBoard, boardDispatch, sendMessage],
  );

  // 指定されたボードにラベルを作成
  const createLabelInBoard = useCallback(
    (name: string, color: string, boardId: string) => {
      // 初期化チェック
      if (!boardDispatch) {
        sendMessage({ type: 'critical', text: 'システムが初期化されていません' });
        return;
      }

      // 指定されたボードを取得
      const targetBoard = boardState?.boards?.find(
        (board) => board.id === boardId,
      );
      if (!targetBoard) {
        sendMessage({ type: 'critical', text: '指定されたボードが見つかりません' });
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        sendMessage({ type: 'critical', text: 'ラベル名が空です' });
        return;
      }

      if (trimmedName.length > 50) {
        sendMessage({ type: 'critical', text: 'ラベル名は50文字以下で入力してください' });
        return;
      }

      // 指定されたボードでの重複チェック
      const existingLabels = targetBoard.labels || [];
      const isDuplicate = existingLabels.some(
        (label) => label.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (isDuplicate) {
        sendMessage({
          type: 'critical',
          text: `ボード「${targetBoard.title}」に同じ名前のラベルが既に存在します`
        });
        return;
      }

      try {
        const newLabel: Label = {
          id: generateId(),
          name: trimmedName,
          color,
        };

        const updatedLabels = [...existingLabels, newLabel];

        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: targetBoard.id,
            updates: { labels: updatedLabels },
          },
        });

        sendMessage({
          type: 'success',
          text: `ボード「${targetBoard.title}」にラベル「${trimmedName}」を作成しました`
        });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルの作成に失敗しました' });
      }
    },
    [boardState?.boards, boardDispatch, sendMessage],
  );

  // ラベル更新（原子性を考慮した統合更新）
  const updateLabel = useCallback(
    (labelId: string, updates: Partial<Label>) => {
      // 初期化チェック
      if (!boardState?.currentBoard || !boardDispatch) {
        sendMessage({ type: 'critical', text: 'ボードが選択されていません' });
        return;
      }

      // バリデーション
      if (updates.name !== undefined) {
        const trimmedName = updates.name.trim();
        if (!trimmedName) {
          sendMessage({ type: 'critical', text: 'ラベル名が空です' });
          return;
        }
        if (trimmedName.length > 50) {
          sendMessage({ type: 'critical', text: 'ラベル名は50文字以下で入力してください' });
          return;
        }

        // 重複チェック（自分自身を除外）
        const existingLabels = boardState.currentBoard.labels || [];
        const isDuplicate = existingLabels.some(
          (label) =>
            label.id !== labelId &&
            label.name.toLowerCase() === trimmedName.toLowerCase(),
        );

        if (isDuplicate) {
          sendMessage({ type: 'critical', text: '同じ名前のラベルが既に存在します' });
          return;
        }
      }

      try {
        // ボードのラベルを更新
        const updatedLabels = (boardState.currentBoard.labels || []).map(
          (label) => (label.id === labelId ? { ...label, ...updates } : label),
        );

        // タスクのラベルも同時に更新
        const updatedColumns = boardState.currentBoard.columns.map(
          (column) => ({
            ...column,
            tasks: column.tasks.map((task) => ({
              ...task,
              labels: (task.labels || []).map((label) =>
                label.id === labelId ? { ...label, ...updates } : label,
              ),
            })),
          }),
        );

        // 単一のディスパッチでボードとタスクを同時更新
        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: boardState.currentBoard.id,
            updates: {
              labels: updatedLabels,
              columns: updatedColumns,
            },
          },
        });

        sendMessage({ type: 'success', text: 'ラベルを更新しました' });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルの更新に失敗しました' });
      }
    },
    [boardState?.currentBoard, boardDispatch, sendMessage],
  );

  // ラベル削除（原子性を考慮した統合削除）
  const deleteLabel = useCallback(
    (labelId: string) => {
      // 初期化チェック
      if (!boardState?.currentBoard || !boardDispatch) {
        sendMessage({ type: 'critical', text: 'ボードが選択されていません' });
        return;
      }

      const labelToDelete = (boardState.currentBoard.labels || []).find(
        (label) => label.id === labelId,
      );
      if (!labelToDelete) {
        sendMessage({ type: 'critical', text: '削除対象のラベルが見つかりません' });
        return;
      }

      // 使用数をチェック
      const usageCount = getCurrentBoardLabelUsageCount(labelId);

      try {
        // ボードからラベルを削除
        const updatedLabels = (boardState.currentBoard.labels || []).filter(
          (label) => label.id !== labelId,
        );

        // タスクからもラベルを削除
        const updatedColumns = boardState.currentBoard.columns.map(
          (column) => ({
            ...column,
            tasks: column.tasks.map((task) => ({
              ...task,
              labels: (task.labels || []).filter(
                (label) => label.id !== labelId,
              ),
            })),
          }),
        );

        // 単一のディスパッチでボードとタスクを同時更新
        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: boardState.currentBoard.id,
            updates: {
              labels: updatedLabels,
              columns: updatedColumns,
            },
          },
        });

        const message =
          usageCount > 0
            ? `ラベル「${labelToDelete.name}」を削除しました（${usageCount}個のタスクから削除）`
            : `ラベル「${labelToDelete.name}」を削除しました`;

        sendMessage({ type: 'success', text: message });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルの削除に失敗しました' });
      }
    },
    [
      boardState?.currentBoard,
      boardDispatch,
      sendMessage,
      getCurrentBoardLabelUsageCount,
    ],
  );

  // ラベルが現在のボードにあるかチェック
  const isLabelInCurrentBoard = useCallback(
    (labelId: string): boolean => {
      if (!boardState?.currentBoard) {
        return false;
      }

      return (boardState.currentBoard.labels || []).some(
        (label) => label.id === labelId,
      );
    },
    [boardState?.currentBoard],
  );

  // 他のボードのラベルを現在のボードにコピー
  const copyLabelToCurrentBoard = useCallback(
    (label: Label) => {
      // 初期化チェック
      if (!boardState?.currentBoard || !boardDispatch) {
        sendMessage({ type: 'critical', text: 'ボードが選択されていません' });
        return;
      }

      // 既に現在のボードに存在するかチェック
      if (isLabelInCurrentBoard(label.id)) {
        sendMessage({
          type: 'info',
          text: `ラベル「${label.name}」は既に現在のボードに存在します`
        });
        return;
      }

      // 同じ名前のラベルが現在のボードに存在するかチェック
      const existingLabels = boardState.currentBoard.labels || [];
      const isDuplicate = existingLabels.some(
        (existingLabel) =>
          existingLabel.name.toLowerCase() === label.name.toLowerCase(),
      );

      if (isDuplicate) {
        sendMessage({
          type: 'critical',
          text: `同じ名前のラベル「${label.name}」が既に現在のボードに存在します`
        });
        return;
      }

      try {
        // 新しいIDでラベルをコピー
        const newLabel: Label = {
          id: generateId(),
          name: label.name,
          color: label.color,
        };

        const updatedLabels = [...existingLabels, newLabel];

        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: boardState.currentBoard.id,
            updates: { labels: updatedLabels },
          },
        });

        sendMessage({
          type: 'success',
          text: `ラベル「${label.name}」を現在のボードにコピーしました`
        });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルのコピーに失敗しました' });
      }
    },
    [boardState?.currentBoard, boardDispatch, sendMessage, isLabelInCurrentBoard],
  );

  // 全ボードのラベル情報をボード名付きで取得
  const getAllLabelsWithBoardInfo = useCallback((): Array<
    Label & { boardName: string; boardId: string }
  > => {
    const labelsWithBoardInfo: Array<
      Label & { boardName: string; boardId: string }
    > = [];

    // すべてのボードからラベルを収集
    boardState?.boards?.forEach((board) => {
      board.labels?.forEach((label) => {
        labelsWithBoardInfo.push({
          ...label,
          boardName: board.title,
          boardId: board.id,
        });
      });
    });

    return labelsWithBoardInfo;
  }, [boardState?.boards]);

  // 指定されたボードでのラベル使用数を取得
  const getLabelUsageCountInBoard = useCallback(
    (labelId: string, boardId: string): number => {
      const board = boardState?.boards?.find((b) => b.id === boardId);
      if (!board) {
        return 0;
      }

      let count = 0;
      board.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.labels?.some((label) => label.id === labelId)) {
            count++;
          }
        });
      });

      return count;
    },
    [boardState?.boards],
  );

  // 全ボードでのラベル使用数を取得
  const getAllLabelUsageCount = useCallback(
    (labelId: string): number => {
      let totalCount = 0;

      boardState?.boards?.forEach((board) => {
        board.columns.forEach((column) => {
          column.tasks.forEach((task) => {
            if (task.labels?.some((label) => label.id === labelId)) {
              totalCount++;
            }
          });
        });
      });

      return totalCount;
    },
    [boardState?.boards],
  );

  // 全ボードからラベルを削除
  const deleteLabelFromAllBoards = useCallback(
    (labelId: string) => {
      // 初期化チェック
      if (!boardDispatch) {
        sendMessage({ type: 'critical', text: 'システムが初期化されていません' });
        return;
      }

      // まず、削除対象のラベル情報を取得
      const labelToDelete = getAllLabels().find(
        (label) => label.id === labelId,
      );
      if (!labelToDelete) {
        sendMessage({ type: 'critical', text: '削除対象のラベルが見つかりません' });
        return;
      }

      // 全ボードでの使用数を確認
      const totalUsageCount = getAllLabelUsageCount(labelId);

      try {
        // すべてのボードを個別に更新
        boardState?.boards?.forEach((board) => {
          const hasLabel = (board.labels || []).some(
            (label) => label.id === labelId,
          );

          if (!hasLabel) {
            return; // このボードにはラベルがないのでスキップ
          }

          // ボードからラベルを削除
          const updatedLabels = (board.labels || []).filter(
            (label) => label.id !== labelId,
          );

          // タスクからもラベルを削除
          const updatedColumns = board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) => ({
              ...task,
              labels: (task.labels || []).filter(
                (label) => label.id !== labelId,
              ),
            })),
          }));

          // 個別のボードを更新
          boardDispatch({
            type: "UPDATE_BOARD",
            payload: {
              boardId: board.id,
              updates: {
                labels: updatedLabels,
                columns: updatedColumns,
              },
            },
          });
        });

        const message =
          totalUsageCount > 0
            ? `ラベル「${labelToDelete.name}」を全ボードから削除しました（${totalUsageCount}個のタスクから削除）`
            : `ラベル「${labelToDelete.name}」を全ボードから削除しました`;

        sendMessage({ type: 'success', text: message });
      } catch (error) {
        sendMessage({ type: 'critical', text: 'ラベルの削除に失敗しました' });
      }
    },
    [
      boardState?.boards,
      boardDispatch,
      sendMessage,
      getAllLabels,
      getAllLabelUsageCount,
    ],
  );

  // メモ化されたコンテキスト値
  const contextValue = useMemo(
    () => ({
      // 現在のボード対象
      labels,
      getCurrentBoardLabels,
      getCurrentBoardLabelUsageCount,

      // 全ボード対象
      getAllLabels,
      getAllLabelsWithBoardInfo,
      getLabelUsageCountInBoard,
      getAllLabelUsageCount,

      // ラベル操作
      createLabel,
      createLabelInBoard,
      updateLabel,
      deleteLabel,
      deleteLabelFromAllBoards,

      // ラベル共通化機能
      copyLabelToCurrentBoard,
      isLabelInCurrentBoard,

      // メッセージコールバック設定
      setMessageCallback,
    }),
    [
      labels,
      getCurrentBoardLabels,
      getCurrentBoardLabelUsageCount,
      getAllLabels,
      getAllLabelsWithBoardInfo,
      getLabelUsageCountInBoard,
      getAllLabelUsageCount,
      createLabel,
      createLabelInBoard,
      updateLabel,
      deleteLabel,
      deleteLabelFromAllBoards,
      copyLabelToCurrentBoard,
      isLabelInCurrentBoard,
      setMessageCallback,
    ],
  );

  // 初期化されていない場合は、空のコンテキストを提供
  if (!notify || !boardDispatch) {
    return (
      <LabelContext.Provider value={{
        labels: [],
        getCurrentBoardLabels: () => [],
        getCurrentBoardLabelUsageCount: () => 0,
        getAllLabels: () => [],
        getAllLabelsWithBoardInfo: () => [],
        getLabelUsageCountInBoard: () => 0,
        getAllLabelUsageCount: () => 0,
        createLabel: () => {},
        createLabelInBoard: () => {},
        updateLabel: () => {},
        deleteLabel: () => {},
        deleteLabelFromAllBoards: () => {},
        copyLabelToCurrentBoard: () => {},
        isLabelInCurrentBoard: () => false,
        setMessageCallback: () => {},
      }}>
        {children}
      </LabelContext.Provider>
    );
  }

  return (
    <LabelContext.Provider value={contextValue}>
      {children}
    </LabelContext.Provider>
  );
};

export const useLabel = (): LabelContextType => {
  const context = useContext(LabelContext);
  if (context === undefined) {
    throw new Error("useLabel must be used within a LabelProvider");
  }
  return context;
};

export default LabelContext;

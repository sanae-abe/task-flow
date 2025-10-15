import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { Label } from "../types";
import { useBoard } from "./BoardContext";
// import { useNotify } from "./NotificationContext"; // 将来的にメッセージ機能で使用予定

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

export const LabelProvider: React.FC<LabelProviderProps> = ({ children }) => {
  // 基本的な依存関係を安全に取得
  const { state: boardState, dispatch: boardDispatch } = useBoard();
  // const _notify = useNotify(); // 将来的にメッセージ機能で使用予定

  // 複数のメッセージコールバックを管理する配列
  const _messageCallbacksRef = useRef<Set<MessageCallback>>(new Set());

  // 現在のボードからラベルを取得
  const currentBoard = boardState.currentBoard;

  // 段階的機能実装：実際のデータを使用した基本機能
  const contextValue = useMemo(() => {
    const currentBoardLabels = currentBoard?.labels || [];

    return {
      // 現在のボード対象
      labels: currentBoardLabels,
      getCurrentBoardLabels: () => currentBoardLabels,
      getCurrentBoardLabelUsageCount: (labelId: string) => {
        if (!currentBoard) {
          return 0;
        }
        let count = 0;
        currentBoard.columns.forEach(column => {
          count += column.tasks.filter(task =>
            task.labels && task.labels.some(label => label.id === labelId)
          ).length;
        });
        return count;
      },

      // 全ボード対象
      getAllLabels: () => {
        const allLabels: Label[] = [];
        boardState.boards.forEach(board => {
          if (board.labels) {
            allLabels.push(...board.labels);
          }
        });
        return allLabels;
      },
      getAllLabelsWithBoardInfo: () => {
        const result: Array<Label & { boardName: string; boardId: string }> = [];
        boardState.boards.forEach(board => {
          if (board.labels) {
            board.labels.forEach(label => {
              result.push({
                ...label,
                boardName: board.title,
                boardId: board.id
              });
            });
          }
        });
        return result;
      },
      getLabelUsageCountInBoard: (labelId: string, boardId: string) => {
        const board = boardState.boards.find(b => b.id === boardId);
        if (!board) {
          return 0;
        }
        let count = 0;
        board.columns.forEach(column => {
          count += column.tasks.filter(task =>
            task.labels && task.labels.some(label => label.id === labelId)
          ).length;
        });
        return count;
      },
      getAllLabelUsageCount: (labelId: string) => {
        let totalCount = 0;
        boardState.boards.forEach(board => {
          board.columns.forEach(column => {
            totalCount += column.tasks.filter(task =>
              task.labels && task.labels.some(label => label.id === labelId)
            ).length;
          });
        });
        return totalCount;
      },

      // ラベル操作
      createLabel: (name: string, color: string) => {
        if (!currentBoard) {
          return;
        }

        const newLabel: Label = {
          id: crypto.randomUUID(),
          name,
          color
        };

        boardDispatch({
          type: 'ADD_LABEL',
          payload: { label: newLabel }
        });

        // 成功メッセージを全てのコールバックに送信
        if (_messageCallbacksRef.current.size > 0) {
          const messageToSend = {
            type: 'success' as const,
            text: `ラベル「${name}」を作成しました`
          };

          let callbackIndex = 0;
          _messageCallbacksRef.current.forEach((callback) => {
            callbackIndex++;
            try {
              callback(messageToSend);
            } catch (error) {
              console.error(`💬 createLabel: Error sending message to callback ${callbackIndex}:`, error);
            }
          });
        }
      },
      createLabelInBoard: (name: string, color: string, boardId: string) => {
        // 現在のボードでない場合の処理は将来実装
        if (boardId === currentBoard?.id) {
          const newLabel: Label = {
            id: crypto.randomUUID(),
            name,
            color
          };

          boardDispatch({
            type: 'ADD_LABEL',
            payload: { label: newLabel }
          });

          // 成功メッセージを全てのコールバックに送信
          if (_messageCallbacksRef.current.size > 0) {
            const messageToSend = {
              type: 'success' as const,
              text: `ラベル「${name}」を作成しました`
            };
            
            let callbackIndex = 0;
            _messageCallbacksRef.current.forEach((callback) => {
              callbackIndex++;
              try {
                callback(messageToSend);
              } catch (error) {
                console.error(`💬 createLabelInBoard: Error sending message to callback ${callbackIndex}:`, error);
              }
            });
          }
        }
      },
      updateLabel: (labelId: string, updates: Partial<Label>) => {
        if (!currentBoard) {
          return;
        }
        const labelToUpdate = currentBoardLabels.find(label => label.id === labelId);
        if (!labelToUpdate) {
          return;
        }

        // 変更内容を判定してメッセージを生成
        const isNameChanged = updates.name !== undefined && updates.name !== labelToUpdate.name;
        const isColorChanged = updates.color !== undefined && updates.color !== labelToUpdate.color;

        let messageText = '';
        if (isNameChanged && isColorChanged) {
          messageText = `ラベル「${labelToUpdate.name}」を「${updates.name}」に変更し、色も変更しました`;
        } else if (isNameChanged) {
          messageText = `ラベル名を「${labelToUpdate.name}」から「${updates.name}」に変更しました`;
        } else if (isColorChanged) {
          messageText = `ラベル「${labelToUpdate.name}」の色を変更しました`;
        } else {
          // 変更がない場合（念のため）
          messageText = `ラベル「${labelToUpdate.name}」を更新しました`;
        }

        boardDispatch({
          type: 'UPDATE_LABEL',
          payload: { labelId, updates }
        });

        // 成功メッセージを全てのコールバックに送信
        if (_messageCallbacksRef.current.size > 0) {
          const messageToSend = {
            type: 'success' as const,
            text: messageText
          };
          
          let callbackIndex = 0;
          _messageCallbacksRef.current.forEach((callback) => {
            callbackIndex++;
            try {
              callback(messageToSend);
            } catch (error) {
              console.error(`📬 updateLabel: Error sending message to callback ${callbackIndex}:`, error);
            }
          });
        } else {
        }
      },
      deleteLabel: (labelId: string) => {
        if (!currentBoard) {
          return;
        }

        // 削除前にラベル名を取得
        const labelToDelete = currentBoardLabels.find(label => label.id === labelId);
        const labelName = labelToDelete?.name || 'ラベル';

        boardDispatch({
          type: 'DELETE_LABEL',
          payload: { labelId }
        });

        // 成功メッセージを全てのコールバックに送信
        if (_messageCallbacksRef.current.size > 0) {
          const messageToSend = {
            type: 'success' as const,
            text: `ラベル「${labelName}」を削除しました`
          };

          let callbackIndex = 0;
          _messageCallbacksRef.current.forEach((callback) => {
            callbackIndex++;
            try {
              callback(messageToSend);
            } catch (error) {
              console.error(`💬 deleteLabel: Error sending message to callback ${callbackIndex}:`, error);
            }
          });
        } else {
        }
      },
      deleteLabelFromAllBoards: (labelId: string) => {
        // 削除前にラベル名を取得
        const labelToDelete = boardState.boards
          .flatMap(board => board.labels || [])
          .find(label => label.id === labelId);
        const labelName = labelToDelete?.name || 'ラベル';

        boardDispatch({
          type: 'DELETE_LABEL_FROM_ALL_BOARDS',
          payload: { labelId }
        });

        // 成功メッセージを全てのコールバックに送信
        if (_messageCallbacksRef.current.size > 0) {
          const messageToSend = {
            type: 'success' as const,
            text: `ラベル「${labelName}」を削除しました`
          };

          let callbackIndex = 0;
          _messageCallbacksRef.current.forEach((callback) => {
            callbackIndex++;
            try {
              callback(messageToSend);
            } catch (error) {
              console.error(`💬 deleteLabelFromAllBoards: Error sending message to callback ${callbackIndex}:`, error);
            }
          });
        } else {
        }
      },

      // ラベル共通化機能
      copyLabelToCurrentBoard: (label: Label) => {
        if (!currentBoard) {
          return;
        }

        // 既に現在のボードに存在するかチェック
        if (currentBoardLabels.some(existing => existing.id === label.id)) {
          return; // 既に存在する場合は何もしない
        }

        // 新しいIDでラベルをコピー（重複を避けるため）
        const copiedLabel: Label = {
          ...label,
          id: crypto.randomUUID()
        };

        boardDispatch({
          type: 'ADD_LABEL',
          payload: { label: copiedLabel }
        });
      },
      isLabelInCurrentBoard: (labelId: string) => currentBoardLabels.some(label => label.id === labelId),

      // メッセージコールバック設定
      setMessageCallback: (callback: MessageCallback | null) => {
        if (callback) {
          // 既存のコールバックをクリアして新しいコールバックのみを設定
          _messageCallbacksRef.current.clear();
          _messageCallbacksRef.current.add(callback);
        } else {
          // null の場合は全てのコールバックをクリア
          _messageCallbacksRef.current.clear();
        }
      },
    };
  }, [boardState, currentBoard, boardDispatch]);

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
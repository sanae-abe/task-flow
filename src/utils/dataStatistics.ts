import type { KanbanBoard } from '../types';
import type { DataStatistics } from '../components/DataManagement/types';

/**
 * データ統計情報を計算するユーティリティ
 */

/**
 * ボードデータから統計情報を計算
 * @param boards - カンバンボード配列
 * @param labels - ラベル配列
 * @returns データ統計情報
 */
export const calculateDataStatistics = (
  boards: KanbanBoard[],
  labels: Array<{ id: string; name: string; color: string }>
): DataStatistics => {
  let taskCount = 0;
  let attachmentCount = 0;

  // 各ボードのタスクと添付ファイルをカウント
  boards.forEach(board => {
    board.columns.forEach(column => {
      taskCount += column.tasks.length;

      column.tasks.forEach(task => {
        if (task.files) {
          attachmentCount += task.files.length;
        }
      });
    });
  });

  // データサイズを推定（JSON文字列化して計算）
  const dataObject = { boards, labels };
  const estimatedSize = new Blob([JSON.stringify(dataObject)]).size;

  return {
    boardCount: boards.length,
    taskCount,
    labelCount: labels.length,
    attachmentCount,
    estimatedSize
  };
};

/**
 * 現在のボードのみの統計情報を計算
 * @param board - 現在のカンバンボード
 * @returns データ統計情報
 */
export const calculateCurrentBoardStatistics = (
  board: KanbanBoard | null
): Omit<DataStatistics, 'boardCount' | 'labelCount'> => {
  if (!board) {
    return {
      taskCount: 0,
      attachmentCount: 0,
      estimatedSize: 0
    };
  }

  let taskCount = 0;
  let attachmentCount = 0;

  board.columns.forEach(column => {
    taskCount += column.tasks.length;

    column.tasks.forEach(task => {
      if (task.files) {
        attachmentCount += task.files.length;
      }
    });
  });

  const estimatedSize = new Blob([JSON.stringify(board)]).size;

  return {
    taskCount,
    attachmentCount,
    estimatedSize
  };
};

/**
 * バイトサイズを人間が読みやすい形式に変換
 * @param bytes - バイトサイズ
 * @returns フォーマットされた文字列（例: "1.5 KB", "2.3 MB"）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

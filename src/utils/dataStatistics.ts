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
    estimatedSize,
  };
};

/**
 * 現在のボードのみの統計情報を計算
 * @param board - 現在のカンバンボード
 * @returns データ統計情報
 */
export const calculateCurrentBoardStatistics = (
  board: KanbanBoard | null
): DataStatistics => {
  if (!board) {
    return {
      boardCount: 1,
      taskCount: 0,
      labelCount: 0,
      attachmentCount: 0,
      estimatedSize: 0,
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

  // ボードに関連するラベル数を計算
  const labelIds = new Set<string>();
  board.columns.forEach(column => {
    column.tasks.forEach(task => {
      task.labels?.forEach(label => {
        labelIds.add(label.id);
      });
    });
  });

  const estimatedSize = new Blob([JSON.stringify(board)]).size;

  return {
    boardCount: 1, // 常に1（現在のボード）
    taskCount,
    labelCount: labelIds.size,
    attachmentCount,
    estimatedSize,
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

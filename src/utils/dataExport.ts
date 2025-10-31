import type { KanbanBoard } from '../types';

export interface ExportData {
  version: string;
  exportedAt: string;
  boards: KanbanBoard[];
}

/**
 * 全ボードデータをJSONファイルとしてエクスポート
 */
export const exportData = (boards: KanbanBoard[]): void => {
  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    boards,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * 単一ボードをJSONファイルとしてエクスポート
 */
export const exportBoard = (board: KanbanBoard): void => {
  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    boards: [board],
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `kanban-${board.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * インポートファイルの内容を検証
 */
export const validateImportData = (data: unknown): ExportData => {
  if (!data || typeof data !== 'object') {
    throw new Error('無効なファイル形式です');
  }

  const dataObj = data as Record<string, unknown>;

  if (
    !dataObj['version'] ||
    !dataObj['exportedAt'] ||
    !Array.isArray(dataObj['boards'])
  ) {
    throw new Error('必要なフィールドが不足しています');
  }

  // ボードデータの基本構造を検証
  for (const board of dataObj['boards']) {
    const boardObj = board;
    if (!boardObj.id || !boardObj.title || !Array.isArray(boardObj.columns)) {
      throw new Error('ボードデータの構造が無効です');
    }

    for (const column of boardObj.columns) {
      const columnObj = column;
      if (
        !columnObj.id ||
        !columnObj.title ||
        !Array.isArray(columnObj.tasks)
      ) {
        throw new Error('カラムデータの構造が無効です');
      }

      for (const task of columnObj.tasks) {
        const taskObj = task;
        if (!taskObj.id || !taskObj.title) {
          throw new Error('タスクデータの構造が無効です');
        }

        // 日付フィールドをDateオブジェクトに変換
        if (taskObj.createdAt) {
          taskObj.createdAt = new Date(taskObj.createdAt);
        }
        if (taskObj.updatedAt) {
          taskObj.updatedAt = new Date(taskObj.updatedAt);
        }
        if (taskObj.dueDate) {
          taskObj.dueDate = new Date(taskObj.dueDate);
        }

        // サブタスクの日付も変換
        if (taskObj.subTasks) {
          for (const subTask of taskObj.subTasks) {
            const subTaskObj = subTask;
            if (subTaskObj.createdAt) {
              subTaskObj.createdAt = new Date(subTaskObj.createdAt);
            }
          }
        }

        // 添付ファイルの日付も変換
        if (taskObj.attachments) {
          for (const attachment of taskObj.attachments) {
            const attachmentObj = attachment;
            if (attachmentObj.uploadedAt) {
              attachmentObj.uploadedAt = new Date(attachmentObj.uploadedAt);
            }
          }
        }
      }
    }

    // ボードの日付フィールドも変換
    if (boardObj.createdAt) {
      boardObj.createdAt = new Date(boardObj.createdAt);
    }
    if (boardObj.updatedAt) {
      boardObj.updatedAt = new Date(boardObj.updatedAt);
    }
  }

  return dataObj as unknown as ExportData;
};

/**
 * ファイルを読み込んでJSONパース
 */
export const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('ファイルの読み込みに失敗しました'));
      }
    };
    reader.onerror = () =>
      reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });

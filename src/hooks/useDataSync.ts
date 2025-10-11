import { useEffect, useCallback } from "react";
import { indexedDBManager } from "../utils/indexedDB";
import { useKanban } from "../contexts/KanbanContext";
import { useOffline } from "./useOffline";

export const useDataSync = () => {
  const { state } = useKanban();
  const { isOnline, wasOffline, resetWasOffline } = useOffline();

  // IndexedDBの初期化とデータ読み込み
  const initializeData = useCallback(async () => {
    try {
      await indexedDBManager.init();
    } catch (error) {
      // データの初期化に失敗 (silent fail)
    }
  }, []);

  // データの保存
  const saveToIndexedDB = useCallback(async () => {
    try {
      // IndexedDBが初期化されているかチェック
      if (!indexedDBManager.isInitialized()) {
        await indexedDBManager.init();
      }

      const allTasks = state.boards.flatMap((board) =>
        board.columns.flatMap((column) => column.tasks),
      );
      const allColumns = state.boards.flatMap((board) => board.columns);

      const dataToSave = {
        tasks: allTasks,
        columns: allColumns,
        boards: state.boards,
        labels: state.labels,
      };

      await indexedDBManager.saveAllData(dataToSave);
    } catch (error) {
      // データの保存に失敗 (silent fail)
    }
  }, [state.boards, state.labels]);

  // オンライン復帰時の同期処理
  const handleOnlineSync = useCallback(async () => {
    if (isOnline && wasOffline) {
      try {
        // ここで将来的にサーバーとの同期処理を実装
        // 現在はローカルデータの保存のみ
        await saveToIndexedDB();

        resetWasOffline();
      } catch (error) {
        // オンライン同期に失敗 (silent fail)
      }
    }
  }, [isOnline, wasOffline, saveToIndexedDB, resetWasOffline]);

  // 初期化
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // データの変更を監視して自動保存
  useEffect(() => {
    if (state.boards.length > 0) {
      saveToIndexedDB();
    }
  }, [state.boards, state.labels, saveToIndexedDB]);

  // オンライン復帰の監視
  useEffect(() => {
    handleOnlineSync();
  }, [handleOnlineSync]);

  return {
    saveToIndexedDB,
    initializeData,
    isOnline,
    isOffline: !isOnline,
  };
};

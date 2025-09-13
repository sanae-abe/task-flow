import { useEffect, useCallback } from 'react';
import { indexedDBManager } from '../utils/indexedDB';
import { useKanban } from '../contexts/KanbanContext';
import { useOffline } from './useOffline';

export const useDataSync = () => {
  const { state } = useKanban();
  const { isOnline, wasOffline, resetWasOffline } = useOffline();

  // IndexedDBの初期化とデータ読み込み
  const initializeData = useCallback(async () => {
    try {
      await indexedDBManager.init();
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('データの初期化に失敗しました:', error);
    }
  }, []);

  // データの保存
  const saveToIndexedDB = useCallback(async () => {
    try {
      const allTasks = state.boards.flatMap(board => 
        board.columns.flatMap(column => column.tasks)
      );
      const allColumns = state.boards.flatMap(board => board.columns);
      
      const dataToSave = {
        tasks: allTasks,
        columns: allColumns,
        boards: state.boards,
        labels: state.labels
      };

      await indexedDBManager.saveAllData(dataToSave);
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
    }
  }, [state.boards, state.labels]);

  // オンライン復帰時の同期処理
  const handleOnlineSync = useCallback(async () => {
    if (isOnline && wasOffline) {
      try {
        // ここで将来的にサーバーとの同期処理を実装
        console.log('オンライン復帰: データ同期開始');
        
        // 現在はローカルデータの保存のみ
        await saveToIndexedDB();
        
        resetWasOffline();
        console.log('データ同期完了');
      } catch (error) {
        console.error('オンライン同期に失敗しました:', error);
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
    isOffline: !isOnline
  };
};
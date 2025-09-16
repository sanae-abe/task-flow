import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useKanban } from '../contexts/KanbanContext';
import type { ViewMode } from '../types';

/**
 * URLとビューモードを同期させるカスタムフック
 * 
 * - URLの変更に応じてビューモードを更新
 * - ビューモードの変更に応じてURLを更新
 * - ブラウザの戻る/進むボタンに対応
 * - チラつき防止のため、適切な同期制御を実装
 */
export const useViewRoute = () => {
  const { state, setViewMode } = useKanban();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 同期を制御するためのフラグ
  const isNavigatingRef = useRef(false);
  const isUpdatingViewModeRef = useRef(false);

  // URLパスからビューモードを取得
  const getViewModeFromPath = useCallback((pathname: string): ViewMode => {
    switch (pathname) {
      case '/kanban':
        return 'kanban';
      case '/calendar':
        return 'calendar';
      case '/table':
        return 'table';
      case '/':
      default:
        return 'kanban'; // デフォルトはカンバンビュー
    }
  }, []);

  // ビューモードからURLパスを取得
  const getPathFromViewMode = useCallback((viewMode: ViewMode): string => {
    switch (viewMode) {
      case 'kanban':
        return '/kanban';
      case 'calendar':
        return '/calendar';
      case 'table':
        return '/table';
      default:
        return '/kanban';
    }
  }, []);

  // HashRouter使用のため404リダイレクト処理は不要

  // URLの変更を監視してビューモードを更新（ブラウザナビゲーション対応）
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    const viewModeFromUrl = getViewModeFromPath(location.pathname);

    // 現在のビューモードと異なる場合のみ更新
    if (state.viewMode !== viewModeFromUrl) {
      isUpdatingViewModeRef.current = true;
      setViewMode(viewModeFromUrl);
      // 次のレンダリング後にフラグをリセット
      setTimeout(() => {
        isUpdatingViewModeRef.current = false;
      }, 0);
    }
  }, [location.pathname, state.viewMode, setViewMode, getViewModeFromPath]);

  // プログラマティックナビゲーション用の関数
  const navigateToView = useCallback((viewMode: ViewMode) => {
    if (state.viewMode === viewMode) {return;}
    
    const path = getPathFromViewMode(viewMode);
    if (location.pathname === path) {return;}
    
    isNavigatingRef.current = true;
    navigate(path);
  }, [state.viewMode, location.pathname, navigate, getPathFromViewMode]);

  return {
    currentView: state.viewMode,
    navigateToView
  };
};
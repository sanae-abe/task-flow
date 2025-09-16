import { lazy, type ComponentType } from 'react';

// コード分割による遅延読み込み
export const LazyKanbanBoard = lazy(() => import('../components/KanbanBoard'));
export const LazyCalendarView = lazy(() => import('../components/CalendarView'));
export const LazyTableView = lazy(() => import('../components/TableView'));
export const LazyTaskDetailSidebar: ComponentType<any> = lazy(() => import('../components/TaskDetailSidebar'));
export const LazyHelpSidebar: ComponentType<any> = lazy(() => import('../components/HelpSidebar'));

// 重いコンポーネントの遅延読み込み
export const LazyTaskCreateDialog = lazy(() => import('../components/TaskCreateDialog'));
export const LazyTaskEditDialog: ComponentType<any> = lazy(() => import('../components/TaskEditDialog'));

// プリロード機能
export const preloadComponents = () => {
  // ユーザーがページにアクセスした後、他のコンポーネントをプリロード
  setTimeout(() => {
    import('../components/CalendarView');
    import('../components/TableView');
  }, 2000);

  // ユーザーアクション予測に基づくプリロード
  const preloadOnHover = (componentImport: () => Promise<any>) => () => {
      componentImport();
    };

  return {
    preloadCalendar: preloadOnHover(() => import('../components/CalendarView')),
    preloadTable: preloadOnHover(() => import('../components/TableView')),
    preloadTaskDetail: preloadOnHover(() => import('../components/TaskDetailSidebar')),
  };
};
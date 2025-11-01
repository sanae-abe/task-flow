// Primer React ThemeProvider と BaseStyles を削除 - Shadcn/UI + Tailwind CSS 完全移行済み
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';

import Header from './components/Header';
import SubHeader from './components/SubHeader';
import KanbanBoard from './components/KanbanBoard';
import { Toaster } from '@/components/ui/sonner';
import TaskCreateDialog from './components/TaskCreateDialog/TaskCreateDialog';
import FirstTimeUserHint from './components/FirstTimeUserHint';

// 動的インポート（コードスプリッティング対応）
const CalendarView = lazy(() => import('./components/CalendarView'));
const TableView = lazy(() => import('./components/TableView'));
const SettingsDialog = lazy(() => import('./components/SettingsDialog'));
const HelpSidebar = lazy(() => import('./components/HelpSidebar'));
const TaskDetailSidebar = lazy(() => import('./components/TaskDetailSidebar'));
import { useKanban } from './contexts/KanbanContext';
import { useUI } from './contexts/UIContext';
import AppProviders from './contexts/AppProviders';
import { useDataSync } from './hooks/useDataSync';
import { useViewRoute } from './hooks/useViewRoute';
import { useTaskFinder } from './hooks/useTaskFinder';
import { useFirstTimeUser } from './hooks/useFirstTimeUser';
import { useSubHeader } from './hooks/useSubHeader';

const AppContent: React.FC = () => {
  const { state } = useKanban();
  const { openHelp, closeHelp, closeTaskDetail, state: uiState } = useUI();
  const { findTaskById } = useTaskFinder(state.currentBoard);
  const { shouldShowHint, markAsExistingUser, markHintAsShown } =
    useFirstTimeUser();
  const { handlers } = useSubHeader();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // データ同期の初期化
  useDataSync();

  // URL同期の初期化
  useViewRoute();

  // 選択されたタスクを取得
  const selectedTask = uiState.selectedTaskId
    ? findTaskById(uiState.selectedTaskId)
    : null;

  // 選択されたタスクが削除された場合の処理
  useEffect(() => {
    if (uiState.selectedTaskId && !selectedTask && uiState.isTaskDetailOpen) {
      closeTaskDetail();
    }
  }, [
    uiState.selectedTaskId,
    selectedTask,
    uiState.isTaskDetailOpen,
    closeTaskDetail,
  ]);

  // ヒント表示時の処理
  const handleDismissHint = () => {
    markHintAsShown();
    markAsExistingUser();
  };

  // 設定ダイアログの処理
  const openSettings = () => {
    setIsSettingsOpen(true);
  };
  const closeSettings = () => setIsSettingsOpen(false);

  // 排他制御はUIContext内で処理されるため、シンプルに呼び出すだけ
  const handleOpenHelp = () => {
    openHelp();
  };

  return (
    <div
      className='app'
      role='application'
      aria-label='TaskFlowアプリケーション'
    >
      <div className='fixed inset-0 z-1 h-[97px]'>
        <Header onHelpClick={handleOpenHelp} onSettingsClick={openSettings} />
        <SubHeader />
      </div>
      <main
        aria-label={
          uiState.viewMode === 'kanban'
            ? 'カンバンボード'
            : uiState.viewMode === 'calendar'
              ? 'カレンダービュー'
              : 'テーブルビュー'
        }
        className='transition-opacity duration-150 will-change-opacity'
      >
        <Routes>
          <Route path='/' element={<Navigate to='/kanban' replace />} />
          <Route path='/kanban' element={<KanbanBoard />} />
          <Route
            path='/calendar'
            element={
              <Suspense
                fallback={
                  <div className='flex items-center justify-center h-64'>
                    読み込み中...
                  </div>
                }
              >
                <CalendarView />
              </Suspense>
            }
          />
          <Route
            path='/table'
            element={
              <Suspense
                fallback={
                  <div className='flex items-center justify-center h-64'>
                    読み込み中...
                  </div>
                }
              >
                <TableView />
              </Suspense>
            }
          />
          <Route path='*' element={<Navigate to='/kanban' replace />} />
        </Routes>
      </main>
      {shouldShowHint && (
        <>
          {/* オーバーレイ背景 */}
          <div
            className='fixed inset-0 bg-black/50 z-600 animate-fadeIn duration-200 ease-out cursor-pointer'
            onClick={handleDismissHint}
            role='button'
            aria-label='ヒントを閉じる'
          />

          {/* ツールチップ */}
          <div className='fixed top-[100px] right-[80px] z-601 animate-fadeInSlide duration-300 ease-out'>
            <FirstTimeUserHint onDismiss={handleDismissHint} />
          </div>
        </>
      )}
      <Toaster position='top-right' richColors closeButton />

      {/* 動的ローディング対応のサイドバー・ダイアログ */}
      {uiState.isHelpOpen && (
        <Suspense fallback={null}>
          <HelpSidebar isOpen={uiState.isHelpOpen} onClose={closeHelp} />
        </Suspense>
      )}

      {uiState.isTaskDetailOpen && selectedTask && (
        <Suspense fallback={null}>
          <TaskDetailSidebar
            task={selectedTask}
            isOpen={uiState.isTaskDetailOpen}
            onClose={closeTaskDetail}
          />
        </Suspense>
      )}

      <TaskCreateDialog />

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsDialog
            isOpen={isSettingsOpen}
            onClose={closeSettings}
            onExportData={handlers.exportAllData}
            onExportBoard={handlers.exportCurrentBoard}
          />
        </Suspense>
      )}
    </div>
  );
};

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;

import { BaseStyles, ThemeProvider } from '@primer/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Header from './components/Header';
import SubHeader from './components/SubHeader';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import TableView from './components/TableView';
import NotificationContainer from './components/NotificationContainer';
import HelpSidebar from './components/HelpSidebar';
import TaskDetailSidebar from './components/TaskDetailSidebar';
import TaskCreateDialog from './components/TaskCreateDialog';
import FirstTimeUserHint from './components/FirstTimeUserHint';
import SettingsDialog from './components/SettingsDialog';
import { useKanban } from './contexts/KanbanContext';
import { useUI } from './contexts/UIContext';
import AppProviders from './contexts/AppProviders';
import { useDataSync } from './hooks/useDataSync';
import { useViewRoute } from './hooks/useViewRoute';
import { useTaskFinder } from './hooks/useTaskFinder';
import { useFirstTimeUser } from './hooks/useFirstTimeUser';
import { useSubHeader } from './hooks/useSubHeader';

// 定数定義
const Z_INDEX = 1000;

// スタイル定義
const styles = {
  fixedHeader: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: Z_INDEX,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
} as const;

const AppContent: React.FC = () => {
  const { state } = useKanban();
  const { openHelp, closeHelp, closeTaskDetail, state: uiState } = useUI();
  const { findTaskById } = useTaskFinder(state.currentBoard);
  const { shouldShowHint, markAsExistingUser, markHintAsShown } = useFirstTimeUser();
  const { handlers } = useSubHeader();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // データ同期の初期化
  useDataSync();

  // URL同期の初期化
  useViewRoute();

  // 選択されたタスクを取得
  const selectedTask = uiState.selectedTaskId ? findTaskById(uiState.selectedTaskId) : null;

  // 選択されたタスクが削除された場合の処理
  useEffect(() => {
    if (uiState.selectedTaskId && !selectedTask && uiState.isTaskDetailOpen) {
      closeTaskDetail();
    }
  }, [uiState.selectedTaskId, selectedTask, uiState.isTaskDetailOpen, closeTaskDetail]);


  // ヒント表示時の処理
  const handleDismissHint = () => {
    markHintAsShown();
    markAsExistingUser();
  };

  // 設定ダイアログの処理
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // 排他制御はUIContext内で処理されるため、シンプルに呼び出すだけ
  const handleOpenHelp = () => {
    openHelp();
  };



  return (
    <div className="app" role="application" aria-label="TaskFlowアプリケーション">
      <div style={styles.fixedHeader}>
        <Header onHelpClick={handleOpenHelp} onSettingsClick={openSettings} />
        <SubHeader />
      </div>
      <main
        aria-label={
          uiState.viewMode === 'kanban' ? 'カンバンボード' :
          uiState.viewMode === 'calendar' ? 'カレンダービュー' :
          'テーブルビュー'
        }
        style={{
          transition: 'opacity 0.15s ease-out',
          willChange: 'opacity',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/kanban" replace />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/table" element={<TableView />} />
          <Route path="*" element={<Navigate to="/kanban" replace />} />
        </Routes>
      </main>
      {shouldShowHint && (
        <>
          {/* オーバーレイ背景 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
              animation: 'fadeIn 0.2s ease-out',
              cursor: 'pointer'
            }}
            onClick={handleDismissHint}
            role="button"
            aria-label="ヒントを閉じる"
          />

          {/* ツールチップ */}
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '80px',
            zIndex: 9999,
            animation: 'fadeInSlide 0.3s ease-out'
          }}>
            <FirstTimeUserHint
              onDismiss={handleDismissHint}
            />
          </div>
        </>
      )}
      <NotificationContainer />
      <HelpSidebar isOpen={uiState.isHelpOpen} onClose={closeHelp} />
      <TaskDetailSidebar
        task={selectedTask}
        isOpen={uiState.isTaskDetailOpen}
        onClose={closeTaskDetail}
      />
      <TaskCreateDialog />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onExportData={handlers.exportAllData}
        onExportBoard={handlers.exportCurrentBoard}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <AppProviders>
          <AppContent />
        </AppProviders>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;

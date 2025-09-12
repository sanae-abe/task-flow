import { BaseStyles, ThemeProvider } from '@primer/react';

import Header from './components/Header';
import SubHeader from './components/SubHeader';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import NotificationContainer from './components/NotificationContainer';
import HelpSidebar from './components/HelpSidebar';
import { KanbanProvider, useKanban } from './contexts/KanbanContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useHelp } from './hooks/useHelp';

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
  const { isHelpOpen, openHelp, closeHelp } = useHelp();

  return (
    <div className="app" role="application" aria-label="ToDoアプリケーション">
      <div style={styles.fixedHeader}>
        <Header onHelpClick={openHelp} />
        <SubHeader />
      </div>
      <main aria-label={state.viewMode === 'kanban' ? 'カンバンボード' : 'カレンダービュー'}>
        {state.viewMode === 'kanban' ? <KanbanBoard /> : <CalendarView />}
      </main>
      <NotificationContainer />
      <HelpSidebar isOpen={isHelpOpen} onClose={closeHelp} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <NotificationProvider>
          <KanbanProvider>
            <AppContent />
          </KanbanProvider>
        </NotificationProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;

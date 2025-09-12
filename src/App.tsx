import { BaseStyles, ThemeProvider } from '@primer/react';

import Header from './components/Header';
import SubHeader from './components/SubHeader';
import KanbanBoard from './components/KanbanBoard';
import NotificationContainer from './components/NotificationContainer';
import { KanbanProvider } from './contexts/KanbanContext';
import { NotificationProvider } from './contexts/NotificationContext';

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

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <NotificationProvider>
          <KanbanProvider>
            <div className="app" role="application" aria-label="カンバンボードアプリケーション">
              <div style={styles.fixedHeader}>
                <Header />
                <SubHeader />
              </div>
              <main aria-label="カンバンボード">
                <KanbanBoard />
              </main>
            </div>
            <NotificationContainer />
          </KanbanProvider>
        </NotificationProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;

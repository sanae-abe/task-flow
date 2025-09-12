import { BaseStyles, ThemeProvider } from '@primer/react';

import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import NotificationContainer from './components/NotificationContainer';
import { KanbanProvider } from './contexts/KanbanContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <NotificationProvider>
          <KanbanProvider>
            <div className="app">
              <Header />
              <main>
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

import { BaseStyles, ThemeProvider } from '@primer/react';
import { KanbanProvider } from './contexts/KanbanContext';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <KanbanProvider>
          <div style={{ minHeight: '100vh' }}>
            <Header />
            <main style={{ padding: '24px' }}>
              <KanbanBoard />
            </main>
          </div>
        </KanbanProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;

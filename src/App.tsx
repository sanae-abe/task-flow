import { BaseStyles, ThemeProvider } from '@primer/react';
import { KanbanProvider } from './contexts/KanbanContext';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <KanbanProvider>
          <div className="app">
            <Header />
            <main>
              <KanbanBoard />
            </main>
          </div>
        </KanbanProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;

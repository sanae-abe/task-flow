import { KanbanProvider } from './contexts/KanbanContext';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <KanbanProvider>
      <div className="min-h-screen pulse-app-bg">
        <Header />
        <main className="pulse-main">
          <KanbanBoard />
        </main>
      </div>
    </KanbanProvider>
  );
}

export default App;

import { BaseStyles, ThemeProvider } from '@primer/react';
import { StyleSheetManager } from 'styled-components';
import { KanbanProvider } from './contexts/KanbanContext';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <StyleSheetManager
      shouldForwardProp={(prop) => {
        // Primerの特殊なプロパティを除外
        const primerProps = ['sx', 'bg', 'px', 'py', 'p', 'm', 'mx', 'my', 'borderRadius', 'borderColor', 'border'];
        if (primerProps.includes(prop)) {
          return false;
        }
        // React HTMLプロパティやARIAプロパティは通す
        return !prop.startsWith('$') && !prop.startsWith('data-') && !prop.startsWith('aria-') 
          ? prop === 'children' || prop === 'className' || prop === 'style' || prop === 'onClick' || 
            prop === 'onKeyDown' || prop === 'onChange' || prop === 'value' || prop === 'placeholder' ||
            prop === 'autoFocus' || prop === 'title' || prop === 'size' || prop === 'variant' ||
            prop === 'as' || prop === 'leadingVisual' || prop === 'disabled' || prop === 'type'
          : true;
      }}
    >
      <ThemeProvider>
        <BaseStyles>
          <KanbanProvider>
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: '#f6f8fa',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
            }}>
              <Header />
              <main>
                <KanbanBoard />
              </main>
            </div>
          </KanbanProvider>
        </BaseStyles>
      </ThemeProvider>
    </StyleSheetManager>
  );
}

export default App;

import React, { type ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';

import { BoardProvider } from './BoardContext';
import { TaskProvider } from './TaskContext';
import { UIProvider } from './UIContext';
import { LabelProvider } from './LabelContext';
import { TableColumnsProvider } from './TableColumnsContext';
import { KanbanProvider } from './KanbanContext';
import { LanguageProvider } from './LanguageContext';
import { apolloClient } from '@/lib/apollo-client';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * アプリケーション全体のContextプロバイダーを統合
 * 分割されたContextを適切な順序で提供
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <ApolloProvider client={apolloClient}>
    <LanguageProvider>
      <BoardProvider>
        <TaskProvider>
          <UIProvider>
            <LabelProvider>
              <TableColumnsProvider>
                <KanbanProvider>{children}</KanbanProvider>
              </TableColumnsProvider>
            </LabelProvider>
          </UIProvider>
        </TaskProvider>
      </BoardProvider>
    </LanguageProvider>
  </ApolloProvider>
);

export default AppProviders;

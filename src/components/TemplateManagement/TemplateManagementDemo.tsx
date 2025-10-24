import React from 'react';
import { ThemeProvider, BaseStyles } from '@primer/react';

import TemplateManagementPanel from './TemplateManagementPanel';

/**
 * テンプレート管理パネルのデモページ
 * 開発・テスト用のスタンドアロンコンポーネント
 */
const TemplateManagementDemo: React.FC = () => (
    <ThemeProvider>
      <BaseStyles>
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--background)',
            padding: '16px'
          }}
        >
          <TemplateManagementPanel />
        </div>
      </BaseStyles>
    </ThemeProvider>
  );

export default TemplateManagementDemo;

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
            backgroundColor: 'var(--background)'
          }}
          className="min-h-screen p-4"
        >
          <TemplateManagementPanel />
        </div>
      </BaseStyles>
    </ThemeProvider>
  );

export default TemplateManagementDemo;

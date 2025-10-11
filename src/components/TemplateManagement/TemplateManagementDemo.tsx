import React from 'react';
import { ThemeProvider, BaseStyles, Box } from '@primer/react';

import TemplateManagementPanel from './TemplateManagementPanel';

/**
 * テンプレート管理パネルのデモページ
 * 開発・テスト用のスタンドアロンコンポーネント
 */
const TemplateManagementDemo: React.FC = () => (
    <ThemeProvider>
      <BaseStyles>
        <Box
          sx={{
            minHeight: '100vh',
            bg: 'canvas.default',
            p: 4
          }}
        >
          <TemplateManagementPanel />
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );

export default TemplateManagementDemo;

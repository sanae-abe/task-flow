import { PlusIcon, QuestionIcon } from '@primer/octicons-react';
import { Box, Button } from '@primer/react';
import React from 'react';

import { useHeaderState } from '../hooks/useHeaderState';

import BoardCreateDialog from './BoardCreateDialog';
import BoardSelector from './BoardSelector';
import Logo from './Logo';


// 定数定義
const HEADER_HEIGHT = '67px';
const MAX_CONTENT_WIDTH = '1440px';
const DIVIDER_HEIGHT = '24px';

// スタイル定義オブジェクト
const headerStyles = {
  container: {
    px: 4,
    py: 0,
    bg: 'canvas.default',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    height: HEADER_HEIGHT
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: MAX_CONTENT_WIDTH,
    mx: 'auto',
    height: '100%'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  divider: {
    height: DIVIDER_HEIGHT,
    width: '1px',
    backgroundColor: 'border.muted'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 3
  },
  createButton: {
    backgroundColor: 'accent.emphasis',
    color: '#ffffff',
    border: 'none',
    borderRadius: 2
  }
};

// 区切り線コンポーネント
const VerticalDivider: React.FC = () => (
  <Box sx={headerStyles.divider} role="separator" aria-orientation="vertical" />
);

// 左側セクションコンポーネント
const LeftSection: React.FC = () => (
  <Box sx={headerStyles.leftSection}>
    <Logo />
    <VerticalDivider />
    <BoardSelector />
  </Box>
);

// 右側セクションコンポーネント
interface RightSectionProps {
  onCreateClick: () => void;
  onHelpClick: () => void;
}

const RightSection: React.FC<RightSectionProps> = ({ onCreateClick, onHelpClick }) => (
  <Box sx={headerStyles.rightSection}>
    <Button
      onClick={onCreateClick}
      variant="primary"
      aria-label="新しいボードを作成"
      leadingVisual={PlusIcon}
      sx={headerStyles.createButton}
    >
      新しいボード
    </Button>
    <Button
      onClick={onHelpClick}
      variant="default"
      aria-label="ヘルプを表示"
      leadingVisual={QuestionIcon}
    >
      ヘルプ
    </Button>
  </Box>
);

interface HeaderProps {
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  const {
    isCreatingBoard,
    handleCreateBoard,
    handleStartCreate,
    handleCancelCreate
  } = useHeaderState();

  return (
    <Box as="header" sx={headerStyles.container} role="banner">
      <Box sx={headerStyles.content}>
        <LeftSection />
        <RightSection onCreateClick={handleStartCreate} onHelpClick={onHelpClick} />
      </Box>
      
      <BoardCreateDialog
        isOpen={isCreatingBoard}
        onSave={handleCreateBoard}
        onCancel={handleCancelCreate}
      />
    </Box>
  );
};

export default Header;
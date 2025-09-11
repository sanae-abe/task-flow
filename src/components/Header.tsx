import React from 'react';
import { Box, Button } from '@primer/react';
import { PlusIcon } from '@primer/octicons-react';
import Logo from './Logo';
import BoardSelector from './BoardSelector';
import BoardCreateDialog from './BoardCreateDialog';
import { useHeaderState } from '../hooks/useHeaderState';

const Header: React.FC = () => {
  const {
    isCreatingBoard,
    handleCreateBoard,
    handleStartCreate,
    handleCancelCreate
  } = useHeaderState();
  
  return (
    <Box
      sx={{
        px: 4,
        py: 0,
        bg: 'canvas.default',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: '1px solid',
        borderColor: 'border.default'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Logo />
          
          <Box sx={{ height: '24px', width: '1px', backgroundColor: 'border.muted' }} />
          
          <BoardSelector />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button 
            onClick={handleStartCreate}
            variant="primary"
            aria-label="Add Board"
            leadingVisual={PlusIcon}
            sx={{
              backgroundColor: 'accent.emphasis',
              color: '#ffffff',
              border: 'none',
              borderRadius: 2,
            }}
          >
            新しいボード
          </Button>
          
          <BoardCreateDialog
            isOpen={isCreatingBoard}
            onSave={handleCreateBoard}
            onCancel={handleCancelCreate}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
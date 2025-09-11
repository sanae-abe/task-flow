import React from 'react';
import { Box } from '@primer/react';
import Logo from './Logo';
import BoardSelector from './BoardSelector';
import BoardCreateForm from './BoardCreateForm';
import { useHeaderState } from '../hooks/useHeaderState';

const Header: React.FC = () => {
  const {
    isCreatingBoard,
    newBoardTitle,
    setNewBoardTitle,
    handleCreateBoard,
    handleStartCreate,
    handleCancelCreate
  } = useHeaderState();
  
  return (
    <Box
      sx={{
        px: 4,
        py: 3,
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
          <BoardCreateForm
            isCreating={isCreatingBoard}
            newBoardTitle={newBoardTitle}
            onTitleChange={setNewBoardTitle}
            onCreate={handleCreateBoard}
            onCancel={handleCancelCreate}
            onStartCreate={handleStartCreate}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
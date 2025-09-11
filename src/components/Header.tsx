import React, { useState } from 'react';
import { Button, TextInput, Box, Heading, ActionMenu, ActionList } from '@primer/react';
import { ChevronDownIcon, PlusIcon, CloudOfflineIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';

const Header: React.FC = () => {
  const { state, createBoard, setCurrentBoard } = useKanban();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  
  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreatingBoard(false);
    }
  };
  
  const handleCancelCreate = () => {
    setNewBoardTitle('');
    setIsCreatingBoard(false);
  };
  
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudOfflineIcon size={20} />
            <Heading sx={{ fontSize: 3, margin: 0, color: 'fg.default', fontWeight: '600' }}>
              Kanban
            </Heading>
          </Box>
          
          <Box sx={{ height: '24px', width: '1px', backgroundColor: 'border.muted' }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <ActionMenu>
              <ActionMenu.Anchor>
                <Button
                  variant="invisible"
                  size="medium"
                  trailingVisual={ChevronDownIcon}
                  sx={{
                    fontSize: 2,
                    fontWeight: '500',
                    color: 'fg.default',
                    '&:hover': {
                      backgroundColor: 'canvas.subtle'
                    }
                  }}
                >
                  {state.currentBoard ? state.currentBoard.title : 'ボードを選択'}
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay 
                width="medium" 
                sx={{ 
                  minWidth: '200px',
                  backgroundColor: 'canvas.overlay',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  zIndex: 1002,
                  position: 'absolute'
                }}
              >
                <ActionList
                  sx={{
                    backgroundColor: 'canvas.overlay'
                  }}
                >
                  {state.boards.length === 0 ? (
                    <ActionList.Item 
                      disabled
                      sx={{
                        backgroundColor: 'canvas.overlay',
                        color: 'fg.muted'
                      }}
                    >
                      ボードがありません
                    </ActionList.Item>
                  ) : (
                    state.boards.map((board) => (
                      <ActionList.Item
                        key={board.id}
                        onSelect={(event) => {
                          event.preventDefault();
                          setCurrentBoard(board.id);
                        }}
                        selected={state.currentBoard?.id === board.id}
                        sx={{
                          backgroundColor: 'canvas.overlay',
                          '&:hover': {
                            backgroundColor: 'actionListItem.default.hoverBg'
                          },
                          '&[data-selected="true"]': {
                            backgroundColor: 'actionListItem.default.selectedBg',
                            fontWeight: '600'
                          }
                        }}
                      >
                        {board.title}
                      </ActionList.Item>
                    ))
                  )}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {isCreatingBoard ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextInput
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="新しいボード名"
                autoFocus
                sx={{ minWidth: '200px' }}
              />
              <Button onClick={handleCreateBoard} variant="primary">
                作成
              </Button>
              <Button onClick={handleCancelCreate}>
                キャンセル
              </Button>
            </Box>
          ) : (
            <div
              title="新しいボードを追加"
              style={{ display: 'inline-block', cursor: 'pointer' }}
            >
              <Button 
                onClick={() => setIsCreatingBoard(true)}
                variant="primary"
                aria-label="新しいボードを追加"
                leadingVisual={PlusIcon}
                sx={{
                  backgroundColor: '#1a7f37',
                  color: '#dafbe1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  '&:hover': {
                    backgroundColor: '#166e2e'
                  }
                }}
              >
                新しいボード
              </Button>
            </div>
          )}
          

        </Box>
      </Box>
    </Box>
  );
};

export default Header;
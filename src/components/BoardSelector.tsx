import React from 'react';
import { Button, Box, ActionMenu, ActionList } from '@primer/react';
import { ChevronDownIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';

const BoardSelector: React.FC = () => {
  const { state, setCurrentBoard } = useKanban();

  return (
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
  );
};

export default BoardSelector;
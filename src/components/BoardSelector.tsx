import React from 'react';
import { Button, Box, Text } from '@primer/react';
import { useKanban } from '../contexts/KanbanContext';

const BoardSelector: React.FC = () => {
  const { state, setCurrentBoard } = useKanban();

  if (state.boards.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
          No boards available
        </Text>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {state.boards.map((board) => {
        const isSelected = state.currentBoard?.id === board.id;
        
        return (
          <Box
            key={board.id}
            sx={{
              px: 0,
              py: 3,
              borderBottom: isSelected ? '2px solid' : 'none',
              borderBottomColor: isSelected ? 'accent.emphasis' : 'transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Button
              variant="invisible"
              size="medium"
              onClick={() => setCurrentBoard(board.id)}
              sx={{
                fontSize: 2,
                fontWeight: isSelected ? '600' : '500',
                color: isSelected ? 'fg.default' : 'fg.muted',
                borderRadius: '6px',
                px: 1,
                py: 0,
                '&:hover': {
                  backgroundColor: 'canvas.subtle',
                  color: 'fg.default'
                }
              }}
            >
              {board.title}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
};

export default BoardSelector;
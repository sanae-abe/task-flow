import { Button, Box, Text } from '@primer/react';
import React, { memo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
import type { KanbanBoard } from '../types';

// スタイル定義
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center'
  },
  emptyText: {
    color: 'fg.muted',
    fontSize: 1
  },
  tabContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  selectedTab: {
    px: 0,
    py: 3,
    borderBottom: '2px solid',
    borderBottomColor: 'accent.emphasis'
  },
  unselectedTab: {
    px: 0,
    py: 3,
    borderBottom: 'none'
  },
  tabButton: {
    fontSize: 1,
    borderRadius: '6px',
    px: 1,
    py: 0,
    '&:hover': {
      backgroundColor: 'canvas.subtle',
      color: 'fg.default'
    }
  },
  selectedButton: {
    fontWeight: '700',
    color: 'fg.default'
  },
  unselectedButton: {
    fontWeight: '400',
    color: 'fg.muted'
  }
} as const;

// 空状態表示コンポーネント
const EmptyBoardsMessage: React.FC = memo(() => (
  <Box sx={styles.emptyState}>
    <Text sx={styles.emptyText}>
      利用可能なボードがありません
    </Text>
  </Box>
));

// ボードタブコンポーネント
interface BoardTabProps {
  board: KanbanBoard;
  isSelected: boolean;
  onSelect: (boardId: string) => void;
}

const BoardTab: React.FC<BoardTabProps> = memo(({ board, isSelected, onSelect }) => {
  const tabStyles = isSelected ? styles.selectedTab : styles.unselectedTab;
  const buttonStyles = {
    ...styles.tabButton,
    ...(isSelected ? styles.selectedButton : styles.unselectedButton)
  };

  return (
    <Box
      key={board.id}
      sx={{
        ...styles.tabContainer,
        ...tabStyles
      }}
      role="tab"
      aria-selected={isSelected}
    >
      <Button
        variant="invisible"
        size="medium"
        onClick={() => onSelect(board.id)}
        sx={buttonStyles}
        aria-label={`${board.title}ボードを選択`}
      >
        {board.title}
      </Button>
    </Box>
  );
});

// メインコンポーネント
const BoardSelector: React.FC = () => {
  const { state, setCurrentBoard } = useKanban();

  if (state.boards.length === 0) {
    return <EmptyBoardsMessage />;
  }

  return (
    <Box sx={styles.container} role="tablist" aria-label="ボード選択">
      {state.boards.map((board) => (
        <BoardTab
          key={board.id}
          board={board}
          isSelected={state.currentBoard?.id === board.id}
          onSelect={setCurrentBoard}
        />
      ))}
    </Box>
  );
};

export default BoardSelector;
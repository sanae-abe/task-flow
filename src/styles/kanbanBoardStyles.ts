export const KANBAN_BOARD_STYLES = {
  container: {
    width: "100vw",
    bg: "canvas.subtle",
  },
  
  columnsContainer: {
    display: "flex" as const,
    overflow: 'auto' as const,
    gap: 4,
    p: 4,
    pb: '100px',
    '&::-webkit-scrollbar': {
      height: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'canvas.subtle'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'border.muted',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'border.default'
    }
  },
  
  emptyState: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: "400px"
  },
  
  emptyStateText: {
    fontSize: 2,
    color: "fg.muted"
  }
} as const;
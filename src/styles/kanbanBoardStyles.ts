export const KANBAN_BOARD_STYLES = {
  columnsContainer: {
    display: 'flex' as const,
    overflow: 'auto' as const,
    gap: '16px',
    padding: '16px',
    '&::WebkitScrollbar': {
      height: '8px',
    },
    '&::WebkitScrollbarTrack': {
      background: 'var(--muted)',
    },
    '&::WebkitScrollbarThumb': {
      background: 'var(--border)',
      borderRadius: '0.25rem',
    },
    '&::WebkitScrollbarThumb:hover': {
      background: 'var(--border)',
    },
  },

  emptyState: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: '400px',
  },

  emptyStateText: {
    fontSize: '16px',
    color: 'var(--muted-foreground)',
  },
} as const;

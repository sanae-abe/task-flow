export const KANBAN_BOARD_STYLES = {
  container: {
    width: "100vw",
    bg: "var(--bgColor-muted)",
  },

  columnsContainer: {
    display: "flex" as const,
    overflow: "auto" as const,
    gap: "16px",
    padding: "16px",
    "&::-webkit-scrollbar": {
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "var(--bgColor-muted)",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "var(--borderColor-muted)",
      borderRadius: "var(--borderRadius-small)",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "var(--borderColor-default)",
    },
  },

  emptyState: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: "400px",
  },

  emptyStateText: {
    fontSize: "16px",
    color: "var(--fgColor-muted)",
  },
} as const;

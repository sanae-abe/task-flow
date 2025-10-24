export const KANBAN_BOARD_STYLES = {
  columnsContainer: {
    display: "flex" as const,
    overflow: "auto" as const,
    gap: "16px",
    padding: "16px",
    "&::WebkitScrollbar": {
      height: "8px",
    },
    "&::WebkitScrollbarTrack": {
      background: "rgb(245 245 245)",
    },
    "&::WebkitScrollbarThumb": {
      background: "rgb(209 213 219)",
      borderRadius: "0.25rem",
    },
    "&::WebkitScrollbarThumb:hover": {
      background: "hsl(var(--border))",
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
    color: "hsl(var(--muted-foreground))",
  },
} as const;

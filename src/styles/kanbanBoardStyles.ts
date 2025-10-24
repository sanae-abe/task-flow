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
      background: "var(--color-neutral-100)",
    },
    "&::WebkitScrollbarThumb": {
      background: "var(--borderColor-muted)",
      borderRadius: "var(--borderRadius-small)",
    },
    "&::WebkitScrollbarThumb:hover": {
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
    color: "hsl(var(--muted-foreground))",
  },
} as const;

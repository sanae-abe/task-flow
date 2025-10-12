export const subTaskItemStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    borderRadius: 2,
    bg: "canvas.default",
    cursor: "pointer",
    position: "relative",
    "&:hover": {
      bg: "canvas.subtle",
    },
    "&:hover .action-buttons": {
      opacity: "1 !important",
    },
    "&:hover .drag-handle": {
      opacity: "1 !important",
    },
  },

  dragHandle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    color: "fg.muted",
    opacity: 0,
    transition: "opacity 0.2s ease",
    cursor: "grab",
    borderRadius: 1,
    "&:active": {
      cursor: "grabbing",
    },
    "&:hover": {
      bg: "neutral.muted",
      color: "accent.fg",
    },
  },

  toggleButton: {
    "&:hover": {
      bg: "transparent",
    },
  },

  textInput: {
    flex: 1,
    fontSize: 1,
    px: 2,
    py: 1,
  },

  editActionsContainer: {
    display: "flex",
    gap: 1,
    opacity: 1,
  },

  saveButton: {
    color: "success.fg",
    "&:hover": {
      bg: "transparent",
      color: "success.emphasis",
    },
  },

  cancelButton: {
    color: "fg.muted",
    "&:hover": {
      bg: "transparent",
      color: "danger.fg",
    },
  },

  taskText: {
    flex: 1,
    textDecoration: "none",
    fontSize: 1,
  },

  actionButtons: {
    display: "flex",
    gap: 1,
    opacity: 0,
    transition: "opacity 0.2s ease",
  },

  editButton: {
    color: "fg.muted",
    "&:hover": {
      bg: "transparent",
      color: "accent.fg",
    },
  },

  deleteButton: {
    color: "fg.muted",
    "&:hover": {
      bg: "transparent",
      color: "danger.fg",
    },
  },
} as const;
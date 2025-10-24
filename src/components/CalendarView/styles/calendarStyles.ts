import type { CSSProperties } from "react";

export const calendarStyles = {
  container: {
    padding: "24px 32px 32px",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  title: {
    fontSize: "20px",
    fontWeight: "600",
  },

  navigation: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  calendarGridContainer: {
    overflow: "hidden",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "1px",
    backgroundColor: "hsl(var(--border))",
    overflow: "hidden",
    flex: 1,
  },

  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "1px",
    backgroundColor: "hsl(var(--border))",
    borderBottom: "1px solid hsl(var(--border))",
    borderRadius: "6px 6px 0 0",
    marginBottom: 0,
  },

  weekDay: {
    padding: "8px",
    backgroundColor: "var(--background)",
    textAlign: "center" as const,
    fontWeight: "600",
    fontSize: "12px",
    color: "var(--fg-muted)",
  },

  dragOverlay: {
    fontSize: "13px",
    padding: "2px 8px",
    borderRadius: "6px",
    backgroundColor: "rgb(219 234 254)",
    color: "rgb(37 99 235)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "200px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    opacity: 0.5,
    transition: "opacity 200ms, transform 200ms",
  },
} as const satisfies Record<string, CSSProperties>;

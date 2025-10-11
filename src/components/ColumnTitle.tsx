import { Box, Heading, CounterLabel } from "@primer/react";
import React from "react";

import type { Column } from "../types";

interface ColumnTitleProps {
  column: Column;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({ column }) => (
  <Box
    sx={{
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      flexShrink: 0,
      width: "100%",
      overflow: "hidden",
    }}
  >
    <Heading
      sx={{
        fontSize: 2,
        margin: 0,
        fontWeight: 700,
        color: "fg.default",
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {column.title}
    </Heading>
    <CounterLabel sx={{ flexShrink: 0 }}>{column.tasks.length}</CounterLabel>
  </Box>
);

export default ColumnTitle;

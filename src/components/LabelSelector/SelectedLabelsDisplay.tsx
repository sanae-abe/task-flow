import { Box } from "@primer/react";
import React from "react";

import type { Label } from "../../types";
import LabelChip from "../LabelChip";

interface SelectedLabelsDisplayProps {
  selectedLabels: Label[];
  onRemoveLabel: (labelId: string) => void;
}

export const SelectedLabelsDisplay: React.FC<SelectedLabelsDisplayProps> = ({
  selectedLabels,
  onRemoveLabel,
}) => {
  if (selectedLabels.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        "& button": {
          height: "auto",
          padding: 0,
          fontSize: 0,
        },
      }}
    >
      {selectedLabels.map((label) => (
        <LabelChip
          key={label.id}
          label={label}
          showRemove
          onRemove={onRemoveLabel}
        />
      ))}
    </Box>
  );
};
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
    <div className="mb-2 flex flex-wrap items-center gap-1">
      {selectedLabels.map((label) => (
        <LabelChip
          key={label.id}
          label={label}
          showRemove
          onRemove={onRemoveLabel}
        />
      ))}
    </div>
  );
};
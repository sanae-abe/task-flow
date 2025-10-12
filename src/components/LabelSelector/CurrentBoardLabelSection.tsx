import { ActionList } from "@primer/react";
import { CheckIcon } from "@primer/octicons-react";
import React from "react";

import type { Label } from "../../types";
import { LabelColorCircle } from "./LabelColorCircle";

interface CurrentBoardLabelSectionProps {
  labels: Label[];
  selectedLabelIds: Set<string>;
  onToggleLabel: (label: Label) => void;
}

export const CurrentBoardLabelSection: React.FC<CurrentBoardLabelSectionProps> = ({
  labels,
  selectedLabelIds,
  onToggleLabel,
}) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ActionList.Group title="現在のボード">
      {labels.map((label) => {
        const isSelected = selectedLabelIds.has(label.id);
        return (
          <ActionList.Item
            key={label.id}
            onSelect={() => onToggleLabel(label)}
          >
            <ActionList.LeadingVisual>
              <LabelColorCircle color={label.color} />
            </ActionList.LeadingVisual>
            {label.name}
            {isSelected && (
              <ActionList.TrailingVisual>
                <CheckIcon size={16} />
              </ActionList.TrailingVisual>
            )}
          </ActionList.Item>
        );
      })}
    </ActionList.Group>
  );
};
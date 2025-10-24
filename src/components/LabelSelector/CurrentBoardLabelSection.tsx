import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
    <>
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">現在のボード</div>
      {labels.map((label) => {
        const isSelected = selectedLabelIds.has(label.id);
        return (
          <DropdownMenuItem
            key={label.id}
            onClick={() => onToggleLabel(label)}
          >
            <LabelColorCircle color={label.color} />
            <span className="ml-2 flex-1">{label.name}</span>
            {isSelected && (
              <CheckIcon size={16} className="ml-auto" />
            )}
          </DropdownMenuItem>
        );
      })}
    </>
  );
};
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
 } from "@/components/ui/dropdown-menu";
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
      <DropdownMenuLabel>現在のボード</DropdownMenuLabel>
      {labels.map((label) => {
        const isSelected = selectedLabelIds.has(label.id);
        return (
          <DropdownMenuCheckboxItem
            key={label.id}
            checked={isSelected}
            onCheckedChange={() => onToggleLabel(label)}
          >
            <LabelColorCircle color={label.color} />
            <span className="ml-2 flex-1">{label.name}</span>
          </DropdownMenuCheckboxItem>
        );
      })}
    </>
  );
};
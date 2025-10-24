import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CopyIcon } from "@primer/octicons-react";
import React from "react";

import type { Label } from "../../types";
import { LabelColorCircle } from "./LabelColorCircle";

interface OtherBoardLabelSectionProps {
  labels: Label[];
  onCopyAndSelectLabel: (label: Label) => void;
}

export const OtherBoardLabelSection: React.FC<OtherBoardLabelSectionProps> = ({
  labels,
  onCopyAndSelectLabel,
}) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">他のボード</div>
      {labels.map((label) => (
        <DropdownMenuItem
          key={label.id}
          onClick={() => onCopyAndSelectLabel(label)}
        >
          <LabelColorCircle color={label.color} />
          <span className="ml-2 flex-1">{label.name}</span>
          <CopyIcon size={16} className="ml-auto" />
        </DropdownMenuItem>
      ))}
    </>
  );
};
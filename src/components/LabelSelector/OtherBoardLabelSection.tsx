import { ActionList } from "@primer/react";
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
      <ActionList.Divider />
      <ActionList.Group title="他のボード">
        {labels.map((label) => (
          <ActionList.Item
            key={label.id}
            onSelect={() => onCopyAndSelectLabel(label)}
          >
            <ActionList.LeadingVisual>
              <LabelColorCircle color={label.color} />
            </ActionList.LeadingVisual>
            {label.name}
            <ActionList.TrailingVisual>
              <CopyIcon size={16} />
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ))}
      </ActionList.Group>
    </>
  );
};
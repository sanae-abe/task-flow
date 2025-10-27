import { memo } from "react";

import type { Label } from "../types";

import LabelChip from "./LabelChip";

interface TaskLabelsProps {
  labels?: Label[];
}

const TaskLabels = memo<TaskLabelsProps>(({ labels }) => {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {labels.map((label) => (
        <LabelChip key={label.id} label={label} showRemove={false} />
      ))}
    </div>
  );
});

export default TaskLabels;

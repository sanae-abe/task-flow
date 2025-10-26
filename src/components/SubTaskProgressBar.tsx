import React from "react";
import { Progress } from "@/components/ui/progress";

interface SubTaskProgressBarProps {
  completedCount: number;
  totalCount: number;
}

const SubTaskProgressBar: React.FC<SubTaskProgressBarProps> = ({
  completedCount,
  totalCount,
}) => {
  if (totalCount === 0) {
    return null;
  }

  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="mb-2">
      <Progress
        color="bg-green-500"
        value={progressPercentage}
        className="h-[6px] bg-gray-300"
      />
    </div>
  );
};

export default SubTaskProgressBar;
import React from "react";

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
      <div className="w-full h-[6px] rounded-sm overflow-hidden bg-gray-300">
        <div
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: "rgb(45 164 78)",
          }}
          className="h-full transition-width duration-200 ease"
        />
      </div>
    </div>
  );
};

export default SubTaskProgressBar;

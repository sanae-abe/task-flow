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
      <div
        style={{
          backgroundColor: "var(--bgColor-neutral-muted)",
        }}
        className="w-full h-[6px] rounded-sm overflow-hidden"
      >
        <div
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: "var(--bgColor-success-emphasis)",
          }}
          className="h-full transition-width duration-200 ease"
        />
      </div>
    </div>
  );
};

export default SubTaskProgressBar;

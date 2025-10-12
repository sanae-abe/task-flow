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
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          width: "100%",
          height: "6px",
          backgroundColor: "var(--bgColor-neutral-muted)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            backgroundColor: "var(--bgColor-success-emphasis)",
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
};

export default SubTaskProgressBar;

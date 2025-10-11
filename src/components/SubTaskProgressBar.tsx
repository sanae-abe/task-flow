import { Box } from "@primer/react";
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
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          width: "100%",
          height: "6px",
          bg: "neutral.muted",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${progressPercentage}%`,
            height: "100%",
            bg: "success.emphasis",
            transition: "width 0.2s ease",
          }}
        />
      </Box>
    </Box>
  );
};

export default SubTaskProgressBar;

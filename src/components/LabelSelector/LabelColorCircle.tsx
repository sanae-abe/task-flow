import { Box } from "@primer/react";
import React from "react";

import { getLabelColors } from "../../utils/labelHelpers";

interface LabelColorCircleProps {
  color: string;
  size?: number;
}

export const LabelColorCircle: React.FC<LabelColorCircleProps> = ({
  color,
  size = 12,
}) => {
  const colors = getLabelColors(color);

  return (
    <Box
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        bg: colors.bg,
        border: "1px solid",
        borderColor: colors.color,
      }}
      aria-label={`ラベル色: ${color}`}
    />
  );
};
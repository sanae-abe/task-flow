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
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: colors.bg,
        border: "1px solid",
        borderColor: colors.color,
      }}
      aria-label={`ラベル色: ${color}`}
    />
  );
};
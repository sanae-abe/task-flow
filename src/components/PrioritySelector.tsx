import { FormControl, RadioGroup, Radio } from "@primer/react";
import React from "react";

import type { Priority } from "../types";
import { prioritySelectorOptions } from "../utils/priorityConfig";

interface PrioritySelectorProps {
  priority?: Priority;
  onPriorityChange: (priority: Priority | undefined) => void;
  disabled?: boolean;
  variant?: "compact" | "full";
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  disabled = false,
  variant = "full",
}) => {
  const handleClick = (value: Priority | undefined) => {
    if (disabled) {
      return;
    }
    onPriorityChange(value);
  };

  return (
    <FormControl>
      {variant === "full" && (
        <FormControl.Label>優先度（任意）</FormControl.Label>
      )}
      <RadioGroup
        name="priority"
        sx={{
          "& > div": {
            flexDirection: "row",
            gap: 3,
            alignItems: "center",
            mt: 2,
          },
        }}
      >
        {prioritySelectorOptions.map((option) => (
          <FormControl key={option.value || "none"} sx={{ mt: 0 }}>
            <Radio
              value={option.label}
              onClick={() => handleClick(option.value)}
              checked={priority === option.value}
            />
            <FormControl.Label>{option.label}</FormControl.Label>
          </FormControl>
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default PrioritySelector;

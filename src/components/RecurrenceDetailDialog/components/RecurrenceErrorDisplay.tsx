import React from "react";
import { Text } from "@primer/react";

interface RecurrenceErrorDisplayProps {
  errors: string[];
}

const RecurrenceErrorDisplay: React.FC<RecurrenceErrorDisplayProps> = ({
  errors,
}) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      {errors.map((error, index) => (
        <Text
          key={index}
          sx={{ fontSize: 0, color: "danger.fg", display: "block" }}
        >
          ※{error}
        </Text>
      ))}
    </div>
  );
};

export default RecurrenceErrorDisplay;
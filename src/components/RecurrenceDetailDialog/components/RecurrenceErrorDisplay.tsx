import React from "react";
import ErrorMessage from "../../ErrorMessage";

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
    <div style={{ marginTop: "8px" }}>
      {errors.map((error, index) => (
        <ErrorMessage
          key={index}
          error={error}
        />
      ))}
    </div>
  );
};

export default RecurrenceErrorDisplay;
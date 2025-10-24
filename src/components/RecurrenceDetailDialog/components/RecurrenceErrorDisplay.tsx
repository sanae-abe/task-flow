import React from "react";
import InlineMessage from "../../shared/InlineMessage";

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
    <div className="mt-2">
      {errors.map((error, index) => (
        <InlineMessage
          key={index}
          variant="critical"
          message={error}
          size="small"
        />
      ))}
    </div>
  );
};

export default RecurrenceErrorDisplay;
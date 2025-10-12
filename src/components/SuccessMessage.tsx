import { FormControl } from "@primer/react";
import React from "react";

interface SuccessMessageProps {
  success: string | null;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ success }) => {
  if (!success) {
    return null;
  }

  return (
    <FormControl.Validation variant="success">{success}</FormControl.Validation>
  );
};

export default SuccessMessage;

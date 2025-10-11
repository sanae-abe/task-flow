import { FormControl } from "@primer/react";
import React from "react";

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <FormControl.Validation variant="error">{error}</FormControl.Validation>
  );
};

export default ErrorMessage;

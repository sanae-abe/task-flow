import React from "react";
import { FormControl } from "@primer/react";
import { StopIcon } from '@primer/octicons-react';

interface InlineMessageProps {
  message: string | null;
  variant?: "success" | "error" | "warning";
}

const InlineMessage: React.FC<InlineMessageProps> = ({ message, variant = "error" }) => {
  if (!message) {
    return null;
  }

  if (variant === "warning") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--fgColor-attention)' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}><StopIcon size={12} /></span>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "success") {
    return <FormControl.Validation variant="success">{message}</FormControl.Validation>;
  }

  return <FormControl.Validation variant="error">{message}</FormControl.Validation>;
};

export default InlineMessage;

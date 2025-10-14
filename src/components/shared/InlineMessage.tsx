import React from "react";
import { FormControl } from "@primer/react";
import { StopIcon, InfoIcon } from '@primer/octicons-react';

interface InlineMessageProps {
  message: string | null;
  variant?: "success" | "error" | "warning" | "info" | "default";
}

const InlineMessage: React.FC<InlineMessageProps> = ({ message, variant = "default" }) => {
  if (!message) {
    return null;
  }

  if (variant === "info") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--fgColor-accent)' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}><InfoIcon size={12} /></span>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
          {message}
        </span>
      </div>
    );
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

  if (variant === "default") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--fgColor-default)' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}><InfoIcon size={12} /></span>
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

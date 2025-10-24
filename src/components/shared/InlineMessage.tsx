import React from "react";
import { InfoIcon, CheckCircleIcon, CheckCircleFillIcon, AlertIcon, AlertFillIcon } from '@primer/octicons-react';
import InfoFillIcon from './icons/InfoFillIcon';

interface InlineMessageProps {
  message: string | null;
  variant?: "success" | "warning" | "critical" | "info" | "unavailable";
  size?: "small" | "medium";
}

const InlineMessage: React.FC<InlineMessageProps> = ({ message, variant = "info", size = "medium" }) => {
  if (!message) {
    return null;
  }

  const fontSize = size === "small" ? "12px" : "14px";
  const iconSize = size === "small" ? 12 : 16;
  const gap = size === "small" ? '4px' : '8px';
  const fontWeight = size === "small" ? '700' : '400';

  if (variant === "success") {
    const SuccessIconComponent = size === "small" ? CheckCircleFillIcon : CheckCircleIcon;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap, color: 'rgb(22 163 74)' }}>
        <span style={{ display: 'flex', alignItems: 'center', paddingTop: '0.25em' }}><SuccessIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "warning") {
    const WarningIconComponent = size === "small" ? AlertFillIcon : AlertIcon;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap, color: 'rgb(212 167 44)' }}>
        <span style={{ display: 'flex', alignItems: 'center', paddingTop: "0.25em" }}><WarningIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "critical") {
    const CriticalIconComponent = size === "small" ? AlertFillIcon : AlertIcon;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap, color: 'hsl(var(--foreground))' }}>
        <span style={{ display: 'flex', alignItems: 'center', paddingTop: '0.25em' }}><CriticalIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "info") {
    const InfoIconComponent = size === "small" ? InfoFillIcon : InfoIcon;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap, color: 'rgb(37 99 235)' }}>
        <span style={{ display: 'flex', alignItems: 'center', paddingTop: '0.25em' }}><InfoIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  const UnavailableIconComponent = size === "small" ? AlertFillIcon : AlertIcon;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap, color: 'hsl(var(--muted-foreground))' }}>
      <span style={{ display: 'flex', alignItems: 'center', paddingTop: '0.25em' }}><UnavailableIconComponent size={iconSize} /></span>
      <span style={{ fontSize, fontWeight }}>
        {message}
      </span>
    </div>
  );
};

export default InlineMessage;

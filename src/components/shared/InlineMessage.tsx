import React from "react";
import { Info, CircleCheck, AlertTriangle } from 'lucide-react';
import InfoFillIcon from './icons/InfoFillIcon';
import CircleCheck2Icon from './icons/CircleCheck2Icon';

interface InlineMessageProps {
  message: string | null;
  variant?: "success" | "warning" | "critical" | "info" | "unavailable";
  size?: "small" | "medium";
  useInvertedIcon?: boolean; // 色反転アイコンを使用するかどうか
  className?: string;
}

const InlineMessage: React.FC<InlineMessageProps> = ({ message, variant = "info", size = "medium", useInvertedIcon = false, className }) => {
  if (!message) {
    return null;
  }

  const fontSize = size === "small" ? "12px" : "14px";
  const iconSize = size === "small" ? 12 : 16;
  const gap = size === "small" ? '4px' : '8px';
  const fontWeight = size === "small" ? '700' : '400';

  if (variant === "success") {
    let SuccessIconComponent;
    if (useInvertedIcon) {
      SuccessIconComponent = CircleCheck2Icon;
    } else {
      SuccessIconComponent = CircleCheck; // CircleCheckのみ使用
    }
    return (
      <div className={`flex items-start text-green-800 ${className}`} style={{ gap }}>
        <span className="flex items-center pt-[0.2em]"><SuccessIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "warning") {
    const WarningIconComponent = AlertTriangle;
    return (
      <div className={`flex items-start gap-2 text-yellow-700 ${className}`} style={{ gap }}>
        <span className="flex items-center pt-[0.2em]"><WarningIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "critical") {
    const CriticalIconComponent = AlertTriangle;
    return (
      <div className={`flex items-start gap-2 text-destructive ${className}`} style={{ gap }}>
        <span className="flex items-center pt-[0.2em]"><CriticalIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "info") {
    const InfoIconComponent = size === "small" ? InfoFillIcon : Info;
    return (
      <div className={`flex items-start gap-2 text-blue-600 ${className}`} style={{ gap }}>
        <span className="flex items-center pt-[0.2em]"><InfoIconComponent size={iconSize} /></span>
        <span style={{ fontSize, fontWeight }}>
          {message}
        </span>
      </div>
    );
  }

  const UnavailableIconComponent = AlertTriangle;
  return (
    <div className={`flex items-start gap-2 text-muted-foreground ${className}`} style={{ gap }}>
      <span className="flex items-center pt-[0.2em]"><UnavailableIconComponent size={iconSize} /></span>
      <span style={{ fontSize, fontWeight }}>
        {message}
      </span>
    </div>
  );
};

export default InlineMessage;

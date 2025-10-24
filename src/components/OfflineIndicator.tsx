import React from "react";
import { CloudOff, Check } from "lucide-react";
import { useOffline } from "../hooks/useOffline";

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOffline();

  if (isOnline && !wasOffline) {
    return null; // オンライン状態で過去にオフラインになったことがない場合は表示しない
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 mr-1 border rounded-md transition-all duration-300 ease-in-out"
      style={{
        right: "10px",
        borderColor: isOffline
          ? "var(--bgColor-severe-emphasis)"
          : "var(--fgColor-success)",
        color: isOffline
          ? "var(--bgColor-severe-emphasis)"
          : "var(--fgColor-onEmphasis)",
        animation: wasOffline && isOnline ? "slideIn 0.3s ease" : "none",
      }}
    >
      {isOffline ? <CloudOff size={16} /> : <Check size={16} />}
      <span className="text-sm font-bold">
        {isOffline ? "オフライン" : "オンラインに復帰しました"}
      </span>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(OfflineIndicator);

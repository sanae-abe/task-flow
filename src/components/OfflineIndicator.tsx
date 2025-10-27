import React from "react";
import { CloudOff, Check } from "lucide-react";
import { useOffline } from "../hooks/useOffline";

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOffline();

  if (isOnline && !wasOffline) {
    return null; // オンライン状態で過去にオフラインになったことがない場合は表示しない
  }

  // Dynamic className generation for indicator
  const indicatorClassName = `
    flex items-center gap-2 px-3 py-1 mr-1 border border-border rounded-md transition-all duration-300 ease-in-out right-[10px]
    ${isOffline
      ? "border-red-600 text-red-600"
      : "border-green-600 text-white"
    }
    ${wasOffline && isOnline ? "animate-slide-in" : ""}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={indicatorClassName}>
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
        .animate-slide-in {
          animation: slideIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default React.memo(OfflineIndicator);

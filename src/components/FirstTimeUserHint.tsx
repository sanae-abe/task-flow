import React from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FirstTimeUserHintProps {
  onDismiss: () => void;
}

const FirstTimeUserHint: React.FC<FirstTimeUserHintProps> = ({ onDismiss }) => (
  <div className="relative max-w-sm bg-white border border-border border-gray-200 rounded-md shadow-lg p-3 before:content-[''] before:absolute before:-top-2 before:right-[100px] before:w-0 before:h-0 before:border-l-8 before:border-r-8 before:border-b-8 before:border-l-transparent before:border-r-transparent before:border-b-gray-200 after:content-[''] after:absolute after:-top-[7px] after:right-[100px] after:w-0 after:h-0 after:border-l-8 after:border-r-8 after:border-b-8 after:border-l-transparent after:border-r-transparent after:border-b-white">
    <div className="flex items-start gap-2">
      <div className="text-blue-600">
        <Sparkles size={16} />
      </div>
      <div className="flex-1">
        <div className="font-bold mb-1 text-sm">
          TaskFlowアプリへようこそ！
        </div>
        <div className="text-xs text-gray-600 leading-relaxed">
          「ボード設定」メニューから新しいボードを作成して、プロジェクトごとにタスクを管理しましょう
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        aria-label="ヒントを閉じる"
        className="text-gray-500 p-1 min-w-0 hover:text-gray-700 hover:bg-gray-100"
      >
        <X size={16} />
      </Button>
    </div>
  </div>
);

export default FirstTimeUserHint;

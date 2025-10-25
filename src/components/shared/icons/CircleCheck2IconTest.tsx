import React from 'react';
import { CircleCheck } from 'lucide-react';
import CircleCheck2Icon from './CircleCheck2Icon';

/**
 * CircleCheck2Icon のテスト用コンポーネント
 * 元のCircleCheckと並べて比較表示
 */
const CircleCheck2IconTest: React.FC = () => {
  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
      <h3 className="text-lg font-bold mb-4">CircleCheck2Icon テスト</h3>

      {/* 通常サイズでの比較 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">通常サイズ (16px)</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CircleCheck size={16} />
            <span className="text-sm text-gray-600">CircleCheck (オリジナル)</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheck2Icon size={16} />
            <span className="text-sm text-gray-600">CircleCheck2Icon (色反転版)</span>
          </div>
        </div>
      </div>

      {/* 大きなサイズでの比較 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">大きなサイズ (24px)</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CircleCheck size={24} />
            <span className="text-sm text-gray-600">CircleCheck (オリジナル)</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheck2Icon size={24} />
            <span className="text-sm text-gray-600">CircleCheck2Icon (色反転版)</span>
          </div>
        </div>
      </div>

      {/* 小さなサイズでの比較 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">小さなサイズ (12px)</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CircleCheck size={12} />
            <span className="text-sm text-gray-600">CircleCheck (オリジナル)</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheck2Icon size={12} />
            <span className="text-sm text-gray-600">CircleCheck2Icon (色反転版)</span>
          </div>
        </div>
      </div>

      {/* 使用例 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">使用例</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <CircleCheck2Icon size={16} />
            <span className="text-sm text-green-800">タスクが完了しました</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <CircleCheck size={16} />
            <span className="text-sm text-gray-700">通常の状態</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleCheck2IconTest;
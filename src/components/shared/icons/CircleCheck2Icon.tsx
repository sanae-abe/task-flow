import React from 'react';

interface CircleCheck2IconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * 色反転版のCircleCheckアイコン - 緑い背景に白いチェックマーク
 * lucide-reactのCircleCheckの反転バージョン
 */
const CircleCheck2Icon: React.FC<CircleCheck2IconProps> = ({ size = 16, className, color = "var(--bg-success)" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 背景の円 */}
      <circle
        cx="12"
        cy="12"
        r="12"
        fill={color}
      />
      {/* 白いチェックマーク */}
      <path
        d="m9 12 2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

export default CircleCheck2Icon;
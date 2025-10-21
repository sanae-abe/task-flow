import React from 'react';

interface InfoFillIconProps {
  size?: number;
  className?: string;
}

/**
 * 反転色版のInfoIcon - 青い背景に白いアイコン
 * Primer OcticonsのInfoIconの反転バージョン
 */
const InfoFillIcon: React.FC<InfoFillIconProps> = ({ size = 16, className }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 青い背景の円 */}
      <circle
        cx="8"
        cy="8"
        r="8"
        fill="var(--fgColor-accent, #0969da)"
      />
      {/* 白い情報アイコン */}
      <g fill="white">
        {/* 上部の点 */}
        <circle cx="8" cy="5.5" r="1" />
        {/* 下部の縦線 */}
        <rect x="7" y="7.5" width="2" height="5" rx="1" />
      </g>
    </svg>
  );

export default InfoFillIcon;
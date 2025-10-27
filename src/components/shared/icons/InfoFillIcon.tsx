import React from 'react';
import { Info } from 'lucide-react';

interface InfoFillIconProps {
  size?: number;
  className?: string;
}

/**
 * 反転色版のInfoIcon - 青い背景に白いアイコン
 * Lucide React InfoアイコンベースのFill反転バージョン
 */
const InfoFillIcon: React.FC<InfoFillIconProps> = ({ size = 16, className }) => (
  <div
    className={`inline-flex items-center justify-center rounded-full ${className || ''}`}
    style={{
      width: size,
      height: size,
      backgroundColor: 'var(--primary)', // primary blue
    }}
  >
    <Info
      size={Math.round(size * 0.6)} // アイコンサイズを背景の60%に調整
      color="white"
      strokeWidth={2.5} // より太い線で視認性向上
    />
  </div>
);

export default InfoFillIcon;
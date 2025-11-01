import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HELP_SECTIONS,
  SIDEBAR_WIDTH,
  SIDEBAR_Z_INDEX,
  TITLE_MIN_WIDTH,
  type HelpItemConfig,
  type HelpSectionConfig,
} from './constants';

/**
 * ヘルプサイドバーのProps
 */
export interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ヘルプアイテムコンポーネント
 */
const HelpItem: React.FC<HelpItemConfig> = ({
  icon: Icon,
  title,
  description,
}) => (
  <li className='flex items-start gap-3 mb-3'>
    <Icon className='w-5 h-5 mt-1 shrink-0 text-zinc-500' aria-hidden='true' />
    <div>
      <h4 className='font-semibold text-sm mb-1'>{title}</h4>
      <p className='text-sm text-zinc-600 leading-relaxed'>{description}</p>
    </div>
  </li>
);

/**
 * ヘルプセクションコンポーネント
 */
const HelpSection: React.FC<HelpSectionConfig> = ({ title, color, items }) => (
  <section className='mb-6'>
    <h3
      className={cn(
        'text-white text-sm font-bold px-3 py-2 rounded-md mb-3 inline-block',
        `min-w-[${TITLE_MIN_WIDTH}px]`,
        color
      )}
    >
      {title}
    </h3>
    <ul className='space-y-0'>
      {items.map((item, index) => (
        <HelpItem key={`${title}-${index}`} {...item} />
      ))}
    </ul>
  </section>
);

/**
 * ヘルプサイドバーコンポーネント
 *
 * @description
 * アプリケーションの機能説明を表示するサイドバー
 * 各機能をカテゴリー別に整理して表示
 */
export const HelpSidebar: React.FC<HelpSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className='fixed inset-0 bg-black/50 transition-opacity'
        style={{ zIndex: SIDEBAR_Z_INDEX }}
        onClick={onClose}
        aria-label='ヘルプを閉じる'
      />

      {/* サイドバー本体 */}
      <div
        className='fixed top-0 right-0 h-full bg-white shadow-xl overflow-y-auto'
        style={{ width: SIDEBAR_WIDTH, zIndex: SIDEBAR_Z_INDEX + 1 }}
        role='dialog'
        aria-labelledby='help-sidebar-title'
        aria-modal='true'
      >
        {/* ヘッダー */}
        <div className='sticky top-0 bg-white border-b border-border px-6 py-4 flex justify-between items-center'>
          <h2 id='help-sidebar-title' className='text-xl font-bold'>
            使い方ガイド
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-zinc-100 rounded-md transition-colors'
            aria-label='ヘルプを閉じる'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* コンテンツ */}
        <div className='px-6 py-6'>
          {HELP_SECTIONS.map((section, index) => (
            <HelpSection key={`section-${index}`} {...section} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HelpSidebar;

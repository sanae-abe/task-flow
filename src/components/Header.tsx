import { Plus, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

import { useKanban } from '../contexts/KanbanContext';

import OfflineIndicator from './OfflineIndicator';
import BoardSelector from './BoardSelector';
import Logo from './Logo';

// 区切り線コンポーネント
const VerticalDivider: React.FC = () => (
  <div
    className='h-6 w-px bg-gray-200'
    role='separator'
    aria-orientation='vertical'
  />
);

// 左側セクションコンポーネント
const LeftSection: React.FC = () => (
  <div className='flex items-center gap-4 flex-1 min-w-0 pr-4 w-full h-full'>
    <Logo size='medium' />
    <VerticalDivider />
    <BoardSelector />
  </div>
);

// 右側セクションコンポーネント
interface RightSectionProps {
  onCreateClick: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

const RightSection: React.FC<RightSectionProps> = ({
  onCreateClick,
  onHelpClick,
  onSettingsClick,
}) => (
  <div className='flex items-center shrink-0'>
    <OfflineIndicator />
    <Button
      onClick={onCreateClick}
      variant='default'
      aria-label='タスク作成'
      className='bg-primary text-white hover:bg-primary/90 flex items-center gap-1'
    >
      <Plus size={16} />
      タスク作成
    </Button>
    <Button
      onClick={onSettingsClick}
      variant='ghost'
      aria-label='設定を開く'
      className='ml-2 flex items-center gap-2'
    >
      <Settings size={16} />
      設定
    </Button>
    <Button
      onClick={onHelpClick}
      variant='ghost'
      aria-label='ヘルプを表示'
      className='flex items-center gap-2'
    >
      <HelpCircle size={16} />
      ヘルプ
    </Button>
  </div>
);

interface HeaderProps {
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onSettingsClick }) => {
  const { openTaskForm } = useKanban();

  const handleStartCreateTask = () => {
    openTaskForm();
  };

  return (
    <header
      className='px-6 bg-white border-b border-border border-gray-200 h-[52px]'
      role='banner'
    >
      <div className='flex items-center justify-between max-w-full mx-auto h-full'>
        <LeftSection />
        <RightSection
          onCreateClick={handleStartCreateTask}
          onHelpClick={onHelpClick}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </header>
  );
};

export default Header;

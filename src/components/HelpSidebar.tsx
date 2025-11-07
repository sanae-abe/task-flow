import {
  X,
  Database,
  Filter,
  Info,
  Calendar,
  Table,
  Video,
  List,
  Paperclip,
  MousePointer,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import Logo from './Logo';

// 定数定義
const SIDEBAR_WIDTH = '440px';
const SIDEBAR_Z_INDEX = 400;
const TITLE_MIN_WIDTH = '120px';

// セクション背景色定数
const SECTION_COLORS = {
  PRIMARY_BLUE: 'bg-primary', // ビュー切り替え、タスク管理
  SUCCESS_GREEN: 'bg-success', // 基本操作、便利なヒント
  ATTENTION_YELLOW: 'bg-warning', // ファイル添付
  ACCENT_PURPLE: 'bg-purple-600', // カレンダー機能
  DANGER_RED: 'bg-destructive', // フィルタリング・ソート
  MUTED_GRAY: 'bg-gray-600', // テンプレート管理
  SPONSOR_ORANGE: 'bg-orange-600', // データ管理
} as const;

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  backgroundClass?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  icon: Icon,
  children,
  backgroundClass = SECTION_COLORS.PRIMARY_BLUE,
}) => (
  <>
    <div className='flex items-center gap-2 mb-3'>
      <div
        className={`p-2 flex items-center justify-center rounded-full text-white ${backgroundClass}`}
      >
        <Icon size={14} />
      </div>
      <h3 className='text-base font-semibold m-0'>{title}</h3>
    </div>
    <div className='mb-5 p-3 bg-neutral-100 rounded-md'>
      <div className='pl-0'>{children}</div>
    </div>
  </>
);

interface HelpItemProps {
  title: string | React.ReactNode;
  description: string;
}

const HelpItem: React.FC<HelpItemProps> = ({ title, description }) => (
  <div className='p-2 flex gap-3 items-start bg-neutral-100 rounded-md'>
    <span
      style={{ minWidth: TITLE_MIN_WIDTH }}
      className={cn(`text-sm font-semibold text-primary shrink-0 break-words`)}
    >
      {title}
    </span>
    <span className='text-xs leading-6 flex-1'>{description}</span>
  </div>
);

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
    return undefined;
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='help-title'
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: SIDEBAR_WIDTH,
        height: '100vh',
        backgroundColor: 'var(--background)',
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'var(--border)',
        zIndex: SIDEBAR_Z_INDEX,
        overflowY: 'auto',
        animation:
          'sidebar-slide-in-right 250ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <div className='flex h-full flex-col'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-border shrink-0 pt-[17px] pb-4 px-4'>
          <h1
            id='help-title'
            className='flex items-center gap-2 text-xl font-bold'
          >
            <Logo />
            {t('help.title')}
          </h1>
          <Button
            onClick={onClose}
            variant='ghost'
            size='sm'
            aria-label={t('help.closeHelp')}
            className='shrink-0 p-1 h-auto min-w-0'
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className='flex-1 p-5 overflow-y-auto'>
          <HelpSection
            title={t('help.viewSwitch.title')}
            icon={Video}
            backgroundClass={SECTION_COLORS.PRIMARY_BLUE}
          >
            <HelpItem
              title={t('help.viewSwitch.kanban.title')}
              description={t('help.viewSwitch.kanban.description')}
            />
            <HelpItem
              title={t('help.viewSwitch.calendar.title')}
              description={t('help.viewSwitch.calendar.description')}
            />
            <HelpItem
              title={t('help.viewSwitch.table.title')}
              description={t('help.viewSwitch.table.description')}
            />
            <HelpItem
              title={t('help.viewSwitch.howTo.title')}
              description={t('help.viewSwitch.howTo.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.basicOperations.title')}
            icon={MousePointer}
            backgroundClass={SECTION_COLORS.SUCCESS_GREEN}
          >
            <HelpItem
              title={t('help.basicOperations.createBoard.title')}
              description={t('help.basicOperations.createBoard.description')}
            />
            <HelpItem
              title={t('help.basicOperations.addColumn.title')}
              description={t('help.basicOperations.addColumn.description')}
            />
            <HelpItem
              title={t('help.basicOperations.createTask.title')}
              description={t('help.basicOperations.createTask.description')}
            />
            <HelpItem
              title={
                <>
                  {t('help.basicOperations.dragDrop.title')
                    .split('\n')
                    .map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                </>
              }
              description={t('help.basicOperations.dragDrop.description')}
            />
            <HelpItem
              title={t('help.basicOperations.moveColumn.title')}
              description={t('help.basicOperations.moveColumn.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.taskManagement.title')}
            icon={List}
            backgroundClass={SECTION_COLORS.PRIMARY_BLUE}
          >
            <HelpItem
              title={t('help.taskManagement.editTask.title')}
              description={t('help.taskManagement.editTask.description')}
            />
            <HelpItem
              title={t('help.taskManagement.duplicateTask.title')}
              description={t('help.taskManagement.duplicateTask.description')}
            />
            <HelpItem
              title={t('help.taskManagement.editor.title')}
              description={t('help.taskManagement.editor.description')}
            />
            <HelpItem
              title={t('help.taskManagement.complete.title')}
              description={t('help.taskManagement.complete.description')}
            />
            <HelpItem
              title={t('help.taskManagement.subtasks.title')}
              description={t('help.taskManagement.subtasks.description')}
            />
            <HelpItem
              title={t('help.taskManagement.labels.title')}
              description={t('help.taskManagement.labels.description')}
            />
            <HelpItem
              title={t('help.taskManagement.dueRecurrence.title')}
              description={t('help.taskManagement.dueRecurrence.description')}
            />
            <HelpItem
              title={t('help.taskManagement.priority.title')}
              description={t('help.taskManagement.priority.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.attachments.title')}
            icon={Paperclip}
            backgroundClass={SECTION_COLORS.ATTENTION_YELLOW}
          >
            <HelpItem
              title={t('help.attachments.fileManagement.title')}
              description={t('help.attachments.fileManagement.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.calendarFeature.title')}
            icon={Calendar}
            backgroundClass={SECTION_COLORS.ACCENT_PURPLE}
          >
            <HelpItem
              title={t('help.calendarFeature.monthlyView.title')}
              description={t('help.calendarFeature.monthlyView.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.filterSort.title')}
            icon={Filter}
            backgroundClass={SECTION_COLORS.DANGER_RED}
          >
            <HelpItem
              title={t('help.filterSort.filterSort.title')}
              description={t('help.filterSort.filterSort.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.templateManagement.title')}
            icon={FileText}
            backgroundClass={SECTION_COLORS.MUTED_GRAY}
          >
            <HelpItem
              title={t('help.templateManagement.templates.title')}
              description={t('help.templateManagement.templates.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.tableView.title')}
            icon={Table}
            backgroundClass={SECTION_COLORS.PRIMARY_BLUE}
          >
            <HelpItem
              title={t('help.tableView.columnManagement.title')}
              description={t('help.tableView.columnManagement.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.dataManagement.title')}
            icon={Database}
            backgroundClass={SECTION_COLORS.SPONSOR_ORANGE}
          >
            <HelpItem
              title={t('help.dataManagement.localStorage.title')}
              description={t('help.dataManagement.localStorage.description')}
            />
            <HelpItem
              title={t('help.dataManagement.import.title')}
              description={t('help.dataManagement.import.description')}
            />
            <HelpItem
              title={
                <>
                  {t('help.dataManagement.export.title')
                    .split('\n')
                    .map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                </>
              }
              description={t('help.dataManagement.export.description')}
            />
            <HelpItem
              title={t('help.dataManagement.labelManagement.title')}
              description={t('help.dataManagement.labelManagement.description')}
            />
            <HelpItem
              title={
                <>
                  {t('help.dataManagement.defaultColumn.title')
                    .split('\n')
                    .map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                </>
              }
              description={t('help.dataManagement.defaultColumn.description')}
            />
            <HelpItem
              title={t('help.dataManagement.management.title')}
              description={t('help.dataManagement.management.description')}
            />
          </HelpSection>

          <HelpSection
            title={t('help.tips.title')}
            icon={Info}
            backgroundClass={SECTION_COLORS.SUCCESS_GREEN}
          >
            <HelpItem
              title={t('help.tips.keyboard.title')}
              description={t('help.tips.keyboard.description')}
            />
            <HelpItem
              title={t('help.tips.offline.title')}
              description={t('help.tips.offline.description')}
            />
            <HelpItem
              title={t('help.tips.efficiency.title')}
              description={t('help.tips.efficiency.description')}
            />
          </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpSidebar;

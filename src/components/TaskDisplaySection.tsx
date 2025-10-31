import { memo } from 'react';

interface TaskDisplaySectionProps {
  title: string;
  children: React.ReactNode;
  marginBottom?: string;
}

const TaskDisplaySection = memo<TaskDisplaySectionProps>(
  ({ title, children, marginBottom = '16px' }) => (
    <div style={{ marginBottom }}>
      <h3 className='text-sm m-0 mb-2 font-bold'>{title}</h3>
      {children}
    </div>
  )
);

TaskDisplaySection.displayName = 'TaskDisplaySection';

export default TaskDisplaySection;

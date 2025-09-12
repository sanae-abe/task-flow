import { Box, Heading } from '@primer/react';
import { memo } from 'react';

interface TaskDisplaySectionProps {
  title: string;
  children: React.ReactNode;
  mb?: number;
}

const TaskDisplaySection = memo<TaskDisplaySectionProps>(({ 
  title, 
  children, 
  mb = 4 
}) => (
    <Box sx={{ mb }}>
      <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: '700' }}>
        {title}
      </Heading>
      {children}
    </Box>
  ));

TaskDisplaySection.displayName = 'TaskDisplaySection';

export default TaskDisplaySection;
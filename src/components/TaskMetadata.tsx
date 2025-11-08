import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Task } from '../types';
import { formatDateTime } from '../utils/dateHelpers';

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => {
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <h3 className='text-sm m-0 mb-2 font-bold'>
        {t('task.createdUpdatedDateTime')}
      </h3>
      <div className='p-3 flex flex-col gap-1 bg-gray-50 text-sm'>
        <p>
          {t('task.createdDateTime')}: {formatDateTime(task.createdAt)}
        </p>
        <p>
          {t('task.updatedDateTime')}: {formatDateTime(task.updatedAt)}
        </p>
      </div>
    </div>
  );
};

export default TaskMetadata;

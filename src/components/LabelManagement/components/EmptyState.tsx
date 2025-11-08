import React from 'react';
import { useTranslation } from 'react-i18next';

const EmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className='text-center py-6 border border-border border-dashed rounded-md flex flex-col gap-2 justify-center items-center'>
      <span className='text-zinc-700'>{t('label.noLabels')}</span>
    </div>
  );
};

export default EmptyState;

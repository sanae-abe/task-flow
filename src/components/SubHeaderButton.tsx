import type { Icon } from '@primer/octicons-react';
import { Button, type ButtonProps } from '@primer/react';
import React from 'react';

interface SubHeaderButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  icon: Icon;
  children: React.ReactNode;
}

const SubHeaderButton: React.FC<SubHeaderButtonProps> = ({ 
  icon: IconComponent, 
  children, 
  ...props 
}) => (
    <Button
      size="small"
      variant="invisible"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
      {...props}
    >
      <IconComponent size={16} />
      {children}
    </Button>
  );

export default SubHeaderButton;
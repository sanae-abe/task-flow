import React from 'react';
import { Text } from '@primer/react';

interface CounterLabelProps {
  count: number;
}

const CounterLabel: React.FC<CounterLabelProps> = ({ count }) => (
  <Text
    sx={{
      fontSize: 1,
      fontWeight: count > 0 ? 'bold' : 'normal',
      color: count > 0 ? 'fg.default' : 'fg.muted'
    }}
  >
    {count}
  </Text>
);

export default CounterLabel;
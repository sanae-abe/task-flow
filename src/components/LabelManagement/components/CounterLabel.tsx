import React from 'react';

interface CounterLabelProps {
  count: number;
}

const CounterLabel: React.FC<CounterLabelProps> = ({ count }) => (
  <span
    className={`text-sm ${
      count > 0
        ? 'font-bold text-foreground'
        : 'font-normal text-muted-foreground'
    }`}
  >
    {count}
  </span>
);

export default CounterLabel;
import React from 'react';

interface CounterLabelProps {
  count: number;
}

const CounterLabel: React.FC<CounterLabelProps> = ({ count }) => (
  <span
    className={`text-sm ${
      count > 0
        ? 'font-bold text-foreground'
        : 'font-normal text-zinc-700'
    }`}
  >
    {count}
  </span>
);

export default CounterLabel;
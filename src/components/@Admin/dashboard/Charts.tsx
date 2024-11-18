import React from 'react';
import type { FC } from 'react';
import ChartOne from '@/components/Charts/ChartOne';
import ChartTwo from '@/components/Charts/ChartTwo';
import ChartThree from '@/components/Charts/ChartThree';

interface IChartsProps {}

const Charts: FC<IChartsProps> = ({}) => {
  return (
    <div className="2xl:mt-7.5 2xl:gap-7.5 mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6">
      <ChartOne />
      <ChartTwo />
      <ChartThree />
    </div>
  );
};

export default Charts;

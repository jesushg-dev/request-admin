'use client';

import ChartOne from '@/components/Charts/ChartOne';
import ChartTwo from '@/components/Charts/ChartTwo';
import ChartThree from '@/components/Charts/ChartThree';
import React from 'react';

const Chart: React.FC = () => {
  return (
    <>
      <div className="2xl:gap-7.5 grid grid-cols-12 gap-4 md:gap-6">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
      </div>
    </>
  );
};

export default Chart;

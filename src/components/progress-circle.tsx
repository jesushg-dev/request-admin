'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressCircleProps {
  value: number;
  total: number;
  label: string;
}

export function ProgressCircle({ value, total, label }: ProgressCircleProps) {
  const percentage = total <= 0 ? 100 : (value / total) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative h-20 w-20">
        <Progress value={percentage} className="h-20 w-20 rotate-[-90deg]" />
        <div className="absolute inset-0 flex items-center justify-center text-white dark:text-black">
          <div className="text-center">
            <span className="text-xl font-bold">
              {value}/{total}
            </span>
            <p className="text-xs">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

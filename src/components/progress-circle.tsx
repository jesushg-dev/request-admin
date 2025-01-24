'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressCircleProps {
  value: number;
  total: number;
  label: string;
}

export function ProgressCircle({ value, total, label }: ProgressCircleProps) {
  const percentage = (value / total) * 100;

  return (
    <div className="flex min-w-[150px] flex-col items-center justify-center p-4">
      <div className="relative h-20 w-20">
        <Progress value={percentage} className="h-20 w-20 rotate-[-90deg]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-xl font-bold">
              {value}/{total}
            </span>
            <p className="text-muted-foreground text-xs">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

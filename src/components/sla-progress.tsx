'use client';

import { Progress } from '@/components/ui/progress';

interface SLAProgressProps {
  resolutionTime: number;
  escalationTime: number;
  timeRemaining: number;
  progress: number;
}

export function SLAProgress({ resolutionTime, escalationTime, timeRemaining, progress }: SLAProgressProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Current SLA</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Resolution Time: {resolutionTime} hours</span>
          <span>Escalation Time: {escalationTime} hours</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm">Time Remaining</span>
          <p className="text-2xl font-bold">{timeRemaining}h</p>
        </div>
      </div>
    </div>
  );
}

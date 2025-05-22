import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

import type { TimerNodeType } from '@/types/execution-flow';

export const TimerNode = memo(({ data }: NodeProps<TimerNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-full bg-amber-50 border-amber-300 min-w-[150px] dark:bg-amber-900 dark:border-amber-600">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-300" />
        <div className="font-medium dark:text-amber-100">{data.label}</div>
      </div>
      <div className="text-center text-sm dark:text-amber-100">
        {data.duration} {data.timeUnit}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TimerNode.displayName = 'TimerNode';

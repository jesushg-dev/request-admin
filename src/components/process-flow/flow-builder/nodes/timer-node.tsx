import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

import type { TimerNodeType } from '@/types/execution-flow';

export const TimerNode = memo(({ data }: NodeProps<TimerNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-full bg-amber-50 border-amber-300 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-amber-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-center text-sm">
        {data.duration} {data.timeUnit}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TimerNode.displayName = 'TimerNode';

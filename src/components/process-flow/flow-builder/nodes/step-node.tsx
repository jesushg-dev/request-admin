import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box, Clock, User } from 'lucide-react';

import type { StepNodeType } from '@/types/execution-flow';

export const StepNode = memo(({ data }: NodeProps<StepNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded bg-blue-50 border-blue-300 min-w-[200px] dark:bg-blue-900 dark:border-blue-600">
      <div className="flex items-center gap-2 mb-1">
        <Box className="w-4 h-4 text-blue-500 dark:text-blue-300" />
        <div className="font-medium dark:text-blue-100">{data.label}</div>
      </div>
      {data.action && <div className="px-2 py-1 mb-2 text-sm bg-white/70 rounded dark:bg-blue-800 dark:text-blue-100">{data.action}</div>}
      <div className="flex flex-wrap gap-2 text-xs">
        {data.responsible && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full dark:bg-blue-800 dark:text-blue-100">
            <User className="w-3 h-3" /> {data.responsible}
          </div>
        )}
        {data.estimatedTime && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full dark:bg-amber-900 dark:text-amber-100">
            <Clock className="w-3 h-3" /> {data.estimatedTime} {data.timeUnit}
          </div>
        )}
        {data.sla && <div className="px-2 py-1 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-100">⏱️ SLA: {data.sla}h</div>}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StepNode.displayName = 'StepNode';

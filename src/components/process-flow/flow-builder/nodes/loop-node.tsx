import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { RefreshCw } from 'lucide-react';

import type { LoopNodeType } from '@/types/execution-flow';

export const LoopNode = memo(({ data }: NodeProps<LoopNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-lg bg-purple-50 border-purple-300 min-w-[150px] dark:bg-purple-900 dark:border-purple-600">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-300" />
        <div className="font-medium dark:text-purple-100">{data.label}</div>
      </div>
      {data.condition && <div className="px-2 py-1 mb-1 text-sm bg-white rounded dark:bg-purple-800 dark:text-purple-100">{data.condition}</div>}
      {data.maxIterations && <div className="text-xs text-purple-700 dark:text-purple-200">🔁 {data.maxIterations}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="success" />
      <Handle type="source" position={Position.Right} id="error" />
    </div>
  );
});

LoopNode.displayName = 'LoopNode';

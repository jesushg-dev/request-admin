import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';

import type { EndNodeType } from '@/types/execution-flow';

export const EndNode = memo(({ data }: NodeProps<EndNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-full bg-red-100 border-red-500 min-w-[100px] text-center dark:bg-red-900 dark:border-red-400">
      <div className="flex items-center justify-center gap-2">
        <Square className="w-4 h-4 fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" />
        <div className="dark:text-red-100">{data.label}</div>
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
});

EndNode.displayName = 'EndNode';

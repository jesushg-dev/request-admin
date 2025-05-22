import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

import type { StartNodeType } from '@/types/execution-flow';

export const StartNode = memo(({ data }: NodeProps<StartNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-full bg-green-100 border-green-500 min-w-[100px] text-center dark:bg-green-900 dark:border-green-400">
      <div className="flex items-center justify-center gap-2">
        <Play className="w-4 h-4 fill-green-500 text-green-500 dark:fill-green-400 dark:text-green-400" />
        <div className="dark:text-green-100">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StartNode.displayName = 'StartNode';

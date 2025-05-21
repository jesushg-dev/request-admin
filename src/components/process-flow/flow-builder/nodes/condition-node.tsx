import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

import type { ConditionNodeType } from '@/types/execution-flow';

export const ConditionNode = memo(({ data }: NodeProps<ConditionNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded-lg bg-yellow-50 border-yellow-300 min-w-[150px] rotate-45">
      <div className="flex flex-col items-center -rotate-45">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="w-4 h-4 text-yellow-600" />
          <div className="font-medium">{data.label}</div>
        </div>
        {data.expression && <div className="px-2 py-1 text-xs bg-white rounded">{data.expression}</div>}
      </div>
      <Handle type="target" position={Position.Top} className="-rotate-45" />
      <Handle type="source" position={Position.Right} className="-rotate-45" id="yes" />
      <Handle type="source" position={Position.Bottom} className="-rotate-45" id="no" />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

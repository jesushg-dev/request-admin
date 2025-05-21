import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Layers } from 'lucide-react';

import type { SubProcessNodeType } from '@/types/execution-flow';

export const SubprocessNode = memo(({ data }: NodeProps<SubProcessNodeType>) => {
  return (
    <div className="px-4 py-2 border-2 border-dashed rounded bg-gray-50 border-gray-400 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4 text-gray-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      {data.processRef && <div className="px-2 py-1 text-xs bg-white rounded border border-gray-200">Ref: {data.processRef}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

SubprocessNode.displayName = 'SubprocessNode';

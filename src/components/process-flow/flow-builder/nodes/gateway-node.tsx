import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

export const GatewayNode = memo(({ data }: NodeProps) => {
  const isParallel = data.type === 'parallel';

  return (
    <div className="px-4 py-2 border rounded-lg bg-teal-50 border-teal-300 min-w-[150px] rotate-45">
      <div className="flex flex-col items-center -rotate-45">
        <div className="flex items-center gap-2 mb-1">
          <GitMerge className="w-4 h-4 text-teal-600" />
          <div className="font-medium">{data.label}</div>
        </div>
        <div className="px-2 py-0.5 text-xs bg-white/50 rounded-full">{isParallel ? 'Parallel' : 'Inclusive'}</div>
      </div>
      <Handle type="target" position={Position.Top} className="-rotate-45" />
      <Handle type="source" position={Position.Right} className="-rotate-45" />
      <Handle type="source" position={Position.Bottom} className="-rotate-45" />
      <Handle type="source" position={Position.Left} className="-rotate-45" />
    </div>
  );
});

GatewayNode.displayName = 'GatewayNode';

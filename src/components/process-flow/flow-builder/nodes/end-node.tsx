import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';

export const EndNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 border rounded-full bg-red-100 border-red-500 min-w-[100px] text-center">
      <div className="flex items-center justify-center gap-2">
        <Square className="w-4 h-4 fill-red-500 text-red-500" />
        <div>{data.label}</div>
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
});

EndNode.displayName = 'EndNode';

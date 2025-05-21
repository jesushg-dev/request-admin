import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

import type { MessageNodeType } from '@/types/execution-flow';

export const MessageNode = memo(({ data }: NodeProps<MessageNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded bg-violet-50 border-violet-300 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-violet-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      {data.message && <div className="px-2 py-1 text-sm bg-white/70 rounded">{data.message}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';

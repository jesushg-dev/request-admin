import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cpu } from 'lucide-react';

export const TaskNode = memo(({ data }: NodeProps) => {
  const getTaskBg = () => {
    switch (data.type) {
      case 'manual':
        return 'bg-indigo-50 border-indigo-300';
      case 'automatic':
        return 'bg-green-50 border-green-300';
      case 'api':
        return 'bg-cyan-50 border-cyan-300';
      case 'rpa':
        return 'bg-orange-50 border-orange-300';
      default:
        return 'bg-indigo-50 border-indigo-300';
    }
  };

  return (
    <div className={`px-4 py-2 border rounded ${getTaskBg()} min-w-[150px]`}>
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="w-4 h-4 text-indigo-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="px-2 py-0.5 mb-1 text-xs bg-white/50 rounded-full inline-block">{data.type || 'manual'}</div>
      {data.details && <div className="px-2 py-1 text-sm bg-white/70 rounded">{data.details}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

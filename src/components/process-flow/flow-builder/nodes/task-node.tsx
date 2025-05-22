import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cpu } from 'lucide-react';

import type { TaskNodeType } from '@/types/execution-flow';

const getTaskBg = (type: string) => {
  switch (type) {
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

const getTaskBgDark = (type: string) => {
  switch (type) {
    case 'manual':
      return 'bg-indigo-900 border-indigo-600';
    case 'automatic':
      return 'bg-green-900 border-green-600';
    case 'api':
      return 'bg-cyan-900 border-cyan-600';
    case 'rpa':
      return 'bg-orange-900 border-orange-600';
    default:
      return 'bg-indigo-900 border-indigo-600';
  }
};

export const TaskNode = memo(({ data }: NodeProps<TaskNodeType>) => {
  return (
    <div className={`px-4 py-2 border rounded ${getTaskBg(data.type)} min-w-[150px] dark:${getTaskBgDark(data.type)}`}>
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
        <div className="font-medium dark:text-indigo-100">{data.label}</div>
      </div>
      <div className="px-2 py-0.5 mb-1 text-xs bg-white/50 rounded-full inline-block dark:bg-indigo-800 dark:text-indigo-100">{data.type || 'manual'}</div>
      {data.details && <div className="px-2 py-1 text-sm bg-white/70 rounded dark:bg-indigo-900 dark:text-indigo-100">{data.details}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

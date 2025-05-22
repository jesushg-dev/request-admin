import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Bell } from 'lucide-react';

import type { NotificationNodeType } from '@/types/execution-flow';

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'email':
      return '📧';
    case 'sms':
      return '📱';
    case 'alert':
      return '🔔';
    default:
      return '📧';
  }
};

export const NotificationNode = memo(({ data }: NodeProps<NotificationNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded bg-pink-50 border-pink-300 min-w-[150px] dark:bg-pink-900 dark:border-pink-600">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-pink-600 dark:text-pink-300" />
        <div className="font-medium dark:text-pink-100">{data.label}</div>
      </div>
      <div className="px-2 py-0.5 mb-1 text-xs bg-white/50 rounded-full inline-block dark:bg-pink-800 dark:text-pink-100">
        {getChannelIcon(data.channel)} {data.channel}
      </div>
      {data.message && <div className="px-2 py-1 text-sm bg-white/70 rounded dark:bg-pink-800 dark:text-pink-100">{data.message}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

NotificationNode.displayName = 'NotificationNode';

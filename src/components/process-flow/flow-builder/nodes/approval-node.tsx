import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckSquare, ShieldUser } from 'lucide-react';

import type { ApprovalNodeType } from '@/types/execution-flow';

export const ApprovalNode = memo(({ data }: NodeProps<ApprovalNodeType>) => {
  return (
    <div className="px-4 py-2 border rounded bg-emerald-50 border-emerald-300 min-w-[150px] dark:bg-emerald-900 dark:border-emerald-600">
      <div className="flex items-center gap-2 mb-1">
        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
        <div className="font-medium dark:text-emerald-100">{data.label}</div>
      </div>
      {data.approvers && data.approvers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.approvers.map((approver: string, index: number) => (
            <div key={index} className="px-2 py-0.5 text-xs bg-emerald-100 rounded-full dark:bg-emerald-800 dark:text-emerald-100">
              <ShieldUser /> {approver}
            </div>
          ))}
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="approve" />
      <Handle type="source" position={Position.Right} id="reject" />
    </div>
  );
});

ApprovalNode.displayName = 'ApprovalNode';

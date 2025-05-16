import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckSquare } from 'lucide-react';

export const ApprovalNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 border rounded bg-emerald-50 border-emerald-300 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <CheckSquare className="w-4 h-4 text-emerald-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      {data.approvers && data.approvers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.approvers.map((approver: string, index: number) => (
            <div key={index} className="px-2 py-0.5 text-xs bg-emerald-100 rounded-full">
              👤 {approver}
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

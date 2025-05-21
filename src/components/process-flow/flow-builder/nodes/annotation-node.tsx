import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';

import type { AnnotationNodeType } from '@/types/execution-flow';

export const AnnotationNode = memo(({ data }: NodeProps<AnnotationNodeType>) => {
  return (
    <div className="px-4 py-2 border border-dashed rounded bg-gray-50 border-gray-300 min-w-[150px] max-w-[250px]">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-4 h-4 text-gray-600" />
        <div className="font-medium">{data.label}</div>
      </div>
      {data.text && <div className="px-2 py-1 text-sm italic text-gray-600">{data.text}</div>}
    </div>
  );
});

AnnotationNode.displayName = 'AnnotationNode';

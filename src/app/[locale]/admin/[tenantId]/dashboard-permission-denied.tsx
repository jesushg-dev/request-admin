'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionEmptyState } from '@/components/shared/permission-empty-state';

export default function DashboardPermissionDenied() {
  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <PermissionEmptyState />
      </div>
    </ScrollArea>
  );
}


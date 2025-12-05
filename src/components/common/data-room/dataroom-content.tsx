'use client';

import { useState } from 'react';

import { DataroomFolderWithRelations } from '@/types/zenstackhq/document';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import { DataroomDocuments } from './dataroom-documents';
import { DataroomFolderTree } from './dataroom-folder-tree';

interface DataroomContentProps {
  dataroomId: string;
  tenantId: string;
  callbackUrl: string;
  folders: DataroomFolderWithRelations[];
}

export function DataroomContent({ dataroomId, tenantId, callbackUrl, folders }: DataroomContentProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={35} collapsible className="min-w-[200px]">
        <DataroomFolderTree folders={folders} currentFolderId={currentFolderId} onFolderSelect={setCurrentFolderId} />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={80} minSize={65} className="flex-1 overflow-hidden">
        <DataroomDocuments dataroomId={dataroomId} tenantId={tenantId} callbackUrl={callbackUrl} currentFolderId={currentFolderId} onFolderChange={setCurrentFolderId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

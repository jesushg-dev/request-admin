'use client';

import { useMemo, useState, type FC } from 'react';

import { type DataroomViewerDetail } from '@/types/prisma/document';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ViewerGroup {
  id: string;
  name: string;
  memberCount: number;
  domains: string[];
  allowAll: boolean;
  accessControls: AccessControl[];
}

interface DataroomItem {
  id: string;
  name: string;
  type: 'DATAROOM_DOCUMENT' | 'DATAROOM_FOLDER';
}

interface AccessControl {
  id: string;
  itemId: string;
  itemType: 'DATAROOM_DOCUMENT' | 'DATAROOM_FOLDER';
  itemName: string;
  canView: boolean;
  canDownload: boolean;
}

interface AccessControlManagementProps {
  tenantId: string;
  dataroomId: string;
  isLoading: boolean;
  selectedGroupId: string;
  folders: DataroomViewerDetail['folders'];
  documents: DataroomViewerDetail['documents'];
}

export const AccessControlManagement: FC<AccessControlManagementProps> = ({ isLoading, selectedGroupId, folders, documents }) => {
  const [viewerGroups, setViewerGroups] = useState<ViewerGroup[]>([]);

  const dataroomItems: DataroomItem[] = useMemo(() => {
    if (!documents && !folders) return [];
    const documentsList = documents?.map((doc) => ({ id: doc.id, name: doc.name, type: 'DATAROOM_DOCUMENT' as const })) ?? [];
    const foldersList = folders?.map((folder) => ({ id: folder.id, name: folder.name, type: 'DATAROOM_FOLDER' as const })) ?? [];
    return [...documentsList, ...foldersList];
  }, [folders, documents]);

  const handleUpdatePermissions = (itemId: string, permission: 'view' | 'download', value: boolean) => {
    if (!selectedGroupId) return;

    setViewerGroups(
      viewerGroups.map((group) => {
        if (group.id === selectedGroupId) {
          const existingControlIndex = group.accessControls.findIndex((ac) => ac.itemId === itemId);

          if (existingControlIndex >= 0) {
            // Update existing control
            const updatedControls = [...group.accessControls];
            if (permission === 'view') {
              updatedControls[existingControlIndex].canView = value;
            } else {
              updatedControls[existingControlIndex].canDownload = value;
            }
            return { ...group, accessControls: updatedControls };
          } else {
            // Create new control
            const item = dataroomItems.find((i) => i.id === itemId);
            if (!item) return group;

            const newControl: AccessControl = {
              id: `ac_${Date.now()}`,
              itemId,
              itemType: item.type,
              itemName: item.name,
              canView: permission === 'view' ? value : false,
              canDownload: permission === 'download' ? value : false,
            };

            return { ...group, accessControls: [...group.accessControls, newControl] };
          }
        }
        return group;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg  overflow-y-auto flex flex-1">
      <table className="min-w-full divide-y divide-border ">
        <thead className="bg-muted">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Item
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              View
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Download
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border flex-1">
          {dataroomItems.map((item) => {
            const accessControl = viewerGroups.find((g) => g.id === selectedGroupId)?.accessControls.find((ac) => ac.itemId === item.id);

            return (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant="outline">{item.type === 'DATAROOM_DOCUMENT' ? 'Document' : 'Folder'}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <Checkbox checked={accessControl?.canView || false} onCheckedChange={(checked) => handleUpdatePermissions(item.id, 'view', checked === true)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <Checkbox checked={accessControl?.canDownload || false} onCheckedChange={(checked) => handleUpdatePermissions(item.id, 'download', checked === true)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

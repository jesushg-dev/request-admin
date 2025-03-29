import { FC } from 'react';

import { DataroomViewerGroups } from '@/components/common/data-room/dataroom-viewer-groups';

interface DataroomViewersPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const DataroomViewersPage: FC<DataroomViewersPageProps> = async ({ params }) => {
  const { slug, tenantId } = await params;

  return (
    <div className="flex flex-col p-4 flex-1">
      <DataroomViewerGroups dataroomId={slug} tenantId={tenantId} />
    </div>
  );
};

export default DataroomViewersPage;

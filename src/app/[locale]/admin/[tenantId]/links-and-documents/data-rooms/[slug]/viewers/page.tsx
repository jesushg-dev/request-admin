import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataroomViewerGroups } from '@/components/common/data-rooms/dataroom-viewer-groups';

interface DataroomViewersPageProps {
  params: {
    id: string;
  };
}

export default function DataroomViewersPage({ params }: DataroomViewersPageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/datarooms/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dataroom
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Viewer Groups</h1>
      </div>
      <DataroomViewerGroups dataroomId={params.id} />
    </div>
  );
}

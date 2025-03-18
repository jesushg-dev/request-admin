import { DataroomDetail } from '@/components/common/data-rooms/dataroom-detail';

interface DataroomDetailPageProps {
  params: {
    id: string;
  };
}

export default function DataroomDetailPage({ params }: DataroomDetailPageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DataroomDetail id={params.id} />
    </div>
  );
}

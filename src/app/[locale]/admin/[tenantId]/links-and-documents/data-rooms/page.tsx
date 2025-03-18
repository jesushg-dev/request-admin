import { DataroomList } from '@/components/common/data-rooms/dataroom-list';

export default function DataroomsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Datarooms</h2>
      </div>
      <DataroomList />
    </div>
  );
}

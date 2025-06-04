import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Skeleton className="flex-1 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export default Loading;

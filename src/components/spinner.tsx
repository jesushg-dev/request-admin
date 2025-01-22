import { Loader } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}
export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn('flex h-full items-center justify-center', className)}>
      <Loader className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
};

import { FC, ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';

// Define props for the EmptyState component
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

// Reusable EmptyState component
const EmptyState: FC<EmptyStateProps> = ({ title = 'No items available', description = 'No content matches your current selection.', icon = <InboxIcon className="w-10 h-10" /> }) => {
  return (
    <div className="flex-1 gap-4 flex justify-center items-center flex-col">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">{icon}</div>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;

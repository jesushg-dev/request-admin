import { LayoutGridIcon, TableIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  viewType: 'table' | 'card';
  onViewChange: (viewType: 'table' | 'card') => void;
  className?: string;
}

export function ViewToggle({ viewType, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex justify-end ${className}`}>
      <Button type="button" variant="outline" size="sm" onClick={() => onViewChange(viewType === 'table' ? 'card' : 'table')}>
        {viewType === 'table' ? (
          <>
            <LayoutGridIcon className="mr-2 h-4 w-4" />
            Card View
          </>
        ) : (
          <>
            <TableIcon className="mr-2 h-4 w-4" />
            Table View
          </>
        )}
      </Button>
    </div>
  );
}

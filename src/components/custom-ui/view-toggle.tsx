'use client';

import { LayoutGridIcon, TableIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';

const viewModes = ['table', 'card'] as const;
export type ViewMode = (typeof viewModes)[number];

interface ViewToggleProps {
  queryKey: string;
  className?: string;
}

export function ViewToggle({ queryKey, className = '' }: ViewToggleProps) {
  const [viewType, setViewType] = useQueryState(queryKey, parseAsStringLiteral(viewModes).withDefault('table'));

  const toggleView = () => {
    setViewType(viewType === 'table' ? 'card' : 'table');
  };

  return (
    <div className={`flex justify-end ${className}`}>
      <Button type="button" variant="outline" size="sm" onClick={toggleView}>
        {viewType === 'table' ? (
          <>
            <LayoutGridIcon className="h-4 w-4" />
            <span className="sr-only">Card View</span>
          </>
        ) : (
          <>
            <TableIcon className="h-4 w-4" />
            <span className="sr-only">Table View</span>
          </>
        )}
      </Button>
    </div>
  );
}

//export a hook wrapper to use the view toggle
export function useViewToggle(queryKey: string) {
  const [viewType, setViewType] = useQueryState(queryKey, parseAsStringLiteral(viewModes).withDefault('table'));

  const toggleView = () => {
    setViewType(viewType === 'table' ? 'card' : 'table');
  };

  return [viewType, toggleView] as const;
}

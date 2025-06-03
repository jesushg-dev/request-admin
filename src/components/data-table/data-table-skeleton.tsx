import { memo } from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

interface DataTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'table' | 'card';

  /**
   * The number of columns in the table.
   * @type number
   */
  columnCount: number;

  /**
   * The number of rows in the table.
   * @default 10
   * @type number | undefined
   */
  rowCount?: number;

  /**
   * The width of each cell in the table.
   * The length of the array should be equal to the columnCount.
   * Any valid CSS width value is accepted.
   * @default ["auto"]
   * @type string[] | undefined
   */
  cellWidths?: string[];

  /**
   * Flag to prevent the table cells from shrinking.
   * @default false
   * @type boolean | undefined
   */
  shrinkZero?: boolean;
}

export const DataTableSkeleton = memo(function DataTableSkeleton(props: DataTableSkeletonProps) {
  const { columnCount, variant = 'table', rowCount = 10, cellWidths = ['auto'], shrinkZero = false, className, ...skeletonProps } = props;
  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(280px,max-content))] gap-4 w-fit', className)} {...skeletonProps}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex-1 flex items-stretch">
            <div className="flex flex-col gap-2 p-4 border rounded-md w-full">
              {Array.from({ length: columnCount }).map((_, j) => (
                <div
                  key={j}
                  className="w-full"
                  style={{
                    width: cellWidths[j],
                    minWidth: shrinkZero ? cellWidths[j] : 'auto',
                  }}>
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: table skeleton
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell
              key={j}
              style={{
                width: cellWidths[j],
                minWidth: shrinkZero ? cellWidths[j] : 'auto',
              }}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
});

DataTableSkeleton.displayName = 'DataTableSkeleton';

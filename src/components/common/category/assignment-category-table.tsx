'use client';

import { useFindFirstAssignmentHierarchyLevel, useFindManyAssignmentCategory } from '@/services/api/hooks';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable } from '@/components/data-table/data-table';

const AssignmentCategoryDefaultArgs = Prisma.validator<Prisma.AssignmentCategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    hierarchyLevelId: true,
    area: { select: { name: true } },
    _count: { select: { subcategories: true, assignmentRequests: true } },
  },
});

type AssignmentCategory = Prisma.AssignmentCategoryGetPayload<typeof AssignmentCategoryDefaultArgs>;

interface IAssignmentCategoryBaseProps {
  referenceId: string;
  visibleCellsCount: number;
  columns: ColumnDef<AssignmentCategory>[];
  isExpanded: boolean;
  parentType: 'area' | 'category';
  areaId?: string;
}

function AssignmentCategorySubTable({ referenceId, visibleCellsCount, columns, isExpanded, parentType, areaId }: IAssignmentCategoryBaseProps) {
  const { data, isError, error, refetch, isLoading } = useFindManyAssignmentCategory(
    {
      select: AssignmentCategoryDefaultArgs.select,
      where: {
        areaId: parentType === 'area' ? referenceId : areaId,
        hierarchyLevel: parentType === 'area' ? { position: 1 } : undefined,
        parentCategoryId: parentType === 'category' ? referenceId : undefined,
      },
      orderBy: { name: 'asc' },
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstAssignmentHierarchyLevel(
    {
      select: { name: true, position: true },
      where: { id: data?.[0]?.hierarchyLevelId },
    },
    { enabled: isExpanded && !isLoading && (data?.length || 0) > 0 }
  );

  const nestedTable = useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (nestedRow) => nestedRow.original._count.subcategories > 0,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={visibleCellsCount}>
          <ErrorRetryFallback error={error} onRetry={refetch} />
        </TableCell>
      </TableRow>
    );
  }

  if (!isExpanded) {
    return null;
  }

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={visibleCellsCount}>
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={visibleCellsCount} className="text-center text-muted-foreground p-4">
          No subcategories found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={visibleCellsCount}>
        <div className="space-y-4 pl-6 border-l-2 border-muted">
          <div className="flex items-center space-x-2">
            {hierarchyIsLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span className="font-semibold text-sm text-muted-foreground">
                {hierarchy?.name} #{hierarchy?.position}
              </span>
            )}
          </div>
          <DataTable
            table={nestedTable}
            subComponent={{
              columns,
              render: ({ row, columns, isExpanded }) => (
                <AssignmentCategorySubTable
                  visibleCellsCount={row.getVisibleCells().length}
                  parentType="category"
                  columns={columns}
                  isExpanded={isExpanded}
                  // FIX: Pass the current row's ID, not the original referenceId
                  referenceId={row.original.id}
                  // FIX: Always pass the root areaId down the chain
                  areaId={areaId || (parentType === 'area' ? referenceId : areaId)}
                />
              ),
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AssignmentCategoryTable({ referenceId, visibleCellsCount, columns, isExpanded, parentType, areaId }: IAssignmentCategoryBaseProps) {
  return <AssignmentCategorySubTable referenceId={referenceId} visibleCellsCount={visibleCellsCount} columns={columns} isExpanded={isExpanded} parentType={parentType} areaId={areaId} />;
}

export function useAssignmentCategoryTableConfiguration({}: { entity?: string }) {
  const t = useTranslations('component.categoryTable');

  const columns: ColumnDef<AssignmentCategory>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getCanExpand() && (
            <button onClick={row.getToggleExpandedHandler()} className="mr-2 p-1 hover:bg-muted rounded transition-colors" aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}>
              {row.getIsExpanded() ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <span className="font-medium">{row.original.name}</span>
          {row.original._count.subcategories > 0 && <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{row.original._count.subcategories}</span>}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: () => t('columns.description'),
      cell: ({ cell }) => <span className="text-sm text-muted-foreground">{String(cell.getValue() || 'N/A')}</span>,
    },
    {
      header: () => t('columns.area'),
      accessorFn: (row) => row.area?.name,
      id: 'area.name',
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? 'N/A')}</span>,
    },
    {
      header: () => t('columns.subcategories'),
      accessorFn: (row) => row._count?.subcategories,
      id: '_count.subcategories',
      cell: ({ getValue }) => <span className="text-sm font-mono">{String(getValue() ?? 0)}</span>,
    },
    {
      header: () => t('columns.requests'),
      accessorFn: (row) => row._count?.assignmentRequests,
      id: '_count.assignmentRequests',
      cell: ({ getValue }) => <span className="text-sm font-mono">{String(getValue() ?? 0)}</span>,
    },
  ];

  return { columns };
}

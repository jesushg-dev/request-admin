'use client';

import { useFindFirstRequestHierarchyLevel, useFindManyRequestCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable } from '@/components/data-table/data-table';

import RequirementDialogCell from '../requirement/requirement-dialog-cell';

const RequestCategoryDefaultArgs = Prisma.validator<Prisma.RequestCategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    hierarchyLevelId: true,
    isEligibleForNewClients: true,
    _count: { select: { subcategories: true, categoryForms: true, requestCategoryRequirements: true } },
  },
});

type RequestCategory = Prisma.RequestCategoryGetPayload<typeof RequestCategoryDefaultArgs>;

interface IRequestCategoryBaseProps {
  referenceId: string;
  visibleCellsCount: number;
  columns: ColumnDef<RequestCategory>[];
  isExpanded: boolean;
}

function RequestCategorySubTable({ referenceId, visibleCellsCount, columns, isExpanded }: IRequestCategoryBaseProps) {
  const {
    data,
    isError,
    error,
    isLoading: requestCategoryIsLoading,
    refetch,
  } = useFindManyRequestCategory(
    {
      select: RequestCategoryDefaultArgs.select,
      where: {
        parentCategoryId: referenceId,
      },
      orderBy: { name: 'asc' },
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstRequestHierarchyLevel(
    {
      select: { name: true, position: true },
      where: { id: data?.[0]?.hierarchyLevelId },
    },
    { enabled: isExpanded && !requestCategoryIsLoading && (data?.length || 0) > 0 }
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
                <RequestCategorySubTable 
                  // FIX: Pass the current row's ID, not the original referenceId
                  referenceId={row.original.id} 
                  visibleCellsCount={row.getVisibleCells().length} 
                  columns={columns} 
                  isExpanded={isExpanded} 
                />
              ),
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RequestCategoryTable({ referenceId, visibleCellsCount, columns, isExpanded }: IRequestCategoryBaseProps) {
  return (
    <RequestCategorySubTable 
      referenceId={referenceId} 
      visibleCellsCount={visibleCellsCount} 
      columns={columns} 
      isExpanded={isExpanded} 
    />
  );
}

export function useRequestCategoryTableConfiguration({ entity }: { entity?: string }) {
  const t = useTranslations('component.categoryTable');

  const columns: ColumnDef<RequestCategory>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getCanExpand() && (
            <button 
              onClick={row.getToggleExpandedHandler()} 
              className="mr-2 p-1 hover:bg-muted rounded transition-colors"
              aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
            >
              {row.getIsExpanded() ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
          <span className="font-medium">{row.original.name}</span>
          {row.original._count.subcategories > 0 && (
            <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {row.original._count.subcategories}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: () => t('columns.description'),
      cell: ({ cell }) => (
        <span className="text-sm text-muted-foreground">
          {String(cell.getValue() ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'isEligibleForNewClients',
      header: () => t('columns.isEligibleForNewClients'),
      cell: ({ cell }) => (
        <div className="flex items-center justify-center">
          <Checkbox 
            checked={cell.getValue() as boolean} 
            disabled 
            className="cursor-default"
          />
        </div>
      ),
    },
    {
      accessorKey: '_count.categoryForms',
      header: () => t('columns.forms'),
      cell: ({ cell }) => (
        <span className="text-sm font-mono text-center block">
          {String(cell.getValue() ?? 0)}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: '_count.subcategories',
      header: () => t('columns.subcategories'),
      cell: ({ cell }) => (
        <span className="text-sm font-mono text-center block">
          {String(cell.getValue() ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: '_count.requestCategoryRequirements',
      header: () => t('columns.requirements'),
      cell: ({ cell }) => (
        <RequirementDialogCell 
          count={cell.getValue() as number} 
          entity={entity || ''} 
          categoryId={cell.row.original.id} 
        />
      ),
    },
  ];

  return { columns };
}

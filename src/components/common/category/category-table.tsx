'use client';

import React, { useMemo } from 'react';
import { useFindFirstHierarchyLevel, useFindManyCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable } from '@/components/data-table/data-table';

import RequirementDialogCell from '../requirement/requirement-dialog-cell';

/*
  Explanation:
  We split the nested subcomponent into two components:
    1. CategoryTable (the parent, which is used as a sub-renderer by DataTable).
    2. CategorySubTable (the child, used *inside* CategoryTable for nested data).

  This avoids the same component calling itself recursively, which can lead to
  a "Rendered more hooks than during the previous render" error.
*/

// Prisma configuration for Category entity
const CategoryDefaultArgs = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    isEligibleForNewClients: true,
    subcategories: { select: { id: true } },
    _count: { select: { subcategories: true, categoryRequirement: true } },
  },
});

type Category = Prisma.CategoryGetPayload<typeof CategoryDefaultArgs>;

interface ICategoryBaseProps {
  row: Row<{
    categories?: Array<{ id: string }> | null;
    subcategories?: Array<{ id: string }> | null;
  }>;
  columns: ColumnDef<Category>[];
  isExpanded: boolean;
}

/* 
  Child subcomponent for nested expansion. It does the same logic
  of fetching categories, but does NOT recursively call CategoryTable again.
  Instead, CategorySubTable calls itself for deeper nesting, if needed.
*/
function CategorySubTable({ row, columns, isExpanded }: ICategoryBaseProps) {
  // Always call hooks unconditionally
  const ids = useMemo(() => {
    return [...(row.original.categories?.map((cat) => cat.id) || []), ...(row.original.subcategories?.map((subcat) => subcat.id) || [])];
  }, [row.original.categories, row.original.subcategories]);

  const { data, isLoading, isError, error, refetch } = useFindManyCategory(
    {
      where: { id: { in: ids } },
      select: CategoryDefaultArgs.select,
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstHierarchyLevel(
    {
      where: { categories: { some: { id: { in: ids } } } },
      select: {
        name: true,
        categories: {
          select: { id: true },
          where: { id: { in: ids } },
        },
      },
    },
    { enabled: isExpanded }
  );

  // Build a nested table for subcategories
  const nestedTable = useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (nestedRow) => nestedRow.original._count.subcategories > 0,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError) {
    return <ErrorRetryFallback error={error} onRetry={refetch} />;
  }

  if (!isExpanded) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={row.getVisibleCells().length} className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">{hierarchyIsLoading ? <Skeleton className="h-5 w-32" /> : <span className="font-semibold">{hierarchy?.name}</span>}</div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <DataTable
                table={nestedTable}
                subComponent={{
                  columns,
                  render: (props) => <CategorySubTable {...props} />,
                }}
              />
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

/*
  Parent component that is used by your main DataTable as the `subComponent` renderer.
  This calls CategorySubTable for the nested expansion instead of calling itself again.
*/
export function CategoryTable({ row, columns, isExpanded }: ICategoryBaseProps) {
  // We call the same child subcomponent with the same props
  return <CategorySubTable row={row} columns={columns} isExpanded={isExpanded} />;
}

/*
  This hook exports the ColumnDef configuration for your categories.
  It does NOT change. We reference CategoryTable separately to avoid
  recursion issues.
*/
export function useCategoryTableConfiguration({ entity }: { entity?: string }) {
  const t = useTranslations('component.categoryTable');

  const columns: ColumnDef<Category>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ row }) => {
        const hasSubRows = row.getCanExpand();
        return (
          <div className="flex items-center">
            {hasSubRows && (
              <button onClick={row.getToggleExpandedHandler()} style={{ cursor: 'pointer' }} className="mr-2">
                {row.getIsExpanded() ? <ChevronUp className="size-4 shrink-0 opacity-50" /> : <ChevronDown className="size-4 shrink-0 opacity-50" />}
              </button>
            )}
            <span>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: () => t('columns.description'),
      cell: ({ cell }) => cell.getValue() || 'N/A',
    },
    {
      accessorKey: 'isEligibleForNewClients',
      header: () => t('columns.isEligibleForNewClients'),
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label={(cell.getValue() as boolean) ? t('common.yes') : t('common.no')} disabled />,
    },
    {
      accessorKey: '_count.subcategories',
      header: () => t('columns.categories'),
      cell: ({ cell }) => cell.getValue() || 0,
    },
    {
      accessorKey: '_count.categoryRequirement',
      header: () => t('columns.requirements'),
      cell: ({ cell }) => <RequirementDialogCell count={cell.getValue() as number} entity={entity ?? ''} categoryId={cell.row.original.id} />,

      /*cell: ({ cell }) => {
        // If you have a special RequirementDialogCell, reference it here
        const requirementCount = cell.getValue() as number;
        return (
          <span>
            {requirementCount} {entity && `(${entity})`}
          </span>
        );
      },*/
    },
  ];

  return { columns };
}

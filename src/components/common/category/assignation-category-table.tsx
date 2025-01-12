'use client';

import React, { useMemo } from 'react';
import { useFindFirstAssignationHierarchyLevel, useFindManyAssignationCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable } from '@/components/data-table/data-table';

const AssignationCategoryDefaultArgs = Prisma.validator<Prisma.AssignationCategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    area: { select: { name: true } },
    subcategories: { select: { id: true } },
    _count: { select: { subcategories: true, assignmentRequests: true } },
  },
});

type AssignationCategory = Prisma.AssignationCategoryGetPayload<typeof AssignationCategoryDefaultArgs>;

interface IAssignationCategoryBaseProps {
  row: Row<{
    assignationCategories?: Array<{ id: string }> | null;
    subcategories?: Array<{ id: string }> | null;
  }>;
  columns: ColumnDef<AssignationCategory>[];
  isExpanded: boolean;
}

function AssignationCategorySubTable({ row, columns, isExpanded }: IAssignationCategoryBaseProps) {
  const ids = useMemo(() => {
    return [...(row.original.assignationCategories?.map((cat) => cat.id) || []), ...(row.original.subcategories?.map((subcat) => subcat.id) || [])];
  }, [row.original.assignationCategories, row.original.subcategories]);

  const { data, isError, error, refetch } = useFindManyAssignationCategory(
    {
      where: { id: { in: ids } },
      select: AssignationCategoryDefaultArgs.select,
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstAssignationHierarchyLevel(
    {
      where: { categories: { some: { id: { in: ids } } } },
      select: { name: true },
    },
    { enabled: isExpanded }
  );

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
      <TableCell colSpan={row.getVisibleCells().length}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">{hierarchyIsLoading ? <Skeleton className="h-5 w-32" /> : <span className="font-semibold">{hierarchy?.name}</span>}</div>
          <DataTable
            table={nestedTable}
            subComponent={{
              columns,
              render: (props) => <AssignationCategorySubTable {...props} />,
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AssignationCategoryTable({ row, columns, isExpanded }: IAssignationCategoryBaseProps) {
  return <AssignationCategorySubTable row={row} columns={columns} isExpanded={isExpanded} />;
}

export function useAssignationCategoryTableConfiguration({}: { entity?: string }) {
  const t = useTranslations('component.categoryTable');

  const columns: ColumnDef<AssignationCategory>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getCanExpand() && (
            <button onClick={row.getToggleExpandedHandler()} className="mr-2">
              {row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: () => t('columns.description'),
      cell: ({ cell }) => cell.getValue() || 'N/A',
    },
    {
      accessorKey: 'area.name',
      header: () => t('columns.area'),
      cell: ({ cell }) => cell.getValue() || 'N/A',
    },
    {
      accessorKey: '_count.subcategories',
      header: () => t('columns.subcategories'),
      cell: ({ cell }) => cell.getValue() || 0,
    },
    {
      accessorKey: '_count.assignmentRequests',
      header: () => t('columns.requests'),
      cell: ({ cell }) => cell.getValue() || 0,
    },
  ];

  return { columns };
}

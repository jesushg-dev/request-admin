'use client';

import React, { useMemo } from 'react';
import { useFindFirstHierarchyLevel, useFindManyCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable } from '@/components/data-table/data-table';

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

interface ICategoryTableProps {
  row: Row<{
    categories?: Array<{ id: string }> | null;
    subcategories?: Array<{ id: string }> | null;
  }>;
  isExpanded: boolean;
}

const CategoryTable = ({ row, isExpanded }: ICategoryTableProps) => {
  const t = useTranslations('admin.area.main.subtable');

  const { data, isLoading, isError, error, refetch } = useFindManyCategory(
    {
      where: {
        id: {
          in: [...(row.original.categories?.map((category) => category.id) || []), ...(row.original.subcategories?.map((subcategory) => subcategory.id) || [])],
        },
      },
      select: CategoryDefaultArgs.select,
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstHierarchyLevel({
    where: {
      categories: {
        some: {
          id: {
            in: [...(row.original.categories?.map((category) => category.id) || []), ...(row.original.subcategories?.map((subcategory) => subcategory.id) || [])],
          },
        },
      },
    },
    select: { name: true },
  });

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => row.original._count.subcategories > 0,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError) return <ErrorRetryFallback error={error} onRetry={refetch} />;
  if (!isExpanded) return <></>;

  return (
    <TableRow>
      <TableCell colSpan={row.getVisibleCells().length} className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">{hierarchyIsLoading ? <Skeleton className="h-5 w-32" /> : <span className="font-semibold">{hierarchy?.name}</span>}</div>
          <div className="mt-2">{isLoading ? <Skeleton className="h-10 w-full" /> : <DataTable table={table} renderSubComponent={CategoryTable} />}</div>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

// Configuration for the table columns
export function getTableConfiguration({ t }: GetTableConfigurationProps) {
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
      cell: ({ cell }) => cell.getValue() || 0,
    },
  ];

  return { columns };
}

export default CategoryTable;

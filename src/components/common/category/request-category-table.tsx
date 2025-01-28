'use client';

import React from 'react';
import { useFindFirstRequestHierarchyLevel, useFindManyRequestCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
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
    subcategories: { select: { id: true } },
    _count: { select: { subcategories: true, requestCategoryRequirement: true } },
  },
});

type RequestCategory = Prisma.RequestCategoryGetPayload<typeof RequestCategoryDefaultArgs>;

interface IRequestCategoryBaseProps {
  row: Row<{ id: string }>;
  columns: ColumnDef<RequestCategory>[];
  isExpanded: boolean;
}

function RequestCategorySubTable({ row, columns, isExpanded }: IRequestCategoryBaseProps) {
  const { data, isError, error, refetch } = useFindManyRequestCategory(
    {
      select: RequestCategoryDefaultArgs.select,
      where: {
        parentCategoryId: row.original.id,
      },
    },
    { enabled: isExpanded }
  );

  const { data: hierarchy, isLoading: hierarchyIsLoading } = useFindFirstRequestHierarchyLevel(
    {
      select: { name: true },
      where: { id: data?.[0]?.hierarchyLevelId },
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
              render: (props) => <RequestCategorySubTable {...props} />,
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RequestCategoryTable({ row, columns, isExpanded }: IRequestCategoryBaseProps) {
  return <RequestCategorySubTable row={row} columns={columns} isExpanded={isExpanded} />;
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
      accessorKey: 'isEligibleForNewClients',
      header: () => t('columns.isEligibleForNewClients'),
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} disabled />,
    },
    {
      accessorKey: '_count.subcategories',
      header: () => t('columns.subcategories'),
      cell: ({ cell }) => cell.getValue() || 0,
    },
    {
      accessorKey: '_count.requestCategoryRequirement',
      header: () => t('columns.requirements'),
      cell: ({ cell }) => <RequirementDialogCell count={cell.getValue() as number} entity={entity || ''} categoryId={cell.row.original.id} />,
    },
  ];

  return { columns };
}

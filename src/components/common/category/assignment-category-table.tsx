'use client';

import React from 'react';
import { useFindFirstAssignmentHierarchyLevel, useFindManyAssignmentCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
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
    { enabled: isExpanded && !isLoading }
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
      <TableCell colSpan={visibleCellsCount}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            {hierarchyIsLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span className="font-semibold">
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
                  referenceId={referenceId}
                  areaId={parentType === 'area' ? referenceId : areaId}
                />
              ),
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AssignmentCategoryTable({ referenceId, visibleCellsCount, columns, isExpanded, parentType }: Omit<IAssignmentCategoryBaseProps, 'position'>) {
  return <AssignmentCategorySubTable referenceId={referenceId} visibleCellsCount={visibleCellsCount} columns={columns} isExpanded={isExpanded} parentType={parentType} />;
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

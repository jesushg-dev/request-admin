import React from 'react';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable } from '@/components/data-table/data-table';

export const AssignmentLevelDefaultArgs = Prisma.validator<Prisma.AssignmentHierarchyLevelDefaultArgs>()({
  select: {
    id: true,
    name: true,
    position: true,
  },
});

type AssignmentLevel = Prisma.AssignmentHierarchyLevelGetPayload<typeof AssignmentLevelDefaultArgs>;

interface AssignmentLevelTableProps {
  row: Row<{ levels: Array<AssignmentLevel> }>;
  columns: ColumnDef<AssignmentLevel>[];
  isExpanded: boolean;
}

export function AssignmentHierarchyLevelTable({ row, columns, isExpanded }: AssignmentLevelTableProps) {
  const table = useReactTable({
    columns,
    data: row.original.levels,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  if (!isExpanded) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={row.getVisibleCells().length} className="p-4">
        <DataTable table={table} />
      </TableCell>
    </TableRow>
  );
}

export const useAssignmentLevelTableColumns = () => {
  const columns: ColumnDef<AssignmentLevel>[] = [
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'position',
      header: () => 'Position',
      cell: ({ cell }) => cell.getValue(),
    },
  ];

  return { columns };
};

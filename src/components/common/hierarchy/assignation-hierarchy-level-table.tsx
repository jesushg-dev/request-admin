import React from 'react';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable } from '@/components/data-table/data-table';

export const AssignationLevelDefaultArgs = Prisma.validator<Prisma.AssignationHierarchyLevelDefaultArgs>()({
  select: {
    id: true,
    name: true,
    position: true,
  },
});

type AssignationLevel = Prisma.AssignationHierarchyLevelGetPayload<typeof AssignationLevelDefaultArgs>;

interface AssignationLevelTableProps {
  row: Row<{ levels: Array<AssignationLevel> }>;
  columns: ColumnDef<AssignationLevel>[];
  isExpanded: boolean;
}

export function AssignationHierarchyLevelTable({ row, columns, isExpanded }: AssignationLevelTableProps) {
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

export const useAssignationLevelTableColumns = () => {
  const columns: ColumnDef<AssignationLevel>[] = [
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

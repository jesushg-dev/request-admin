import React from 'react';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable } from '@/components/data-table/data-table';

export const RequestLevelDefaultArgs = Prisma.validator<Prisma.RequestHierarchyLevelDefaultArgs>()({
  select: {
    id: true,
    name: true,
    position: true,
  },
});

type RequestLevel = Prisma.RequestHierarchyLevelGetPayload<typeof RequestLevelDefaultArgs>;

interface RequestLevelTableProps {
  row: Row<{ levels: Array<RequestLevel> }>;
  columns: ColumnDef<RequestLevel>[];
  isExpanded: boolean;
}

export function RequestHierarchyLevelTable({ row, columns, isExpanded }: RequestLevelTableProps) {
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

export const useRequestLevelTableColumns = () => {
  const columns: ColumnDef<RequestLevel>[] = [
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

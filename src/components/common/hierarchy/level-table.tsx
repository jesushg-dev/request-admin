import React from 'react';
import { Prisma } from '@prisma/client';
import { ColumnDef, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable } from '@/components/data-table/data-table';

const LevelDefaultArgs = Prisma.validator<Prisma.HierarchyLevelDefaultArgs>()({
  select: {
    id: true,
    name: true,
    position: true,
  },
});

type Level = Prisma.HierarchyLevelGetPayload<typeof LevelDefaultArgs>;

interface LevelTableProps {
  row: Row<{ levels: Array<Level> }>;
  columns: ColumnDef<Level>[];
  isExpanded: boolean;
}

export const LevelTable: React.FC<LevelTableProps> = ({ row, columns, isExpanded }) => {
  const table = useReactTable({
    columns,
    data: row.original.levels,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  if (!isExpanded) {
    return <></>;
  }

  return (
    <TableRow>
      <TableCell colSpan={row.getVisibleCells().length} className="p-4">
        <DataTable table={table} />{' '}
      </TableCell>
    </TableRow>
  );
};

export const useLevelTableColumns = () => {
  const columns: ColumnDef<Level>[] = [
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

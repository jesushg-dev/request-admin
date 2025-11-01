import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

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

interface AssignmentHierarchyLevelTableProps {
  levels: AssignmentLevel[];
  columns: ColumnDef<AssignmentLevel>[];
  isExpanded: boolean;
}

export function AssignmentHierarchyLevelTable({ levels, columns, isExpanded }: AssignmentHierarchyLevelTableProps) {
  const table = useReactTable({
    columns,
    data: levels,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  if (!isExpanded) return null;

  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="p-4">
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

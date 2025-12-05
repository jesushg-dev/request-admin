import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { useTranslations } from 'next-intl';

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
  levels: Array<RequestLevel>;
  columns: ColumnDef<RequestLevel>[];
  isExpanded: boolean;
}

export function RequestHierarchyLevelTable({ levels, columns, isExpanded }: RequestLevelTableProps) {
  const table = useReactTable({
    columns,
    data: levels,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  if (!isExpanded) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="p-4">
        <DataTable table={table} />
      </TableCell>
    </TableRow>
  );
}

export const useRequestLevelTableColumns = () => {
  const t = useTranslations('admin.hierarchy.requestHierarchyLevelTable');

  const columns: ColumnDef<RequestLevel>[] = [
    {
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'position',
      header: () => t('columns.position'),
      cell: ({ cell }) => cell.getValue(),
    },
  ];

  return { columns };
};

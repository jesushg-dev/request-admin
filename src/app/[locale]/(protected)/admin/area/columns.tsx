'use client';

import * as React from 'react';
import { type DataTableRowAction } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { Area as AreaType } from '@zenstackhq/runtime/models';
import { Ellipsis } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

interface GetColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<AreaType> | null>>;
}

export function getColumns({ setRowAction }: GetColumnsProps): ColumnDef<AreaType>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-2 translate-y-0.5"
        />
      ),
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" className="ml-2 translate-y-0.5" />,
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label="Active" />,
      size: 20,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => setRowAction({ row, type: 'update' })}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setRowAction({ row, type: 'delete' })}>
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 20,
    },
  ] satisfies ColumnDef<AreaType>[];
}

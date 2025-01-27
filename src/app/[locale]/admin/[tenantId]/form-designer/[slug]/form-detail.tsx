'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format, formatDistance } from 'date-fns';
import { useTranslations } from 'next-intl';

import { DynamicColumn } from '@/types/prisma/form';
import { useDataTable } from '@/hooks/use-data-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
//import FormLinkShare from '@/components/builder-form/form-link-share';
//import VisitBtn from '@/components/builder-form/visit-btn';
import { DataTable, DataTableShell, DataTableStatsToggle, DataTableStatsWrapper } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

interface DynamicDataTableProps {
  tenantId: string;
  slug: string;
  name: string;
  columns: DynamicColumn[];
  children: React.ReactNode;
}

const DynamicDataTable: React.FC<DynamicDataTableProps> = ({ tenantId, slug, name, columns, children }) => {
  const t = useTranslations('admin.formBuilder.view');

  const tableColumns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    const generatedColumns = columns.map(
      (col) =>
        ({
          accessorKey: col.id,
          header: ({ column }) => <DataTableColumnHeader column={column} title={col.label} />,
          cell: ({ cell }) => {
            const value = cell.getValue();
            if (col.type === 'DateField') {
              return <Badge variant="outline">{value && !isNaN(Date.parse(value as string)) ? format(new Date(Date.parse(value as string)), 'dd/MM/yyyy') : 'N/A'}</Badge>;
            }
            if (col.type === 'CheckboxField') {
              return <Checkbox checked={value === 'true'} disabled />;
            }
            return value;
          },
        }) as ColumnDef<Record<string, unknown>>
    );

    generatedColumns.push({
      accessorKey: 'submittedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('submittedAt')} />,
      cell: ({ cell }) => {
        return formatDistance(new Date(cell.getValue() as string | number | Date), new Date(), {
          addSuffix: true,
        });
      },
    });

    return generatedColumns;
  }, [columns, t]);

  const { table } = useDataTable({
    data: [],
    columns: tableColumns,
    pageCount: 1,
    enableAdvancedFilter: true,
    getRowId: (row) => row.submittedAt,
  });

  return (
    <DataTableShell table={table}>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table} filterFields={[]} shallow={false}>
          <DataTableStatsToggle />
          <DataTableToolbarActions
            table={table}
            exportFilename="users"
            entityLabel={name}
            addLink={{
              pathname: '/admin/[tenantId]/form-designer/[slug]/new',
              params: { tenantId, slug },
            }}
          />
        </DataTableAdvancedToolbar>
        <DataTableStatsWrapper>{children}</DataTableStatsWrapper>
      </DataTable>
    </DataTableShell>
  );
};

export default DynamicDataTable;

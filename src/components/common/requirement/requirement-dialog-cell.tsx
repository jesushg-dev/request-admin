import React, { useMemo, useState } from 'react';
import { useFindManyRequirement } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table/data-table';

import ErrorRetryFallback from '../error-retry-fallback';

const RequirementDefaultArgs = Prisma.validator<Prisma.RequirementDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
  },
});

type Requirement = Prisma.RequirementGetPayload<typeof RequirementDefaultArgs>;

interface RequirementDialogCellProps {
  count: number;
  entity: string;
  categoryId: string;
}

const RequirementDialogCell: React.FC<RequirementDialogCellProps> = ({ count, entity, categoryId }) => {
  const t = useTranslations('component.requirementDialogCell');

  const [open, setOpen] = useState(false);
  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { data, isError, isLoading, error, refetch } = useFindManyRequirement(
    {
      select: RequirementDefaultArgs.select,
      where: { requestCategoryRequirements: { some: { categoryId } } },
    },
    { enabled: open }
  );

  const handleOpen = async () => {
    setOpen((e) => !e);
  };

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  if (count === 0) return <>{count}</>;

  return (
    <>
      <button onClick={handleOpen} className="underline">
        {count}
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{t('dialogTitle', { count, entity })}</DialogTitle>
            <DialogDescription>{t('dialogDescription', { count, entity })}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] max-w-6xl overflow-auto">{isLoading ? <Skeleton className="h-20 w-full" /> : <DataTable table={table} />}</div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

// Configuration for the table columns
function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<Requirement>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ cell }) => cell.getValue() || 'N/A',
    },
    {
      accessorKey: 'description',
      header: () => t('columns.description'),
      cell: ({ cell }) => cell.getValue() || 'N/A',
    },
  ];

  return { columns };
}

export default RequirementDialogCell;

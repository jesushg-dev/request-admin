'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useFindManyArea } from '@/services/api/hooks';
import { DataTable } from './data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { isArrayOfNumbers, isArrayOfDates } from '@/lib/is-array';
import { ColumnDef } from '@tanstack/react-table';
import { isSameDay } from 'date-fns';
import { Badge, Minus, Check } from 'lucide-react';
import { format } from 'path';
import { DataTableFilterField, Option } from '@/components/data-table/types';
import { REGIONS } from '@/constants/region';
import { TAGS } from '@/constants/tag';
import { cn } from '@/lib/utils';
import { searchParamsCache } from './search-params';
import { ColumnSchema } from './schema';
import { Skeleton } from './skeleton';

interface IAreaMainPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const AreaMainPage: React.FC<IAreaMainPageProps> = ({ searchParams }) => {
  const router = useRouter();
  const search = searchParamsCache.parse(searchParams);

  const { data, isLoading, error, refetch } = useFindManyArea({
    include: {
      requestAssignment: true,
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="flex flex-1 flex-col gap-10">
      <DataTable
        data={data ?? []}
        columns={columns}
        filterFields={filterFields}
        defaultColumnFilters={Object.entries(search)
          .map(([key, value]) => ({
            id: key,
            value,
          }))
          .filter(({ value }) => value ?? undefined)}
      />
    </div>
  );
};

const columns: ColumnDef<ColumnSchema>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableHiding: false,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      const value = row.getValue('url');
      return <div className="max-w-[200px] truncate">{`${value}`}</div>;
    },
  },
  {
    accessorKey: 'regions',
    header: 'Regions',
    cell: ({ row }) => {
      const value = row.getValue('regions');
      if (Array.isArray(value)) {
        return <div className="text-muted-foreground">{value.join(', ')}</div>;
      }
      return <div className="text-muted-foreground">{`${value}`}</div>;
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === 'string') return array.includes(value);
      // up to the user to define either `.some` or `.every`
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const value = row.getValue('tags') as string | string[];
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <Badge key={v} className={tagsColor[v].badge}>
                {v}
              </Badge>
            ))}
          </div>
        );
      }
      return <Badge className={tagsColor[value].badge}>{value}</Badge>;
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === 'string') return array.includes(value);
      // up to the user to define either `.some` or `.every`
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: 'p95',
    header: ({ column }) => <DataTableColumnHeader column={column} title="P95" />,
    cell: ({ row }) => {
      const value = row.getValue('p95');
      if (typeof value === 'undefined') {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return (
        <div>
          <span className="font-mono">{`${value}`}</span> ms
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      if (typeof value === 'number') return value === Number(rowValue);
      if (Array.isArray(value) && isArrayOfNumbers(value)) {
        if (value.length === 1) {
          return value[0] === rowValue;
        } else {
          const sorted = value.sort((a, b) => a - b);
          return sorted[0] <= rowValue && rowValue <= sorted[1];
        }
      }
      return false;
    },
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: ({ row }) => {
      const value = row.getValue('active');
      if (value) return <Check className="h-4 w-4" />;
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (typeof value === 'string') return value === String(rowValue);
      if (typeof value === 'boolean') return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
  },
  {
    accessorKey: 'public',
    header: 'Public',
    cell: ({ row }) => {
      const value = row.getValue('public');
      if (value) return <Check className="h-4 w-4" />;
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (typeof value === 'string') return value === String(rowValue);
      if (typeof value === 'boolean') return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const value = row.getValue('date');
      return (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {format(new Date(`${value}`), 'LLL dd, y HH:mm')}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (value instanceof Date && rowValue instanceof Date) {
        return isSameDay(value, rowValue);
      }
      if (Array.isArray(value)) {
        if (isArrayOfDates(value) && rowValue instanceof Date) {
          const sorted = value.sort((a, b) => a.getTime() - b.getTime());
          // TODO: check length
          return sorted[0]?.getTime() <= rowValue.getTime() && rowValue.getTime() <= sorted[1]?.getTime();
        }
      }
      return false;
    },
  },
];

const tagsColor = {
  api: {
    badge: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/10',
    dot: 'bg-[#10b981]',
  },
  web: {
    badge: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/10',
    dot: 'bg-[#0ea5e9]',
  },
  enterprise: {
    badge: 'text-[#ec4899] bg-[#ec4899]/10 border-[#ec4899]/20 hover:bg-[#ec4899]/10',
    dot: 'bg-[#ec4899]',
  },
  app: {
    badge: 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20 hover:bg-[#f97316]/10',
    dot: 'bg-[#f97316]',
  },
} as Record<string, Record<'badge' | 'dot', string>>;

const filterFields = [
  {
    label: 'Time Range',
    value: 'date',
    type: 'timerange',
    defaultOpen: true,
    commandDisabled: true,
  },
  {
    label: 'URL',
    value: 'url',
    type: 'input',
    //options: data.map(({ url }) => ({ label: url, value: url })),
  },
  {
    label: 'Public',
    value: 'public',
    type: 'checkbox',
    options: [true, false].map((bool) => ({ label: `${bool}`, value: bool })),
  },
  {
    label: 'Active',
    value: 'active',
    type: 'checkbox',
    options: [true, false].map((bool) => ({ label: `${bool}`, value: bool })),
  },
  {
    label: 'P95',
    value: 'p95',
    type: 'slider',
    min: 0,
    max: 3000,
    //options: data.map(({ p95 }) => ({ label: `${p95}`, value: p95 })),
    defaultOpen: true,
  },
  {
    label: 'Regions',
    value: 'regions',
    type: 'checkbox',
    options: REGIONS.map((region) => ({ label: region, value: region })),
  },
  {
    label: 'Tags',
    value: 'tags',
    type: 'checkbox',
    defaultOpen: true,
    // REMINDER: "use client" needs to be declared in the file - otherwise getting serialization error from Server Component
    component: (props: Option) => {
      if (typeof props.value === 'boolean') return null;
      if (typeof props.value === 'undefined') return null;
      return (
        <div className="flex w-full items-center justify-between gap-2">
          <span className="truncate font-normal">{props.value}</span>
          <span className={cn('h-2 w-2 rounded-full', tagsColor[props.value].dot)} />
        </div>
      );
    },
    options: TAGS.map((tag) => ({ label: tag, value: tag })),
  },
] satisfies DataTableFilterField<ColumnSchema>[];

export default memo(AreaMainPage);

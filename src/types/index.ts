import type { ColumnSort, Row } from '@tanstack/react-table';
import { type SQL } from 'drizzle-orm';
import { type z } from 'zod';

import { type DataTableConfig } from '@/config/data-table';
import { type filterSchema } from '@/lib/parsers';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type StringKeyOf<TData> = Extract<keyof TData, string>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: StringKeyOf<TData>;
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[];

export type ColumnType = DataTableConfig['columnTypes'][number];

export type FilterOperator = DataTableConfig['globalOperators'][number];

export type JoinOperator = DataTableConfig['joinOperators'][number]['value'];

/**
 * This component can render either a faceted filter or a search filter based on the `options` prop.
 *
 * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
 *
 * Each `option` object has the following properties:
 * @prop {string} label - The label for the filter option.
 * @prop {string} value - The value for the filter option.
 * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
 * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
 */
export interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>;
  label: string;
  placeholder?: string;
  options?: Option[];
}

/**
 * Advanced filter fields for the data table.
 * These fields provide more complex filtering options compared to the regular filterFields.
 *
 * Key differences from regular filterFields:
 * 1. More field types: Includes 'text', 'multi-select', 'date', and 'boolean'.
 * 2. Enhanced flexibility: Allows for more precise and varied filtering options.
 * 3. Used with DataTableAdvancedToolbar: Enables a more sophisticated filtering UI.
 * 4. Date and boolean types: Adds support for filtering by date ranges and boolean values.
 */
export interface DataTableAdvancedFilterField<TData> extends DataTableFilterField<TData> {
  type: ColumnType;
}

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, 'id'> & {
    id: StringKeyOf<TData>;
  }
>;

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  type: 'update' | 'delete';
}

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}

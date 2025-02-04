import type { ColumnSort } from '@tanstack/react-table';
import { type ClientUploadedFileData } from 'uploadthing/types';
import { type z } from 'zod';

import { type DataTableConfig } from '@/config/data-table';
import { type filterSchema } from '@/lib/parsers';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type UploadedFile<T = unknown> = ClientUploadedFileData<T>;

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

/**
 * Represents the column type of a DataTable.
 */
export type ColumnType = DataTableConfig['columnTypes'][number];

/**
 * Represents the operators available for filters.
 */
export type FilterOperator = DataTableConfig['globalOperators'][number];

/**
 * Represents the join operators ('and', 'or') used in advanced filters.
 */
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

/**
 * Represents a filter applied to a DataTable.
 */
export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, 'id'> & {
    id: StringKeyOf<TData>;
  }
>;

/**
 * Options for building a query.
 *
 * This interface defines options that can be passed to a query builder
 * to customize the generated query. It includes support for filters (`where`),
 * sorting (`orderBy`), distinct results, and nullish values.
 *
 * @template TWhere - The specific `WhereInput` type for the model.
 * @template TOrderBy - The specific `OrderByInput` type for the model.
 *
 * @prop {TWhere} where - A Prisma-compatible filter object for the model.
 * @prop {TOrderBy} orderBy - A Prisma-compatible sort order object for the model.
 * @prop {boolean} [distinct] - Whether to include distinct results in the query.
 * @prop {boolean} [nullish] - Whether to include nullish values in the query.
 */
export interface QueryBuilderOpts<TWhere, TOrderBy> {
  where?: TWhere; // Prisma-compatible "where" filter
  orderBy?: TOrderBy; // Prisma-compatible "orderBy" filter
  distinct?: boolean; // Whether to apply distinct results
  nullish?: boolean; // Custom logic, if needed
}

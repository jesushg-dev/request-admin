import type { ExtendedSortingState, Filter, StringKeyOf } from '@/types';
import { type QueryError } from '@zenstackhq/tanstack-query/runtime-v5';

import { getValidFilters } from '@/lib/data-table';

//ensure FindManyArgs has select and include has keys
type FindManyArgs<SelectArgs = unknown, IncludeArgs = unknown, WhereArgs = unknown, OrderByArgS = unknown, CursorArgs = unknown, DistinctArgs = unknown> = {
  select?: SelectArgs | null;
  include?: IncludeArgs | null;
  where?: WhereArgs | null;
  orderBy?: OrderByArgS | null;
  cursor?: CursorArgs | null;
  distinct?: DistinctArgs | null;
  take?: number;
  skip?: number;
};

interface UseFetchTableDataProps<TData, FMA extends FindManyArgs, CountArgs> {
  search: {
    sort: ExtendedSortingState<TData>;
    filters: Filter<TData>[];
    perPage: number;
    page: number;
  };
  useFindManyHook: (args?: FMA | any) => {
    data: TData[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: QueryError | null;
    refetch: () => void;
  };
  useCountHook: (args?: CountArgs | any) => {
    data: number | undefined;
    isLoading: boolean;
    error: QueryError | null;
  };
  defaultArgs?: Pick<FMA, 'select' | 'include' | 'where'>;
}

export function useFetchTableData<TData, FMA extends FindManyArgs, CountArgs>({ search, defaultArgs, useFindManyHook, useCountHook }: UseFetchTableDataProps<TData, FMA, CountArgs>) {
  // Transform ExtendedSortingState to Prisma sorting state
  const prismaSortingState = extendedToPrismaSortingState(search.sort);

  // Transform Extended Filters to Prisma Filters
  const prismaFilters = extendedToPrismaFilters(getValidFilters(search.filters));

  // Fetch data for the table
  const { data, isLoading, error, refetch, isError } = useFindManyHook({
    orderBy: prismaSortingState,
    take: search.perPage,
    skip: (search.page - 1) * search.perPage,
    include: defaultArgs?.include,
    select: defaultArgs?.select,
    where: {
      AND: [defaultArgs?.where || {}, ...prismaFilters],
    },
  } as FMA);

  // Fetch total count for pagination
  const { data: totalCountData, error: countError } = useCountHook({
    where: {
      AND: [defaultArgs?.where || {}, ...prismaFilters],
    },
  } as CountArgs);

  // Calculate total pages
  const totalRecords = totalCountData ?? 0;
  const pageCount = Math.ceil(totalRecords / search.perPage);

  return {
    data,
    isError,
    isLoading,
    error,
    countError,
    refetch,
    pageCount,
  };
}

// Transform ExtendedSortingState to Prisma sorting state
export function extendedToPrismaSortingState<TData>(sorting: ExtendedSortingState<TData>): Partial<Record<keyof TData, 'asc' | 'desc'>>[] {
  return sorting.map(({ id, desc }) => ({
    [id]: desc ? 'desc' : 'asc',
  })) as Partial<Record<keyof TData, 'asc' | 'desc'>>[];
}

// Transform Prisma sorting state to ExtendedSortingState
export function prismaToExtendedSortingState<TData>(sorting: Partial<Record<keyof TData, 'asc' | 'desc'>>[]): ExtendedSortingState<TData> {
  return sorting
    .map((item) =>
      Object.entries(item).map(([field, direction]) => ({
        id: field as StringKeyOf<TData>,
        desc: direction === 'desc',
      }))
    )
    .flat();
}

// Transform Extended Filters to Prisma Filters
export function extendedToPrismaFilters<TData>(filters: Filter<TData>[]): Record<string, unknown>[] {
  return filters.map((filter) => {
    const { id, value, operator } = filter;
    return {
      [id]: {
        [operator]: value,
      },
    };
  });
}

// Transform Prisma Filters to Extended Filters
export function prismaToExtendedFilters<TData>(filters: Record<string, unknown>[]): Filter<TData>[] {
  return filters.map((filter) => {
    // Get the first entry of the filter, or fallback to an empty object
    const [id, conditions] = Object.entries(filter)[0] || [null, null];

    if (!id || !conditions) {
      throw new Error('Invalid filter format. Ensure the filters are properly structured.');
    }

    // Get the first operator and value from the conditions, or fallback to null
    const [operator, value] = Object.entries(conditions)[0] || [null, null];

    if (!operator || value === undefined) {
      throw new Error('Invalid filter conditions. Ensure the filter conditions are properly structured.');
    }

    return {
      id: id as StringKeyOf<TData>,
      operator: operator as unknown,
      value: value,
    } as Filter<TData>;
  });
}

/* eslint-disable */
import type { Prisma, SubCategory } from '@zenstackhq/runtime/models';
import type { UseMutationOptions, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import { getHooksContext } from '@zenstackhq/tanstack-query/runtime-v5/react';
import { useModelQuery, useInfiniteModelQuery, useModelMutation } from '@zenstackhq/tanstack-query/runtime-v5/react';
import type { PickEnumerable, CheckSelect, QueryError, ExtraQueryOptions, ExtraMutationOptions } from '@zenstackhq/tanstack-query/runtime-v5';
import type { PolicyCrudKind } from '@zenstackhq/runtime';
import metadata from './__model_meta';
type DefaultError = QueryError;
import { useSuspenseModelQuery, useSuspenseInfiniteModelQuery } from '@zenstackhq/tanstack-query/runtime-v5/react';
import type { UseSuspenseQueryOptions, UseSuspenseInfiniteQueryOptions } from '@tanstack/react-query';

export function useCreateSubCategory(options?: Omit<UseMutationOptions<SubCategory | undefined, DefaultError, Prisma.SubCategoryCreateArgs> & ExtraMutationOptions, 'mutationFn'>) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryCreateArgs, DefaultError, SubCategory, true>(
    'SubCategory',
    'POST',
    `${endpoint}/subCategory/create`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryCreateArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryCreateArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useCreateManySubCategory(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SubCategoryCreateManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryCreateManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'SubCategory',
    'POST',
    `${endpoint}/subCategory/createMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryCreateManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryCreateManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryCreateManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useFindManySubCategory<
  TArgs extends Prisma.SubCategoryFindManyArgs,
  TQueryFnData = Array<Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean }>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindManyArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findMany`, args, options, fetch);
}

export function useInfiniteFindManySubCategory<
  TArgs extends Prisma.SubCategoryFindManyArgs,
  TQueryFnData = Array<Prisma.SubCategoryGetPayload<TArgs>>,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindManyArgs>,
  options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TData>>, 'queryKey' | 'initialPageParam'>
) {
  options = options ?? { getNextPageParam: () => null };
  const { endpoint, fetch } = getHooksContext();
  return useInfiniteModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findMany`, args, options, fetch);
}

export function useSuspenseFindManySubCategory<
  TArgs extends Prisma.SubCategoryFindManyArgs,
  TQueryFnData = Array<Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean }>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindManyArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findMany`, args, options, fetch);
}

export function useSuspenseInfiniteFindManySubCategory<
  TArgs extends Prisma.SubCategoryFindManyArgs,
  TQueryFnData = Array<Prisma.SubCategoryGetPayload<TArgs>>,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindManyArgs>,
  options?: Omit<UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TData>>, 'queryKey' | 'initialPageParam'>
) {
  options = options ?? { getNextPageParam: () => null };
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseInfiniteModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findMany`, args, options, fetch);
}

export function useFindUniqueSubCategory<
  TArgs extends Prisma.SubCategoryFindUniqueArgs,
  TQueryFnData = Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindUniqueArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findUnique`, args, options, fetch);
}

export function useSuspenseFindUniqueSubCategory<
  TArgs extends Prisma.SubCategoryFindUniqueArgs,
  TQueryFnData = Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindUniqueArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findUnique`, args, options, fetch);
}

export function useFindFirstSubCategory<
  TArgs extends Prisma.SubCategoryFindFirstArgs,
  TQueryFnData = Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindFirstArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findFirst`, args, options, fetch);
}

export function useSuspenseFindFirstSubCategory<
  TArgs extends Prisma.SubCategoryFindFirstArgs,
  TQueryFnData = Prisma.SubCategoryGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryFindFirstArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/findFirst`, args, options, fetch);
}

export function useUpdateSubCategory(options?: Omit<UseMutationOptions<SubCategory | undefined, DefaultError, Prisma.SubCategoryUpdateArgs> & ExtraMutationOptions, 'mutationFn'>) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryUpdateArgs, DefaultError, SubCategory, true>(
    'SubCategory',
    'PUT',
    `${endpoint}/subCategory/update`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryUpdateArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryUpdateArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useUpdateManySubCategory(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SubCategoryUpdateManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryUpdateManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'SubCategory',
    'PUT',
    `${endpoint}/subCategory/updateMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryUpdateManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryUpdateManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryUpdateManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useUpsertSubCategory(options?: Omit<UseMutationOptions<SubCategory | undefined, DefaultError, Prisma.SubCategoryUpsertArgs> & ExtraMutationOptions, 'mutationFn'>) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryUpsertArgs, DefaultError, SubCategory, true>(
    'SubCategory',
    'POST',
    `${endpoint}/subCategory/upsert`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryUpsertArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryUpsertArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryUpsertArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useDeleteSubCategory(options?: Omit<UseMutationOptions<SubCategory | undefined, DefaultError, Prisma.SubCategoryDeleteArgs> & ExtraMutationOptions, 'mutationFn'>) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryDeleteArgs, DefaultError, SubCategory, true>(
    'SubCategory',
    'DELETE',
    `${endpoint}/subCategory/delete`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryDeleteArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryDeleteArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, SubCategory, Prisma.SubCategoryGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useDeleteManySubCategory(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SubCategoryDeleteManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.SubCategoryDeleteManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'SubCategory',
    'DELETE',
    `${endpoint}/subCategory/deleteMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.SubCategoryDeleteManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.SubCategoryDeleteManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.SubCategoryDeleteManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useAggregateSubCategory<
  TArgs extends Prisma.SubCategoryAggregateArgs,
  TQueryFnData = Prisma.GetSubCategoryAggregateType<TArgs>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.SubCategoryAggregateArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/aggregate`, args, options, fetch);
}

export function useSuspenseAggregateSubCategory<
  TArgs extends Prisma.SubCategoryAggregateArgs,
  TQueryFnData = Prisma.GetSubCategoryAggregateType<TArgs>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.SubCategoryAggregateArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/aggregate`, args, options, fetch);
}

export function useGroupBySubCategory<
  TArgs extends Prisma.SubCategoryGroupByArgs,
  HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<TArgs>>, Prisma.Extends<'take', Prisma.Keys<TArgs>>>,
  OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.SubCategoryGroupByArgs['orderBy'] } : { orderBy?: Prisma.SubCategoryGroupByArgs['orderBy'] },
  OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<TArgs['orderBy']>>>,
  ByFields extends Prisma.MaybeTupleToUnion<TArgs['by']>,
  ByValid extends Prisma.Has<ByFields, OrderFields>,
  HavingFields extends Prisma.GetHavingFields<TArgs['having']>,
  HavingValid extends Prisma.Has<ByFields, HavingFields>,
  ByEmpty extends TArgs['by'] extends never[] ? Prisma.True : Prisma.False,
  InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
              : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
        }[HavingFields]
      : 'take' extends Prisma.Keys<TArgs>
        ? 'orderBy' extends Prisma.Keys<TArgs>
          ? ByValid extends Prisma.True
            ? {}
            : {
                [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
              }[OrderFields]
          : 'Error: If you provide "take", you also need to provide "orderBy"'
        : 'skip' extends Prisma.Keys<TArgs>
          ? 'orderBy' extends Prisma.Keys<TArgs>
            ? ByValid extends Prisma.True
              ? {}
              : {
                  [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                }[OrderFields]
            : 'Error: If you provide "skip", you also need to provide "orderBy"'
          : ByValid extends Prisma.True
            ? {}
            : {
                [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
              }[OrderFields],
  TQueryFnData = {} extends InputErrors
    ? Array<
        PickEnumerable<Prisma.SubCategoryGroupByOutputType, TArgs['by']> & {
          [P in keyof TArgs & keyof Prisma.SubCategoryGroupByOutputType]: P extends '_count'
            ? TArgs[P] extends boolean
              ? number
              : Prisma.GetScalarType<TArgs[P], Prisma.SubCategoryGroupByOutputType[P]>
            : Prisma.GetScalarType<TArgs[P], Prisma.SubCategoryGroupByOutputType[P]>;
        }
      >
    : InputErrors,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args: Prisma.SelectSubset<TArgs, Prisma.SubsetIntersection<TArgs, Prisma.SubCategoryGroupByArgs, OrderByArg> & InputErrors>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/groupBy`, args, options, fetch);
}

export function useSuspenseGroupBySubCategory<
  TArgs extends Prisma.SubCategoryGroupByArgs,
  HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<TArgs>>, Prisma.Extends<'take', Prisma.Keys<TArgs>>>,
  OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.SubCategoryGroupByArgs['orderBy'] } : { orderBy?: Prisma.SubCategoryGroupByArgs['orderBy'] },
  OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<TArgs['orderBy']>>>,
  ByFields extends Prisma.MaybeTupleToUnion<TArgs['by']>,
  ByValid extends Prisma.Has<ByFields, OrderFields>,
  HavingFields extends Prisma.GetHavingFields<TArgs['having']>,
  HavingValid extends Prisma.Has<ByFields, HavingFields>,
  ByEmpty extends TArgs['by'] extends never[] ? Prisma.True : Prisma.False,
  InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
              : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
        }[HavingFields]
      : 'take' extends Prisma.Keys<TArgs>
        ? 'orderBy' extends Prisma.Keys<TArgs>
          ? ByValid extends Prisma.True
            ? {}
            : {
                [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
              }[OrderFields]
          : 'Error: If you provide "take", you also need to provide "orderBy"'
        : 'skip' extends Prisma.Keys<TArgs>
          ? 'orderBy' extends Prisma.Keys<TArgs>
            ? ByValid extends Prisma.True
              ? {}
              : {
                  [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                }[OrderFields]
            : 'Error: If you provide "skip", you also need to provide "orderBy"'
          : ByValid extends Prisma.True
            ? {}
            : {
                [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
              }[OrderFields],
  TQueryFnData = {} extends InputErrors
    ? Array<
        PickEnumerable<Prisma.SubCategoryGroupByOutputType, TArgs['by']> & {
          [P in keyof TArgs & keyof Prisma.SubCategoryGroupByOutputType]: P extends '_count'
            ? TArgs[P] extends boolean
              ? number
              : Prisma.GetScalarType<TArgs[P], Prisma.SubCategoryGroupByOutputType[P]>
            : Prisma.GetScalarType<TArgs[P], Prisma.SubCategoryGroupByOutputType[P]>;
        }
      >
    : InputErrors,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args: Prisma.SelectSubset<TArgs, Prisma.SubsetIntersection<TArgs, Prisma.SubCategoryGroupByArgs, OrderByArg> & InputErrors>,
  options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/groupBy`, args, options, fetch);
}

export function useCountSubCategory<
  TArgs extends Prisma.SubCategoryCountArgs,
  TQueryFnData = TArgs extends { select: any }
    ? TArgs['select'] extends true
      ? number
      : Prisma.GetScalarType<TArgs['select'], Prisma.SubCategoryCountAggregateOutputType>
    : number,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryCountArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/count`, args, options, fetch);
}

export function useSuspenseCountSubCategory<
  TArgs extends Prisma.SubCategoryCountArgs,
  TQueryFnData = TArgs extends { select: any }
    ? TArgs['select'] extends true
      ? number
      : Prisma.GetScalarType<TArgs['select'], Prisma.SubCategoryCountAggregateOutputType>
    : number,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.SubCategoryCountArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('SubCategory', `${endpoint}/subCategory/count`, args, options, fetch);
}

export function useCheckSubCategory<TError = DefaultError>(
  args: {
    operation: PolicyCrudKind;
    where?: { createdBy?: string; modifiedBy?: string; tenantId?: string; id?: string; categoryId?: string; name?: string; description?: string; formId?: string };
  },
  options?: Omit<UseQueryOptions<boolean, TError, boolean>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<boolean, boolean, TError>('SubCategory', `${endpoint}/subCategory/check`, args, options, fetch);
}

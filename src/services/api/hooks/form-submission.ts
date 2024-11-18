/* eslint-disable */
import type { Prisma, FormSubmission } from '@zenstackhq/runtime/models';
import type { UseMutationOptions, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import { getHooksContext } from '@zenstackhq/tanstack-query/runtime-v5/react';
import { useModelQuery, useInfiniteModelQuery, useModelMutation } from '@zenstackhq/tanstack-query/runtime-v5/react';
import type { PickEnumerable, CheckSelect, QueryError, ExtraQueryOptions, ExtraMutationOptions } from '@zenstackhq/tanstack-query/runtime-v5';
import type { PolicyCrudKind } from '@zenstackhq/runtime';
import metadata from './__model_meta';
type DefaultError = QueryError;
import { useSuspenseModelQuery, useSuspenseInfiniteModelQuery } from '@zenstackhq/tanstack-query/runtime-v5/react';
import type { UseSuspenseQueryOptions, UseSuspenseInfiniteQueryOptions } from '@tanstack/react-query';

export function useCreateFormSubmission(
  options?: Omit<UseMutationOptions<FormSubmission | undefined, DefaultError, Prisma.FormSubmissionCreateArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionCreateArgs, DefaultError, FormSubmission, true>(
    'FormSubmission',
    'POST',
    `${endpoint}/formSubmission/create`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionCreateArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionCreateArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useCreateManyFormSubmission(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.FormSubmissionCreateManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionCreateManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'FormSubmission',
    'POST',
    `${endpoint}/formSubmission/createMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionCreateManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionCreateManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionCreateManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useFindManyFormSubmission<
  TArgs extends Prisma.FormSubmissionFindManyArgs,
  TQueryFnData = Array<Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean }>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindManyArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findMany`, args, options, fetch);
}

export function useInfiniteFindManyFormSubmission<
  TArgs extends Prisma.FormSubmissionFindManyArgs,
  TQueryFnData = Array<Prisma.FormSubmissionGetPayload<TArgs>>,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindManyArgs>,
  options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TData>>, 'queryKey' | 'initialPageParam'>
) {
  options = options ?? { getNextPageParam: () => null };
  const { endpoint, fetch } = getHooksContext();
  return useInfiniteModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findMany`, args, options, fetch);
}

export function useSuspenseFindManyFormSubmission<
  TArgs extends Prisma.FormSubmissionFindManyArgs,
  TQueryFnData = Array<Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean }>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindManyArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findMany`, args, options, fetch);
}

export function useSuspenseInfiniteFindManyFormSubmission<
  TArgs extends Prisma.FormSubmissionFindManyArgs,
  TQueryFnData = Array<Prisma.FormSubmissionGetPayload<TArgs>>,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindManyArgs>,
  options?: Omit<UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TData>>, 'queryKey' | 'initialPageParam'>
) {
  options = options ?? { getNextPageParam: () => null };
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseInfiniteModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findMany`, args, options, fetch);
}

export function useFindUniqueFormSubmission<
  TArgs extends Prisma.FormSubmissionFindUniqueArgs,
  TQueryFnData = Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindUniqueArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findUnique`, args, options, fetch);
}

export function useSuspenseFindUniqueFormSubmission<
  TArgs extends Prisma.FormSubmissionFindUniqueArgs,
  TQueryFnData = Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindUniqueArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findUnique`, args, options, fetch);
}

export function useFindFirstFormSubmission<
  TArgs extends Prisma.FormSubmissionFindFirstArgs,
  TQueryFnData = Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindFirstArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findFirst`, args, options, fetch);
}

export function useSuspenseFindFirstFormSubmission<
  TArgs extends Prisma.FormSubmissionFindFirstArgs,
  TQueryFnData = Prisma.FormSubmissionGetPayload<TArgs> & { $optimistic?: boolean },
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionFindFirstArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/findFirst`, args, options, fetch);
}

export function useUpdateFormSubmission(
  options?: Omit<UseMutationOptions<FormSubmission | undefined, DefaultError, Prisma.FormSubmissionUpdateArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionUpdateArgs, DefaultError, FormSubmission, true>(
    'FormSubmission',
    'PUT',
    `${endpoint}/formSubmission/update`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionUpdateArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionUpdateArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useUpdateManyFormSubmission(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.FormSubmissionUpdateManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionUpdateManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'FormSubmission',
    'PUT',
    `${endpoint}/formSubmission/updateMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionUpdateManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionUpdateManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionUpdateManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useUpsertFormSubmission(
  options?: Omit<UseMutationOptions<FormSubmission | undefined, DefaultError, Prisma.FormSubmissionUpsertArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionUpsertArgs, DefaultError, FormSubmission, true>(
    'FormSubmission',
    'POST',
    `${endpoint}/formSubmission/upsert`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionUpsertArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionUpsertArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionUpsertArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useDeleteFormSubmission(
  options?: Omit<UseMutationOptions<FormSubmission | undefined, DefaultError, Prisma.FormSubmissionDeleteArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionDeleteArgs, DefaultError, FormSubmission, true>(
    'FormSubmission',
    'DELETE',
    `${endpoint}/formSubmission/delete`,
    metadata,
    options,
    fetch,
    true
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionDeleteArgs>,
      options?: Omit<
        UseMutationOptions<CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionDeleteArgs>> &
          ExtraMutationOptions,
        'mutationFn'
      >
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as CheckSelect<T, FormSubmission, Prisma.FormSubmissionGetPayload<T>> | undefined;
    },
  };
  return mutation;
}

export function useDeleteManyFormSubmission(
  options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.FormSubmissionDeleteManyArgs> & ExtraMutationOptions, 'mutationFn'>
) {
  const { endpoint, fetch } = getHooksContext();
  const _mutation = useModelMutation<Prisma.FormSubmissionDeleteManyArgs, DefaultError, Prisma.BatchPayload, false>(
    'FormSubmission',
    'DELETE',
    `${endpoint}/formSubmission/deleteMany`,
    metadata,
    options,
    fetch,
    false
  );
  const mutation = {
    ..._mutation,
    mutateAsync: async <T extends Prisma.FormSubmissionDeleteManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.FormSubmissionDeleteManyArgs>,
      options?: Omit<UseMutationOptions<Prisma.BatchPayload, DefaultError, Prisma.SelectSubset<T, Prisma.FormSubmissionDeleteManyArgs>> & ExtraMutationOptions, 'mutationFn'>
    ) => {
      return (await _mutation.mutateAsync(args, options as any)) as Prisma.BatchPayload;
    },
  };
  return mutation;
}

export function useAggregateFormSubmission<
  TArgs extends Prisma.FormSubmissionAggregateArgs,
  TQueryFnData = Prisma.GetFormSubmissionAggregateType<TArgs>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionAggregateArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/aggregate`, args, options, fetch);
}

export function useSuspenseAggregateFormSubmission<
  TArgs extends Prisma.FormSubmissionAggregateArgs,
  TQueryFnData = Prisma.GetFormSubmissionAggregateType<TArgs>,
  TData = TQueryFnData,
  TError = DefaultError,
>(args: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionAggregateArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/aggregate`, args, options, fetch);
}

export function useGroupByFormSubmission<
  TArgs extends Prisma.FormSubmissionGroupByArgs,
  HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<TArgs>>, Prisma.Extends<'take', Prisma.Keys<TArgs>>>,
  OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.FormSubmissionGroupByArgs['orderBy'] } : { orderBy?: Prisma.FormSubmissionGroupByArgs['orderBy'] },
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
        PickEnumerable<Prisma.FormSubmissionGroupByOutputType, TArgs['by']> & {
          [P in keyof TArgs & keyof Prisma.FormSubmissionGroupByOutputType]: P extends '_count'
            ? TArgs[P] extends boolean
              ? number
              : Prisma.GetScalarType<TArgs[P], Prisma.FormSubmissionGroupByOutputType[P]>
            : Prisma.GetScalarType<TArgs[P], Prisma.FormSubmissionGroupByOutputType[P]>;
        }
      >
    : InputErrors,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args: Prisma.SelectSubset<TArgs, Prisma.SubsetIntersection<TArgs, Prisma.FormSubmissionGroupByArgs, OrderByArg> & InputErrors>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/groupBy`, args, options, fetch);
}

export function useSuspenseGroupByFormSubmission<
  TArgs extends Prisma.FormSubmissionGroupByArgs,
  HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<TArgs>>, Prisma.Extends<'take', Prisma.Keys<TArgs>>>,
  OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.FormSubmissionGroupByArgs['orderBy'] } : { orderBy?: Prisma.FormSubmissionGroupByArgs['orderBy'] },
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
        PickEnumerable<Prisma.FormSubmissionGroupByOutputType, TArgs['by']> & {
          [P in keyof TArgs & keyof Prisma.FormSubmissionGroupByOutputType]: P extends '_count'
            ? TArgs[P] extends boolean
              ? number
              : Prisma.GetScalarType<TArgs[P], Prisma.FormSubmissionGroupByOutputType[P]>
            : Prisma.GetScalarType<TArgs[P], Prisma.FormSubmissionGroupByOutputType[P]>;
        }
      >
    : InputErrors,
  TData = TQueryFnData,
  TError = DefaultError,
>(
  args: Prisma.SelectSubset<TArgs, Prisma.SubsetIntersection<TArgs, Prisma.FormSubmissionGroupByArgs, OrderByArg> & InputErrors>,
  options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/groupBy`, args, options, fetch);
}

export function useCountFormSubmission<
  TArgs extends Prisma.FormSubmissionCountArgs,
  TQueryFnData = TArgs extends { select: any }
    ? TArgs['select'] extends true
      ? number
      : Prisma.GetScalarType<TArgs['select'], Prisma.FormSubmissionCountAggregateOutputType>
    : number,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionCountArgs>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/count`, args, options, fetch);
}

export function useSuspenseCountFormSubmission<
  TArgs extends Prisma.FormSubmissionCountArgs,
  TQueryFnData = TArgs extends { select: any }
    ? TArgs['select'] extends true
      ? number
      : Prisma.GetScalarType<TArgs['select'], Prisma.FormSubmissionCountAggregateOutputType>
    : number,
  TData = TQueryFnData,
  TError = DefaultError,
>(args?: Prisma.SelectSubset<TArgs, Prisma.FormSubmissionCountArgs>, options?: Omit<UseSuspenseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & ExtraQueryOptions) {
  const { endpoint, fetch } = getHooksContext();
  return useSuspenseModelQuery<TQueryFnData, TData, TError>('FormSubmission', `${endpoint}/formSubmission/count`, args, options, fetch);
}

export function useCheckFormSubmission<TError = DefaultError>(
  args: { operation: PolicyCrudKind; where?: { createdBy?: string; modifiedBy?: string; tenantId?: string; id?: string; formId?: string; content?: string } },
  options?: Omit<UseQueryOptions<boolean, TError, boolean>, 'queryKey'> & ExtraQueryOptions
) {
  const { endpoint, fetch } = getHooksContext();
  return useModelQuery<boolean, boolean, TError>('FormSubmission', `${endpoint}/formSubmission/check`, args, options, fetch);
}

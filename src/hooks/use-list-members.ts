import { useQuery } from '@tanstack/react-query';
import { listMembers, type ListMembersParams, type ListMembersResult } from '@/actions/organization';

/**
 * Hook to fetch organization members using Better Auth
 */
export function useListMembers(params: ListMembersParams) {
  return useQuery<ListMembersResult>({
    queryKey: ['listMembers', params.organizationId, params.page, params.perPage, params.sort, params.filters],
    queryFn: () => listMembers(params),
    staleTime: 30000, // 30 seconds
  });
}


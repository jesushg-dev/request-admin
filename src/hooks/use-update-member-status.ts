'use client';

import { updateMemberStatus, type ListMembersParams } from '@/actions/organization';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to enable/disable a member in an organization
 */
export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, organizationId, isActive }: { memberId: string; organizationId: string; isActive: boolean }) => updateMemberStatus(memberId, organizationId, isActive),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch members list
      queryClient.invalidateQueries({
        queryKey: ['listMembers', variables.organizationId],
      });
    },
  });
}

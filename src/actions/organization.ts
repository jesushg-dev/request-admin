'use server';

import { headers } from 'next/headers';
import { auth } from '@/server/auth-server';
import type { ExtendedSortingState, Filter } from '@/types';

export interface ListMembersParams {
  organizationId: string;
  page: number;
  perPage: number;
  sort: ExtendedSortingState<any>;
  filters: Filter<any>[];
}

// Structure matching Better Auth organization member response
export interface BetterAuthMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string | string[];
  createdAt: Date;
  isActive?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    username?: string | null;
  };
}

// Structure adapted for the component (maps Better Auth response to component expectations)
export interface MemberWithRelations {
  id: string;
  person: {
    firstName: string;
    lastName: string;
    image: string | null;
  } | null;
  user: {
    username: string | null;
    email: string;
  };
  userRoles: Array<{
    role: {
      name: string;
    };
  }>;
  _count: {
    userAreas: number;
    userRoles: number;
    assignedUsers: number;
  };
}

export interface ListMembersResult {
  data: MemberWithRelations[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/**
 * Maps Better Auth member response to component expected format
 */
function transformMemberToComponentFormat(member: BetterAuthMember): MemberWithRelations {
  // Parse name into firstName and lastName (assumes "FirstName LastName" format)
  const nameParts = member.user.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Convert role(s) to userRoles format expected by component
  const roles = Array.isArray(member.role) ? member.role : member.role.split(',').map(r => r.trim());
  const userRoles = roles.map((role) => ({
    role: {
      name: role,
    },
  }));

  return {
    id: member.id,
    person: firstName || lastName ? {
      firstName,
      lastName,
      image: member.user.image,
    } : null,
    user: {
      username: member.user.username || null,
      email: member.user.email,
    },
    userRoles,
    _count: {
      userAreas: 0, // Better Auth doesn't provide this, would need separate API call if needed
      userRoles: roles.length,
      assignedUsers: 0, // Better Auth doesn't provide this, would need separate API call if needed
    },
  };
}

/**
 * Maps table sorting state to Better Auth sortBy and sortDirection
 */
function mapSortingToBetterAuth(sort: ExtendedSortingState<any>): { sortBy?: string; sortDirection?: 'asc' | 'desc' } {
  if (!sort || sort.length === 0) {
    return { sortBy: 'createdAt', sortDirection: 'desc' };
  }

  const firstSort = sort[0];
  let sortBy = firstSort.id;
  
  // Map nested fields to Better Auth expected fields
  if (sortBy.includes('.')) {
    sortBy = sortBy.split('.').pop() || sortBy;
  }
  
  // Map common field names that Better Auth supports
  const fieldMap: Record<string, string> = {
    id: 'createdAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    email: 'email', // Better Auth supports sorting by user.email through filterField
  };

  return {
    sortBy: fieldMap[sortBy] || 'createdAt',
    sortDirection: firstSort.desc ? 'desc' : 'asc',
  };
}

/**
 * Maps table filters to Better Auth filter parameters
 * Note: Better Auth listMembers only supports single field filtering
 */
function mapFiltersToBetterAuth(
  filters: Filter<any>[]
): { filterField?: string; filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains'; filterValue?: string } {
  if (!filters || filters.length === 0) {
    return {};
  }

  const firstFilter = filters[0];
  let filterField = firstFilter.id;
  
  // Map nested paths to Better Auth field names
  if (filterField.startsWith('user.')) {
    filterField = filterField.split('.').pop() || filterField;
  }
  // Better Auth doesn't support filtering by person fields directly
  // Would need to filter client-side or use a different approach
  
  const operatorMap: Record<string, 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains'> = {
    equals: 'eq',
    eq: 'eq',
    not: 'ne',
    ne: 'ne',
    gt: 'gt',
    gte: 'gte',
    lt: 'lt',
    lte: 'lte',
    contains: 'contains',
  };

  const filterOperator = operatorMap[firstFilter.operator as string] || 'eq';
  const filterValue = typeof firstFilter.value === 'string' ? firstFilter.value : String(firstFilter.value);

  return {
    filterField,
    filterOperator,
    filterValue,
  };
}

/**
 * Server action to list organization members using Better Auth API only
 * Uses Better Auth's native capabilities without Prisma/ZenStack
 */
export async function listMembers(params: ListMembersParams): Promise<ListMembersResult> {
  const { organizationId, page, perPage, sort, filters } = params;

  try {
    // Get members from Better Auth
    const sortParams = mapSortingToBetterAuth(sort);
    const filterParams = mapFiltersToBetterAuth(filters);
    const offset = (page - 1) * perPage;

    // Build query object for Better Auth
    const queryParams: {
      organizationId: string;
      limit: number;
      offset: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      filterField?: string;
      filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains';
      filterValue?: string;
    } = {
      organizationId,
      limit: perPage,
      offset,
    };

    // Add sort params if they exist
    if (sortParams.sortBy) {
      queryParams.sortBy = sortParams.sortBy;
      queryParams.sortDirection = sortParams.sortDirection;
    }

    // Add filter params if they exist and are supported by Better Auth
    if (filterParams.filterField && filterParams.filterOperator && filterParams.filterValue) {
      // Only apply filters for fields that Better Auth supports (user.email, role, etc.)
      const supportedOperators: Array<'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains'> = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'contains'];
      if (
        (filterParams.filterField === 'email' || filterParams.filterField === 'role' || filterParams.filterField === 'createdAt') &&
        supportedOperators.includes(filterParams.filterOperator as any)
      ) {
        queryParams.filterField = filterParams.filterField;
        queryParams.filterOperator = filterParams.filterOperator;
        queryParams.filterValue = filterParams.filterValue;
      }
    }

    // Call Better Auth API
    const authResult = await auth.api.listMembers({
      query: queryParams,
      headers: await headers(),
    });

    // Better Auth returns { members: [...], total: number }
    const members = (authResult.members || []) as BetterAuthMember[];
    
    // Get member IDs to fetch additional counts from Prisma
    const memberIds = members.map((m) => m.id);
    
    // Fetch counts from Prisma in a single efficient query
    let memberCountsMap = new Map<string, { userAreas: number; assignedUsers: number }>();
    
    if (memberIds.length > 0) {
      const { db } = await import('@/server/db-client');
      
      // Fetch all counts in parallel for better performance using aggregation
      const [userAreasCounts, assignedUsersCounts] = await Promise.all([
        db.userTenantArea.groupBy({
          by: ['userTenantId'],
          where: {
            userTenantId: { in: memberIds },
            tenantId: organizationId,
            isActive: true,
          },
          _count: {
            id: true,
          },
        }),
        db.assignedUser.groupBy({
          by: ['userTenantId'],
          where: {
            userTenantId: { in: memberIds },
            tenantId: organizationId,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      // Build maps for O(1) lookup
      userAreasCounts.forEach((item) => {
        const existing = memberCountsMap.get(item.userTenantId) || { userAreas: 0, assignedUsers: 0 };
        memberCountsMap.set(item.userTenantId, { ...existing, userAreas: item._count?.id ?? 0 });
      });

      assignedUsersCounts.forEach((item) => {
        const existing = memberCountsMap.get(item.userTenantId) || { userAreas: 0, assignedUsers: 0 };
        memberCountsMap.set(item.userTenantId, { ...existing, assignedUsers: item._count?.id ?? 0 });
      });
    }
    
    // Transform Better Auth members to component format with counts from Prisma
    const transformedMembers = members.map((member) => {
      const base = transformMemberToComponentFormat(member);
      const counts = memberCountsMap.get(member.id) || { userAreas: 0, assignedUsers: 0 };
      return {
        ...base,
        _count: {
          ...base._count,
          userAreas: counts.userAreas,
          assignedUsers: counts.assignedUsers,
        },
      };
    });

    // Get total from Better Auth
    const total = authResult.total ?? 0;
    const pageCount = Math.ceil(total / perPage);

    // Apply client-side filtering for fields not supported by Better Auth
    let filteredMembers = transformedMembers;
    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        // Only apply filters that weren't handled by Better Auth
        if (filter.id.startsWith('person.')) {
          const field = filter.id.split('.')[1];
          filteredMembers = filteredMembers.filter((member) => {
            if (!member.person) return false;
            const value = (member.person as any)[field];
            const filterValue = String(filter.value).toLowerCase();
            
            const operator = filter.operator as string;
            if (operator === 'equals' || operator === 'eq') {
              return String(value).toLowerCase() === filterValue;
            }
            if (operator === 'contains' || operator === 'iLike' || operator === 'notILike') {
              return String(value).toLowerCase().includes(filterValue);
            }
            return true;
          });
        }
      });
    }

    // Recalculate total if we applied client-side filters
    const finalTotal = filteredMembers.length < transformedMembers.length ? filteredMembers.length : total;

    return {
      data: filteredMembers,
      total: finalTotal,
      page,
      perPage,
      pageCount: Math.ceil(finalTotal / perPage),
    };
  } catch (error) {
    console.error('Error listing members:', error);
    throw new Error('Failed to list organization members');
  }
}

/**
 * Enable or disable a member in an organization
 * Note: Better Auth doesn't provide a direct API for updating member additional fields,
 * so we use the base Prisma client for this specific operation since isActive is a custom field
 */
export async function updateMemberStatus(
  memberId: string,
  organizationId: string,
  isActive: boolean
): Promise<void> {
  try {
    // Import the base Prisma client (not ZenStack) for direct database access
    // This is necessary because Better Auth doesn't expose APIs for additional fields
    const { db } = await import('@/server/db-client');
    
    await db.userTenant.update({
      where: {
        id: memberId,
        tenantId: organizationId,
      },
      data: {
        isActive,
      },
    });
  } catch (error) {
    console.error('Error updating member status:', error);
    throw new Error('Failed to update member status');
  }
}

/**
 * Remove a member from an organization using Better Auth
 */
export async function removeMember(
  memberIdOrEmail: string,
  organizationId: string
): Promise<void> {
  try {
    await auth.api.removeMember({
      body: {
        memberIdOrEmail,
        organizationId,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error('Error removing member:', error);
    throw new Error('Failed to remove member');
  }
}

/**
 * Cancel an invitation using Better Auth
 */
export async function cancelInvitation(
  invitationId: string
): Promise<void> {
  try {
    await auth.api.cancelInvitation({
      body: {
        invitationId,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw new Error('Failed to cancel invitation');
  }
}
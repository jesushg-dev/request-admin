'use server';

import { headers } from 'next/headers';
import { auth, currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserTenant } from '@/types/user';
import { convertUserTenantTypeToUserTenant, getUserName } from '@/lib/user';
import { UserTenantScopedFormValues } from '@/components/common/user/user-tenant-scoped-form';

class UserNotFoundErr extends Error { }

// Type definition for Better Auth member
type BetterAuthMember = {
  id: string;
  userId: string;
  role: string | string[];
  user: {
    email: string;
    name: string | null;
  };
  isActive?: boolean;
};

// Unified function to get a member from Better Auth
// Supports searching by memberId, userId, or email
async function getMemberFromBetterAuth(
  tenantId: string,
  options: {
    memberId?: string;
    userId?: string;
    email?: string;
  }
): Promise<BetterAuthMember | null> {
  const { memberId, userId, email } = options;

  // If we have memberId, try to filter directly by ID (most efficient)
  if (memberId) {
    try {
      const authResult = await auth.api.listMembers({
        query: {
          organizationId: tenantId,
          limit: 1,
          offset: 0,
          filterField: 'id',
          filterOperator: 'eq',
          filterValue: memberId,
        },
        headers: await headers(),
      });

      const members = authResult.members || [];
      const member = members.find((m) => m.id === memberId || m.userId === memberId);
      if (member) {
        return member as BetterAuthMember;
      }
    } catch (error) {
      console.error('Failed to get member from Better Auth by ID:', error);
    }
  }

  // If filtering by ID didn't work or we don't have memberId, fetch members and filter client-side
  try {
    // Start with a reasonable limit
    const initialLimit = 100;
    let authResult = await auth.api.listMembers({
      query: {
        organizationId: tenantId,
        limit: initialLimit,
        offset: 0,
      },
      headers: await headers(),
    });

    let members = authResult.members || [];

    // Filter by the criteria we have
    let foundMember: BetterAuthMember | undefined;

    if (memberId) {
      foundMember = members.find((m) => m.id === memberId || m.userId === memberId) as BetterAuthMember | undefined;
    } else if (userId) {
      foundMember = members.find((m) => m.userId === userId) as BetterAuthMember | undefined;
    } else if (email) {
      foundMember = members.find((m) => m.user?.email === email) as BetterAuthMember | undefined;
    }

    // If not found and there are more members, fetch all
    if (!foundMember && authResult.total && authResult.total > initialLimit) {
      const allResult = await auth.api.listMembers({
        query: {
          organizationId: tenantId,
          limit: authResult.total,
          offset: 0,
        },
        headers: await headers(),
      });

      const allMembers = allResult.members || [];

      if (memberId) {
        foundMember = allMembers.find((m) => m.id === memberId || m.userId === memberId) as BetterAuthMember | undefined;
      } else if (userId) {
        foundMember = allMembers.find((m) => m.userId === userId) as BetterAuthMember | undefined;
      } else if (email) {
        foundMember = allMembers.find((m) => m.user?.email === email) as BetterAuthMember | undefined;
      }
    }

    return foundMember || null;
  } catch (error) {
    console.error('Failed to get member from Better Auth:', error);
    return null;
  }
}

// Type definition for safe invitation metadata
type SafeInvitationMetadata = {
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isTwoFactorRequired?: boolean;
  roles?: Array<{ roleId: string; isActive: boolean }>;
  areaRoles?: Array<{ areaId: string; roleId: string; isActive: boolean }>;
};

// Sanitizes data before saving it in metadata
const sanitizeInvitationData = (data: UserTenantScopedFormValues): SafeInvitationMetadata => {
  return {
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    isAdmin: data.user.isAdmin,
    isTwoFactorRequired: data.user.isTwoFactorRequired,
    roles: data.roles?.map((role) => ({
      roleId: role.roleId.value,
      isActive: role.isActive,
    })),
    areaRoles: data.areaRoles?.map((area) => ({
      areaId: area.areaId.value,
      roleId: area.roleId.value,
      isActive: area.isActive,
    })),
  };
};

// Updates an existing user
const updateExistingUser = async (tenantId: string, data: UserTenantScopedFormValues, existingUserId: string, memberId?: string) => {
  const db = await getDb();

  // Get member from Better Auth using unified function
  const existingMember = await getMemberFromBetterAuth(tenantId, {
    memberId,
    userId: existingUserId,
  });

  // Find the current UserTenant record
  const currentUserTenant = await db.userTenant.findUnique({
    where: { userId_tenantId: { userId: existingUserId, tenantId } },
    select: { personId: true, id: true },
  });

  // Find the current Person record if it exists (using userTenantId for better reliability)
  const currentPerson = currentUserTenant?.id
    ? await db.person.findUnique({
      where: { userTenantId: currentUserTenant.id },
      select: { id: true },
    })
    : null;

  // Uniqueness check for phone
  if (data.user.phone) {
    const phoneExists = await db.person.findFirst({
      where: {
        phone: data.user.phone,
        tenantId,
        // Exclude the current person's record if it exists
        ...(currentPerson ? { id: { not: currentPerson.id } } : {}),
      },
      select: { id: true },
    });
    if (phoneExists) {
      throw new Error('Phone number is already registered in this tenant.');
    }
  }

  // Uniqueness check for identificationNumber
  if (data.user.identificationNumber) {
    const idNumberExists = await db.person.findFirst({
      where: {
        identificationNumber: data.user.identificationNumber,
        tenantId,
        // Exclude the current person's record if it exists
        ...(currentPerson ? { id: { not: currentPerson.id } } : {}),
      },
      select: { id: true },
    });
    if (idNumberExists) {
      throw new Error('Identification number is already registered in this tenant.');
    }
  }

  // Determine the role to use in Better Auth
  const betterAuthRole = data.user.isAdmin ? 'admin' : 'member';

  // Update member role in Better Auth if it changed
  if (existingMember) {
    const currentRoles = Array.isArray(existingMember.role) ? existingMember.role : existingMember.role.split(',').map((r) => r.trim());
    const needsRoleUpdate = !currentRoles.includes(betterAuthRole);

    if (needsRoleUpdate) {
      try {
        await auth.api.updateMemberRole({
          body: {
            memberId: existingMember.id,
            organizationId: tenantId,
            role: betterAuthRole,
          },
          headers: await headers(),
        });
      } catch (error: any) {
        // If update fails, log but continue with Prisma update
        console.error('Failed to update member role in Better Auth:', error);
        // Don't throw - we'll update Prisma anyway
      }
    }
  }

  // Use the memberId from Better Auth if available, otherwise use data.user.id or currentUserTenant.id
  const finalMemberId = existingMember?.id || data.user.id || currentUserTenant?.id;

  return await db.user.update({
    select: { id: true, email: true, username: true },
    where: { id: existingUserId },
    data: {
      userTenants: {
        upsert: {
          where: { userId_tenantId: { userId: existingUserId, tenantId } },
          create: {
            tenantId,
            id: finalMemberId,
            isActive: data.user.isActive,
            isTwoFactorRequired: data.user.isTwoFactorRequired,
            person: {
              create: {
                tenantId,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                phone: data.user.phone,
                identificationNumber: data.user.identificationNumber,
                identificationTypeId: data.user.identificationTypeId?.value,
              },
            },
            userRoles: data.roles
              ? {
                create: data.roles.map((role) => ({
                  tenantId,
                  roleId: role.roleId.value,
                  isActive: role.isActive,
                })),
              }
              : undefined,
            userAreas: data.areaRoles
              ? {
                create: data.areaRoles.map((area) => ({
                  tenantId,
                  areaId: area.areaId.value,
                  roleId: area.roleId.value,
                  isActive: area.isActive,
                })),
              }
              : undefined,
            role: betterAuthRole,
          },
          update: {
            isActive: data.user.isActive,
            isTwoFactorRequired: data.user.isTwoFactorRequired,
            person: {
              update: {
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                phone: data.user.phone,
                identificationNumber: data.user.identificationNumber,
                identificationTypeId: data.user.identificationTypeId?.value,
              },
            },
            userRoles: {
              deleteMany: {},
              create: (data.roles || []).map((role) => ({
                tenantId,
                roleId: role.roleId.value,
                isActive: role.isActive,
              })),
            },
            userAreas: {
              deleteMany: {},
              create: (data.areaRoles || []).map((area) => ({
                tenantId,
                areaId: area.areaId.value,
                roleId: area.roleId.value,
                isActive: area.isActive,
              })),
            },
            role: betterAuthRole,
          },
        },
      },
    },
  });
};

// Creates an invitation with safe metadata
const createUserInvitation = async (tenantId: string, data: UserTenantScopedFormValues) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  // Sanitize data before saving
  const safeMetadata = sanitizeInvitationData(data);

  // Create invitation in the authentication system
  const invitationResult = await auth.api.createInvitation({
    headers: await headers(),
    body: {
      resend: true,
      email: data.user.email,
      role: data.user.isAdmin ? 'admin' : 'member',
      organizationId: tenantId,
    },
  });

  // Save safe metadata in the database
  await db.invitationTenant.update({
    where: { id: invitationResult.id },
    data: { metadata: JSON.stringify(safeMetadata) },
  });

  return {
    isNewUser: true,
    email: data.user.email,
    invitationId: invitationResult.id,
  };
};

// Processes the acceptance of an invitation
export const processInvitationAcceptance = async (invitationId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  // 1. Retrieve invitation metadata
  const invitationRecord = await db.invitationTenant.findUnique({
    select: { tenantId: true, metadata: true },
    where: { id: invitationId },
  });
  if (!invitationRecord) throw new Error('Invitation metadata not found');

  // 2. Parse metadata (with basic validation)
  let metadata: SafeInvitationMetadata;
  try {
    metadata = JSON.parse(invitationRecord.metadata);
  } catch {
    throw new Error('Invalid invitation format, you may need to ask the administrator to resend the invitation');
  }

  // 3. Accept the invitation in the authentication system
  const authResult = await auth.api.acceptInvitation({
    headers: await headers(),
    body: { invitationId },
  });

  if (!authResult) throw new Error('Failed to accept invitation, you may need to ask the administrator to resend the invitation');

  // 4. Apply tenant configuration
  await db.userTenant.update({
    where: { userId_tenantId: { userId: session.session.userId, tenantId: invitationRecord.tenantId } },
    data: {
      isTermAccepted: true, // Default value
      userId: session.session.userId,
      tenantId: invitationRecord.tenantId,
      role: metadata.isAdmin ? 'admin' : 'member',
      isTwoFactorRequired: metadata.isTwoFactorRequired ?? false,
      isActive: true,
      person: {
        create: {
          tenantId: invitationRecord.tenantId,
          firstName: metadata.firstName,
          lastName: metadata.lastName,
        },
      },
      userRoles: metadata.roles
        ? {
          create: metadata.roles.map((role) => ({
            tenantId: invitationRecord.tenantId,
            roleId: role.roleId,
            isActive: role.isActive,
          })),
        }
        : undefined,
      userAreas: metadata.areaRoles
        ? {
          create: metadata.areaRoles.map((area) => ({
            tenantId: invitationRecord.tenantId,
            areaId: area.areaId,
            roleId: area.roleId,
            isActive: area.isActive,
          })),
        }
        : undefined,
    },
  });

  return { tenantId: authResult.invitation.organizationId };
};

// Main function to create/update users
export const upsertUser = async (tenantId: string, data: UserTenantScopedFormValues) => {
  console.log('data UserTenantScopedFormValues', data);
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // Check if the user already exists as a member in Better Auth
  const existingMember = await getMemberFromBetterAuth(tenantId, {
    memberId: data.user.id && data.user.isEditing ? data.user.id : undefined,
    email: !data.user.isEditing ? data.user.email : undefined,
  });

  if (existingMember) {
    return await updateExistingUser(tenantId, data, existingMember.userId, existingMember.id);
  } else {
    return await createUserInvitation(tenantId, data);
  }
};

// Get a single user tenant and map to the form default values for editing
// Uses Better Auth to get member info, then fetches additional data from Prisma
export const getUserFormValuesByUserTenantId = async (tenantId: string, memberId: string): Promise<UserTenantScopedFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // Get member from Better Auth using unified function
  const member = await getMemberFromBetterAuth(tenantId, {
    memberId,
  });

  if (!member) {
    throw new Error(`Member not found with ID: ${memberId}`);
  }

  // Get additional data from Prisma (person, userRoles, userAreas)
  const db = await getDb();
  const userTenant = await db.userTenant.findFirst({
    where: {
      OR: [
        { id: member.id, tenantId },
        { userId: member.userId, tenantId },
      ],
    },
    select: {
      id: true,
      isActive: true,
      isTwoFactorRequired: true,
      role: true,
      person: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          identificationNumber: true,
          identificationTypeId: true,
        },
      },
      userRoles: {
        select: {
          id: true,
          isActive: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      userAreas: {
        select: {
          id: true,
          isActive: true,
          area: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Get identification type name if it exists
  let identificationTypeLabel = '';
  if (userTenant?.person?.identificationTypeId) {
    const identificationType = await db.identificationType.findUnique({
      where: { id: userTenant.person.identificationTypeId },
      select: { name: true },
    });
    identificationTypeLabel = identificationType?.name ?? '';
  }

  // Parse Better Auth role(s) to determine if admin
  const roles = Array.isArray(member.role) ? member.role : member.role.split(',').map((r) => r.trim());
  const isAdmin = roles.includes('admin') || roles.includes('owner');

  return {
    user: {
      id: userTenant?.id || member.id,
      email: member.user.email,
      isActive: userTenant?.isActive ?? member.isActive ?? true,
      isAdmin,
      isTwoFactorRequired: userTenant?.isTwoFactorRequired ?? false,
      firstName: userTenant?.person?.firstName ?? member.user.name?.split(' ')[0] ?? '',
      lastName: userTenant?.person?.lastName ?? member.user.name?.split(' ').slice(1).join(' ') ?? '',
      phone: userTenant?.person?.phone ?? '',
      identificationNumber: userTenant?.person?.identificationNumber ?? '',
      identificationTypeId: {
        value: userTenant?.person?.identificationTypeId ?? '',
        label: identificationTypeLabel,
      },
      isEditing: true,
    },
    roles:
      userTenant?.userRoles.map((ur) => ({
        id: ur.id,
        roleId: { value: ur.role.id, label: ur.role.name },
        isActive: ur.isActive,
      })) ?? [],
    areaRoles:
      userTenant?.userAreas.map((ua) => ({
        id: ua.id,
        areaId: { value: ua.area.id, label: ua.area.name },
        roleId: { value: ua.role.id, label: ua.role.name },
        isActive: ua.isActive,
      })) ?? [],
  };
};

// Get users as options for selects
export const getUsersAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const userTenants = await db.userTenant.findMany({
    select: {
      id: true,
      user: { select: { id: true, email: true, username: true } },
      person: { select: { image: true, firstName: true, lastName: true } },
    },
    where: { tenantId, isActive: true },
    orderBy: { user: { username: 'asc' } },
  });

  return userTenants.map((userTenant) => ({
    label: getUserName(userTenant),
    value: userTenant.id,
  }));
};

// Get identification types as options
export const getIdentityTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const identityTypes = await db.identificationType.findMany({
    select: { id: true, name: true, regex: true },
    where: { tenantId },
  });

  return identityTypes.map(({ name, id, regex }) => ({
    label: name,
    value: id,
    regex,
  }));
};

// Get roles as options
export const getRolesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const roles = await db.role.findMany({
    select: { id: true, name: true },
    where: { tenantId },
  });

  return roles.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
};

// Get the current user's tenant
export const getCurrentUserTenant = async (tenantId: string): Promise<UserTenant | null> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const result = await db.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
    select: {
      id: true,
      user: { select: { id: true, email: true, username: true } },
      person: { select: { id: true, image: true, firstName: true, lastName: true } },
    },
  });

  if (!result) return null;

  return convertUserTenantTypeToUserTenant(result);
};

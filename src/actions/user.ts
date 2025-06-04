'use server';

import { headers } from 'next/headers';
import { auth, currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { UserTenant } from '@/types/user';
import { convertUserTenantTypeToUserTenant, getUserName } from '@/lib/user';
import { UserTenantScopedFormValues } from '@/components/common/user/user-tenant-scoped-form';

class UserNotFoundErr extends Error {}

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
const updateExistingUser = async (tenantId: string, data: UserTenantScopedFormValues, existingUserId: string) => {
  // Find the current Person record for this user and tenant
  const currentUserTenant = await db.userTenant.findUnique({
    where: { userId_tenantId: { userId: existingUserId, tenantId } },
    select: { personId: true },
  });

  // Uniqueness check for phone
  if (data.user.phone) {
    const phoneExists = await db.person.findFirst({
      where: {
        phone: data.user.phone,
        tenantId,
        // Exclude the current person's record (if exists)
        id: currentUserTenant?.personId ? { not: currentUserTenant.personId } : undefined,
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
        id: currentUserTenant?.personId ? { not: currentUserTenant.personId } : undefined,
      },
      select: { id: true },
    });
    if (idNumberExists) {
      throw new Error('Identification number is already registered in this tenant.');
    }
  }

  return await db.user.update({
    select: { id: true, email: true, username: true },
    where: { id: existingUserId },
    data: {
      userTenants: {
        upsert: {
          where: { userId_tenantId: { userId: existingUserId, tenantId } },
          create: {
            tenantId,
            id: data.user.id,
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
            role: data.user.isAdmin ? 'admin' : 'member',
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
            role: data.user.isAdmin ? 'admin' : 'member',
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
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // Check if the user already exists
  const existingUser = await db.user.findUnique({
    select: { id: true },
    where: { email: data.user.email },
  });

  if (existingUser) {
    return await updateExistingUser(tenantId, data, existingUser.id);
  } else {
    return await createUserInvitation(tenantId, data);
  }
};

// Get users as options for selects
export const getUsersAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

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
export const getCurrentUserTenant = async (tenantId: string): Promise<UserTenant> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const result = await db.userTenant.findUniqueOrThrow({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
    select: {
      id: true,
      user: { select: { id: true, email: true, username: true } },
      person: { select: { id: true, image: true, firstName: true, lastName: true } },
    },
  });

  return convertUserTenantTypeToUserTenant(result);
};

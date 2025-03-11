'use server';

import { auth, currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
//import { sendVerificationEmailWithPassword } from '@/lib/mail';
import { generateTempPassword } from '@/lib/password';
import { UserTenantScopedFormValues } from '@/components/common/user/user-tenant-scoped-form';

class UserNotFoundErr extends Error {}

export const getUsersAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      userTenants: {
        select: {
          id: true,
          person: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        where: { tenantId },
      },
    },
    where: { userTenants: { every: { tenantId } } },
  });

  return users.map((user) => ({
    label:
      user.userTenants[0].person?.firstName && user.userTenants[0].person?.lastName
        ? `${user.userTenants[0].person?.firstName} ${user.userTenants[0].person?.lastName} @${user.username}`
        : user.username,
    value: user.userTenants[0].id,
  }));
};

export const getIdentityTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const identityTypes = await db.identificationType.findMany({
    select: { id: true, name: true, regex: true },
    where: { tenantId },
  });

  return identityTypes.map(({ name, id, regex }) => ({ label: name, value: id, regex }));
};

export const getRolesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const roles = await db.role.findMany({
    select: { id: true, name: true },
    where: { tenantId },
  });

  return roles.map(({ name, id }) => ({ label: name, value: id }));
};

export const upsertUser = async (tenantId: string, data: UserTenantScopedFormValues) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // 1️⃣ Check if the user already exists by email
  const existingUser = await db.user.findUnique({
    where: { email: data.user.email },
  });

  // 2️⃣ Generate base data for user creation
  const newUserData = {
    username: `${data.user.firstName.toLowerCase()}.${data.user.lastName.toLowerCase() + generateUuid().slice(0, 4)}`,
    email: data.user.email,
    password: generateTempPassword(),
    isTemporalPassword: true,
  };

  // 3️⃣ If the user does NOT exist, create it and send an invitation email
  let user;
  let isNewUser = false;

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        email: newUserData.email,
        password: newUserData.password,
        name: newUserData.username,
      },
    });

    isNewUser = true;
  } else {
    // 4️⃣ If the user already exists, update their information

    user = await db.user.update({
      where: { email: data.user.email },
      data: {
        userTenants: {
          upsert: {
            where: { userId_tenantId: { userId: existingUser.id, tenantId } },
            create: {
              tenantId,
              isActive: data.user.isActive,
              isTwoFactorRequired: data.user.isTwoFactorRequired,
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
            },
            update: {
              isTwoFactorRequired: data.user.isTwoFactorRequired,
              isActive: data.user.isActive,
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
            },
          },
        },
      },
    });
  }

  // 5️⃣ If the user is new, send an invitation email
  if (isNewUser) {
    // todo: send email
  }

  return user;
};

export const getCurrentUserTenant = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const user = await db.userTenant.findUniqueOrThrow({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
    select: { id: true },
  });

  return {
    userTenantId: user.id,
  };
};

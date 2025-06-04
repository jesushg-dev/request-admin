import { type UserTenant } from '@/types/user';

export type UserTenantType = {
  id: string;
  user: {
    id: string;
    email: string;
    username: string | null;
  };
  person: {
    image: string | null;
    firstName: string;
    lastName: string;
  } | null;
};

export const getUserName = (userTenant: UserTenantType): string => {
  if (userTenant.person) {
    return `${userTenant.person.firstName} ${userTenant.person.lastName}`;
  }
  if (userTenant.user.username) {
    return `@${userTenant.user.username} (${userTenant.user.email})`;
  }
  return userTenant.user.email;
};

export const convertUserTenantTypeToUserTenant = (userTenant: UserTenantType): UserTenant => {
  return {
    userId: userTenant.user.id,
    userEmail: userTenant.user.email,
    userUsername: userTenant.user.username ?? null,
    userTenantId: userTenant.id,
    personId: userTenant.person?.image ?? null,
    personImage: userTenant.person?.image ?? null,
    personFirstName: userTenant.person?.firstName ?? null,
    personLastName: userTenant.person?.lastName ?? null,
    displayUserName: getUserName(userTenant),
  };
};

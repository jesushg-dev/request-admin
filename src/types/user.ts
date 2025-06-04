export enum LoginErrorCodeEnum {
  UNAUTHENTICATED = 'unauthenticated',
  TENANT_NOT_AUTHORIZED = 'tenant-not-authorized',
  INVITATION_REQUIRED_AUTH = 'invitation-required-auth',
}

export interface UserTenant {
  userId: string;
  userEmail: string;
  userUsername?: string | null;
  userTenantId: string;
  personId?: string | null;
  personImage?: string | null;
  personFirstName?: string | null;
  personLastName?: string | null;
  displayUserName: string;
}

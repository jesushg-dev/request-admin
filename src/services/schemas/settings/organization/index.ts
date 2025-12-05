/**
 * Settings Organization Schemas
 * Re-exports all organization-related schemas
 */

export { createPersonSchema, usePersonSchema, type TPersonSchema } from './person.schema';

export { createUserTenantSchema, useUserTenantSchema, type TUserTenantSchema } from './roles-and-access.schema';

/* eslint-disable */
import type { AnyTRPCRouter as AnyRouter } from '@trpc/server';
import type { PrismaClient } from '@zenstackhq/runtime/models';
import { createTRPCRouter } from '../../trpc';
import createUserRouter from './User.router';
import createTenantRouter from './Tenant.router';
import createAccountRouter from './Account.router';
import createSessionRouter from './Session.router';
import createVerificationTokenRouter from './VerificationToken.router';
import createPasswordResetTokenRouter from './PasswordResetToken.router';
import createTwoFactorTokenRouter from './TwoFactorToken.router';
import createTwoFactorConfirmationRouter from './TwoFactorConfirmation.router';
import createAuthenticatorRouter from './Authenticator.router';
import createRequirementRouter from './Requirement.router';
import createCategoryRequirementRouter from './CategoryRequirement.router';
import createSalesChannelRouter from './SalesChannel.router';
import createServiceTypeRouter from './ServiceType.router';
import createRequirementServiceTypeAssociationRouter from './RequirementServiceTypeAssociation.router';
import createRequestRouter from './Request.router';
import createRequirementComplianceTrackingRouter from './RequirementComplianceTracking.router';
import createDocumentRouter from './Document.router';
import createAreaRouter from './Area.router';
import createCategoryRouter from './Category.router';
import createSubCategoryRouter from './SubCategory.router';
import createRequestAssignmentRouter from './RequestAssignment.router';
import createUserRoleRouter from './UserRole.router';
import createRoleRouter from './Role.router';
import createModuleRouter from './Module.router';
import createPermissionRouter from './Permission.router';
import createRolePermissionRouter from './RolePermission.router';
import createRequestStateRouter from './RequestState.router';
import createClientRouter from './Client.router';
import createIdentificationTypeRouter from './IdentificationType.router';
import createDocumentAssignmentRouter from './DocumentAssignment.router';
import createRequestTypeRouter from './RequestType.router';
import createFormRouter from './Form.router';
import createFormSubmissionRouter from './FormSubmission.router';

export function db(ctx: any) {
  if (!ctx.prisma) {
    throw new Error('Missing "prisma" field in trpc context');
  }
  return ctx.prisma as PrismaClient;
}

export function createRouter() {
  return createTRPCRouter({
    user: createUserRouter(),
    tenant: createTenantRouter(),
    account: createAccountRouter(),
    session: createSessionRouter(),
    verificationToken: createVerificationTokenRouter(),
    passwordResetToken: createPasswordResetTokenRouter(),
    twoFactorToken: createTwoFactorTokenRouter(),
    twoFactorConfirmation: createTwoFactorConfirmationRouter(),
    authenticator: createAuthenticatorRouter(),
    requirement: createRequirementRouter(),
    categoryRequirement: createCategoryRequirementRouter(),
    salesChannel: createSalesChannelRouter(),
    serviceType: createServiceTypeRouter(),
    requirementServiceTypeAssociation: createRequirementServiceTypeAssociationRouter(),
    request: createRequestRouter(),
    requirementComplianceTracking: createRequirementComplianceTrackingRouter(),
    document: createDocumentRouter(),
    area: createAreaRouter(),
    category: createCategoryRouter(),
    subCategory: createSubCategoryRouter(),
    requestAssignment: createRequestAssignmentRouter(),
    userRole: createUserRoleRouter(),
    role: createRoleRouter(),
    module: createModuleRouter(),
    permission: createPermissionRouter(),
    rolePermission: createRolePermissionRouter(),
    requestState: createRequestStateRouter(),
    client: createClientRouter(),
    identificationType: createIdentificationTypeRouter(),
    documentAssignment: createDocumentAssignmentRouter(),
    requestType: createRequestTypeRouter(),
    form: createFormRouter(),
    formSubmission: createFormSubmissionRouter(),
  });
}

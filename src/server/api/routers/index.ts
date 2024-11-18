/* eslint-disable */
import type { AnyTRPCRouter as AnyRouter } from '@trpc/server';
import type { PrismaClient } from '@zenstackhq/runtime/models';
import { createTRPCRouter } from '../../trpc';
import createTenantRouter from './Tenant.router';
import createUserRouter from './User.router';
import createUserRoleRouter from './UserRole.router';
import createRoleRouter from './Role.router';
import createModuleRouter from './Module.router';
import createPermissionRouter from './Permission.router';
import createRolePermissionRouter from './RolePermission.router';
import createSessionRouter from './Session.router';
import createAccountRouter from './Account.router';
import createVerificationTokenRouter from './VerificationToken.router';
import createPasswordResetTokenRouter from './PasswordResetToken.router';
import createTwoFactorTokenRouter from './TwoFactorToken.router';
import createTwoFactorConfirmationRouter from './TwoFactorConfirmation.router';
import createAuthenticatorRouter from './Authenticator.router';
import createRequestRouter from './Request.router';
import createRequestAssignmentRouter from './RequestAssignment.router';
import createRequestStateRouter from './RequestState.router';
import createRequirementRouter from './Requirement.router';
import createRequirementComplianceTrackingRouter from './RequirementComplianceTracking.router';
import createRequirementServiceTypeAssociationRouter from './RequirementServiceTypeAssociation.router';
import createServiceTypeRouter from './ServiceType.router';
import createSalesChannelRouter from './SalesChannel.router';
import createCategoryRequirementRouter from './CategoryRequirement.router';
import createAreaRouter from './Area.router';
import createRequestTypeRouter from './RequestType.router';
import createCategoryRouter from './Category.router';
import createSubCategoryRouter from './SubCategory.router';
import createFormRouter from './Form.router';
import createFormSubmissionRouter from './FormSubmission.router';
import createDocumentRouter from './Document.router';
import createDocumentAssignmentRouter from './DocumentAssignment.router';
import createClientRouter from './Client.router';
import createIdentificationTypeRouter from './IdentificationType.router';
import createWorkspaceRouter from './Workspace.router';
import createMemberRouter from './Member.router';
import createChannelRouter from './Channel.router';
import createConversationRouter from './Conversation.router';
import createMessageRouter from './Message.router';
import createReactionRouter from './Reaction.router';

export function db(ctx: any) {
  if (!ctx.prisma) {
    throw new Error('Missing "prisma" field in trpc context');
  }
  return ctx.prisma as PrismaClient;
}

export function createRouter() {
  return createTRPCRouter({
    tenant: createTenantRouter(),
    user: createUserRouter(),
    userRole: createUserRoleRouter(),
    role: createRoleRouter(),
    module: createModuleRouter(),
    permission: createPermissionRouter(),
    rolePermission: createRolePermissionRouter(),
    session: createSessionRouter(),
    account: createAccountRouter(),
    verificationToken: createVerificationTokenRouter(),
    passwordResetToken: createPasswordResetTokenRouter(),
    twoFactorToken: createTwoFactorTokenRouter(),
    twoFactorConfirmation: createTwoFactorConfirmationRouter(),
    authenticator: createAuthenticatorRouter(),
    request: createRequestRouter(),
    requestAssignment: createRequestAssignmentRouter(),
    requestState: createRequestStateRouter(),
    requirement: createRequirementRouter(),
    requirementComplianceTracking: createRequirementComplianceTrackingRouter(),
    requirementServiceTypeAssociation: createRequirementServiceTypeAssociationRouter(),
    serviceType: createServiceTypeRouter(),
    salesChannel: createSalesChannelRouter(),
    categoryRequirement: createCategoryRequirementRouter(),
    area: createAreaRouter(),
    requestType: createRequestTypeRouter(),
    category: createCategoryRouter(),
    subCategory: createSubCategoryRouter(),
    form: createFormRouter(),
    formSubmission: createFormSubmissionRouter(),
    document: createDocumentRouter(),
    documentAssignment: createDocumentAssignmentRouter(),
    client: createClientRouter(),
    identificationType: createIdentificationTypeRouter(),
    workspace: createWorkspaceRouter(),
    member: createMemberRouter(),
    channel: createChannelRouter(),
    conversation: createConversationRouter(),
    message: createMessageRouter(),
    reaction: createReactionRouter(),
  });
}

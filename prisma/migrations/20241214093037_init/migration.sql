BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tenant] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [logo] NVARCHAR(1000),
    [websiteUrl] NVARCHAR(1000),
    [title] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [primaryColor] NVARCHAR(1000),
    [secondaryColor] NVARCHAR(1000),
    [contactEmail] NVARCHAR(1000),
    [contactPhone] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    CONSTRAINT [Tenant_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [id] UNIQUEIDENTIFIER NOT NULL,
    [username] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [emailVerified] DATETIME2,
    [password] NVARCHAR(1000) NOT NULL,
    [isTwoFactorEnabled] BIT NOT NULL CONSTRAINT [User_isTwoFactorEnabled_df] DEFAULT 0,
    [twoFactorConfirmationId] UNIQUEIDENTIFIER,
    [isGlobalAdmin] BIT NOT NULL CONSTRAINT [User_isGlobalAdmin_df] DEFAULT 0,
    [personId] UNIQUEIDENTIFIER,
    [areaId] UNIQUEIDENTIFIER,
    [coordinatorId] UNIQUEIDENTIFIER,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[UserTenant] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [UserTenant_isActive_df] DEFAULT 1,
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [UserTenant_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [isSuperAdmin] BIT NOT NULL CONSTRAINT [UserTenant_isSuperAdmin_df] DEFAULT 0,
    [isCurrent] BIT NOT NULL CONSTRAINT [UserTenant_isCurrent_df] DEFAULT 0,
    CONSTRAINT [UserTenant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserTenant_userId_tenantId_key] UNIQUE NONCLUSTERED ([userId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[UserTenantRole] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserRole_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [roleId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Module] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Module_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    CONSTRAINT [Module_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Module_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Feature] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Feature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(50) NOT NULL,
    [description] VARCHAR(255),
    [moduleId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Feature_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RoleFeature] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoleFeature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [roleId] UNIQUEIDENTIFIER NOT NULL,
    [featureId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [RoleFeature_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] TEXT,
    [access_token] TEXT,
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] TEXT,
    [session_state] NVARCHAR(1000),
    [refresh_token_expires_in] INT,
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationToken] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VerificationToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [VerificationToken_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[PasswordResetToken] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [PasswordResetToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasswordResetToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [PasswordResetToken_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[TwoFactorToken] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [TwoFactorToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TwoFactorToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [TwoFactorToken_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[TwoFactorConfirmation] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [TwoFactorConfirmation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TwoFactorConfirmation_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Authenticator] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [credentialID] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [credentialPublicKey] NVARCHAR(1000) NOT NULL,
    [counter] INT NOT NULL,
    [credentialDeviceType] NVARCHAR(1000) NOT NULL,
    [credentialBackedUp] BIT NOT NULL,
    [transports] NVARCHAR(1000),
    CONSTRAINT [Authenticator_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Authenticator_credentialID_key] UNIQUE NONCLUSTERED ([credentialID]),
    CONSTRAINT [Authenticator_userId_providerAccountId_key] UNIQUE NONCLUSTERED ([userId],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Hierarchy] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Hierarchy_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [type] VARCHAR(50) NOT NULL,
    CONSTRAINT [Hierarchy_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Hierarchy_type_key] UNIQUE NONCLUSTERED ([type])
);

-- CreateTable
CREATE TABLE [dbo].[HierarchyLevel] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [HierarchyLevel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [position] INT NOT NULL,
    [hierarchyId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [HierarchyLevel_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Category] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Category_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isEligibleForNewClients] BIT NOT NULL CONSTRAINT [Category_isEligibleForNewClients_df] DEFAULT 1,
    [parent_id] UNIQUEIDENTIFIER,
    [hierarchyLevelId] UNIQUEIDENTIFIER NOT NULL,
    [hierarchyId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Category_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Request] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Request_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [clientId] UNIQUEIDENTIFIER NOT NULL,
    [issueSubject] VARCHAR(255),
    [description] VARCHAR(5000),
    [priority] VARCHAR(50),
    [closedAt] DATETIME2,
    [closedBy] VARCHAR(50),
    [closedComment] VARCHAR(500),
    [comment] VARCHAR(255),
    [statusId] UNIQUEIDENTIFIER NOT NULL,
    [requestCategoryId] UNIQUEIDENTIFIER NOT NULL,
    [assignmentCategoryId] UNIQUEIDENTIFIER NOT NULL,
    [formSubmissionId] UNIQUEIDENTIFIER,
    CONSTRAINT [Request_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestAssignment] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestAssignment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [priority] VARCHAR(50),
    [comment] VARCHAR(255),
    [assignmentDate] DATETIME2 NOT NULL,
    [unAssignmentDate] DATETIME2,
    [type] VARCHAR(50) NOT NULL,
    [requestId] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER,
    [areaId] UNIQUEIDENTIFIER,
    [statusId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [RequestAssignment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[StatusType] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [StatusType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(50) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [StatusType_isActive_df] DEFAULT 1,
    CONSTRAINT [StatusType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [StatusType_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Area] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Area_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Area_isActive_df] DEFAULT 1,
    CONSTRAINT [Area_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Area_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Requirement] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Requirement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(200) NOT NULL,
    [description] VARCHAR(500) NOT NULL,
    [isRequiredOnlyOnce] BIT NOT NULL CONSTRAINT [Requirement_isRequiredOnlyOnce_df] DEFAULT 0,
    [requirementTypeId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Requirement_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Requirement_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[RequirementType] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequirementType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255) NOT NULL,
    CONSTRAINT [RequirementType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequirementType_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[CategoryRequirement] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CategoryRequirement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [requirementId] UNIQUEIDENTIFIER NOT NULL,
    [categoryId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [CategoryRequirement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequirementComplianceTracking] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequirementComplianceTracking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [requestId] UNIQUEIDENTIFIER NOT NULL,
    [requirementId] UNIQUEIDENTIFIER NOT NULL,
    [isFulfilled] BIT NOT NULL CONSTRAINT [RequirementComplianceTracking_isFulfilled_df] DEFAULT 0,
    CONSTRAINT [RequirementComplianceTracking_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Form] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Form_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL CONSTRAINT [Form_description_df] DEFAULT '',
    [content] NVARCHAR(1000) NOT NULL CONSTRAINT [Form_content_df] DEFAULT '[]',
    [published] BIT NOT NULL CONSTRAINT [Form_published_df] DEFAULT 0,
    [visits] INT NOT NULL CONSTRAINT [Form_visits_df] DEFAULT 0,
    [submissions] INT NOT NULL CONSTRAINT [Form_submissions_df] DEFAULT 0,
    [shareURL] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Form_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Form_shareURL_key] UNIQUE NONCLUSTERED ([shareURL]),
    CONSTRAINT [Form_name_userId_key] UNIQUE NONCLUSTERED ([name],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[FormSubmission] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormSubmission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [formId] UNIQUEIDENTIFIER NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [FormSubmission_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Document] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Document_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(155) NOT NULL,
    [status] INT NOT NULL,
    [requestId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Document_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentAssignment] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentAssignment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(50),
    [status] VARCHAR(50),
    [requestAssignmentId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [DocumentAssignment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Person] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Person_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [firstName] VARCHAR(100) NOT NULL,
    [lastName] VARCHAR(100) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] VARCHAR(50),
    [identificationNumber] VARCHAR(110) NOT NULL CONSTRAINT [Person_identificationNumber_df] DEFAULT '',
    [image] NVARCHAR(1000),
    [userId] UNIQUEIDENTIFIER,
    [clientId] UNIQUEIDENTIFIER,
    [identificationTypeId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Person_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Person_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [Person_identificationNumber_key] UNIQUE NONCLUSTERED ([identificationNumber]),
    CONSTRAINT [Person_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [Person_clientId_key] UNIQUE NONCLUSTERED ([clientId])
);

-- CreateTable
CREATE TABLE [dbo].[Client] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Client_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [corporateName] VARCHAR(100),
    [monthlyIncome] FLOAT(53),
    [occupation] VARCHAR(100),
    [personId] UNIQUEIDENTIFIER,
    CONSTRAINT [Client_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[IdentificationType] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IdentificationType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] VARCHAR(150) NOT NULL,
    [description] VARCHAR(500),
    CONSTRAINT [IdentificationType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IdentificationType_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Workspace] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [joinCode] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Workspace_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Member] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [workspaceId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Member_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Channel] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [workspaceId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Channel_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conversation] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [workspaceId] UNIQUEIDENTIFIER NOT NULL,
    [memberOneId] UNIQUEIDENTIFIER NOT NULL,
    [memberTwoId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Conversation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Message] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [imageId] UNIQUEIDENTIFIER,
    [updatedAt] DATETIME2,
    [memberId] UNIQUEIDENTIFIER NOT NULL,
    [workspaceId] UNIQUEIDENTIFIER NOT NULL,
    [channelId] UNIQUEIDENTIFIER,
    [parentMessageId] UNIQUEIDENTIFIER,
    [conversationId] UNIQUEIDENTIFIER,
    CONSTRAINT [Message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Reaction] (
    [tenantId] UNIQUEIDENTIFIER NOT NULL,
    [id] UNIQUEIDENTIFIER NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [workspaceId] UNIQUEIDENTIFIER NOT NULL,
    [messageId] UNIQUEIDENTIFIER NOT NULL,
    [memberId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Reaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_CategoryToForm] (
    [A] UNIQUEIDENTIFIER NOT NULL,
    [B] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [_CategoryToForm_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_AreaToCategory] (
    [A] UNIQUEIDENTIFIER NOT NULL,
    [B] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [_AreaToCategory_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_userId_idx] ON [dbo].[Session]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Account_userId_idx] ON [dbo].[Account]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_hierarchy_name] ON [dbo].[Hierarchy]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_hierarchy_id] ON [dbo].[HierarchyLevel]([hierarchyId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_hierarchy_level_name] ON [dbo].[HierarchyLevel]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_hierarchy_id] ON [dbo].[Category]([hierarchyId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_hierarchy_level_id] ON [dbo].[Category]([hierarchyLevelId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_name] ON [dbo].[Category]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_service_category_id] ON [dbo].[Request]([requestCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_assignment_category_id] ON [dbo].[Request]([assignmentCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_client_id] ON [dbo].[Request]([clientId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_requirement_name] ON [dbo].[Requirement]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_requirement_type_name] ON [dbo].[RequirementType]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_requirement_id] ON [dbo].[CategoryRequirement]([requirementId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_category_id] ON [dbo].[CategoryRequirement]([categoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_compliance_request_id] ON [dbo].[RequirementComplianceTracking]([requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_compliance_requirement_id] ON [dbo].[RequirementComplianceTracking]([requirementId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Workspace_userId_idx] ON [dbo].[Workspace]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_userId_idx] ON [dbo].[Member]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_workspaceId_idx] ON [dbo].[Member]([workspaceId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_workspaceId_userId_idx] ON [dbo].[Member]([workspaceId], [userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Channel_workspaceId_idx] ON [dbo].[Channel]([workspaceId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Conversation_workspaceId_idx] ON [dbo].[Conversation]([workspaceId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_workspaceId_idx] ON [dbo].[Message]([workspaceId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_memberId_idx] ON [dbo].[Message]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_channelId_idx] ON [dbo].[Message]([channelId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_parentMessageId_idx] ON [dbo].[Message]([parentMessageId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_conversationId_idx] ON [dbo].[Message]([conversationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_channelId_parentMessageId_conversationId_idx] ON [dbo].[Message]([channelId], [parentMessageId], [conversationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reaction_workspaceId_idx] ON [dbo].[Reaction]([workspaceId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reaction_messageId_idx] ON [dbo].[Reaction]([messageId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reaction_memberId_idx] ON [dbo].[Reaction]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_CategoryToForm_B_index] ON [dbo].[_CategoryToForm]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_AreaToCategory_B_index] ON [dbo].[_AreaToCategory]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_coordinatorId_fkey] FOREIGN KEY ([coordinatorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenant] ADD CONSTRAINT [UserTenant_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenant] ADD CONSTRAINT [UserTenant_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserRole_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Role] ADD CONSTRAINT [Role_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Module] ADD CONSTRAINT [Module_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Feature] ADD CONSTRAINT [Feature_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Feature] ADD CONSTRAINT [Feature_moduleId_fkey] FOREIGN KEY ([moduleId]) REFERENCES [dbo].[Module]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RoleFeature] ADD CONSTRAINT [RoleFeature_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RoleFeature] ADD CONSTRAINT [RoleFeature_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RoleFeature] ADD CONSTRAINT [RoleFeature_featureId_fkey] FOREIGN KEY ([featureId]) REFERENCES [dbo].[Feature]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TwoFactorConfirmation] ADD CONSTRAINT [TwoFactorConfirmation_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Authenticator] ADD CONSTRAINT [Authenticator_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Hierarchy] ADD CONSTRAINT [Hierarchy_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HierarchyLevel] ADD CONSTRAINT [HierarchyLevel_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HierarchyLevel] ADD CONSTRAINT [HierarchyLevel_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[Hierarchy]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_hierarchyLevelId_fkey] FOREIGN KEY ([hierarchyLevelId]) REFERENCES [dbo].[HierarchyLevel]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[Hierarchy]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_statusId_fkey] FOREIGN KEY ([statusId]) REFERENCES [dbo].[StatusType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_requestCategoryId_fkey] FOREIGN KEY ([requestCategoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_assignmentCategoryId_fkey] FOREIGN KEY ([assignmentCategoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_formSubmissionId_fkey] FOREIGN KEY ([formSubmissionId]) REFERENCES [dbo].[FormSubmission]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_statusId_fkey] FOREIGN KEY ([statusId]) REFERENCES [dbo].[StatusType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[StatusType] ADD CONSTRAINT [StatusType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Area] ADD CONSTRAINT [Area_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Requirement] ADD CONSTRAINT [Requirement_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Requirement] ADD CONSTRAINT [Requirement_requirementTypeId_fkey] FOREIGN KEY ([requirementTypeId]) REFERENCES [dbo].[RequirementType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementType] ADD CONSTRAINT [RequirementType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CategoryRequirement] ADD CONSTRAINT [CategoryRequirement_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CategoryRequirement] ADD CONSTRAINT [CategoryRequirement_requirementId_fkey] FOREIGN KEY ([requirementId]) REFERENCES [dbo].[Requirement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CategoryRequirement] ADD CONSTRAINT [CategoryRequirement_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_requirementId_fkey] FOREIGN KEY ([requirementId]) REFERENCES [dbo].[Requirement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Form] ADD CONSTRAINT [Form_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_formId_fkey] FOREIGN KEY ([formId]) REFERENCES [dbo].[Form]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentAssignment] ADD CONSTRAINT [DocumentAssignment_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentAssignment] ADD CONSTRAINT [DocumentAssignment_requestAssignmentId_fkey] FOREIGN KEY ([requestAssignmentId]) REFERENCES [dbo].[RequestAssignment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_identificationTypeId_fkey] FOREIGN KEY ([identificationTypeId]) REFERENCES [dbo].[IdentificationType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Client] ADD CONSTRAINT [Client_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[IdentificationType] ADD CONSTRAINT [IdentificationType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Workspace] ADD CONSTRAINT [Workspace_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Workspace] ADD CONSTRAINT [Workspace_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_workspaceId_fkey] FOREIGN KEY ([workspaceId]) REFERENCES [dbo].[Workspace]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Channel] ADD CONSTRAINT [Channel_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Channel] ADD CONSTRAINT [Channel_workspaceId_fkey] FOREIGN KEY ([workspaceId]) REFERENCES [dbo].[Workspace]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_workspaceId_fkey] FOREIGN KEY ([workspaceId]) REFERENCES [dbo].[Workspace]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_memberOneId_fkey] FOREIGN KEY ([memberOneId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_memberTwoId_fkey] FOREIGN KEY ([memberTwoId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_workspaceId_fkey] FOREIGN KEY ([workspaceId]) REFERENCES [dbo].[Workspace]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_channelId_fkey] FOREIGN KEY ([channelId]) REFERENCES [dbo].[Channel]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_parentMessageId_fkey] FOREIGN KEY ([parentMessageId]) REFERENCES [dbo].[Message]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversation]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_workspaceId_fkey] FOREIGN KEY ([workspaceId]) REFERENCES [dbo].[Workspace]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_messageId_fkey] FOREIGN KEY ([messageId]) REFERENCES [dbo].[Message]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[_CategoryToForm] ADD CONSTRAINT [_CategoryToForm_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Category]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_CategoryToForm] ADD CONSTRAINT [_CategoryToForm_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Form]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AreaToCategory] ADD CONSTRAINT [_AreaToCategory_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Area]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AreaToCategory] ADD CONSTRAINT [_AreaToCategory_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Category]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

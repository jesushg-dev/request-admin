BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tenant] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000),
    [logo] NVARCHAR(1000),
    [metadata] NVARCHAR(1000),
    [websiteUrl] NVARCHAR(1000),
    [title] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [primaryColor] NVARCHAR(1000),
    [secondaryColor] NVARCHAR(1000),
    [contactEmail] NVARCHAR(1000),
    [contactPhone] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    CONSTRAINT [Tenant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Tenant_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[UserTenant] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserTenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [UserTenant_isActive_df] DEFAULT 1,
    [isTermAccepted] BIT NOT NULL CONSTRAINT [UserTenant_isTermAccepted_df] DEFAULT 0,
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [UserTenant_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [isTwoFactorRequired] BIT NOT NULL CONSTRAINT [UserTenant_isTwoFactorRequired_df] DEFAULT 0,
    [role] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [personId] NVARCHAR(1000),
    CONSTRAINT [UserTenant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserTenant_userId_tenantId_key] UNIQUE NONCLUSTERED ([userId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[InvitationTenant] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InvitationTenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [inviterId] NVARCHAR(1000) NOT NULL,
    [metadata] NVARCHAR(1000) NOT NULL CONSTRAINT [InvitationTenant_metadata_df] DEFAULT '',
    [teamId] NVARCHAR(1000),
    CONSTRAINT [InvitationTenant_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Subscription] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [planId] NVARCHAR(1000) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [isLifetime] BIT NOT NULL CONSTRAINT [Subscription_isLifetime_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Subscription_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Subscription_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Plan] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [price] FLOAT(53) NOT NULL,
    [durationInDays] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Plan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Plan_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PlanFeature] (
    [id] NVARCHAR(1000) NOT NULL,
    [planId] NVARCHAR(1000) NOT NULL,
    [featureId] NVARCHAR(1000) NOT NULL,
    [dailyLimit] INT,
    [totalLimit] INT,
    [resetInterval] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PlanFeature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PlanFeature_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UsageTracking] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [featureName] NVARCHAR(1000) NOT NULL,
    [usageCount] INT NOT NULL,
    [lastUsedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UsageTracking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UsageTracking_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [id] NVARCHAR(1000) NOT NULL,
    [subscriptionId] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [paymentDate] DATETIME2 NOT NULL,
    [paymentMethod] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Payment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[user] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [emailVerified] BIT NOT NULL,
    [image] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [twoFactorEnabled] BIT,
    [role] NVARCHAR(1000),
    [banned] BIT,
    [banReason] NVARCHAR(1000),
    [banExpires] DATETIME2,
    [phoneNumber] NVARCHAR(1000),
    [phoneNumberVerified] BIT,
    [isAnonymous] BIT,
    [isGlobalAdmin] BIT NOT NULL CONSTRAINT [user_isGlobalAdmin_df] DEFAULT 0,
    [username] NVARCHAR(1000),
    [displayUsername] NVARCHAR(1000),
    CONSTRAINT [user_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [user_email_username_key] UNIQUE NONCLUSTERED ([email],[username])
);

-- CreateTable
CREATE TABLE [dbo].[session] (
    [id] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [ipAddress] NVARCHAR(1000),
    [userAgent] NVARCHAR(1000),
    [userId] NVARCHAR(1000) NOT NULL,
    [activeTenantId] NVARCHAR(1000),
    [impersonatedBy] NVARCHAR(1000),
    CONSTRAINT [session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [session_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[account] (
    [id] NVARCHAR(1000) NOT NULL,
    [accountId] NVARCHAR(1000) NOT NULL,
    [providerId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [accessToken] NVARCHAR(1000),
    [refreshToken] NVARCHAR(1000),
    [idToken] NVARCHAR(1000),
    [accessTokenExpiresAt] DATETIME2,
    [refreshTokenExpiresAt] DATETIME2,
    [scope] NVARCHAR(1000),
    [password] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [account_accountId_key] UNIQUE NONCLUSTERED ([accountId])
);

-- CreateTable
CREATE TABLE [dbo].[verification] (
    [id] NVARCHAR(1000) NOT NULL,
    [identifier] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2,
    [updatedAt] DATETIME2,
    [metadata] NVARCHAR(1000),
    CONSTRAINT [verification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[twoFactor] (
    [id] NVARCHAR(1000) NOT NULL,
    [secret] NVARCHAR(1000) NOT NULL,
    [backupCodes] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [twoFactor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[jwks] (
    [id] NVARCHAR(1000) NOT NULL,
    [publicKey] NVARCHAR(1000) NOT NULL,
    [privateKey] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL,
    CONSTRAINT [jwks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ssoProvider] (
    [id] NVARCHAR(1000) NOT NULL,
    [issuer] NVARCHAR(1000) NOT NULL,
    [oidcConfig] NVARCHAR(1000),
    [samlConfig] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [providerId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000),
    [domain] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ssoProvider_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ssoProvider_providerId_key] UNIQUE NONCLUSTERED ([providerId])
);

-- CreateTable
CREATE TABLE [dbo].[oauthApplication] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [icon] NVARCHAR(1000),
    [metadata] NVARCHAR(1000),
    [clientId] NVARCHAR(1000),
    [clientSecret] NVARCHAR(1000),
    [redirectURLs] NVARCHAR(1000),
    [type] NVARCHAR(1000),
    [disabled] BIT,
    [userId] NVARCHAR(1000),
    [createdAt] DATETIME2,
    [updatedAt] DATETIME2,
    CONSTRAINT [oauthApplication_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [oauthApplication_clientId_key] UNIQUE NONCLUSTERED ([clientId])
);

-- CreateTable
CREATE TABLE [dbo].[oauthAccessToken] (
    [id] NVARCHAR(1000) NOT NULL,
    [accessToken] NVARCHAR(1000),
    [refreshToken] NVARCHAR(1000),
    [accessTokenExpiresAt] DATETIME2,
    [refreshTokenExpiresAt] DATETIME2,
    [clientId] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [scopes] NVARCHAR(1000),
    [createdAt] DATETIME2,
    [updatedAt] DATETIME2,
    CONSTRAINT [oauthAccessToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [oauthAccessToken_accessToken_key] UNIQUE NONCLUSTERED ([accessToken]),
    CONSTRAINT [oauthAccessToken_refreshToken_key] UNIQUE NONCLUSTERED ([refreshToken])
);

-- CreateTable
CREATE TABLE [dbo].[oauthConsent] (
    [id] NVARCHAR(1000) NOT NULL,
    [clientId] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [scopes] NVARCHAR(1000),
    [createdAt] DATETIME2,
    [updatedAt] DATETIME2,
    [consentGiven] BIT,
    CONSTRAINT [oauthConsent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[apikey] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [start] NVARCHAR(1000),
    [prefix] NVARCHAR(1000),
    [key] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [refillInterval] INT,
    [refillAmount] INT,
    [lastRefillAt] DATETIME2,
    [enabled] BIT,
    [rateLimitEnabled] BIT,
    [rateLimitTimeWindow] INT,
    [rateLimitMax] INT,
    [requestCount] INT,
    [remaining] INT,
    [lastRequest] DATETIME2,
    [expiresAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [permissions] NVARCHAR(1000),
    [metadata] NVARCHAR(1000),
    CONSTRAINT [apikey_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[passkey] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [publicKey] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [credentialID] NVARCHAR(1000) NOT NULL,
    [counter] INT NOT NULL,
    [deviceType] NVARCHAR(1000) NOT NULL,
    [backedUp] BIT NOT NULL,
    [transports] NVARCHAR(1000),
    [createdAt] DATETIME2,
    CONSTRAINT [passkey_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Request] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Request_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [slug] INT NOT NULL IDENTITY(1,1),
    [issueSubject] VARCHAR(255) NOT NULL,
    [description] VARCHAR(5000),
    [isDraft] BIT NOT NULL CONSTRAINT [Request_isDraft_df] DEFAULT 1,
    [closedAt] DATETIME2,
    [closedBy] VARCHAR(50),
    [closedComment] VARCHAR(500),
    [dataroomId] NVARCHAR(1000),
    [satisfactionSurveyId] NVARCHAR(1000),
    [channelId] NVARCHAR(1000),
    [executionModelInstanceId] NVARCHAR(1000),
    CONSTRAINT [Request_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestAssignment] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestAssignment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [comment] VARCHAR(255),
    [assignmentDate] DATETIME2 NOT NULL CONSTRAINT [RequestAssignment_assignmentDate_df] DEFAULT CURRENT_TIMESTAMP,
    [unAssignmentDate] DATETIME2,
    [requestId] NVARCHAR(1000) NOT NULL,
    [slaStart] DATETIME2,
    [slaDeadline] DATETIME2,
    [slaEnd] DATETIME2,
    [areaId] NVARCHAR(1000) NOT NULL,
    [statusId] NVARCHAR(1000) NOT NULL,
    [typeId] NVARCHAR(1000) NOT NULL,
    [priorityId] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [RequestAssignment_isActive_df] DEFAULT 1,
    [requestCategoryId] NVARCHAR(1000) NOT NULL,
    [assignmentCategoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequestAssignment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AssignedUser] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignedUser_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [requestAssignmentId] NVARCHAR(1000) NOT NULL,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [role] VARCHAR(150) NOT NULL,
    [unAssignmentDate] DATETIME2,
    [isCoordinator] BIT NOT NULL CONSTRAINT [AssignedUser_isCoordinator_df] DEFAULT 0,
    CONSTRAINT [AssignedUser_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestPriorityType] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestPriorityType_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestPriorityType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [primaryColor] VARCHAR(10) NOT NULL,
    [level] INT NOT NULL,
    [isDefault] BIT NOT NULL CONSTRAINT [RequestPriorityType_isDefault_df] DEFAULT 0,
    CONSTRAINT [RequestPriorityType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestPriorityType_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AssignmentType] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [AssignmentType_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignmentType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [systemName] VARCHAR(100) NOT NULL,
    CONSTRAINT [AssignmentType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssignmentType_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestWorkflow] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestWorkflow_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestWorkflow_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [isDefault] BIT NOT NULL CONSTRAINT [RequestWorkflow_isDefault_df] DEFAULT 0,
    [requireComments] BIT NOT NULL CONSTRAINT [RequestWorkflow_requireComments_df] DEFAULT 0,
    [notifyChanges] BIT NOT NULL CONSTRAINT [RequestWorkflow_notifyChanges_df] DEFAULT 0,
    CONSTRAINT [RequestWorkflow_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestWorkflowStatus] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestWorkflowStatus_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestWorkflowStatus_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [color] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [positionX] FLOAT(53) NOT NULL,
    [positionY] FLOAT(53) NOT NULL,
    [workflowId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequestWorkflowStatus_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestWorkflowTransition] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestWorkflowTransition_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestWorkflowTransition_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [priority] INT NOT NULL CONSTRAINT [RequestWorkflowTransition_priority_df] DEFAULT 0,
    [maxDuration] INT,
    [notifyAfter] INT,
    [requiresApproval] BIT NOT NULL CONSTRAINT [RequestWorkflowTransition_requiresApproval_df] DEFAULT 0,
    [requiresJustification] BIT NOT NULL CONSTRAINT [RequestWorkflowTransition_requiresJustification_df] DEFAULT 0,
    [workflowId] NVARCHAR(1000) NOT NULL,
    [fromStatusId] NVARCHAR(1000) NOT NULL,
    [toStatusId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequestWorkflowTransition_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestWorkflowTransition_tenantId_fromStatusId_toStatusId_key] UNIQUE NONCLUSTERED ([tenantId],[fromStatusId],[toStatusId])
);

-- CreateTable
CREATE TABLE [dbo].[RequirementComplianceTracking] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequirementComplianceTracking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [requirementId] NVARCHAR(1000) NOT NULL,
    [isFulfilled] BIT NOT NULL CONSTRAINT [RequirementComplianceTracking_isFulfilled_df] DEFAULT 0,
    [isArchived] BIT NOT NULL CONSTRAINT [RequirementComplianceTracking_isArchived_df] DEFAULT 0,
    CONSTRAINT [RequirementComplianceTracking_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequirementComplianceTracking_requestId_requirementId_tenantId_key] UNIQUE NONCLUSTERED ([requestId],[requirementId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[CustomerSatisfactionSurvey] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CustomerSatisfactionSurvey_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [rating] INT NOT NULL,
    [feedback] VARCHAR(1000),
    [submittedAt] DATETIME2 NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [CustomerSatisfactionSurvey_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CustomerSatisfactionSurvey_requestId_key] UNIQUE NONCLUSTERED ([requestId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestChangeLog] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestChangeLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [fieldName] VARCHAR(100) NOT NULL,
    [oldValue] VARCHAR(500),
    [newValue] VARCHAR(500),
    [metadata] TEXT,
    CONSTRAINT [RequestChangeLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Document] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Document_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(155) NOT NULL,
    [description] NVARCHAR(1000),
    [file] NVARCHAR(1000) NOT NULL,
    [originalFile] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL,
    [contentType] NVARCHAR(1000) NOT NULL,
    [storageType] NVARCHAR(1000) NOT NULL CONSTRAINT [Document_storageType_df] DEFAULT 'UPLOADTHING',
    [numPages] INT,
    [expirationDate] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Document_status_df] DEFAULT 'ACTIVE',
    [assistantEnabled] BIT NOT NULL CONSTRAINT [Document_assistantEnabled_df] DEFAULT 0,
    [advancedExcelEnabled] BIT NOT NULL CONSTRAINT [Document_advancedExcelEnabled_df] DEFAULT 0,
    [downloadOnly] BIT NOT NULL CONSTRAINT [Document_downloadOnly_df] DEFAULT 0,
    [ownerId] NVARCHAR(1000),
    [folderId] NVARCHAR(1000),
    [dataroomId] NVARCHAR(1000),
    [orderIndex] INT,
    [requirementComplianceTrackingId] NVARCHAR(1000),
    CONSTRAINT [Document_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentVersion] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentVersion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [versionNumber] INT NOT NULL CONSTRAINT [DocumentVersion_versionNumber_df] DEFAULT 1,
    [documentId] NVARCHAR(1000) NOT NULL,
    [file] NVARCHAR(1000) NOT NULL,
    [originalFile] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL,
    [contentType] NVARCHAR(1000) NOT NULL,
    [fileSize] INT,
    [storageType] NVARCHAR(1000) NOT NULL CONSTRAINT [DocumentVersion_storageType_df] DEFAULT 'VERCEL_BLOB',
    [numPages] INT,
    [isPrimary] BIT NOT NULL CONSTRAINT [DocumentVersion_isPrimary_df] DEFAULT 0,
    [isVertical] BIT NOT NULL CONSTRAINT [DocumentVersion_isVertical_df] DEFAULT 0,
    [fileId] NVARCHAR(1000),
    [hasPages] BIT NOT NULL CONSTRAINT [DocumentVersion_hasPages_df] DEFAULT 0,
    [length] INT,
    CONSTRAINT [DocumentVersion_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DocumentVersion_versionNumber_documentId_key] UNIQUE NONCLUSTERED ([versionNumber],[documentId])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentPage] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentPage_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [pageNumber] INT NOT NULL,
    [embeddedLinks] TEXT NOT NULL,
    [pageLinks] TEXT NOT NULL,
    [metadata] TEXT NOT NULL,
    [file] NVARCHAR(1000) NOT NULL,
    [storageType] NVARCHAR(1000) NOT NULL CONSTRAINT [DocumentPage_storageType_df] DEFAULT 'VERCEL_BLOB',
    CONSTRAINT [DocumentPage_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DocumentPage_pageNumber_versionId_key] UNIQUE NONCLUSTERED ([pageNumber],[versionId])
);

-- CreateTable
CREATE TABLE [dbo].[Link] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Link_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000),
    [dataroomId] NVARCHAR(1000),
    [linkType] NVARCHAR(1000) NOT NULL CONSTRAINT [Link_linkType_df] DEFAULT 'DOCUMENT_LINK',
    [url] NVARCHAR(1000),
    [name] NVARCHAR(1000),
    [slug] NVARCHAR(1000),
    [expiresAt] DATETIME2,
    [password] NVARCHAR(1000),
    [allowList] TEXT NOT NULL,
    [denyList] TEXT NOT NULL,
    [emailProtected] BIT NOT NULL CONSTRAINT [Link_emailProtected_df] DEFAULT 1,
    [emailAuthenticated] BIT NOT NULL CONSTRAINT [Link_emailAuthenticated_df] DEFAULT 0,
    [allowDownload] BIT CONSTRAINT [Link_allowDownload_df] DEFAULT 0,
    [isArchived] BIT NOT NULL CONSTRAINT [Link_isArchived_df] DEFAULT 0,
    [enableNotification] BIT CONSTRAINT [Link_enableNotification_df] DEFAULT 1,
    [enableFeedback] BIT CONSTRAINT [Link_enableFeedback_df] DEFAULT 0,
    [enableQuestion] BIT CONSTRAINT [Link_enableQuestion_df] DEFAULT 0,
    [enableScreenshotProtection] BIT CONSTRAINT [Link_enableScreenshotProtection_df] DEFAULT 0,
    [enableAgreement] BIT CONSTRAINT [Link_enableAgreement_df] DEFAULT 0,
    [agreementId] NVARCHAR(1000),
    [domainId] NVARCHAR(1000),
    [domainSlug] NVARCHAR(1000),
    [metaTitle] NVARCHAR(1000),
    [metaDescription] NVARCHAR(1000),
    [metaImage] NVARCHAR(1000),
    [metaFavicon] NVARCHAR(1000),
    [enableCustomMetatag] BIT CONSTRAINT [Link_enableCustomMetatag_df] DEFAULT 0,
    [audienceType] NVARCHAR(1000) NOT NULL CONSTRAINT [Link_audienceType_df] DEFAULT 'GENERAL',
    [groupId] NVARCHAR(1000),
    [enableWatermark] BIT CONSTRAINT [Link_enableWatermark_df] DEFAULT 0,
    [watermarkConfig] TEXT NOT NULL,
    CONSTRAINT [Link_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Link_url_key] UNIQUE NONCLUSTERED ([url]),
    CONSTRAINT [Link_domainSlug_slug_key] UNIQUE NONCLUSTERED ([domainSlug],[slug])
);

-- CreateTable
CREATE TABLE [dbo].[LinkPreset] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LinkPreset_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [enableCustomMetaTag] BIT CONSTRAINT [LinkPreset_enableCustomMetaTag_df] DEFAULT 0,
    [metaTitle] NVARCHAR(1000),
    [metaDescription] NVARCHAR(1000),
    [metaImage] NVARCHAR(1000),
    [metaFavicon] NVARCHAR(1000),
    CONSTRAINT [LinkPreset_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Domain] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Domain_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [verified] BIT NOT NULL CONSTRAINT [Domain_verified_df] DEFAULT 0,
    [isDefault] BIT NOT NULL CONSTRAINT [Domain_isDefault_df] DEFAULT 0,
    [lastChecked] DATETIME2 NOT NULL CONSTRAINT [Domain_lastChecked_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Domain_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Domain_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentView] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentView_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [linkId] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000),
    [dataroomId] NVARCHAR(1000),
    [dataroomViewId] NVARCHAR(1000),
    [viewerEmail] NVARCHAR(1000),
    [viewerName] NVARCHAR(1000),
    [verified] BIT NOT NULL CONSTRAINT [DocumentView_verified_df] DEFAULT 0,
    [viewedAt] DATETIME2 NOT NULL CONSTRAINT [DocumentView_viewedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [downloadedAt] DATETIME2,
    [viewType] NVARCHAR(1000) NOT NULL CONSTRAINT [DocumentView_viewType_df] DEFAULT 'DOCUMENT_VIEW',
    [viewerId] NVARCHAR(1000),
    [groupId] NVARCHAR(1000),
    [isArchived] BIT NOT NULL CONSTRAINT [DocumentView_isArchived_df] DEFAULT 0,
    CONSTRAINT [DocumentView_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Viewer] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Viewer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [verified] BIT NOT NULL CONSTRAINT [Viewer_verified_df] DEFAULT 0,
    [invitedAt] DATETIME2,
    [notificationPreferences] TEXT NOT NULL,
    [dataroomId] NVARCHAR(1000),
    CONSTRAINT [Viewer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Viewer_tenantId_email_key] UNIQUE NONCLUSTERED ([tenantId],[email])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentReaction] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentReaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [viewId] NVARCHAR(1000) NOT NULL,
    [pageNumber] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DocumentReaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[InvitationDocument] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InvitationDocument_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [InvitationDocument_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [InvitationDocument_email_tenantId_key] UNIQUE NONCLUSTERED ([email],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[SentEmail] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SentEmail_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [recipient] NVARCHAR(1000) NOT NULL,
    [marketing] BIT NOT NULL CONSTRAINT [SentEmail_marketing_df] DEFAULT 0,
    [domainSlug] NVARCHAR(1000),
    CONSTRAINT [SentEmail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentConversation] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentConversation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [threadId] NVARCHAR(1000) NOT NULL,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DocumentConversation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DocumentConversation_threadId_key] UNIQUE NONCLUSTERED ([threadId]),
    CONSTRAINT [DocumentConversation_userTenantId_documentId_key] UNIQUE NONCLUSTERED ([userTenantId],[documentId]),
    CONSTRAINT [DocumentConversation_threadId_documentId_key] UNIQUE NONCLUSTERED ([threadId],[documentId])
);

-- CreateTable
CREATE TABLE [dbo].[Dataroom] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Dataroom_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Dataroom_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [pId] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000),
    CONSTRAINT [Dataroom_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Dataroom_pId_key] UNIQUE NONCLUSTERED ([pId]),
    CONSTRAINT [Dataroom_requestId_key] UNIQUE NONCLUSTERED ([requestId])
);

-- CreateTable
CREATE TABLE [dbo].[DataroomFolder] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DataroomFolder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [path] NVARCHAR(1000) NOT NULL,
    [parentId] NVARCHAR(1000),
    [dataroomId] NVARCHAR(1000) NOT NULL,
    [orderIndex] INT,
    CONSTRAINT [DataroomFolder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DataroomFolder_dataroomId_path_key] UNIQUE NONCLUSTERED ([dataroomId],[path])
);

-- CreateTable
CREATE TABLE [dbo].[DataroomBrand] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DataroomBrand_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [logo] NVARCHAR(1000),
    [banner] NVARCHAR(1000),
    [brandColor] NVARCHAR(1000),
    [accentColor] NVARCHAR(1000),
    [dataroomId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DataroomBrand_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DataroomBrand_dataroomId_key] UNIQUE NONCLUSTERED ([dataroomId])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentFeedback] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentFeedback_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [linkId] NVARCHAR(1000) NOT NULL,
    [data] TEXT NOT NULL,
    CONSTRAINT [DocumentFeedback_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DocumentFeedback_linkId_key] UNIQUE NONCLUSTERED ([linkId])
);

-- CreateTable
CREATE TABLE [dbo].[FeedbackResponse] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FeedbackResponse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [feedbackId] NVARCHAR(1000) NOT NULL,
    [data] TEXT NOT NULL,
    [viewId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [FeedbackResponse_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FeedbackResponse_viewId_key] UNIQUE NONCLUSTERED ([viewId])
);

-- CreateTable
CREATE TABLE [dbo].[Agreement] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Agreement_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Agreement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [requireName] BIT NOT NULL CONSTRAINT [Agreement_requireName_df] DEFAULT 1,
    CONSTRAINT [Agreement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AgreementResponse] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AgreementResponse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [agreementId] NVARCHAR(1000) NOT NULL,
    [viewId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AgreementResponse_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AgreementResponse_viewId_key] UNIQUE NONCLUSTERED ([viewId])
);

-- CreateTable
CREATE TABLE [dbo].[DataroomViewerGroup] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DataroomViewerGroup_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [domains] TEXT NOT NULL,
    [allowAll] BIT NOT NULL CONSTRAINT [DataroomViewerGroup_allowAll_df] DEFAULT 0,
    [dataroomId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DataroomViewerGroup_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DataroomViewerGroupMembership] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DataroomViewerGroupMembership_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [viewerId] NVARCHAR(1000) NOT NULL,
    [groupId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DataroomViewerGroupMembership_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DataroomViewerGroupMembership_viewerId_groupId_key] UNIQUE NONCLUSTERED ([viewerId],[groupId])
);

-- CreateTable
CREATE TABLE [dbo].[DataroomViewerGroupAccessControls] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DataroomViewerGroupAccessControls_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [groupId] NVARCHAR(1000) NOT NULL,
    [itemId] NVARCHAR(1000) NOT NULL,
    [itemType] NVARCHAR(1000) NOT NULL,
    [canView] BIT NOT NULL CONSTRAINT [DataroomViewerGroupAccessControls_canView_df] DEFAULT 1,
    [canDownload] BIT NOT NULL CONSTRAINT [DataroomViewerGroupAccessControls_canDownload_df] DEFAULT 0,
    CONSTRAINT [DataroomViewerGroupAccessControls_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DataroomViewerGroupAccessControls_groupId_itemId_key] UNIQUE NONCLUSTERED ([groupId],[itemId])
);

-- CreateTable
CREATE TABLE [dbo].[IncomingWebhook] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IncomingWebhook_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [externalId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [secret] NVARCHAR(1000),
    [source] NVARCHAR(1000),
    [actions] NVARCHAR(1000),
    [consecutiveFailures] INT NOT NULL CONSTRAINT [IncomingWebhook_consecutiveFailures_df] DEFAULT 0,
    [lastFailedAt] DATETIME2,
    [disabledAt] DATETIME2,
    CONSTRAINT [IncomingWebhook_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IncomingWebhook_externalId_key] UNIQUE NONCLUSTERED ([externalId])
);

-- CreateTable
CREATE TABLE [dbo].[RestrictedToken] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RestrictedToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hashedKey] NVARCHAR(1000) NOT NULL,
    [partialKey] NVARCHAR(1000) NOT NULL,
    [scopes] NVARCHAR(1000),
    [expires] DATETIME2,
    [lastUsed] DATETIME2,
    [rateLimit] INT NOT NULL CONSTRAINT [RestrictedToken_rateLimit_df] DEFAULT 60,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RestrictedToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RestrictedToken_hashedKey_key] UNIQUE NONCLUSTERED ([hashedKey])
);

-- CreateTable
CREATE TABLE [dbo].[Webhook] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Webhook_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [pId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [secret] NVARCHAR(1000) NOT NULL,
    [triggers] TEXT NOT NULL,
    CONSTRAINT [Webhook_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Webhook_pId_key] UNIQUE NONCLUSTERED ([pId])
);

-- CreateTable
CREATE TABLE [dbo].[CustomField] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CustomField_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [identifier] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [placeholder] NVARCHAR(1000),
    [required] BIT NOT NULL CONSTRAINT [CustomField_required_df] DEFAULT 0,
    [disabled] BIT NOT NULL CONSTRAINT [CustomField_disabled_df] DEFAULT 0,
    [linkId] NVARCHAR(1000) NOT NULL,
    [orderIndex] INT NOT NULL CONSTRAINT [CustomField_orderIndex_df] DEFAULT 0,
    CONSTRAINT [CustomField_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CustomFieldResponse] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CustomFieldResponse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [data] TEXT NOT NULL,
    [viewId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [CustomFieldResponse_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CustomFieldResponse_viewId_key] UNIQUE NONCLUSTERED ([viewId])
);

-- CreateTable
CREATE TABLE [dbo].[Area] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Area_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Area_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Area_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Area_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[UserTenantArea] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserTenantArea_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [UserTenantArea_isActive_df] DEFAULT 1,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [areaId] NVARCHAR(1000) NOT NULL,
    [roleId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [UserTenantArea_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserTenantArea_userTenantId_areaId_tenantId_key] UNIQUE NONCLUSTERED ([userTenantId],[areaId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AreaRole] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [AreaRole_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AreaRole_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [areaId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AreaRole_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AreaRole_name_areaId_tenantId_key] UNIQUE NONCLUSTERED ([name],[areaId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AreaRoleFeature] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AreaRoleFeature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [AreaRoleFeature_isActive_df] DEFAULT 1,
    [areaRoleId] NVARCHAR(1000) NOT NULL,
    [featureId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AreaRoleFeature_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AreaRoleFeature_areaRoleId_featureId_tenantId_key] UNIQUE NONCLUSTERED ([areaRoleId],[featureId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestHierarchy] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestHierarchy_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestHierarchy_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequestHierarchy_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestHierarchy_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestHierarchyLevel] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestHierarchyLevel_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestHierarchyLevel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [hierarchyId] NVARCHAR(1000) NOT NULL,
    [position] INT NOT NULL,
    CONSTRAINT [RequestHierarchyLevel_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestHierarchyLevel_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId]),
    CONSTRAINT [RequestHierarchyLevel_position_hierarchyId_key] UNIQUE NONCLUSTERED ([position],[hierarchyId]),
    CONSTRAINT [RequestHierarchyLevel_hierarchyId_position_key] UNIQUE NONCLUSTERED ([hierarchyId],[position])
);

-- CreateTable
CREATE TABLE [dbo].[RequestCategory] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequestCategory_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestCategory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [isEligibleForNewClients] BIT NOT NULL CONSTRAINT [RequestCategory_isEligibleForNewClients_df] DEFAULT 1,
    [hierarchyLevelId] NVARCHAR(1000) NOT NULL,
    [hierarchyId] NVARCHAR(1000) NOT NULL,
    [parentCategoryId] NVARCHAR(1000),
    [requestWorkflowId] NVARCHAR(1000),
    CONSTRAINT [RequestCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestCategory_name_hierarchyLevelId_parentCategoryId_tenantId_key] UNIQUE NONCLUSTERED ([name],[hierarchyLevelId],[parentCategoryId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestCategoryForm] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestCategoryForm_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [RequestCategoryForm_isActive_df] DEFAULT 1,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [formId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequestCategoryForm_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestCategoryForm_categoryId_formId_tenantId_key] UNIQUE NONCLUSTERED ([categoryId],[formId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[SLA] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SLA_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [resolutionTime] INT NOT NULL,
    [escalationTime] INT,
    [requestCategoryId] NVARCHAR(1000),
    CONSTRAINT [SLA_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [SLA_requestCategoryId_key] UNIQUE NONCLUSTERED ([requestCategoryId])
);

-- CreateTable
CREATE TABLE [dbo].[SLAChangeLog] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SLAChangeLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [slaId] NVARCHAR(1000) NOT NULL,
    [oldResolutionTime] INT,
    [newResolutionTime] INT NOT NULL,
    CONSTRAINT [SLAChangeLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[GuideDocument] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [GuideDocument_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [GuideDocument_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [fileType] NVARCHAR(1000) NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [version] NVARCHAR(1000) NOT NULL,
    [requestCategoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [GuideDocument_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [GuideDocument_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Requirement] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Requirement_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Requirement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [isRequiredOnlyOnce] BIT NOT NULL CONSTRAINT [Requirement_isRequiredOnlyOnce_df] DEFAULT 0,
    [requirementTypeId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Requirement_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Requirement_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequestCategoryRequirement] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestCategoryRequirement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [requirementId] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [RequestCategoryRequirement_isActive_df] DEFAULT 1,
    CONSTRAINT [RequestCategoryRequirement_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequestCategoryRequirement_categoryId_requirementId_tenantId_key] UNIQUE NONCLUSTERED ([categoryId],[requirementId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RequirementType] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [RequirementType_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequirementType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RequirementType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RequirementType_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AssignmentHierarchy] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [AssignmentHierarchy_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignmentHierarchy_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [areaId] NVARCHAR(1000),
    CONSTRAINT [AssignmentHierarchy_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssignmentHierarchy_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AssignmentHierarchyLevel] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [AssignmentHierarchyLevel_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignmentHierarchyLevel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [hierarchyId] NVARCHAR(1000) NOT NULL,
    [position] INT NOT NULL,
    CONSTRAINT [AssignmentHierarchyLevel_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssignmentHierarchyLevel_position_hierarchyId_key] UNIQUE NONCLUSTERED ([position],[hierarchyId]),
    CONSTRAINT [AssignmentHierarchyLevel_hierarchyId_position_key] UNIQUE NONCLUSTERED ([hierarchyId],[position]),
    CONSTRAINT [AssignmentHierarchyLevel_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AssignmentCategory] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [AssignmentCategory_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignmentCategory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [parentCategoryId] NVARCHAR(1000),
    [hierarchyLevelId] NVARCHAR(1000) NOT NULL,
    [hierarchyId] NVARCHAR(1000) NOT NULL,
    [areaId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AssignmentCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssignmentCategory_name_hierarchyLevelId_areaId_parentCategoryId_tenantId_key] UNIQUE NONCLUSTERED ([name],[hierarchyLevelId],[areaId],[parentCategoryId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[AssignmentCategoryForm] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssignmentCategoryForm_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [AssignmentCategoryForm_isActive_df] DEFAULT 1,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [formId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AssignmentCategoryForm_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssignmentCategoryForm_categoryId_formId_tenantId_key] UNIQUE NONCLUSTERED ([categoryId],[formId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Form] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Form_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Form_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL CONSTRAINT [Form_content_df] DEFAULT '[]',
    [published] BIT NOT NULL CONSTRAINT [Form_published_df] DEFAULT 0,
    [isPublic] BIT NOT NULL CONSTRAINT [Form_isPublic_df] DEFAULT 0,
    [visits] INT NOT NULL CONSTRAINT [Form_visits_df] DEFAULT 0,
    [submissions] INT NOT NULL CONSTRAINT [Form_submissions_df] DEFAULT 0,
    [shareURL] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Form_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Form_shareURL_key] UNIQUE NONCLUSTERED ([shareURL]),
    CONSTRAINT [Form_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[FormSubmission] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormSubmission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [formId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000),
    CONSTRAINT [FormSubmission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FormSubmission_formId_tenantId_requestId_key] UNIQUE NONCLUSTERED ([formId],[tenantId],[requestId])
);

-- CreateTable
CREATE TABLE [dbo].[FormSubmissionKey] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [submissionId] NVARCHAR(1000) NOT NULL,
    [key] VARCHAR(255) NOT NULL,
    [value] VARCHAR(255) NOT NULL,
    CONSTRAINT [FormSubmissionKey_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MenuItem] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [icon] NVARCHAR(1000),
    [position] INT NOT NULL CONSTRAINT [MenuItem_position_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [MenuItem_isActive_df] DEFAULT 0,
    [pathname] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [parentId] NVARCHAR(1000),
    CONSTRAINT [MenuItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionFlowDefinition] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionFlowDefinition_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL CONSTRAINT [ExecutionFlowDefinition_version_df] DEFAULT 1,
    [isActive] BIT NOT NULL CONSTRAINT [ExecutionFlowDefinition_isActive_df] DEFAULT 1,
    [requestCategoryId] NVARCHAR(1000),
    [viewportX] FLOAT(53),
    [viewportY] FLOAT(53),
    [viewportZoom] FLOAT(53),
    CONSTRAINT [ExecutionFlowDefinition_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ExecutionFlowDefinition_requestCategoryId_key] UNIQUE NONCLUSTERED ([requestCategoryId]),
    CONSTRAINT [ExecutionFlowDefinition_id_version_key] UNIQUE NONCLUSTERED ([id],[version])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionNodeDefinition] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionNodeDefinition_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [positionX] FLOAT(53) NOT NULL,
    [positionY] FLOAT(53) NOT NULL,
    [config] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExecutionNodeDefinition_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionEdgeDefinition] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionEdgeDefinition_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [sourceId] NVARCHAR(1000) NOT NULL,
    [targetId] NVARCHAR(1000) NOT NULL,
    [sourceHandle] NVARCHAR(1000),
    [style] NVARCHAR(1000),
    [markerEnd] NVARCHAR(1000),
    CONSTRAINT [ExecutionEdgeDefinition_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionNodeGuide] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionNodeGuide_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [applicationScope] NVARCHAR(1000) NOT NULL CONSTRAINT [ExecutionNodeGuide_applicationScope_df] DEFAULT 'full',
    [customInstructions] NVARCHAR(1000),
    [order] INT NOT NULL CONSTRAINT [ExecutionNodeGuide_order_df] DEFAULT 1,
    [guideId] NVARCHAR(1000) NOT NULL,
    [nodeId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExecutionNodeGuide_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ExecutionNodeGuide_guideId_nodeId_key] UNIQUE NONCLUSTERED ([guideId],[nodeId])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionModelInstance] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionModelInstance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExecutionModelInstance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ExecutionModelInstance_requestId_key] UNIQUE NONCLUSTERED ([requestId]),
    CONSTRAINT [ExecutionModelInstance_tenantId_flowId_requestId_key] UNIQUE NONCLUSTERED ([tenantId],[flowId],[requestId])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionModelLog] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionModelLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [executionId] NVARCHAR(1000) NOT NULL,
    [nodeId] NVARCHAR(1000) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [ExecutionModelLog_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [eventType] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(1000) NOT NULL,
    [outcome] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExecutionModelLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExecutionModelHistory] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExecutionModelHistory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [executionId] NVARCHAR(1000) NOT NULL,
    [previousFlowId] NVARCHAR(1000),
    [newFlowId] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExecutionModelHistory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserTenantRole] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserTenantRole_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [UserTenantRole_isActive_df] DEFAULT 1,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [roleId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [UserTenantRole_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Role_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Module] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Module_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Module_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Module_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Module_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Feature] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [Feature_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Feature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [key] VARCHAR(100) NOT NULL,
    [scope] NVARCHAR(1000) NOT NULL CONSTRAINT [Feature_scope_df] DEFAULT 'global',
    [moduleId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Feature_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Feature_key_key] UNIQUE NONCLUSTERED ([key]),
    CONSTRAINT [Feature_key_tenantId_key] UNIQUE NONCLUSTERED ([key],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[RoleFeature] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoleFeature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [RoleFeature_isActive_df] DEFAULT 1,
    [roleId] NVARCHAR(1000) NOT NULL,
    [featureId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RoleFeature_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NotificationRecipient] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [notificationId] NVARCHAR(1000) NOT NULL,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [readAt] DATETIME2,
    CONSTRAINT [NotificationRecipient_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [NotificationRecipient_notificationId_userTenantId_key] UNIQUE NONCLUSTERED ([notificationId],[userTenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Channel] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Channel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000),
    CONSTRAINT [Channel_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Channel_requestId_key] UNIQUE NONCLUSTERED ([requestId]),
    CONSTRAINT [Channel_requestId_tenantId_key] UNIQUE NONCLUSTERED ([requestId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Conversation] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [userTenantOneId] NVARCHAR(1000) NOT NULL,
    [userTenantTwoId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Conversation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Conversation_userTenantOneId_userTenantTwoId_key] UNIQUE NONCLUSTERED ([userTenantOneId],[userTenantTwoId])
);

-- CreateTable
CREATE TABLE [dbo].[Message] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Message_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [metadata] NVARCHAR(1000) NOT NULL CONSTRAINT [Message_metadata_df] DEFAULT '{}',
    [imageId] NVARCHAR(1000),
    [userTenantId] NVARCHAR(1000) NOT NULL,
    [channelId] NVARCHAR(1000),
    [parentMessageId] NVARCHAR(1000),
    [conversationId] NVARCHAR(1000),
    CONSTRAINT [Message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Reaction] (
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [messageId] NVARCHAR(1000) NOT NULL,
    [userTenantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Reaction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Reaction_messageId_userTenantId_key] UNIQUE NONCLUSTERED ([messageId],[userTenantId])
);

-- CreateTable
CREATE TABLE [dbo].[Person] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Person_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [firstName] VARCHAR(100) NOT NULL,
    [lastName] VARCHAR(100) NOT NULL,
    [phone] VARCHAR(50),
    [identificationNumber] VARCHAR(110) NOT NULL CONSTRAINT [Person_identificationNumber_df] DEFAULT '',
    [image] NVARCHAR(1000),
    [identificationTypeId] NVARCHAR(1000),
    [userTenantId] NVARCHAR(1000),
    CONSTRAINT [Person_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Person_userTenantId_key] UNIQUE NONCLUSTERED ([userTenantId]),
    CONSTRAINT [Person_userTenantId_tenantId_key] UNIQUE NONCLUSTERED ([userTenantId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[IdentificationType] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [IdentificationType_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IdentificationType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [regex] VARCHAR(500),
    CONSTRAINT [IdentificationType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IdentificationType_name_tenantId_key] UNIQUE NONCLUSTERED ([name],[tenantId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserTenant_userId_idx] ON [dbo].[UserTenant]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserTenant_tenantId_idx] ON [dbo].[UserTenant]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_closed_at] ON [dbo].[Request]([closedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_closed_by] ON [dbo].[Request]([closedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_closed_comment] ON [dbo].[Request]([closedComment]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_issue_subject] ON [dbo].[Request]([issueSubject]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_type_id] ON [dbo].[RequestAssignment]([typeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_request_id] ON [dbo].[RequestAssignment]([requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_status_id] ON [dbo].[RequestAssignment]([statusId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_sla_start] ON [dbo].[RequestAssignment]([slaStart]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_sla_deadline] ON [dbo].[RequestAssignment]([slaDeadline]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_sla_end] ON [dbo].[RequestAssignment]([slaEnd]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_request_category_id] ON [dbo].[RequestAssignment]([requestCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_assignment_category_id] ON [dbo].[RequestAssignment]([assignmentCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_status_type] ON [dbo].[RequestWorkflowStatus]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_transition_source] ON [dbo].[RequestWorkflowTransition]([fromStatusId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_transition_target] ON [dbo].[RequestWorkflowTransition]([toStatusId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_compliance_request_id] ON [dbo].[RequirementComplianceTracking]([requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_compliance_requirement_id] ON [dbo].[RequirementComplianceTracking]([requirementId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_survey_request_id] ON [dbo].[CustomerSatisfactionSurvey]([requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_change_log_request_id] ON [dbo].[RequestChangeLog]([requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_change_log_changed_by] ON [dbo].[RequestChangeLog]([updatedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Document_ownerId_idx] ON [dbo].[Document]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Document_folderId_idx] ON [dbo].[Document]([folderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentVersion_documentId_idx] ON [dbo].[DocumentVersion]([documentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentPage_versionId_idx] ON [dbo].[DocumentPage]([versionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Link_documentId_idx] ON [dbo].[Link]([documentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Link_tenantId_idx] ON [dbo].[Link]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkPreset_tenantId_idx] ON [dbo].[LinkPreset]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Domain_tenantId_idx] ON [dbo].[Domain]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentView_linkId_idx] ON [dbo].[DocumentView]([linkId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentView_documentId_idx] ON [dbo].[DocumentView]([documentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentView_dataroomId_idx] ON [dbo].[DocumentView]([dataroomId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentView_dataroomViewId_idx] ON [dbo].[DocumentView]([dataroomViewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentView_tenantId_idx] ON [dbo].[DocumentView]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Viewer_tenantId_idx] ON [dbo].[Viewer]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Viewer_dataroomId_idx] ON [dbo].[Viewer]([dataroomId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentReaction_viewId_idx] ON [dbo].[DocumentReaction]([viewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SentEmail_tenantId_idx] ON [dbo].[SentEmail]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentConversation_threadId_idx] ON [dbo].[DocumentConversation]([threadId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Dataroom_tenantId_idx] ON [dbo].[Dataroom]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomFolder_parentId_idx] ON [dbo].[DataroomFolder]([parentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomFolder_dataroomId_parentId_orderIndex_idx] ON [dbo].[DataroomFolder]([dataroomId], [parentId], [orderIndex]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomBrand_tenantId_idx] ON [dbo].[DataroomBrand]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentFeedback_linkId_idx] ON [dbo].[DocumentFeedback]([linkId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FeedbackResponse_feedbackId_idx] ON [dbo].[FeedbackResponse]([feedbackId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FeedbackResponse_viewId_idx] ON [dbo].[FeedbackResponse]([viewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Agreement_tenantId_idx] ON [dbo].[Agreement]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AgreementResponse_agreementId_idx] ON [dbo].[AgreementResponse]([agreementId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AgreementResponse_viewId_idx] ON [dbo].[AgreementResponse]([viewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomViewerGroup_dataroomId_idx] ON [dbo].[DataroomViewerGroup]([dataroomId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomViewerGroup_tenantId_idx] ON [dbo].[DataroomViewerGroup]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomViewerGroupMembership_viewerId_idx] ON [dbo].[DataroomViewerGroupMembership]([viewerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomViewerGroupMembership_groupId_idx] ON [dbo].[DataroomViewerGroupMembership]([groupId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DataroomViewerGroupAccessControls_groupId_idx] ON [dbo].[DataroomViewerGroupAccessControls]([groupId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IncomingWebhook_tenantId_idx] ON [dbo].[IncomingWebhook]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RestrictedToken_userTenantId_idx] ON [dbo].[RestrictedToken]([userTenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RestrictedToken_tenantId_idx] ON [dbo].[RestrictedToken]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Webhook_tenantId_idx] ON [dbo].[Webhook]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CustomField_linkId_idx] ON [dbo].[CustomField]([linkId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CustomFieldResponse_viewId_idx] ON [dbo].[CustomFieldResponse]([viewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_area_name] ON [dbo].[Area]([name], [tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_hierarchy_name] ON [dbo].[RequestHierarchy]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_hierarchy_level_hierarchy_id] ON [dbo].[RequestHierarchyLevel]([hierarchyId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_category_name] ON [dbo].[RequestCategory]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_request_category_hierarchy_id] ON [dbo].[RequestCategory]([hierarchyId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_sla_request_category_id] ON [dbo].[SLA]([requestCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_sla_change_log_sla_id] ON [dbo].[SLAChangeLog]([slaId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_guide_document_request_category_id] ON [dbo].[GuideDocument]([requestCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_requirement_name] ON [dbo].[Requirement]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_requirement_id] ON [dbo].[RequestCategoryRequirement]([requirementId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_category_category_id] ON [dbo].[RequestCategoryRequirement]([categoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_requirement_type_name] ON [dbo].[RequirementType]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_hierarchy_name] ON [dbo].[AssignmentHierarchy]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_hierarchy_level_hierarchy_id] ON [dbo].[AssignmentHierarchyLevel]([hierarchyId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_category_name_tenant] ON [dbo].[AssignmentCategory]([name], [tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_category_hierarchy_tenant] ON [dbo].[AssignmentCategory]([hierarchyId], [tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_assignment_category_area_tenant] ON [dbo].[AssignmentCategory]([areaId], [tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FormSubmission_formId_idx] ON [dbo].[FormSubmission]([formId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FormSubmissionKey_key_value_idx] ON [dbo].[FormSubmissionKey]([key], [value]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionFlowDefinition_requestCategoryId_idx] ON [dbo].[ExecutionFlowDefinition]([requestCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionNodeDefinition_type_idx] ON [dbo].[ExecutionNodeDefinition]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionEdgeDefinition_sourceId_targetId_idx] ON [dbo].[ExecutionEdgeDefinition]([sourceId], [targetId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionModelInstance_status_idx] ON [dbo].[ExecutionModelInstance]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionModelInstance_tenantId_flowId_requestId_idx] ON [dbo].[ExecutionModelInstance]([tenantId], [flowId], [requestId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionModelLog_timestamp_idx] ON [dbo].[ExecutionModelLog]([timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ExecutionModelHistory_updatedAt_idx] ON [dbo].[ExecutionModelHistory]([updatedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_role_name] ON [dbo].[Role]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_module_name] ON [dbo].[Module]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [NotificationRecipient_userTenantId_idx] ON [dbo].[NotificationRecipient]([userTenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Channel_tenantId_idx] ON [dbo].[Channel]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Conversation_userTenantOneId_userTenantTwoId_idx] ON [dbo].[Conversation]([userTenantOneId], [userTenantTwoId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_userTenantId_idx] ON [dbo].[Message]([userTenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_channelId_idx] ON [dbo].[Message]([channelId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_parentMessageId_idx] ON [dbo].[Message]([parentMessageId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Message_conversationId_idx] ON [dbo].[Message]([conversationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reaction_messageId_idx] ON [dbo].[Reaction]([messageId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reaction_userTenantId_idx] ON [dbo].[Reaction]([userTenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_identification_type_name] ON [dbo].[IdentificationType]([name]);

-- AddForeignKey
ALTER TABLE [dbo].[UserTenant] ADD CONSTRAINT [UserTenant_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenant] ADD CONSTRAINT [UserTenant_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InvitationTenant] ADD CONSTRAINT [InvitationTenant_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InvitationTenant] ADD CONSTRAINT [InvitationTenant_inviterId_fkey] FOREIGN KEY ([inviterId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InvitationTenant] ADD CONSTRAINT [InvitationTenant_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [dbo].[Area]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Subscription] ADD CONSTRAINT [Subscription_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Subscription] ADD CONSTRAINT [Subscription_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[Plan]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PlanFeature] ADD CONSTRAINT [PlanFeature_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[Plan]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PlanFeature] ADD CONSTRAINT [PlanFeature_featureId_fkey] FOREIGN KEY ([featureId]) REFERENCES [dbo].[Feature]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UsageTracking] ADD CONSTRAINT [UsageTracking_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_subscriptionId_fkey] FOREIGN KEY ([subscriptionId]) REFERENCES [dbo].[Subscription]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[session] ADD CONSTRAINT [session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[account] ADD CONSTRAINT [account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[twoFactor] ADD CONSTRAINT [twoFactor_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ssoProvider] ADD CONSTRAINT [ssoProvider_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[apikey] ADD CONSTRAINT [apikey_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[passkey] ADD CONSTRAINT [passkey_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Request] ADD CONSTRAINT [Request_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_statusId_fkey] FOREIGN KEY ([statusId]) REFERENCES [dbo].[RequestWorkflowStatus]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_typeId_fkey] FOREIGN KEY ([typeId]) REFERENCES [dbo].[AssignmentType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_priorityId_fkey] FOREIGN KEY ([priorityId]) REFERENCES [dbo].[RequestPriorityType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_requestCategoryId_fkey] FOREIGN KEY ([requestCategoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestAssignment] ADD CONSTRAINT [RequestAssignment_assignmentCategoryId_fkey] FOREIGN KEY ([assignmentCategoryId]) REFERENCES [dbo].[AssignmentCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignedUser] ADD CONSTRAINT [AssignedUser_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignedUser] ADD CONSTRAINT [AssignedUser_requestAssignmentId_fkey] FOREIGN KEY ([requestAssignmentId]) REFERENCES [dbo].[RequestAssignment]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignedUser] ADD CONSTRAINT [AssignedUser_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestPriorityType] ADD CONSTRAINT [RequestPriorityType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentType] ADD CONSTRAINT [AssignmentType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflow] ADD CONSTRAINT [RequestWorkflow_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowStatus] ADD CONSTRAINT [RequestWorkflowStatus_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowStatus] ADD CONSTRAINT [RequestWorkflowStatus_workflowId_fkey] FOREIGN KEY ([workflowId]) REFERENCES [dbo].[RequestWorkflow]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowTransition] ADD CONSTRAINT [RequestWorkflowTransition_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowTransition] ADD CONSTRAINT [RequestWorkflowTransition_workflowId_fkey] FOREIGN KEY ([workflowId]) REFERENCES [dbo].[RequestWorkflow]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowTransition] ADD CONSTRAINT [RequestWorkflowTransition_fromStatusId_fkey] FOREIGN KEY ([fromStatusId]) REFERENCES [dbo].[RequestWorkflowStatus]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestWorkflowTransition] ADD CONSTRAINT [RequestWorkflowTransition_toStatusId_fkey] FOREIGN KEY ([toStatusId]) REFERENCES [dbo].[RequestWorkflowStatus]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementComplianceTracking] ADD CONSTRAINT [RequirementComplianceTracking_requirementId_fkey] FOREIGN KEY ([requirementId]) REFERENCES [dbo].[Requirement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomerSatisfactionSurvey] ADD CONSTRAINT [CustomerSatisfactionSurvey_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomerSatisfactionSurvey] ADD CONSTRAINT [CustomerSatisfactionSurvey_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestChangeLog] ADD CONSTRAINT [RequestChangeLog_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestChangeLog] ADD CONSTRAINT [RequestChangeLog_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_folderId_fkey] FOREIGN KEY ([folderId]) REFERENCES [dbo].[DataroomFolder]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_requirementComplianceTrackingId_fkey] FOREIGN KEY ([requirementComplianceTrackingId]) REFERENCES [dbo].[RequirementComplianceTracking]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentVersion] ADD CONSTRAINT [DocumentVersion_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentVersion] ADD CONSTRAINT [DocumentVersion_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[Document]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentPage] ADD CONSTRAINT [DocumentPage_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentPage] ADD CONSTRAINT [DocumentPage_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[DocumentVersion]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[Document]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_agreementId_fkey] FOREIGN KEY ([agreementId]) REFERENCES [dbo].[Agreement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_domainId_fkey] FOREIGN KEY ([domainId]) REFERENCES [dbo].[Domain]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[DataroomViewerGroup]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LinkPreset] ADD CONSTRAINT [LinkPreset_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Domain] ADD CONSTRAINT [Domain_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_linkId_fkey] FOREIGN KEY ([linkId]) REFERENCES [dbo].[Link]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[Document]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_viewerId_fkey] FOREIGN KEY ([viewerId]) REFERENCES [dbo].[Viewer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentView] ADD CONSTRAINT [DocumentView_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[DataroomViewerGroup]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Viewer] ADD CONSTRAINT [Viewer_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Viewer] ADD CONSTRAINT [Viewer_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentReaction] ADD CONSTRAINT [DocumentReaction_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentReaction] ADD CONSTRAINT [DocumentReaction_viewId_fkey] FOREIGN KEY ([viewId]) REFERENCES [dbo].[DocumentView]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InvitationDocument] ADD CONSTRAINT [InvitationDocument_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SentEmail] ADD CONSTRAINT [SentEmail_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentConversation] ADD CONSTRAINT [DocumentConversation_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentConversation] ADD CONSTRAINT [DocumentConversation_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentConversation] ADD CONSTRAINT [DocumentConversation_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[Document]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Dataroom] ADD CONSTRAINT [Dataroom_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Dataroom] ADD CONSTRAINT [Dataroom_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomFolder] ADD CONSTRAINT [DataroomFolder_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomFolder] ADD CONSTRAINT [DataroomFolder_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[DataroomFolder]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomFolder] ADD CONSTRAINT [DataroomFolder_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomBrand] ADD CONSTRAINT [DataroomBrand_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomBrand] ADD CONSTRAINT [DataroomBrand_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentFeedback] ADD CONSTRAINT [DocumentFeedback_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentFeedback] ADD CONSTRAINT [DocumentFeedback_linkId_fkey] FOREIGN KEY ([linkId]) REFERENCES [dbo].[Link]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FeedbackResponse] ADD CONSTRAINT [FeedbackResponse_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FeedbackResponse] ADD CONSTRAINT [FeedbackResponse_feedbackId_fkey] FOREIGN KEY ([feedbackId]) REFERENCES [dbo].[DocumentFeedback]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FeedbackResponse] ADD CONSTRAINT [FeedbackResponse_viewId_fkey] FOREIGN KEY ([viewId]) REFERENCES [dbo].[DocumentView]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Agreement] ADD CONSTRAINT [Agreement_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AgreementResponse] ADD CONSTRAINT [AgreementResponse_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AgreementResponse] ADD CONSTRAINT [AgreementResponse_agreementId_fkey] FOREIGN KEY ([agreementId]) REFERENCES [dbo].[Agreement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AgreementResponse] ADD CONSTRAINT [AgreementResponse_viewId_fkey] FOREIGN KEY ([viewId]) REFERENCES [dbo].[DocumentView]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroup] ADD CONSTRAINT [DataroomViewerGroup_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroup] ADD CONSTRAINT [DataroomViewerGroup_dataroomId_fkey] FOREIGN KEY ([dataroomId]) REFERENCES [dbo].[Dataroom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroupMembership] ADD CONSTRAINT [DataroomViewerGroupMembership_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroupMembership] ADD CONSTRAINT [DataroomViewerGroupMembership_viewerId_fkey] FOREIGN KEY ([viewerId]) REFERENCES [dbo].[Viewer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroupMembership] ADD CONSTRAINT [DataroomViewerGroupMembership_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[DataroomViewerGroup]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroupAccessControls] ADD CONSTRAINT [DataroomViewerGroupAccessControls_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DataroomViewerGroupAccessControls] ADD CONSTRAINT [DataroomViewerGroupAccessControls_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[DataroomViewerGroup]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[IncomingWebhook] ADD CONSTRAINT [IncomingWebhook_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RestrictedToken] ADD CONSTRAINT [RestrictedToken_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RestrictedToken] ADD CONSTRAINT [RestrictedToken_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Webhook] ADD CONSTRAINT [Webhook_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomField] ADD CONSTRAINT [CustomField_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomField] ADD CONSTRAINT [CustomField_linkId_fkey] FOREIGN KEY ([linkId]) REFERENCES [dbo].[Link]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomFieldResponse] ADD CONSTRAINT [CustomFieldResponse_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomFieldResponse] ADD CONSTRAINT [CustomFieldResponse_viewId_fkey] FOREIGN KEY ([viewId]) REFERENCES [dbo].[DocumentView]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Area] ADD CONSTRAINT [Area_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantArea] ADD CONSTRAINT [UserTenantArea_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantArea] ADD CONSTRAINT [UserTenantArea_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantArea] ADD CONSTRAINT [UserTenantArea_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantArea] ADD CONSTRAINT [UserTenantArea_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[AreaRole]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AreaRole] ADD CONSTRAINT [AreaRole_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AreaRole] ADD CONSTRAINT [AreaRole_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AreaRoleFeature] ADD CONSTRAINT [AreaRoleFeature_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AreaRoleFeature] ADD CONSTRAINT [AreaRoleFeature_areaRoleId_fkey] FOREIGN KEY ([areaRoleId]) REFERENCES [dbo].[AreaRole]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AreaRoleFeature] ADD CONSTRAINT [AreaRoleFeature_featureId_fkey] FOREIGN KEY ([featureId]) REFERENCES [dbo].[Feature]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestHierarchy] ADD CONSTRAINT [RequestHierarchy_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestHierarchyLevel] ADD CONSTRAINT [RequestHierarchyLevel_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestHierarchyLevel] ADD CONSTRAINT [RequestHierarchyLevel_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[RequestHierarchy]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategory] ADD CONSTRAINT [RequestCategory_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategory] ADD CONSTRAINT [RequestCategory_hierarchyLevelId_fkey] FOREIGN KEY ([hierarchyLevelId]) REFERENCES [dbo].[RequestHierarchyLevel]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategory] ADD CONSTRAINT [RequestCategory_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[RequestHierarchy]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategory] ADD CONSTRAINT [RequestCategory_parentCategoryId_fkey] FOREIGN KEY ([parentCategoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategory] ADD CONSTRAINT [RequestCategory_requestWorkflowId_fkey] FOREIGN KEY ([requestWorkflowId]) REFERENCES [dbo].[RequestWorkflow]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryForm] ADD CONSTRAINT [RequestCategoryForm_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryForm] ADD CONSTRAINT [RequestCategoryForm_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryForm] ADD CONSTRAINT [RequestCategoryForm_formId_fkey] FOREIGN KEY ([formId]) REFERENCES [dbo].[Form]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SLA] ADD CONSTRAINT [SLA_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SLA] ADD CONSTRAINT [SLA_requestCategoryId_fkey] FOREIGN KEY ([requestCategoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SLAChangeLog] ADD CONSTRAINT [SLAChangeLog_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SLAChangeLog] ADD CONSTRAINT [SLAChangeLog_slaId_fkey] FOREIGN KEY ([slaId]) REFERENCES [dbo].[SLA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GuideDocument] ADD CONSTRAINT [GuideDocument_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GuideDocument] ADD CONSTRAINT [GuideDocument_requestCategoryId_fkey] FOREIGN KEY ([requestCategoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Requirement] ADD CONSTRAINT [Requirement_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Requirement] ADD CONSTRAINT [Requirement_requirementTypeId_fkey] FOREIGN KEY ([requirementTypeId]) REFERENCES [dbo].[RequirementType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryRequirement] ADD CONSTRAINT [RequestCategoryRequirement_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryRequirement] ADD CONSTRAINT [RequestCategoryRequirement_requirementId_fkey] FOREIGN KEY ([requirementId]) REFERENCES [dbo].[Requirement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestCategoryRequirement] ADD CONSTRAINT [RequestCategoryRequirement_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequirementType] ADD CONSTRAINT [RequirementType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentHierarchy] ADD CONSTRAINT [AssignmentHierarchy_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentHierarchy] ADD CONSTRAINT [AssignmentHierarchy_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentHierarchyLevel] ADD CONSTRAINT [AssignmentHierarchyLevel_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentHierarchyLevel] ADD CONSTRAINT [AssignmentHierarchyLevel_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[AssignmentHierarchy]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategory] ADD CONSTRAINT [AssignmentCategory_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategory] ADD CONSTRAINT [AssignmentCategory_parentCategoryId_fkey] FOREIGN KEY ([parentCategoryId]) REFERENCES [dbo].[AssignmentCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategory] ADD CONSTRAINT [AssignmentCategory_hierarchyLevelId_fkey] FOREIGN KEY ([hierarchyLevelId]) REFERENCES [dbo].[AssignmentHierarchyLevel]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategory] ADD CONSTRAINT [AssignmentCategory_hierarchyId_fkey] FOREIGN KEY ([hierarchyId]) REFERENCES [dbo].[AssignmentHierarchy]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategory] ADD CONSTRAINT [AssignmentCategory_areaId_fkey] FOREIGN KEY ([areaId]) REFERENCES [dbo].[Area]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategoryForm] ADD CONSTRAINT [AssignmentCategoryForm_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategoryForm] ADD CONSTRAINT [AssignmentCategoryForm_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[AssignmentCategory]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AssignmentCategoryForm] ADD CONSTRAINT [AssignmentCategoryForm_formId_fkey] FOREIGN KEY ([formId]) REFERENCES [dbo].[Form]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Form] ADD CONSTRAINT [Form_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_formId_fkey] FOREIGN KEY ([formId]) REFERENCES [dbo].[Form]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmissionKey] ADD CONSTRAINT [FormSubmissionKey_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmissionKey] ADD CONSTRAINT [FormSubmissionKey_submissionId_fkey] FOREIGN KEY ([submissionId]) REFERENCES [dbo].[FormSubmission]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MenuItem] ADD CONSTRAINT [MenuItem_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MenuItem] ADD CONSTRAINT [MenuItem_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[MenuItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionFlowDefinition] ADD CONSTRAINT [ExecutionFlowDefinition_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionFlowDefinition] ADD CONSTRAINT [ExecutionFlowDefinition_requestCategoryId_fkey] FOREIGN KEY ([requestCategoryId]) REFERENCES [dbo].[RequestCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionNodeDefinition] ADD CONSTRAINT [ExecutionNodeDefinition_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionNodeDefinition] ADD CONSTRAINT [ExecutionNodeDefinition_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[ExecutionFlowDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionEdgeDefinition] ADD CONSTRAINT [ExecutionEdgeDefinition_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionEdgeDefinition] ADD CONSTRAINT [ExecutionEdgeDefinition_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[ExecutionFlowDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionEdgeDefinition] ADD CONSTRAINT [ExecutionEdgeDefinition_sourceId_fkey] FOREIGN KEY ([sourceId]) REFERENCES [dbo].[ExecutionNodeDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionEdgeDefinition] ADD CONSTRAINT [ExecutionEdgeDefinition_targetId_fkey] FOREIGN KEY ([targetId]) REFERENCES [dbo].[ExecutionNodeDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionNodeGuide] ADD CONSTRAINT [ExecutionNodeGuide_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionNodeGuide] ADD CONSTRAINT [ExecutionNodeGuide_guideId_fkey] FOREIGN KEY ([guideId]) REFERENCES [dbo].[GuideDocument]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionNodeGuide] ADD CONSTRAINT [ExecutionNodeGuide_nodeId_fkey] FOREIGN KEY ([nodeId]) REFERENCES [dbo].[ExecutionNodeDefinition]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelInstance] ADD CONSTRAINT [ExecutionModelInstance_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelInstance] ADD CONSTRAINT [ExecutionModelInstance_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[ExecutionFlowDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelInstance] ADD CONSTRAINT [ExecutionModelInstance_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelLog] ADD CONSTRAINT [ExecutionModelLog_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelLog] ADD CONSTRAINT [ExecutionModelLog_executionId_fkey] FOREIGN KEY ([executionId]) REFERENCES [dbo].[ExecutionModelInstance]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelLog] ADD CONSTRAINT [ExecutionModelLog_nodeId_fkey] FOREIGN KEY ([nodeId]) REFERENCES [dbo].[ExecutionNodeDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelHistory] ADD CONSTRAINT [ExecutionModelHistory_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelHistory] ADD CONSTRAINT [ExecutionModelHistory_executionId_fkey] FOREIGN KEY ([executionId]) REFERENCES [dbo].[ExecutionModelInstance]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelHistory] ADD CONSTRAINT [ExecutionModelHistory_previousFlowId_fkey] FOREIGN KEY ([previousFlowId]) REFERENCES [dbo].[ExecutionFlowDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExecutionModelHistory] ADD CONSTRAINT [ExecutionModelHistory_newFlowId_fkey] FOREIGN KEY ([newFlowId]) REFERENCES [dbo].[ExecutionFlowDefinition]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserTenantRole_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserTenantRole_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserTenantRole] ADD CONSTRAINT [UserTenantRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[NotificationRecipient] ADD CONSTRAINT [NotificationRecipient_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[NotificationRecipient] ADD CONSTRAINT [NotificationRecipient_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[NotificationRecipient] ADD CONSTRAINT [NotificationRecipient_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Channel] ADD CONSTRAINT [Channel_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Channel] ADD CONSTRAINT [Channel_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[Request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_userTenantOneId_fkey] FOREIGN KEY ([userTenantOneId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_userTenantTwoId_fkey] FOREIGN KEY ([userTenantTwoId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_channelId_fkey] FOREIGN KEY ([channelId]) REFERENCES [dbo].[Channel]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_parentMessageId_fkey] FOREIGN KEY ([parentMessageId]) REFERENCES [dbo].[Message]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversation]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_messageId_fkey] FOREIGN KEY ([messageId]) REFERENCES [dbo].[Message]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_identificationTypeId_fkey] FOREIGN KEY ([identificationTypeId]) REFERENCES [dbo].[IdentificationType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Person] ADD CONSTRAINT [Person_userTenantId_fkey] FOREIGN KEY ([userTenantId]) REFERENCES [dbo].[UserTenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[IdentificationType] ADD CONSTRAINT [IdentificationType_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

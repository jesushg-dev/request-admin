-- CreateTable
CREATE TABLE "Tenant" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "metadata" TEXT,
    "websiteUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTenant" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTermAccepted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTwoFactorRequired" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personId" TEXT,

    CONSTRAINT "UserTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationTenant" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "InvitationTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "isLifetime" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationInDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "dailyLimit" INTEGER,
    "totalLimit" INTEGER,
    "resetInterval" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN,
    "isAnonymous" BOOLEAN,
    "isGlobalAdmin" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT,
    "displayUsername" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeTenantId" TEXT,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "metadata" TEXT,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ssoProvider" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "oidcConfig" TEXT,
    "samlConfig" TEXT,
    "userId" TEXT,
    "providerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "domain" TEXT NOT NULL,

    CONSTRAINT "ssoProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauthApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "icon" TEXT,
    "metadata" TEXT,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "redirectURLs" TEXT,
    "type" TEXT,
    "disabled" BOOLEAN,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "oauthApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauthAccessToken" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "clientId" TEXT,
    "userId" TEXT,
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "oauthAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauthConsent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "consentGiven" BOOLEAN,

    CONSTRAINT "oauthConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apikey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "start" TEXT,
    "prefix" TEXT,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refillInterval" INTEGER,
    "refillAmount" INTEGER,
    "lastRefillAt" TIMESTAMP(3),
    "enabled" BOOLEAN,
    "rateLimitEnabled" BOOLEAN,
    "rateLimitTimeWindow" INTEGER,
    "rateLimitMax" INTEGER,
    "requestCount" INTEGER,
    "remaining" INTEGER,
    "lastRequest" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permissions" TEXT,
    "metadata" TEXT,

    CONSTRAINT "apikey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "issueSubject" TEXT NOT NULL,
    "description" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "closedComment" TEXT,
    "dataroomId" TEXT,
    "satisfactionSurveyId" TEXT,
    "channelId" TEXT,
    "executionModelInstanceId" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAssignment" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "comment" TEXT,
    "assignmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unAssignmentDate" TIMESTAMP(3),
    "requestId" TEXT NOT NULL,
    "slaStart" TIMESTAMP(3),
    "slaDeadline" TIMESTAMP(3),
    "slaEnd" TIMESTAMP(3),
    "areaId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "priorityId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requestCategoryId" TEXT NOT NULL,
    "assignmentCategoryId" TEXT NOT NULL,

    CONSTRAINT "RequestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedUser" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "requestAssignmentId" TEXT NOT NULL,
    "userTenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "unAssignmentDate" TIMESTAMP(3),
    "isCoordinator" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AssignedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestPriorityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RequestPriorityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,

    CONSTRAINT "AssignmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestWorkflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "requireComments" BOOLEAN NOT NULL DEFAULT false,
    "notifyChanges" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RequestWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestWorkflowStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "RequestWorkflowStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestWorkflowTransition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxDuration" INTEGER,
    "notifyAfter" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiresJustification" BOOLEAN NOT NULL DEFAULT false,
    "workflowId" TEXT NOT NULL,
    "fromStatusId" TEXT NOT NULL,
    "toStatusId" TEXT NOT NULL,

    CONSTRAINT "RequestWorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementComplianceTracking" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RequirementComplianceTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSatisfactionSurvey" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "CustomerSatisfactionSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestChangeLog" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "metadata" TEXT,

    CONSTRAINT "RequestChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "file" TEXT NOT NULL,
    "originalFile" TEXT,
    "type" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'UPLOADTHING',
    "numPages" INTEGER,
    "expirationDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assistantEnabled" BOOLEAN NOT NULL DEFAULT false,
    "advancedExcelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "downloadOnly" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "folderId" TEXT,
    "dataroomId" TEXT,
    "orderIndex" INTEGER,
    "requirementComplianceTrackingId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "documentId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "originalFile" TEXT,
    "type" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "storageType" TEXT NOT NULL DEFAULT 'VERCEL_BLOB',
    "numPages" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVertical" BOOLEAN NOT NULL DEFAULT false,
    "fileId" TEXT,
    "hasPages" BOOLEAN NOT NULL DEFAULT false,
    "length" INTEGER,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPage" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "embeddedLinks" TEXT NOT NULL,
    "pageLinks" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'VERCEL_BLOB',

    CONSTRAINT "DocumentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "dataroomId" TEXT,
    "linkType" TEXT NOT NULL DEFAULT 'DOCUMENT_LINK',
    "url" TEXT,
    "name" TEXT,
    "slug" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "allowList" TEXT NOT NULL,
    "denyList" TEXT NOT NULL,
    "emailProtected" BOOLEAN NOT NULL DEFAULT true,
    "emailAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "allowDownload" BOOLEAN DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "enableNotification" BOOLEAN DEFAULT true,
    "enableFeedback" BOOLEAN DEFAULT false,
    "enableQuestion" BOOLEAN DEFAULT false,
    "enableScreenshotProtection" BOOLEAN DEFAULT false,
    "enableAgreement" BOOLEAN DEFAULT false,
    "agreementId" TEXT,
    "domainId" TEXT,
    "domainSlug" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaImage" TEXT,
    "metaFavicon" TEXT,
    "enableCustomMetatag" BOOLEAN DEFAULT false,
    "audienceType" TEXT NOT NULL DEFAULT 'GENERAL',
    "groupId" TEXT,
    "enableWatermark" BOOLEAN DEFAULT false,
    "watermarkConfig" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkPreset" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enableCustomMetaTag" BOOLEAN DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaImage" TEXT,
    "metaFavicon" TEXT,

    CONSTRAINT "LinkPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentView" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "documentId" TEXT,
    "dataroomId" TEXT,
    "dataroomViewId" TEXT,
    "viewerEmail" TEXT,
    "viewerName" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadedAt" TIMESTAMP(3),
    "viewType" TEXT NOT NULL DEFAULT 'DOCUMENT_VIEW',
    "viewerId" TEXT,
    "groupId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Viewer" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "invitedAt" TIMESTAMP(3),
    "notificationPreferences" TEXT NOT NULL,
    "dataroomId" TEXT,

    CONSTRAINT "Viewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReaction" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "DocumentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationDocument" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SentEmail" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "domainSlug" TEXT,

    CONSTRAINT "SentEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentConversation" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userTenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "DocumentConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "pId" TEXT NOT NULL,
    "requestId" TEXT,

    CONSTRAINT "Dataroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomFolder" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "parentId" TEXT,
    "dataroomId" TEXT NOT NULL,
    "orderIndex" INTEGER,

    CONSTRAINT "DataroomFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomBrand" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "brandColor" TEXT,
    "accentColor" TEXT,
    "dataroomId" TEXT NOT NULL,

    CONSTRAINT "DataroomBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFeedback" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "DocumentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "requireName" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementResponse" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "AgreementResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomViewerGroup" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domains" TEXT NOT NULL,
    "allowAll" BOOLEAN NOT NULL DEFAULT false,
    "dataroomId" TEXT NOT NULL,

    CONSTRAINT "DataroomViewerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomViewerGroupMembership" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "DataroomViewerGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomViewerGroupAccessControls" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canDownload" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DataroomViewerGroupAccessControls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingWebhook" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secret" TEXT,
    "source" TEXT,
    "actions" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastFailedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "IncomingWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestrictedToken" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "partialKey" TEXT NOT NULL,
    "scopes" TEXT,
    "expires" TIMESTAMP(3),
    "lastUsed" TIMESTAMP(3),
    "rateLimit" INTEGER NOT NULL DEFAULT 60,
    "userTenantId" TEXT NOT NULL,

    CONSTRAINT "RestrictedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "pId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "triggers" TEXT NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "linkId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldResponse" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,

    CONSTRAINT "CustomFieldResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTenantArea" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userTenantId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserTenantArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "AreaRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaRoleFeature" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "areaRoleId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "AreaRoleFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestHierarchy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RequestHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestHierarchyLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "hierarchyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "RequestHierarchyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "isEligibleForNewClients" BOOLEAN NOT NULL DEFAULT true,
    "hierarchyLevelId" TEXT NOT NULL,
    "hierarchyId" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "requestWorkflowId" TEXT,

    CONSTRAINT "RequestCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestCategoryForm" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "RequestCategoryForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLA" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "resolutionTime" INTEGER NOT NULL,
    "escalationTime" INTEGER,
    "requestCategoryId" TEXT,

    CONSTRAINT "SLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAChangeLog" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "slaId" TEXT NOT NULL,
    "oldResolutionTime" INTEGER,
    "newResolutionTime" INTEGER NOT NULL,

    CONSTRAINT "SLAChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "requestCategoryId" TEXT NOT NULL,

    CONSTRAINT "GuideDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "isRequiredOnlyOnce" BOOLEAN NOT NULL DEFAULT false,
    "requirementTypeId" TEXT NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestCategoryRequirement" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RequestCategoryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RequirementType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentHierarchy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "areaId" TEXT,

    CONSTRAINT "AssignmentHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentHierarchyLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "hierarchyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AssignmentHierarchyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "hierarchyLevelId" TEXT NOT NULL,
    "hierarchyId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "AssignmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentCategoryForm" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "AssignmentCategoryForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "shareURL" TEXT NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "requestId" TEXT,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmissionKey" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormSubmissionKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "pathname" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionFlowDefinition" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requestCategoryId" TEXT,
    "viewportX" DOUBLE PRECISION,
    "viewportY" DOUBLE PRECISION,
    "viewportZoom" DOUBLE PRECISION,

    CONSTRAINT "ExecutionFlowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionNodeDefinition" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "config" TEXT NOT NULL,

    CONSTRAINT "ExecutionNodeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionEdgeDefinition" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "style" TEXT,
    "markerEnd" TEXT,

    CONSTRAINT "ExecutionEdgeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionNodeGuide" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "applicationScope" TEXT NOT NULL DEFAULT 'full',
    "customInstructions" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "guideId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "ExecutionNodeGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionModelInstance" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ExecutionModelInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionModelLog" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "ExecutionModelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionModelHistory" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "previousFlowId" TEXT,
    "newFlowId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "ExecutionModelHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTenantRole" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userTenantId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserTenantRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleFeature" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roleId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "RoleFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userTenantId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requestId" TEXT,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "userTenantOneId" TEXT NOT NULL,
    "userTenantTwoId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "imageId" TEXT,
    "userTenantId" TEXT NOT NULL,
    "channelId" TEXT,
    "parentMessageId" TEXT,
    "conversationId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userTenantId" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "identificationNumber" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "identificationTypeId" TEXT,
    "userTenantId" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentificationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "regex" TEXT,

    CONSTRAINT "IdentificationType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "UserTenant_userId_idx" ON "UserTenant"("userId");

-- CreateIndex
CREATE INDEX "UserTenant_tenantId_idx" ON "UserTenant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenant_userId_tenantId_key" ON "UserTenant"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_username_key" ON "user"("email", "username");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "account_accountId_key" ON "account"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ssoProvider_providerId_key" ON "ssoProvider"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthApplication_clientId_key" ON "oauthApplication"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccessToken_accessToken_key" ON "oauthAccessToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccessToken_refreshToken_key" ON "oauthAccessToken"("refreshToken");

-- CreateIndex
CREATE INDEX "idx_request_closed_at" ON "Request"("closedAt");

-- CreateIndex
CREATE INDEX "idx_request_closed_by" ON "Request"("closedBy");

-- CreateIndex
CREATE INDEX "idx_request_closed_comment" ON "Request"("closedComment");

-- CreateIndex
CREATE INDEX "idx_request_issue_subject" ON "Request"("issueSubject");

-- CreateIndex
CREATE INDEX "idx_assignment_type_id" ON "RequestAssignment"("typeId");

-- CreateIndex
CREATE INDEX "idx_assignment_request_id" ON "RequestAssignment"("requestId");

-- CreateIndex
CREATE INDEX "idx_assignment_status_id" ON "RequestAssignment"("statusId");

-- CreateIndex
CREATE INDEX "idx_assignment_sla_start" ON "RequestAssignment"("slaStart");

-- CreateIndex
CREATE INDEX "idx_assignment_sla_deadline" ON "RequestAssignment"("slaDeadline");

-- CreateIndex
CREATE INDEX "idx_assignment_sla_end" ON "RequestAssignment"("slaEnd");

-- CreateIndex
CREATE INDEX "idx_assignment_request_category_id" ON "RequestAssignment"("requestCategoryId");

-- CreateIndex
CREATE INDEX "idx_assignment_assignment_category_id" ON "RequestAssignment"("assignmentCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestPriorityType_name_tenantId_key" ON "RequestPriorityType"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentType_name_tenantId_key" ON "AssignmentType"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_status_type" ON "RequestWorkflowStatus"("type");

-- CreateIndex
CREATE INDEX "idx_transition_source" ON "RequestWorkflowTransition"("fromStatusId");

-- CreateIndex
CREATE INDEX "idx_transition_target" ON "RequestWorkflowTransition"("toStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestWorkflowTransition_tenantId_fromStatusId_toStatusId_key" ON "RequestWorkflowTransition"("tenantId", "fromStatusId", "toStatusId");

-- CreateIndex
CREATE INDEX "idx_compliance_request_id" ON "RequirementComplianceTracking"("requestId");

-- CreateIndex
CREATE INDEX "idx_compliance_requirement_id" ON "RequirementComplianceTracking"("requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementComplianceTracking_requestId_requirementId_tenan_key" ON "RequirementComplianceTracking"("requestId", "requirementId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSatisfactionSurvey_requestId_key" ON "CustomerSatisfactionSurvey"("requestId");

-- CreateIndex
CREATE INDEX "idx_survey_request_id" ON "CustomerSatisfactionSurvey"("requestId");

-- CreateIndex
CREATE INDEX "idx_change_log_request_id" ON "RequestChangeLog"("requestId");

-- CreateIndex
CREATE INDEX "idx_change_log_changed_by" ON "RequestChangeLog"("updatedBy");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_versionNumber_documentId_key" ON "DocumentVersion"("versionNumber", "documentId");

-- CreateIndex
CREATE INDEX "DocumentPage_versionId_idx" ON "DocumentPage"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentPage_pageNumber_versionId_key" ON "DocumentPage"("pageNumber", "versionId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_url_key" ON "Link"("url");

-- CreateIndex
CREATE INDEX "Link_documentId_idx" ON "Link"("documentId");

-- CreateIndex
CREATE INDEX "Link_tenantId_idx" ON "Link"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_domainSlug_slug_key" ON "Link"("domainSlug", "slug");

-- CreateIndex
CREATE INDEX "LinkPreset_tenantId_idx" ON "LinkPreset"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_tenantId_idx" ON "Domain"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentView_linkId_idx" ON "DocumentView"("linkId");

-- CreateIndex
CREATE INDEX "DocumentView_documentId_idx" ON "DocumentView"("documentId");

-- CreateIndex
CREATE INDEX "DocumentView_dataroomId_idx" ON "DocumentView"("dataroomId");

-- CreateIndex
CREATE INDEX "DocumentView_dataroomViewId_idx" ON "DocumentView"("dataroomViewId");

-- CreateIndex
CREATE INDEX "DocumentView_tenantId_idx" ON "DocumentView"("tenantId");

-- CreateIndex
CREATE INDEX "Viewer_tenantId_idx" ON "Viewer"("tenantId");

-- CreateIndex
CREATE INDEX "Viewer_dataroomId_idx" ON "Viewer"("dataroomId");

-- CreateIndex
CREATE UNIQUE INDEX "Viewer_tenantId_email_key" ON "Viewer"("tenantId", "email");

-- CreateIndex
CREATE INDEX "DocumentReaction_viewId_idx" ON "DocumentReaction"("viewId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationDocument_token_key" ON "InvitationDocument"("token");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationDocument_email_tenantId_key" ON "InvitationDocument"("email", "tenantId");

-- CreateIndex
CREATE INDEX "SentEmail_tenantId_idx" ON "SentEmail"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentConversation_threadId_key" ON "DocumentConversation"("threadId");

-- CreateIndex
CREATE INDEX "DocumentConversation_threadId_idx" ON "DocumentConversation"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentConversation_userTenantId_documentId_key" ON "DocumentConversation"("userTenantId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentConversation_threadId_documentId_key" ON "DocumentConversation"("threadId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataroom_pId_key" ON "Dataroom"("pId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataroom_requestId_key" ON "Dataroom"("requestId");

-- CreateIndex
CREATE INDEX "Dataroom_tenantId_idx" ON "Dataroom"("tenantId");

-- CreateIndex
CREATE INDEX "DataroomFolder_parentId_idx" ON "DataroomFolder"("parentId");

-- CreateIndex
CREATE INDEX "DataroomFolder_dataroomId_parentId_orderIndex_idx" ON "DataroomFolder"("dataroomId", "parentId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DataroomFolder_dataroomId_path_key" ON "DataroomFolder"("dataroomId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "DataroomBrand_dataroomId_key" ON "DataroomBrand"("dataroomId");

-- CreateIndex
CREATE INDEX "DataroomBrand_tenantId_idx" ON "DataroomBrand"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentFeedback_linkId_key" ON "DocumentFeedback"("linkId");

-- CreateIndex
CREATE INDEX "DocumentFeedback_linkId_idx" ON "DocumentFeedback"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResponse_viewId_key" ON "FeedbackResponse"("viewId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_feedbackId_idx" ON "FeedbackResponse"("feedbackId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_viewId_idx" ON "FeedbackResponse"("viewId");

-- CreateIndex
CREATE INDEX "Agreement_tenantId_idx" ON "Agreement"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementResponse_viewId_key" ON "AgreementResponse"("viewId");

-- CreateIndex
CREATE INDEX "AgreementResponse_agreementId_idx" ON "AgreementResponse"("agreementId");

-- CreateIndex
CREATE INDEX "AgreementResponse_viewId_idx" ON "AgreementResponse"("viewId");

-- CreateIndex
CREATE INDEX "DataroomViewerGroup_dataroomId_idx" ON "DataroomViewerGroup"("dataroomId");

-- CreateIndex
CREATE INDEX "DataroomViewerGroup_tenantId_idx" ON "DataroomViewerGroup"("tenantId");

-- CreateIndex
CREATE INDEX "DataroomViewerGroupMembership_viewerId_idx" ON "DataroomViewerGroupMembership"("viewerId");

-- CreateIndex
CREATE INDEX "DataroomViewerGroupMembership_groupId_idx" ON "DataroomViewerGroupMembership"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "DataroomViewerGroupMembership_viewerId_groupId_key" ON "DataroomViewerGroupMembership"("viewerId", "groupId");

-- CreateIndex
CREATE INDEX "DataroomViewerGroupAccessControls_groupId_idx" ON "DataroomViewerGroupAccessControls"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "DataroomViewerGroupAccessControls_groupId_itemId_key" ON "DataroomViewerGroupAccessControls"("groupId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingWebhook_externalId_key" ON "IncomingWebhook"("externalId");

-- CreateIndex
CREATE INDEX "IncomingWebhook_tenantId_idx" ON "IncomingWebhook"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RestrictedToken_hashedKey_key" ON "RestrictedToken"("hashedKey");

-- CreateIndex
CREATE INDEX "RestrictedToken_userTenantId_idx" ON "RestrictedToken"("userTenantId");

-- CreateIndex
CREATE INDEX "RestrictedToken_tenantId_idx" ON "RestrictedToken"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_pId_key" ON "Webhook"("pId");

-- CreateIndex
CREATE INDEX "Webhook_tenantId_idx" ON "Webhook"("tenantId");

-- CreateIndex
CREATE INDEX "CustomField_linkId_idx" ON "CustomField"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldResponse_viewId_key" ON "CustomFieldResponse"("viewId");

-- CreateIndex
CREATE INDEX "CustomFieldResponse_viewId_idx" ON "CustomFieldResponse"("viewId");

-- CreateIndex
CREATE INDEX "idx_area_name" ON "Area"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_tenantId_key" ON "Area"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenantArea_userTenantId_areaId_tenantId_key" ON "UserTenantArea"("userTenantId", "areaId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AreaRole_name_areaId_tenantId_key" ON "AreaRole"("name", "areaId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AreaRoleFeature_areaRoleId_featureId_tenantId_key" ON "AreaRoleFeature"("areaRoleId", "featureId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_request_hierarchy_name" ON "RequestHierarchy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestHierarchy_name_tenantId_key" ON "RequestHierarchy"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_request_hierarchy_level_hierarchy_id" ON "RequestHierarchyLevel"("hierarchyId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestHierarchyLevel_name_tenantId_key" ON "RequestHierarchyLevel"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestHierarchyLevel_position_hierarchyId_key" ON "RequestHierarchyLevel"("position", "hierarchyId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestHierarchyLevel_hierarchyId_position_key" ON "RequestHierarchyLevel"("hierarchyId", "position");

-- CreateIndex
CREATE INDEX "idx_request_category_name" ON "RequestCategory"("name");

-- CreateIndex
CREATE INDEX "idx_request_category_hierarchy_id" ON "RequestCategory"("hierarchyId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestCategory_name_hierarchyLevelId_parentCategoryId_tena_key" ON "RequestCategory"("name", "hierarchyLevelId", "parentCategoryId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestCategoryForm_categoryId_formId_tenantId_key" ON "RequestCategoryForm"("categoryId", "formId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SLA_requestCategoryId_key" ON "SLA"("requestCategoryId");

-- CreateIndex
CREATE INDEX "idx_sla_request_category_id" ON "SLA"("requestCategoryId");

-- CreateIndex
CREATE INDEX "idx_sla_change_log_sla_id" ON "SLAChangeLog"("slaId");

-- CreateIndex
CREATE INDEX "idx_guide_document_request_category_id" ON "GuideDocument"("requestCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideDocument_name_tenantId_key" ON "GuideDocument"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_requirement_name" ON "Requirement"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_name_tenantId_key" ON "Requirement"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_category_requirement_id" ON "RequestCategoryRequirement"("requirementId");

-- CreateIndex
CREATE INDEX "idx_category_category_id" ON "RequestCategoryRequirement"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestCategoryRequirement_categoryId_requirementId_tenantI_key" ON "RequestCategoryRequirement"("categoryId", "requirementId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_requirement_type_name" ON "RequirementType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementType_name_tenantId_key" ON "RequirementType"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_assignment_hierarchy_name" ON "AssignmentHierarchy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentHierarchy_name_tenantId_key" ON "AssignmentHierarchy"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_assignment_hierarchy_level_hierarchy_id" ON "AssignmentHierarchyLevel"("hierarchyId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentHierarchyLevel_position_hierarchyId_key" ON "AssignmentHierarchyLevel"("position", "hierarchyId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentHierarchyLevel_hierarchyId_position_key" ON "AssignmentHierarchyLevel"("hierarchyId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentHierarchyLevel_name_tenantId_key" ON "AssignmentHierarchyLevel"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_assignment_category_name_tenant" ON "AssignmentCategory"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_assignment_category_hierarchy_tenant" ON "AssignmentCategory"("hierarchyId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_assignment_category_area_tenant" ON "AssignmentCategory"("areaId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentCategory_name_hierarchyLevelId_areaId_parentCateg_key" ON "AssignmentCategory"("name", "hierarchyLevelId", "areaId", "parentCategoryId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentCategoryForm_categoryId_formId_tenantId_key" ON "AssignmentCategoryForm"("categoryId", "formId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Form_shareURL_key" ON "Form"("shareURL");

-- CreateIndex
CREATE UNIQUE INDEX "Form_name_tenantId_key" ON "Form"("name", "tenantId");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_formId_tenantId_requestId_key" ON "FormSubmission"("formId", "tenantId", "requestId");

-- CreateIndex
CREATE INDEX "FormSubmissionKey_key_value_idx" ON "FormSubmissionKey"("key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionFlowDefinition_requestCategoryId_key" ON "ExecutionFlowDefinition"("requestCategoryId");

-- CreateIndex
CREATE INDEX "ExecutionFlowDefinition_requestCategoryId_idx" ON "ExecutionFlowDefinition"("requestCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionFlowDefinition_id_version_key" ON "ExecutionFlowDefinition"("id", "version");

-- CreateIndex
CREATE INDEX "ExecutionNodeDefinition_type_idx" ON "ExecutionNodeDefinition"("type");

-- CreateIndex
CREATE INDEX "ExecutionEdgeDefinition_sourceId_targetId_idx" ON "ExecutionEdgeDefinition"("sourceId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionNodeGuide_guideId_nodeId_key" ON "ExecutionNodeGuide"("guideId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionModelInstance_requestId_key" ON "ExecutionModelInstance"("requestId");

-- CreateIndex
CREATE INDEX "ExecutionModelInstance_status_idx" ON "ExecutionModelInstance"("status");

-- CreateIndex
CREATE INDEX "ExecutionModelInstance_tenantId_flowId_requestId_idx" ON "ExecutionModelInstance"("tenantId", "flowId", "requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionModelInstance_tenantId_flowId_requestId_key" ON "ExecutionModelInstance"("tenantId", "flowId", "requestId");

-- CreateIndex
CREATE INDEX "ExecutionModelLog_timestamp_idx" ON "ExecutionModelLog"("timestamp");

-- CreateIndex
CREATE INDEX "ExecutionModelHistory_updatedAt_idx" ON "ExecutionModelHistory"("updatedAt");

-- CreateIndex
CREATE INDEX "idx_role_name" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_key" ON "Role"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_module_name" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_tenantId_key" ON "Module"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_key_key" ON "Feature"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_key_tenantId_key" ON "Feature"("key", "tenantId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userTenantId_idx" ON "NotificationRecipient"("userTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_userTenantId_key" ON "NotificationRecipient"("notificationId", "userTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_requestId_key" ON "Channel"("requestId");

-- CreateIndex
CREATE INDEX "Channel_tenantId_idx" ON "Channel"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_requestId_tenantId_key" ON "Channel"("requestId", "tenantId");

-- CreateIndex
CREATE INDEX "Conversation_userTenantOneId_userTenantTwoId_idx" ON "Conversation"("userTenantOneId", "userTenantTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userTenantOneId_userTenantTwoId_key" ON "Conversation"("userTenantOneId", "userTenantTwoId");

-- CreateIndex
CREATE INDEX "Message_userTenantId_idx" ON "Message"("userTenantId");

-- CreateIndex
CREATE INDEX "Message_channelId_idx" ON "Message"("channelId");

-- CreateIndex
CREATE INDEX "Message_parentMessageId_idx" ON "Message"("parentMessageId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Reaction_messageId_idx" ON "Reaction"("messageId");

-- CreateIndex
CREATE INDEX "Reaction_userTenantId_idx" ON "Reaction"("userTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_messageId_userTenantId_key" ON "Reaction"("messageId", "userTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userTenantId_key" ON "Person"("userTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userTenantId_tenantId_key" ON "Person"("userTenantId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_identification_type_name" ON "IdentificationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IdentificationType_name_tenantId_key" ON "IdentificationType"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "UserTenant" ADD CONSTRAINT "UserTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenant" ADD CONSTRAINT "UserTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationTenant" ADD CONSTRAINT "InvitationTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InvitationTenant" ADD CONSTRAINT "InvitationTenant_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssoProvider" ADD CONSTRAINT "ssoProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "RequestWorkflowStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AssignmentType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "RequestPriorityType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_requestCategoryId_fkey" FOREIGN KEY ("requestCategoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_assignmentCategoryId_fkey" FOREIGN KEY ("assignmentCategoryId") REFERENCES "AssignmentCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignedUser" ADD CONSTRAINT "AssignedUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignedUser" ADD CONSTRAINT "AssignedUser_requestAssignmentId_fkey" FOREIGN KEY ("requestAssignmentId") REFERENCES "RequestAssignment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignedUser" ADD CONSTRAINT "AssignedUser_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestPriorityType" ADD CONSTRAINT "RequestPriorityType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentType" ADD CONSTRAINT "AssignmentType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflow" ADD CONSTRAINT "RequestWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowStatus" ADD CONSTRAINT "RequestWorkflowStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowStatus" ADD CONSTRAINT "RequestWorkflowStatus_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "RequestWorkflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowTransition" ADD CONSTRAINT "RequestWorkflowTransition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowTransition" ADD CONSTRAINT "RequestWorkflowTransition_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "RequestWorkflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowTransition" ADD CONSTRAINT "RequestWorkflowTransition_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "RequestWorkflowStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestWorkflowTransition" ADD CONSTRAINT "RequestWorkflowTransition_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "RequestWorkflowStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequirementComplianceTracking" ADD CONSTRAINT "RequirementComplianceTracking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequirementComplianceTracking" ADD CONSTRAINT "RequirementComplianceTracking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequirementComplianceTracking" ADD CONSTRAINT "RequirementComplianceTracking_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomerSatisfactionSurvey" ADD CONSTRAINT "CustomerSatisfactionSurvey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomerSatisfactionSurvey" ADD CONSTRAINT "CustomerSatisfactionSurvey_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestChangeLog" ADD CONSTRAINT "RequestChangeLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestChangeLog" ADD CONSTRAINT "RequestChangeLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DataroomFolder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requirementComplianceTrackingId_fkey" FOREIGN KEY ("requirementComplianceTrackingId") REFERENCES "RequirementComplianceTracking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentPage" ADD CONSTRAINT "DocumentPage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentPage" ADD CONSTRAINT "DocumentPage_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DocumentVersion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DataroomViewerGroup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LinkPreset" ADD CONSTRAINT "LinkPreset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "Viewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DataroomViewerGroup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Viewer" ADD CONSTRAINT "Viewer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Viewer" ADD CONSTRAINT "Viewer_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentReaction" ADD CONSTRAINT "DocumentReaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentReaction" ADD CONSTRAINT "DocumentReaction_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "DocumentView"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InvitationDocument" ADD CONSTRAINT "InvitationDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentConversation" ADD CONSTRAINT "DocumentConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentConversation" ADD CONSTRAINT "DocumentConversation_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentConversation" ADD CONSTRAINT "DocumentConversation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Dataroom" ADD CONSTRAINT "Dataroom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Dataroom" ADD CONSTRAINT "Dataroom_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomFolder" ADD CONSTRAINT "DataroomFolder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomFolder" ADD CONSTRAINT "DataroomFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DataroomFolder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomFolder" ADD CONSTRAINT "DataroomFolder_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomBrand" ADD CONSTRAINT "DataroomBrand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomBrand" ADD CONSTRAINT "DataroomBrand_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentFeedback" ADD CONSTRAINT "DocumentFeedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentFeedback" ADD CONSTRAINT "DocumentFeedback_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "DocumentFeedback"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "DocumentView"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AgreementResponse" ADD CONSTRAINT "AgreementResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AgreementResponse" ADD CONSTRAINT "AgreementResponse_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AgreementResponse" ADD CONSTRAINT "AgreementResponse_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "DocumentView"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroup" ADD CONSTRAINT "DataroomViewerGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroup" ADD CONSTRAINT "DataroomViewerGroup_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroupMembership" ADD CONSTRAINT "DataroomViewerGroupMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroupMembership" ADD CONSTRAINT "DataroomViewerGroupMembership_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "Viewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroupMembership" ADD CONSTRAINT "DataroomViewerGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DataroomViewerGroup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroupAccessControls" ADD CONSTRAINT "DataroomViewerGroupAccessControls_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DataroomViewerGroupAccessControls" ADD CONSTRAINT "DataroomViewerGroupAccessControls_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DataroomViewerGroup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "IncomingWebhook" ADD CONSTRAINT "IncomingWebhook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RestrictedToken" ADD CONSTRAINT "RestrictedToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RestrictedToken" ADD CONSTRAINT "RestrictedToken_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomFieldResponse" ADD CONSTRAINT "CustomFieldResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CustomFieldResponse" ADD CONSTRAINT "CustomFieldResponse_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "DocumentView"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantArea" ADD CONSTRAINT "UserTenantArea_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantArea" ADD CONSTRAINT "UserTenantArea_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantArea" ADD CONSTRAINT "UserTenantArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantArea" ADD CONSTRAINT "UserTenantArea_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AreaRole"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AreaRole" ADD CONSTRAINT "AreaRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AreaRole" ADD CONSTRAINT "AreaRole_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaRoleFeature" ADD CONSTRAINT "AreaRoleFeature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AreaRoleFeature" ADD CONSTRAINT "AreaRoleFeature_areaRoleId_fkey" FOREIGN KEY ("areaRoleId") REFERENCES "AreaRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaRoleFeature" ADD CONSTRAINT "AreaRoleFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestHierarchy" ADD CONSTRAINT "RequestHierarchy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestHierarchyLevel" ADD CONSTRAINT "RequestHierarchyLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestHierarchyLevel" ADD CONSTRAINT "RequestHierarchyLevel_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "RequestHierarchy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_hierarchyLevelId_fkey" FOREIGN KEY ("hierarchyLevelId") REFERENCES "RequestHierarchyLevel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "RequestHierarchy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_requestWorkflowId_fkey" FOREIGN KEY ("requestWorkflowId") REFERENCES "RequestWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestCategoryForm" ADD CONSTRAINT "RequestCategoryForm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategoryForm" ADD CONSTRAINT "RequestCategoryForm_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RequestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestCategoryForm" ADD CONSTRAINT "RequestCategoryForm_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLA" ADD CONSTRAINT "SLA_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SLA" ADD CONSTRAINT "SLA_requestCategoryId_fkey" FOREIGN KEY ("requestCategoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SLAChangeLog" ADD CONSTRAINT "SLAChangeLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SLAChangeLog" ADD CONSTRAINT "SLAChangeLog_slaId_fkey" FOREIGN KEY ("slaId") REFERENCES "SLA"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GuideDocument" ADD CONSTRAINT "GuideDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GuideDocument" ADD CONSTRAINT "GuideDocument_requestCategoryId_fkey" FOREIGN KEY ("requestCategoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_requirementTypeId_fkey" FOREIGN KEY ("requirementTypeId") REFERENCES "RequirementType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategoryRequirement" ADD CONSTRAINT "RequestCategoryRequirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategoryRequirement" ADD CONSTRAINT "RequestCategoryRequirement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequestCategoryRequirement" ADD CONSTRAINT "RequestCategoryRequirement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RequirementType" ADD CONSTRAINT "RequirementType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentHierarchy" ADD CONSTRAINT "AssignmentHierarchy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentHierarchy" ADD CONSTRAINT "AssignmentHierarchy_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentHierarchyLevel" ADD CONSTRAINT "AssignmentHierarchyLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentHierarchyLevel" ADD CONSTRAINT "AssignmentHierarchyLevel_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "AssignmentHierarchy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategory" ADD CONSTRAINT "AssignmentCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategory" ADD CONSTRAINT "AssignmentCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "AssignmentCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategory" ADD CONSTRAINT "AssignmentCategory_hierarchyLevelId_fkey" FOREIGN KEY ("hierarchyLevelId") REFERENCES "AssignmentHierarchyLevel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategory" ADD CONSTRAINT "AssignmentCategory_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "AssignmentHierarchy"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategory" ADD CONSTRAINT "AssignmentCategory_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategoryForm" ADD CONSTRAINT "AssignmentCategoryForm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssignmentCategoryForm" ADD CONSTRAINT "AssignmentCategoryForm_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssignmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentCategoryForm" ADD CONSTRAINT "AssignmentCategoryForm_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormSubmissionKey" ADD CONSTRAINT "FormSubmissionKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormSubmissionKey" ADD CONSTRAINT "FormSubmissionKey_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionFlowDefinition" ADD CONSTRAINT "ExecutionFlowDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionFlowDefinition" ADD CONSTRAINT "ExecutionFlowDefinition_requestCategoryId_fkey" FOREIGN KEY ("requestCategoryId") REFERENCES "RequestCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionNodeDefinition" ADD CONSTRAINT "ExecutionNodeDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionNodeDefinition" ADD CONSTRAINT "ExecutionNodeDefinition_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ExecutionFlowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEdgeDefinition" ADD CONSTRAINT "ExecutionEdgeDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionEdgeDefinition" ADD CONSTRAINT "ExecutionEdgeDefinition_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ExecutionFlowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEdgeDefinition" ADD CONSTRAINT "ExecutionEdgeDefinition_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExecutionNodeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEdgeDefinition" ADD CONSTRAINT "ExecutionEdgeDefinition_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "ExecutionNodeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionNodeGuide" ADD CONSTRAINT "ExecutionNodeGuide_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionNodeGuide" ADD CONSTRAINT "ExecutionNodeGuide_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "GuideDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionNodeGuide" ADD CONSTRAINT "ExecutionNodeGuide_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ExecutionNodeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelInstance" ADD CONSTRAINT "ExecutionModelInstance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionModelInstance" ADD CONSTRAINT "ExecutionModelInstance_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ExecutionFlowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelInstance" ADD CONSTRAINT "ExecutionModelInstance_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionModelLog" ADD CONSTRAINT "ExecutionModelLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionModelLog" ADD CONSTRAINT "ExecutionModelLog_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "ExecutionModelInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelLog" ADD CONSTRAINT "ExecutionModelLog_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ExecutionNodeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelHistory" ADD CONSTRAINT "ExecutionModelHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExecutionModelHistory" ADD CONSTRAINT "ExecutionModelHistory_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "ExecutionModelInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelHistory" ADD CONSTRAINT "ExecutionModelHistory_previousFlowId_fkey" FOREIGN KEY ("previousFlowId") REFERENCES "ExecutionFlowDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionModelHistory" ADD CONSTRAINT "ExecutionModelHistory_newFlowId_fkey" FOREIGN KEY ("newFlowId") REFERENCES "ExecutionFlowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoleFeature" ADD CONSTRAINT "RoleFeature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoleFeature" ADD CONSTRAINT "RoleFeature_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoleFeature" ADD CONSTRAINT "RoleFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userTenantOneId_fkey" FOREIGN KEY ("userTenantOneId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userTenantTwoId_fkey" FOREIGN KEY ("userTenantTwoId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_identificationTypeId_fkey" FOREIGN KEY ("identificationTypeId") REFERENCES "IdentificationType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "IdentificationType" ADD CONSTRAINT "IdentificationType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

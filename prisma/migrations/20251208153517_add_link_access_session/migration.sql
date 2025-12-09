BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[LinkAccessSession] (
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LinkAccessSession_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    [deletedAt] DATETIME2,
    [createdBy] VARCHAR(50),
    [updatedBy] VARCHAR(50),
    [tenantId] NVARCHAR(1000) NOT NULL,
    [id] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [viewId] NVARCHAR(1000) NOT NULL,
    [linkId] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [ipAddress] NVARCHAR(1000),
    [userAgent] NVARCHAR(1000),
    CONSTRAINT [LinkAccessSession_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LinkAccessSession_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkAccessSession_token_idx] ON [dbo].[LinkAccessSession]([token]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkAccessSession_viewId_idx] ON [dbo].[LinkAccessSession]([viewId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkAccessSession_linkId_idx] ON [dbo].[LinkAccessSession]([linkId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkAccessSession_expiresAt_idx] ON [dbo].[LinkAccessSession]([expiresAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LinkAccessSession_tenantId_idx] ON [dbo].[LinkAccessSession]([tenantId]);

-- AddForeignKey
ALTER TABLE [dbo].[LinkAccessSession] ADD CONSTRAINT [LinkAccessSession_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW;

END CATCH


/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Accounts] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Accounts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[refresh_token_expires_in] INT,
[updatedAt] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Users] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL,
[username] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[Sessions] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sessions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Sessions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Sessions_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[Authenticators] (
    [credentialID] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [credentialPublicKey] NVARCHAR(1000) NOT NULL,
    [counter] INT NOT NULL,
    [credentialDeviceType] NVARCHAR(1000) NOT NULL,
    [credentialBackedUp] BIT NOT NULL,
    [transports] NVARCHAR(1000),
    CONSTRAINT [Authenticators_pkey] PRIMARY KEY CLUSTERED ([userId],[credentialID]),
    CONSTRAINT [Authenticators_credentialID_key] UNIQUE NONCLUSTERED ([credentialID])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Sessions_userId_idx] ON [dbo].[Sessions]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Accounts_userId_idx] ON [dbo].[Accounts]([userId]);

-- CreateIndex
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [Users_username_key] UNIQUE NONCLUSTERED ([username]);

-- AddForeignKey
ALTER TABLE [dbo].[Sessions] ADD CONSTRAINT [Sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Authenticators] ADD CONSTRAINT [Authenticators_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Account] DROP CONSTRAINT [Account_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Post] DROP CONSTRAINT [Post_createdById_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Session] DROP CONSTRAINT [Session_userId_fkey];

-- DropTable
DROP TABLE [dbo].[Account];

-- DropTable
DROP TABLE [dbo].[Post];

-- DropTable
DROP TABLE [dbo].[Session];

-- DropTable
DROP TABLE [dbo].[User];

-- DropTable
DROP TABLE [dbo].[VerificationToken];

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [emailVerified] DATETIME2,
    [image] NVARCHAR(1000),
    [password] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [Users_role_df] DEFAULT 'USER',
    [isTwoFactorEnabled] BIT NOT NULL CONSTRAINT [Users_isTwoFactorEnabled_df] DEFAULT 0,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Accounts] (
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
    CONSTRAINT [Accounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Accounts_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationTokens] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationTokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VerificationTokens_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [VerificationTokens_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[PasswordResetTokens] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [PasswordResetTokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasswordResetTokens_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [PasswordResetTokens_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[TwoFactorTokens] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [TwoFactorTokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TwoFactorTokens_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [TwoFactorTokens_email_token_key] UNIQUE NONCLUSTERED ([email],[token])
);

-- CreateTable
CREATE TABLE [dbo].[TwoFactorConfirmations] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [TwoFactorConfirmations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TwoFactorConfirmations_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Accounts] ADD CONSTRAINT [Accounts_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TwoFactorConfirmations] ADD CONSTRAINT [TwoFactorConfirmations_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

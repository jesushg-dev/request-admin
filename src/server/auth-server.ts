import { cache } from 'react';
import { headers } from 'next/headers';
import { sso } from '@better-auth/sso';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  emailOTP,
  genericOAuth,
  jwt,
  magicLink,
  multiSession,
  oAuthProxy,
  oidcProvider,
  oneTap,
  openAPI,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from 'better-auth/plugins';

import { sendChangeEmailVerification, sendInvitationEmail, sendMagicLink, sendResetPassword, sendVerificationEmail, sendVerificationOTP } from '@/lib/mail';
import { comparePassword, hashPassword } from '@/lib/password';
import { PrismaModules } from '@/../prisma/module';

import { db } from './db-client';

/**
 * Initializes global modules and features if they don't exist,
 * then enables all modules for the new tenant by default.
 * Optimized to minimize database queries using createMany.
 */
async function initializeModulesAndEnableForTenant(tenantId: string, userId: string) {
  // Get all active global modules in one query
  let allModules = await db.module.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });

  // Create global modules and features if they don't exist
  if (allModules.length === 0) {
    for (const [, applicationModule] of Object.entries(PrismaModules)) {
      await db.module.create({
        data: {
          name: applicationModule.name.es,
          description: applicationModule.description.es,
          createdBy: 'system',
          feature: {
            create: Object.entries(applicationModule.features).map(([, feature]) => ({
              name: feature.name.es,
              key: feature.action,
              description: feature.description.es,
              scope: feature.scope,
              createdBy: 'system',
            })),
          },
        },
      });
    }

    // Re-fetch modules after creation
    allModules = await db.module.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });
  }

  // Get existing TenantModule records to avoid duplicates
  const existingTenantModules = await db.tenantModule.findMany({
    where: { tenantId },
    select: { moduleId: true },
  });

  const existingModuleIds = new Set(existingTenantModules.map((tm) => tm.moduleId));

  // Filter out modules that are already enabled for this tenant
  const modulesToEnable = allModules.filter((module) => !existingModuleIds.has(module.id));

  // Enable all modules for the tenant using createMany for better performance
  if (modulesToEnable.length > 0) {
    await db.tenantModule.createMany({
      data: modulesToEnable.map((module) => ({
        tenantId,
        moduleId: module.id,
        isEnabled: true,
        createdBy: userId,
      })),
    });
  }
}

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  database: prismaAdapter(db, {
    provider: 'sqlserver',
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: comparePassword,
    },
    sendResetPassword,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification,
    },
    additionalFields: {
      isGlobalAdmin: {
        input: false,
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: process.env.APP_NAME || 'Requestum',
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendVerificationOTP(user.email, otp, 'two-factor');
        },
      },
    }),
    jwt(),
    openAPI(),
    oAuthProxy(),
    multiSession(),
    bearer(),
    sso(),
    oidcProvider({
      loginPage: '/sign-in',
    }),
    organization({
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
        defaultTeam: {
          enabled: false, 
        },
      },
      sendInvitationEmail: async (data) => {
        await sendInvitationEmail({
          id: data.invitation.id,
          role: data.role,
          email: data.email,
          organizationName: data.organization.name,
          invitedByName: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
        });
      },
      organizationHooks: {
        // After creating an organization, initialize modules and features
        afterCreateOrganization: async ({ organization, member, user }) => {
          const tenantId = organization.id;

          // Initialize global modules and features if they don't exist,
          // then enable all modules for the new tenant by default
          await initializeModulesAndEnableForTenant(tenantId, user.id);
        },
      },
      schema: {
        organization: {
          modelName: 'Tenant',
          additionalFields: {
            websiteUrl: {
              type: 'string',
              input: true,
              required: false,
            },
            title: {
              type: 'string',
              input: true,
              required: false,
            },
            description: {
              type: 'string',
              input: true,
              required: false,
            },
            primaryColor: {
              type: 'string',
              input: true,
              required: false,
            },
            secondaryColor: {
              type: 'string',
              input: true,
              required: false,
            },
            contactEmail: {
              type: 'string',
              input: true,
              required: false,
            },
            contactPhone: {
              type: 'string',
              input: true,
              required: false,
            },
            address: {
              type: 'string',
              input: true,
              required: false,
            },
          },
        },
        member: {
          modelName: 'UserTenant',
          fields: {
            organizationId: 'tenantId',
          },
          additionalFields: {
            isActive: {
              type: 'boolean',
              input: true,
              required: false,
              defaultValue: true,
            },
          },
        },
        invitation: {
          modelName: 'InvitationTenant',
          fields: {
            organizationId: 'tenantId',
          },
        },
        team: {
          modelName: 'Area',
          fields: {
            organizationId: 'tenantId',
          },
        },
        teamMember: {
          modelName: 'UserTenantArea',
          fields: {
            teamId: 'areaId',
            userId: 'userTenantId',
            organizationId: 'tenantId',
          },
          additionalFields: {
            tenantId: {
              type: 'string',
              input: false, // We'll set it via hook, not from user input
              required: true,
            },
            roleId: {
              type: 'string',
              input: false, // We'll set it via hook, not from user input
              required: true,
            },
          },
        },
        session: {
          fields: {
            activeOrganizationId: 'activeTenantId',
          },
        },
      },
    }),
    admin(),
    apiKey({
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60 * 60 * 24, // 1 day
        maxRequests: 1000, // 1,000 requests per day
      },
      keyExpiration: {
        minExpiresIn: 1, // 1 day
        maxExpiresIn: 365, // 1 year
        defaultExpiresIn: 7, // 7 days
      },
    }),
    oneTap(),
    genericOAuth({
      config: [],
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        sendVerificationOTP(email, otp, type);
      },
    }),
    magicLink({
      sendMagicLink({ email, token, url }) {
        sendMagicLink(email, token, url);
      },
    }),
    phoneNumber(),
    anonymous(),
    username(),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});

/**
 * Gets the current session with request-level caching.
 * Uses React's cache() to ensure the session is only fetched once per request,
 * avoiding duplicate database queries.
 */
export const currentSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireSession() {
  const session = await currentSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireUser() {
  const session = await requireSession();
  return session.user;
}

/**
 * Gets the active tenant ID from the current session.
 * Returns null if no active tenant is set or if there's no session.
 */
export async function getActiveTenantId(): Promise<string | null> {
  const session = await currentSession();
  if (!session) {
    return null;
  }
  
  // Better Auth stores activeOrganizationId in the session
  // We mapped it to activeTenantId in the schema configuration
  return (session as any).activeTenantId || null;
}

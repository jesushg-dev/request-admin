import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { Link, redirect } from '@/i18n/routing';
import { auth, currentSession, getActiveTenantId } from '@/server/auth-server';
import { db } from '@/server/db-client';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Building2, ExternalLink, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/shared/empty-state';
import { ExternalWebsiteLink } from '@/components/common/tenant/external-website-link';

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('pages.tenants.title')} - ${t('brandName')}`,
    description: t('pages.tenants.description'),
  };
}

interface ITenantPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Admin tenants selection page
 * 
 * Handles authentication and automatic redirection:
 * - Validates session (real authentication check)
 * - Redirects to tenant creation if user has no tenants
 * - Redirects to single tenant if user has exactly one tenant
 * - Shows tenant selection if user has multiple tenants
 */
import { TenantCard } from '@/components/common/tenant/tenant-card';

export default async function TenantsPage(props: ITenantPageProps) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale, namespace: 'tenants.tenants' });

  // REAL AUTHENTICATION CHECK: Validate session properly
  const session = await currentSession();
  if (!session) {
    return redirect({ href: '/auth/login', locale: 'en' });
  }

  // Use direct Prisma client (not ZenStack) because we need to query all tenants
  // before activeTenantId is set. ZenStack policies require activeTenantId to be set.
  const tenants = await db.tenant.findMany({
    where: { userTenants: { some: { userId: session.user.id, isActive: true } } },
    select: { id: true, name: true, logo: true, description: true, websiteUrl: true },
  });

  // Auto-redirect logic: If user has no tenants, redirect to creation page
  if (tenants.length === 0) {
    return redirect({ href: '/admin/global/tenants/new', locale });
  }

  // Auto-redirect logic: If user has exactly one tenant, redirect to that tenant
  if (tenants.length === 1) {
    const singleTenantId = tenants[0].id;
    const currentActiveTenantId = await getActiveTenantId();

    // Set activeOrganization if not already set
    if (currentActiveTenantId !== singleTenantId) {
      try {
        await auth.api.setActiveOrganization({
          body: {
            organizationId: singleTenantId,
          },
          headers: await headers(),
        });
      } catch (error) {
        console.error('Error setting active organization:', error);
      }
    }

    return redirect({
      href: { pathname: '/admin/[tenantId]', params: { tenantId: singleTenantId } },
      locale
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-6 overflow-hidden px-4 py-6 sm:px-6 lg:py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/20">
            <Sparkles className="h-7 w-7 text-white" />
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('brandName')}</h1>
            <p className="text-sm text-muted-foreground">Select your organization</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-right">
          <p className="text-sm font-medium text-foreground">{t('header.messageLine1')}</p>
          <p className="text-sm text-muted-foreground">{t('header.messageLine2')}</p>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Tenant List */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {tenants.length === 0 ? (
          <EmptyState
            title="No organizations available"
            description="You don't have access to any organizations yet. Contact your administrator to get started."
            icons={[Building2]}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Organizations</h2>
              <Badge variant="secondary" className="text-xs">
                {tenants.length} {tenants.length === 1 ? 'organization' : 'organizations'}
              </Badge>
            </div>
            <ScrollArea className="flex flex-1">
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {tenants.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

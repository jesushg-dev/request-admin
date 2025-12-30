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
  const t = await getTranslations({ locale , namespace: 'metadata' });

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
export default async function TenantsPage(props: ITenantPageProps) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale , namespace: 'tenants.tenants' });

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
    return redirect({ href: '/admin/global/tenants/new', locale  });
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
                  <Card
                    key={tenant.id}
                    className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <CardContent className="p-0">
                      <Link
                        className="relative flex w-full flex-col gap-4 p-6 text-left transition-colors hover:bg-muted/30"
                        href={{ pathname: '/admin/[tenantId]', params: { tenantId: tenant.id } }}
                      >
                        {/* Header with Avatar and Arrow */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 ring-2 ring-background transition-all duration-300 group-hover:border-primary/30 group-hover:bg-muted/50">
                              <Avatar className="h-12 w-12 ring-2 ring-background">
                                <AvatarImage src={tenant.logo ?? ''} alt={tenant.name} className="object-contain" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                  <Building2 className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex flex-1 flex-col gap-1 min-w-0">
                              <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                {tenant.name}
                              </h3>
                              {tenant.websiteUrl && (
                                <ExternalWebsiteLink
                                  href={tenant.websiteUrl}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit website
                                </ExternalWebsiteLink>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                        </div>

                        {/* Description */}
                        {tenant.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{tenant.description}</p>
                        )}

                        {/* Hover gradient effect */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

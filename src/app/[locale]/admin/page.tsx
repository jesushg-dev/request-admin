import { Link, redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function TenantsPage() {
  const t = await getTranslations('tenants.tenants');

  const session = await currentSession();
  if (!session) return redirect({ href: '/', locale: 'en' });

  const db = await getDb();
  const tenants = await db.tenant.findMany({
    where: { userTenants: { some: { userId: session.user.id, isActive: true } } },
    select: { id: true, name: true, logo: true, description: true, websiteUrl: true },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-4 overflow-hidden py-4 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold">RE</span>
          </div>
          <h1 className="text-ms font-semibold">{t('brandName')}</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end">
          <p className="text-center text-base">{t('header.messageLine1')}</p>
          <p className="text-center text-base">{t('header.messageLine2')}</p>
        </div>
      </div>

      {/* Tenant List */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-hidden">
        <ScrollArea className="flex flex-1 gap-4">
          <div className="flex flex-col gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg">
                <CardContent className="p-0">
                  <Link className="hover:bg-accent relative flex w-full items-center gap-6 px-6 py-4 text-left" href={{ pathname: '/admin/[tenantId]', params: { tenantId: tenant.id } }}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed">
                      <Avatar>
                        <AvatarImage src={tenant.logo ?? ''} alt={tenant.name} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                        <AvatarFallback>RE</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="text-lg font-semibold">{tenant.name}</h3>
                      <p className="line-clamp-2 text-xs">{tenant.description}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

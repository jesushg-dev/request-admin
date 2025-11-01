import { getPathname, Link, redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, MoreHorizontal, Palette, Pencil, Trash2, User, Users } from 'lucide-react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataroomDocuments } from '@/components/common/data-room/dataroom-documents';
import { MetadataItem } from '@/components/shared/metadata-item';

interface DataroomDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function DataroomDetailPage({ params }: DataroomDetailPageProps) {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewDataRooms = auth.hasPermissions([PermissionActions.DATA_ROOM.VIEW]);
  
  if (!canViewDataRooms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  const canEdit = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.DATA_ROOM.DELETE]);

  const t = await getTranslations('admin.dataroom.view');

  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug } } });

  const db = await getDb();
  const dataroom = await db.dataroom.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, createdBy: true, createdAt: true, updatedAt: true, _count: { select: { documents: true, viewers: true } } },
  });

  if (!dataroom) {
    return redirect({ href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } }, locale });
  }

  return (
    <div className="flex flex-col gap-4 p-4 flex-1">
      <Card>
        <CardHeader>
          <div className="flex gap-2 w-full items-center justify-between">
            <CardTitle className="text-2xl pb-0">{dataroom.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">{t('actions.actions')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions.dataroomActions')}</DropdownMenuLabel>
                {canEdit && (
                  <DropdownMenuItem>
                    <Link
                      className="flex items-center flex-1"
                      href={{
                        pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit',
                        query: { callbackUrl },
                        params: { tenantId, slug },
                      }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('actions.editDataroom')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link
                    className="flex items-center flex-1"
                    href={{
                      pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers',
                      query: { callbackUrl },
                      params: { tenantId, slug },
                    }}>
                    <Users className="mr-2 h-4 w-4" />
                    {t('actions.manageViewers')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    className="flex items-center flex-1"
                    href={{
                      pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/branding',
                      query: { callbackUrl },
                      params: { tenantId, slug },
                    }}>
                    <Palette className="mr-2 h-4 w-4" />
                    {t('actions.customizeBranding')}
                  </Link>
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('actions.deleteDataroom')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{dataroom.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <MetadataItem icon={<FileText className="h-4 w-4" />} label={t('metadata.documents')} value={dataroom._count.documents} />
            <MetadataItem icon={<Users className="h-4 w-4" />} label={t('metadata.viewers')} value={dataroom._count.viewers} />
            <MetadataItem icon={<User className="h-4 w-4" />} label={t('metadata.owner')} value={dataroom.createdBy} />
            <MetadataItem icon={<Calendar className="h-4 w-4" />} label={t('metadata.created')} value={format(dataroom.createdAt, 'MMM d, yyyy')} />
            <MetadataItem icon={<Clock className="h-4 w-4" />} label={t('metadata.updated')} value={dataroom.updatedAt ? format(dataroom.updatedAt, 'MMM d, yyyy') : t('metadata.notAvailable')} />
          </div>
        </CardContent>
      </Card>

      <DataroomDocuments dataroomId={dataroom.id} tenantId={tenantId} callbackUrl={callbackUrl} />
    </div>
  );
}

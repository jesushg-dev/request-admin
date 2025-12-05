import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, Link, redirect } from '@/i18n/routing';
import { getDb } from '@/server/db-client';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, MoreVertical, Palette, Pencil, Trash2, User, Users } from 'lucide-react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataroomContent } from '@/components/common/data-room/dataroom-content';
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

  // Fetch folders for tree navigation with same structure as DataroomFolderDefaultArgs
  const folders = await db.dataroomFolder.findMany({
    where: { tenantId, dataroomId: slug },
    select: {
      id: true,
      name: true,
      parentId: true,
      dataroomId: true,
      createdAt: true,
      _count: { select: { documents: true, childFolders: true } },
    },
  });

  return (
    <div className="flex flex-col h-full flex-1 bg-background">
      {/* Header - Google Drive Style */}
      <div className="px-6 pt-4 pb-3 border-b bg-background">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <h1 className="text-2xl font-normal text-foreground flex-1 min-w-0 truncate">{dataroom.name}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
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
        </div>
        {dataroom.description && <p className="text-sm text-muted-foreground mt-1 truncate">{dataroom.description}</p>}
      </div>

      {/* Main Content with Tree Navigation */}
      <div className="flex-1 overflow-hidden min-h-0">
        <DataroomContent dataroomId={dataroom.id} tenantId={tenantId} callbackUrl={callbackUrl} folders={folders} />
      </div>

      {/* Footer - Metadata */}
      <div className="px-6 py-2 border-t bg-background w-full flex justify-end">
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground uppercase tracking-wide font-medium">{t('metadata.documents')}</span>
            <span className="text-foreground font-semibold">{dataroom._count.documents}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground uppercase tracking-wide font-medium">{t('metadata.viewers')}</span>
            <span className="text-foreground font-semibold">{dataroom._count.viewers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground uppercase tracking-wide font-medium">{t('metadata.owner')}</span>
            <span className="text-foreground font-semibold truncate max-w-[120px]">{dataroom.createdBy}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground uppercase tracking-wide font-medium">{t('metadata.created')}</span>
            <span className="text-foreground font-semibold">{format(dataroom.createdAt, 'MMM d, yyyy')}</span>
          </div>
          {dataroom.updatedAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground uppercase tracking-wide font-medium">{t('metadata.updated')}</span>
              <span className="text-foreground font-semibold">{format(dataroom.updatedAt, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

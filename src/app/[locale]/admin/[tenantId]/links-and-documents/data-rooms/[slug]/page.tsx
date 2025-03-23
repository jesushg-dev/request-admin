import { getPathname, Link, redirect } from '@/i18n/routing';
import { db } from '@/server/db-client';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, ExternalLink, FileText, MoreHorizontal, Palette, Pencil, Trash2, User, Users } from 'lucide-react';
import { Locale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataroomDocuments } from '@/components/common/data-rooms/dataroom-documents';

interface DataroomDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function DataroomDetailPage({ params }: DataroomDetailPageProps) {
  const { locale, tenantId, slug } = await params;
  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug } } });

  const dataroom = await db.dataroom.findFirst({
    where: { id: slug, tenantId },
  });

  if (!dataroom) {
    return redirect({ href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } }, locale });
  }

  return (
    <div className="flex flex-col gap-4 p-4 flex-1">
      <Card>
        <CardHeader>
          <div className="flex gap-2 w-full items-center justify-between">
            <div className="flex gap-2">
              <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } }} className="text-sm text-muted-foreground hover:text-foreground p-1 flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span className="sr-only">Back</span>
              </Link>
              <CardTitle className="text-2xl pb-0">{dataroom.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Dataroom Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Dataroom
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Viewers
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Palette className="mr-2 h-4 w-4" />
                  Customize Branding
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Create Shareable Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Dataroom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{dataroom.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Documents
              </span>
              <span className="text-2xl font-bold">{dataroom.documentCount}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Viewers
              </span>
              <span className="text-2xl font-bold">{dataroom.viewerCount}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-1" />
                Owner
              </span>
              <span className="text-sm font-medium">{dataroom.createdBy.name}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created
              </span>
              <span className="text-sm font-medium">{format(dataroom.createdAt, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Updated
              </span>
              <span className="text-sm font-medium">{format(dataroom.updatedAt, 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataroomDocuments dataroomId={dataroom.id} tenantId={tenantId} callbackUrl={callbackUrl} />
    </div>
  );
}

import { getPathname, Link, redirect } from '@/i18n/routing';
import { db } from '@/server/db-client';
import { FileText, MoreHorizontal, Palette, Pencil, Trash2, Users } from 'lucide-react';
import { Locale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataroomBranding } from '@/components/common/data-rooms/dataroom-branding';
import { DataroomDocuments } from '@/components/common/data-rooms/dataroom-documents';
import { DataroomViewerGroups } from '@/components/common/data-rooms/dataroom-viewer-groups';

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="documents" className="w-full">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{dataroom.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{dataroom.description || 'No description provided'}</p>
            </div>
            <div className="flex gap-2">
              <TabsList>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="viewers">
                  <Users className="h-4 w-4 mr-2" />
                  Viewer Groups
                </TabsTrigger>
                <TabsTrigger value="branding">
                  <Palette className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
              </TabsList>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit', params: { tenantId, slug } }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename Dataroom
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Dataroom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="documents">
            <DataroomDocuments dataroomId={dataroom.id} tenantId={tenantId} callbackUrl={callbackUrl} />
          </TabsContent>

          <TabsContent value="viewers">
            <DataroomViewerGroups dataroomId={dataroom.id} />
          </TabsContent>

          <TabsContent value="branding">
            <DataroomBranding dataroomId={dataroom.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

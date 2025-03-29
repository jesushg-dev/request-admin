'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useFindUniqueDataroom } from '@/services/api/hooks';
import { ArrowLeft, FileKey2, Globe, Mail, MoreHorizontal, Plus, Shield, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import { DataroomViewerDetailDefaultArgs } from '@/types/prisma/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/shared/empty-state';

import { AccessControlManagement } from './access-control-management';
import { DomainSettingsManagement } from './domain-settings-management';
import { MembersManagement } from './members-management';

interface DataroomViewerGroupsProps {
  tenantId: string;
  dataroomId: string;
}

export function DataroomViewerGroups({ tenantId, dataroomId }: DataroomViewerGroupsProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data, isLoading } = useFindUniqueDataroom({ ...DataroomViewerDetailDefaultArgs, where: { tenantId, id: dataroomId } });

  const handleDeleteGroup = (id: string) => {
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
    }
    toast.success('Group deleted successfully');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
      <div className="md:col-span-1 flex-1 flex overflow-hidden">
        <Card className="flex-1 flex-col flex overflow-hidden">
          <CardHeader>
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <Button size="icon" variant="ghost" asChild>
                  <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { slug: dataroomId, tenantId } }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <CardTitle>Viewer Groups</CardTitle>
              </div>
              <Button size="icon" variant="outline" asChild>
                <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers/new', params: { slug: dataroomId, tenantId } }}>
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>Manage access control for different viewer groups</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.viewerGroups.length === 0 ? (
              <EmptyState
                className="flex-1"
                icons={[Users, FileKey2, Globe]}
                title="No Viewer Groups"
                description="Create a viewer group to manage access control"
                actions={[
                  { label: 'Create Viewer Group', icon: Plus, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers/new', params: { slug: dataroomId, tenantId } } },
                ]}
              />
            ) : (
              <div className="space-y-2">
                {data?.viewerGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${selectedGroupId === group.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedGroupId(group.id)}>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium">{group.name}</span>
                        {group.allowAll && (
                          <Badge variant="outline" className="ml-2">
                            <Globe className="h-3 w-3 mr-1" />
                            All Access
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        <span>
                          {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                        </span>
                        {group.domains.length > 0 && (
                          <>
                            <span className="mx-1">•</span>
                            <Mail className="h-3 w-3 mr-1" />
                            <span>
                              {group.domains.length} domain{group.domains.length !== 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 flex-1 flex overflow-hidden">
        {selectedGroupId ? (
          <Card className="flex-1 flex-col flex overflow-hidden">
            <CardHeader>
              <CardTitle>{data?.viewerGroups.find((g) => g.id === selectedGroupId)?.name || 'Group Details'}</CardTitle>
              <CardDescription>Manage viewers and access settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-6 flex-1 flex-col flex overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex-col flex overflow-hidden">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="members" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="access" className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Control
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">
                    <Globe className="h-4 w-4 mr-2" />
                    Domain Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-0 p-6 space-y-6 flex-1 flex-col overflow-hidden">
                  <MembersManagement tenantId={tenantId} dataroomId={dataroomId} selectedGroupId={selectedGroupId} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="access" className="mt-0 p-6 space-y-6 flex-1 flex-col overflow-hidden">
                  <AccessControlManagement
                    tenantId={tenantId}
                    isLoading={isLoading}
                    dataroomId={dataroomId}
                    folders={data?.folders || []}
                    documents={data?.documents || []}
                    selectedGroupId={selectedGroupId}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-0 p-6 space-y-6 flex-1 flex-col overflow-hidden">
                  <DomainSettingsManagement tenantId={tenantId} dataroomId={dataroomId} selectedGroupId={selectedGroupId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            className="flex-1"
            icons={[Users, FileKey2, Globe]}
            title="Select a Viewer Group"
            description="Choose a viewer group to manage its members and settings"
            actions={[{ label: 'Create Viewer Group', icon: Plus, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers/new', params: { slug: dataroomId, tenantId } } }]}
          />
        )}
      </div>
    </div>
  );
}

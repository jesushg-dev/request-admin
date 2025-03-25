'use client';

import { useEffect, useState } from 'react';
import { Check, Globe, Mail, MoreHorizontal, Plus, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataroomViewerGroupsProps {
  dataroomId: string;
}

interface ViewerGroup {
  id: string;
  name: string;
  memberCount: number;
  domains: string[];
  allowAll: boolean;
  accessControls: AccessControl[];
}

interface Viewer {
  id: string;
  email: string;
  verified: boolean;
  name?: string;
}

interface AccessControl {
  id: string;
  itemId: string;
  itemType: 'DATAROOM_DOCUMENT' | 'DATAROOM_FOLDER';
  itemName: string;
  canView: boolean;
  canDownload: boolean;
}

export function DataroomViewerGroups({ dataroomId }: DataroomViewerGroupsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerGroups, setViewerGroups] = useState<ViewerGroup[]>([]);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isAddViewerDialogOpen, setIsAddViewerDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newViewerEmail, setNewViewerEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupViewers, setGroupViewers] = useState<Viewer[]>([]);
  const [allowedDomains, setAllowedDomains] = useState<string>('');
  const [allowAll, setAllowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataroomItems, setDataroomItems] = useState<{ id: string; name: string; type: 'DATAROOM_DOCUMENT' | 'DATAROOM_FOLDER' }[]>([]);

  // Mock data for demonstration
  const mockViewerGroups: ViewerGroup[] = [
    {
      id: '1',
      name: 'Investors',
      memberCount: 5,
      domains: ['investor.com', 'vc.com'],
      allowAll: false,
      accessControls: [
        {
          id: 'ac1',
          itemId: 'doc1',
          itemType: 'DATAROOM_DOCUMENT',
          itemName: 'Financial Projections',
          canView: true,
          canDownload: false,
        },
        {
          id: 'ac2',
          itemId: 'folder1',
          itemType: 'DATAROOM_FOLDER',
          itemName: 'Financial Reports',
          canView: true,
          canDownload: true,
        },
      ],
    },
    {
      id: '2',
      name: 'Board Members',
      memberCount: 3,
      domains: [],
      allowAll: true,
      accessControls: [],
    },
    {
      id: '3',
      name: 'Legal Team',
      memberCount: 2,
      domains: ['legal.com'],
      allowAll: false,
      accessControls: [
        {
          id: 'ac3',
          itemId: 'doc2',
          itemType: 'DATAROOM_DOCUMENT',
          itemName: 'Legal Agreement',
          canView: true,
          canDownload: true,
        },
      ],
    },
  ];

  const mockViewers: Record<string, Viewer[]> = {
    '1': [
      { id: '1', email: 'investor1@investor.com', verified: true, name: 'John Investor' },
      { id: '2', email: 'investor2@investor.com', verified: true, name: 'Jane Capital' },
      { id: '3', email: 'investor3@vc.com', verified: false },
      { id: '4', email: 'investor4@vc.com', verified: true, name: 'Robert Fund' },
      { id: '5', email: 'investor5@gmail.com', verified: true, name: 'Alice Angel' },
    ],
    '2': [
      { id: '6', email: 'board1@company.com', verified: true, name: 'Thomas Board' },
      { id: '7', email: 'board2@company.com', verified: true, name: 'Sarah Director' },
      { id: '8', email: 'board3@company.com', verified: true, name: 'Michael Chair' },
    ],
    '3': [
      { id: '9', email: 'legal1@legal.com', verified: true, name: 'David Counsel' },
      { id: '10', email: 'legal2@legal.com', verified: false },
    ],
  };

  // Mock dataroom items for permissions
  const mockDataroomItems = [
    { id: 'doc1', name: 'Financial Projections', type: 'DATAROOM_DOCUMENT' as const },
    { id: 'doc2', name: 'Legal Agreement', type: 'DATAROOM_DOCUMENT' as const },
    { id: 'doc3', name: 'Business Plan', type: 'DATAROOM_DOCUMENT' as const },
    { id: 'folder1', name: 'Financial Reports', type: 'DATAROOM_FOLDER' as const },
    { id: 'folder2', name: 'Legal Documents', type: 'DATAROOM_FOLDER' as const },
  ];

  useEffect(() => {
    // Simulate API call to fetch viewer groups
    const fetchViewerGroups = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setViewerGroups(mockViewerGroups);
        setDataroomItems(mockDataroomItems);
      } catch (error) {
        toast.error('Failed to fetch viewer groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchViewerGroups();
  }, [dataroomId]);

  useEffect(() => {
    if (selectedGroupId) {
      // Simulate API call to fetch viewers for the selected group
      const fetchGroupViewers = async () => {
        try {
          // In a real application, you would fetch from your API
          await new Promise((resolve) => setTimeout(resolve, 500));
          setGroupViewers(mockViewers[selectedGroupId] || []);

          const group = viewerGroups.find((g) => g.id === selectedGroupId);
          if (group) {
            setAllowedDomains(group.domains.join(', '));
            setAllowAll(group.allowAll);
          }
        } catch (error) {
          toast.error('Failed to fetch viewers');
        }
      };

      fetchGroupViewers();
    } else {
      setGroupViewers([]);
      setAllowedDomains('');
      setAllowAll(false);
    }
  }, [selectedGroupId, viewerGroups]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Group name cannot be empty');
      return;
    }

    // In a real application, you would call your API to create the group
    const newGroup: ViewerGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      memberCount: 0,
      domains: [],
      allowAll: false,
      accessControls: [],
    };

    setViewerGroups([...viewerGroups, newGroup]);
    setNewGroupName('');
    setIsCreateGroupDialogOpen(false);

    toast.success(`Group "${newGroupName}" created successfully`);
  };

  const handleAddViewer = () => {
    if (!newViewerEmail.trim() || !selectedGroupId) {
      toast.error('Email address cannot be empty');
      return;
    }

    if (!newViewerEmail.includes('@') || !newViewerEmail.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // In a real application, you would call your API to add the viewer
    const newViewer: Viewer = {
      id: Date.now().toString(),
      email: newViewerEmail,
      verified: false,
    };

    setGroupViewers([...groupViewers, newViewer]);
    setViewerGroups(viewerGroups.map((group) => (group.id === selectedGroupId ? { ...group, memberCount: group.memberCount + 1 } : group)));
    setNewViewerEmail('');
    setIsAddViewerDialogOpen(false);

    toast.success(`Viewer "${newViewerEmail}" added to group`);
  };

  const handleDeleteGroup = (id: string) => {
    // In a real application, you would call your API to delete the group
    setViewerGroups((prev) => prev.filter((group) => group.id !== id));

    if (selectedGroupId === id) {
      setSelectedGroupId(null);
    }

    toast.success('Group deleted successfully');
  };

  const handleRemoveViewer = (id: string) => {
    // In a real application, you would call your API to remove the viewer
    setGroupViewers((prev) => prev.filter((viewer) => viewer.id !== id));

    if (selectedGroupId) {
      setViewerGroups(viewerGroups.map((group) => (group.id === selectedGroupId ? { ...group, memberCount: Math.max(0, group.memberCount - 1) } : group)));
    }

    toast.success('Viewer removed from the group');
  };

  const handleUpdateDomains = () => {
    if (!selectedGroupId) return;

    // Parse domains from comma-separated string
    const domains = allowedDomains
      .split(',')
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    // In a real application, you would call your API to update the domains
    setViewerGroups(viewerGroups.map((group) => (group.id === selectedGroupId ? { ...group, domains, allowAll } : group)));

    toast.success('Group settings updated successfully');
  };

  const handleUpdatePermissions = (itemId: string, permission: 'view' | 'download', value: boolean) => {
    if (!selectedGroupId) return;

    setViewerGroups(
      viewerGroups.map((group) => {
        if (group.id === selectedGroupId) {
          const existingControlIndex = group.accessControls.findIndex((ac) => ac.itemId === itemId);

          if (existingControlIndex >= 0) {
            // Update existing control
            const updatedControls = [...group.accessControls];
            if (permission === 'view') {
              updatedControls[existingControlIndex].canView = value;
            } else {
              updatedControls[existingControlIndex].canDownload = value;
            }
            return { ...group, accessControls: updatedControls };
          } else {
            // Create new control
            const item = dataroomItems.find((i) => i.id === itemId);
            if (!item) return group;

            const newControl: AccessControl = {
              id: `ac_${Date.now()}`,
              itemId,
              itemType: item.type,
              itemName: item.name,
              canView: permission === 'view' ? value : false,
              canDownload: permission === 'download' ? value : false,
            };

            return { ...group, accessControls: [...group.accessControls, newControl] };
          }
        }
        return group;
      })
    );
  };

  const filteredViewers = searchQuery
    ? groupViewers.filter((viewer) => viewer.email.toLowerCase().includes(searchQuery.toLowerCase()) || (viewer.name && viewer.name.toLowerCase().includes(searchQuery.toLowerCase())))
    : groupViewers;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Viewer Groups</span>
              <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Viewer Group</DialogTitle>
                    <DialogDescription>Create a new group to organize viewers and control access.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="group-name" className="text-right">
                        Name
                      </Label>
                      <Input id="group-name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="col-span-3" placeholder="Enter group name" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup}>Create Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Manage access control for different viewer groups</CardDescription>
          </CardHeader>
          <CardContent>
            {viewerGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No viewer groups found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {viewerGroups.map((group) => (
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
                          {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
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

      <div className="md:col-span-2">
        {selectedGroupId ? (
          <Card>
            <CardHeader>
              <CardTitle>{viewerGroups.find((g) => g.id === selectedGroupId)?.name || 'Group Details'}</CardTitle>
              <CardDescription>Manage viewers and access settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                <TabsContent value="members" className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="relative w-full md:w-64">
                      <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Dialog open={isAddViewerDialogOpen} onOpenChange={setIsAddViewerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Viewer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Viewer</DialogTitle>
                          <DialogDescription>Add a viewer to the {viewerGroups.find((g) => g.id === selectedGroupId)?.name} group</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="viewer-email" className="text-right">
                              Email
                            </Label>
                            <Input id="viewer-email" value={newViewerEmail} onChange={(e) => setNewViewerEmail(e.target.value)} className="col-span-3" placeholder="Enter email address" type="email" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddViewerDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddViewer}>Add Viewer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {filteredViewers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center border rounded-lg">
                      <UserPlus className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">{searchQuery ? 'No viewers match your search' : 'No viewers in this group'}</p>
                      {!searchQuery && (
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddViewerDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Viewer
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {filteredViewers.map((viewer) => (
                            <tr key={viewer.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{viewer.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{viewer.name || <span className="text-muted-foreground italic">Not provided</span>}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {viewer.verified ? (
                                  <Badge variant="success" className="flex items-center w-fit">
                                    <Check className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center w-fit">
                                    <X className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveViewer(viewer.id)} className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="access" className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Document & Folder Permissions</h3>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            View
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Download
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {dataroomItems.map((item) => {
                          const accessControl = viewerGroups.find((g) => g.id === selectedGroupId)?.accessControls.find((ac) => ac.itemId === item.id);

                          return (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge variant="outline">{item.type === 'DATAROOM_DOCUMENT' ? 'Document' : 'Folder'}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <Checkbox checked={accessControl?.canView || false} onCheckedChange={(checked) => handleUpdatePermissions(item.id, 'view', checked === true)} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <Checkbox checked={accessControl?.canDownload || false} onCheckedChange={(checked) => handleUpdatePermissions(item.id, 'download', checked === true)} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Access Settings</h3>
                      <Button size="sm" onClick={handleUpdateDomains}>
                        Save Settings
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="allowed-domains">Allowed Email Domains</Label>
                        <Input id="allowed-domains" value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} placeholder="e.g., company.com, example.org (comma separated)" />
                        <p className="text-xs text-muted-foreground">Users with these email domains can automatically join this group</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="allow-all" checked={allowAll} onCheckedChange={setAllowAll} />
                        <Label htmlFor="allow-all">Allow access to all documents</Label>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg border mt-4">
                        <h4 className="font-medium mb-2">Domain Settings Explanation</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span>When you add domains, users with email addresses from those domains can automatically join this group</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span>For example, if you add "company.com", anyone with an email ending in "@company.com" can access this group's documents</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span>The "Allow access to all documents" setting gives this group access to all documents in the dataroom</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <CardDescription>Select a viewer group to manage its members and settings</CardDescription>
              {viewerGroups.length === 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCreateGroupDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Viewer Group
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

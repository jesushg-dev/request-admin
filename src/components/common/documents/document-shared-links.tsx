'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Copy, ExternalLink, LinkIcon, MoreHorizontal, Plus, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentSharedLinksProps {
  documentId: string;
}

interface Link {
  id: string;
  url: string;
  name: string;
  expiresAt: Date | null;
  password: string | null;
  emailProtected: boolean;
  viewCount: number;
  createdAt: Date;
}

export function DocumentSharedLinks({ documentId }: DocumentSharedLinksProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form state for creating links
  const [formState, setFormState] = useState({
    name: '',
    expiresAt: null as Date | null,
    password: '',
    emailProtected: true,
  });

  useEffect(() => {
    // Simulate API call to fetch document links
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock links data
        setLinks([
          {
            id: '1',
            url: 'https://docs.example.com/s/abc123',
            name: 'For Marketing Team',
            expiresAt: new Date('2023-12-31'),
            password: 'secure123',
            emailProtected: true,
            viewCount: 24,
            createdAt: new Date('2023-06-15'),
          },
          {
            id: '2',
            url: 'https://docs.example.com/s/def456',
            name: 'For External Review',
            expiresAt: null,
            password: null,
            emailProtected: true,
            viewCount: 12,
            createdAt: new Date('2023-07-22'),
          },
        ]);
      } catch (error) {
        toast.error('Failed to fetch shared links');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [documentId]);

  const handleCreateLink = () => {
    if (!formState.name.trim()) {
      toast.error('Link name is required');
      return;
    }

    // In a real application, you would call your API to create the link
    const newLink: Link = {
      id: Date.now().toString(),
      url: `https://docs.example.com/s/${Math.random().toString(36).substring(2, 8)}`,
      name: formState.name,
      expiresAt: formState.expiresAt,
      password: formState.password || null,
      emailProtected: formState.emailProtected,
      viewCount: 0,
      createdAt: new Date(),
    };

    setLinks([...links, newLink]);
    setIsCreateLinkDialogOpen(false);
    resetFormState();

    // Copy link to clipboard
    navigator.clipboard.writeText(newLink.url);
    toast.success('Link created and copied to clipboard');
  };

  const handleDeleteLink = (id: string) => {
    // In a real application, you would call your API to delete the link
    setLinks((prev) => prev.filter((link) => link.id !== id));
    toast.success('Link deleted successfully');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const resetFormState = () => {
    setFormState({
      name: '',
      expiresAt: null,
      password: '',
      emailProtected: true,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Shared Links</CardTitle>
              <CardDescription>Manage shareable links for this document</CardDescription>
            </div>
            <div className="h-10 w-36 animate-pulse rounded bg-muted"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/2 rounded bg-muted"></div>
                  <div className="h-3 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/3 rounded bg-muted"></div>
                </div>
                <div className="h-8 w-24 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Shared Links</CardTitle>
            <CardDescription>Manage shareable links for this document</CardDescription>
          </div>
          <Dialog open={isCreateLinkDialogOpen} onOpenChange={setIsCreateLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Shareable Link</DialogTitle>
                <DialogDescription>Create a shareable link for this document</DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Link Name</Label>
                      <Input id="name" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} placeholder="Enter link name" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={'outline'} className={`w-full justify-start text-left font-normal ${!formState.expiresAt ? 'text-muted-foreground' : ''}`}>
                            {formState.expiresAt ? format(formState.expiresAt, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={formState.expiresAt || undefined} onSelect={(date) => setFormState({ ...formState, expiresAt: date })} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password Protection (Optional)</Label>
                      <Input id="password" type="password" value={formState.password} onChange={(e) => setFormState({ ...formState, password: e.target.value })} placeholder="Enter password" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-protected">Email Protection</Label>
                        <div className="text-xs text-muted-foreground">Require visitors to enter their email before viewing</div>
                      </div>
                      <Switch id="email-protected" checked={formState.emailProtected} onCheckedChange={(checked) => setFormState({ ...formState, emailProtected: checked })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLink}>Create Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No shared links</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a link to share this document with others</p>
            <Button onClick={() => setIsCreateLinkDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{link.name}</span>
                    {link.password && <Badge variant="outline">Password Protected</Badge>}
                    {link.emailProtected && <Badge variant="outline">Email Required</Badge>}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-muted-foreground truncate max-w-[300px]">{link.url}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleCopyLink(link.url)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4">
                    <span>Created {format(link.createdAt, 'MMM d, yyyy')}</span>
                    {link.expiresAt && <span>Expires {format(link.expiresAt, 'MMM d, yyyy')}</span>}
                    <span>{link.viewCount} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <Button variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Open
                    </a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleCopyLink(link.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteLink(link.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

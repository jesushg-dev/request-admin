'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Eye, LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface DocumentMetadataProps {
  document: any;
}

export function DocumentMetadata({ document }: DocumentMetadataProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: document.name,
    description: document.description,
    status: document.status.toString(),
    expirationDate: document.expirationDate,
    folderId: document.folderId,
    assistantEnabled: document.assistantEnabled,
    advancedExcelEnabled: document.advancedExcelEnabled,
    downloadOnly: document.downloadOnly,
  });

  // Mock folders for the folder selection dropdown
  const mockFolders = [
    { id: '1', name: 'Financial Reports', path: '/Financial Reports' },
    { id: '2', name: 'Marketing', path: '/Marketing' },
    { id: '3', name: 'HR Documents', path: '/HR Documents' },
    { id: '4', name: '2023', path: '/Financial Reports/2023' },
    { id: '5', name: '2022', path: '/Financial Reports/2022' },
    { id: '6', name: 'Campaigns', path: '/Marketing/Campaigns' },
    { id: '7', name: 'Brand Assets', path: '/Marketing/Brand Assets' },
  ];

  const handleSaveMetadata = async () => {
    setIsSaving(true);
    try {
      // In a real application, you would call your API to update the metadata
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update document with new values
      Object.assign(document, {
        ...formState,
        status: Number.parseInt(formState.status),
      });

      setIsEditDialogOpen(false);
      toast.success('Document metadata updated successfully');
    } catch (error) {
      toast.error('Failed to update document metadata');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Document Details</CardTitle>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Document Metadata</DialogTitle>
                  <DialogDescription>Update the metadata for this document</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Document Name</Label>
                    <Input id="name" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} rows={3} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formState.status} onValueChange={(value) => setFormState({ ...formState, status: value })}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Draft</SelectItem>
                        <SelectItem value="2">Published</SelectItem>
                        <SelectItem value="3">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={'outline'} className={`w-full justify-start text-left font-normal ${!formState.expirationDate ? 'text-muted-foreground' : ''}`}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formState.expirationDate ? format(formState.expirationDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={formState.expirationDate || undefined} onSelect={(date) => setFormState({ ...formState, expirationDate: date })} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="folder">Folder</Label>
                    <Select value={formState.folderId} onValueChange={(value) => setFormState({ ...formState, folderId: value })}>
                      <SelectTrigger id="folder">
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Root (No Folder)</SelectItem>
                        {mockFolders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.path}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="assistant-enabled">AI Assistant</Label>
                      <div className="text-xs text-muted-foreground">Enable AI analysis of this document</div>
                    </div>
                    <Switch id="assistant-enabled" checked={formState.assistantEnabled} onCheckedChange={(checked) => setFormState({ ...formState, assistantEnabled: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="excel-enabled">Advanced Excel Features</Label>
                      <div className="text-xs text-muted-foreground">Enable advanced Excel processing</div>
                    </div>
                    <Switch id="excel-enabled" checked={formState.advancedExcelEnabled} onCheckedChange={(checked) => setFormState({ ...formState, advancedExcelEnabled: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="download-only">Download Only</Label>
                      <div className="text-xs text-muted-foreground">Document can only be downloaded, not viewed</div>
                    </div>
                    <Switch id="download-only" checked={formState.downloadOnly} onCheckedChange={(checked) => setFormState({ ...formState, downloadOnly: checked })} />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMetadata} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Name:</dt>
              <dd>{document.name}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Description:</dt>
              <dd>{document.description}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd>
                <Badge variant={document.status === 2 ? 'success' : 'outline'}>{document.status === 1 ? 'Draft' : document.status === 2 ? 'Published' : 'Archived'}</Badge>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">File Type:</dt>
              <dd className="uppercase">{document.type}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Size:</dt>
              <dd>{document.size} MB</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Pages:</dt>
              <dd>{document.numPages}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Folder:</dt>
              <dd>{document.folderPath}</dd>
            </div>
            {document.expirationDate && (
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-muted-foreground">Expires:</dt>
                <dd>{format(document.expirationDate, 'MMM d, yyyy')}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Created By:</dt>
              <dd>{document.createdBy.name}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Created Date:</dt>
              <dd>{format(document.createdAt, 'MMM d, yyyy')}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Last Modified:</dt>
              <dd>{format(document.updatedAt, 'MMM d, yyyy')}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Storage Type:</dt>
              <dd>{document.storageType === 'VERCEL_BLOB' ? 'Vercel Blob' : 'Amazon S3'}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Content Type:</dt>
              <dd>{document.contentType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">File URL:</dt>
              <dd className="truncate">
                <a href={document.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  <span className="truncate mr-1">{document.url}</span>
                  <LinkIcon className="h-3 w-3" />
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Total Views:</dt>
              <dd className="flex items-center">
                <Eye className="mr-1 h-3 w-3 text-muted-foreground" />
                {document.viewCount}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Features & Settings</CardTitle>
          <CardDescription>Special features enabled for this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex flex-col p-4 border rounded-lg ${document.assistantEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.assistantEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.assistantEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">AI Assistant</h3>
              </div>
              <p className="text-sm text-muted-foreground">AI can analyze and extract data from this document</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.advancedExcelEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.advancedExcelEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.advancedExcelEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">Advanced Excel</h3>
              </div>
              <p className="text-sm text-muted-foreground">Advanced Excel processing features</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.downloadOnly ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.downloadOnly ? 'success' : 'outline'} className="mb-2">
                  {document.downloadOnly ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">Download Only</h3>
              </div>
              <p className="text-sm text-muted-foreground">Document can only be downloaded, not viewed in browser</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

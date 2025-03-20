'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, Download, Eye, FileText, MoreHorizontal, RotateCcw, Star, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DocumentVersionHistoryProps {
  documentId: string;
}

interface Version {
  id: string;
  versionNumber: number;
  name: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    avatar: string;
  };
  size: number;
  isCurrent: boolean;
  changeDescription: string;
}

export function DocumentVersionHistory({ documentId }: DocumentVersionHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeDescription, setChangeDescription] = useState('');

  useEffect(() => {
    // Simulate API call to fetch document versions
    const fetchVersions = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock version data
        setVersions([
          {
            id: 'v3',
            versionNumber: 3,
            name: 'Annual Report 2023 - Final',
            createdAt: new Date('2023-01-15'),
            createdBy: {
              id: '1',
              name: 'John Doe',
              avatar: '/placeholder.svg',
            },
            size: 4.5, // MB
            isCurrent: true,
            changeDescription: 'Final version with executive summary and financial highlights',
          },
          {
            id: 'v2',
            versionNumber: 2,
            name: 'Annual Report 2023 - Draft 2',
            createdAt: new Date('2023-01-10'),
            createdBy: {
              id: '1',
              name: 'John Doe',
              avatar: '/placeholder.svg',
            },
            size: 4.2, // MB
            isCurrent: false,
            changeDescription: 'Updated financial data and fixed formatting issues',
          },
          {
            id: 'v1',
            versionNumber: 1,
            name: 'Annual Report 2023 - Initial Draft',
            createdAt: new Date('2023-01-05'),
            createdBy: {
              id: '2',
              name: 'Jane Smith',
              avatar: '/placeholder.svg',
            },
            size: 3.8, // MB
            isCurrent: false,
            changeDescription: 'Initial draft with preliminary financial data',
          },
        ]);
      } catch (error) {
        toast.error('Failed to fetch document versions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setNewVersionFile(selectedFile);
    }
  };

  const handleUploadVersion = () => {
    if (!newVersionFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!changeDescription) {
      toast.error('Please enter a description of the changes');
      return;
    }

    // In a real application, you would call your API to upload the new version
    toast.success('New version uploaded successfully');
    setIsUploadDialogOpen(false);
    setNewVersionFile(null);
    setChangeDescription('');

    // Simulate adding the new version to the list
    const newVersion: Version = {
      id: `v${versions.length + 1}`,
      versionNumber: versions.length + 1,
      name: `Annual Report 2023 - Version ${versions.length + 1}`,
      createdAt: new Date(),
      createdBy: {
        id: '1',
        name: 'John Doe',
        avatar: '/placeholder.svg',
      },
      size: 4.7, // MB
      isCurrent: true,
      changeDescription: changeDescription,
    };

    // Update the current version
    const updatedVersions = versions.map((v) => ({
      ...v,
      isCurrent: false,
    }));

    setVersions([newVersion, ...updatedVersions]);
  };

  const handleRestoreVersion = (versionId: string) => {
    // In a real application, you would call your API to restore the version
    const updatedVersions = versions.map((v) => ({
      ...v,
      isCurrent: v.id === versionId,
    }));

    setVersions(updatedVersions);
    toast.success('Version restored successfully');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track changes to this document over time</CardDescription>
            </div>
            <div className="h-10 w-36 animate-pulse rounded bg-muted"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-4 p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/2 rounded bg-muted"></div>
                  <div className="h-3 w-1/3 rounded bg-muted"></div>
                </div>
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
            <CardTitle>Version History</CardTitle>
            <CardDescription>Track changes to this document over time</CardDescription>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Version</DialogTitle>
                <DialogDescription>Upload a new version of this document and describe your changes</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="file-upload" className="text-sm font-medium">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">{newVersionFile ? newVersionFile.name : 'Click to upload or drag and drop'}</span>
                      <span className="text-xs text-gray-500">PDF, Word, Excel, PowerPoint (max 50MB)</span>
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="change-description" className="text-sm font-medium">
                    Change Description
                  </label>
                  <textarea
                    id="change-description"
                    className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe the changes in this new version"
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadVersion}>Upload Version</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version) => (
            <div key={version.id} className={`flex gap-4 p-4 border rounded-lg ${version.isCurrent ? 'bg-muted/50 border-primary/20' : ''}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={version.createdBy.avatar} alt={version.createdBy.name} />
                <AvatarFallback>{version.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{version.name}</span>
                  {version.isCurrent && (
                    <Badge variant="success" className="ml-2">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{version.changeDescription}</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{format(version.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <FileText className="mr-1 h-3 w-3" />
                    <span>{version.size} MB</span>
                  </div>
                  <span className="mx-2">•</span>
                  <div>
                    <span>By {version.createdBy.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenu></DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {!version.isCurrent && (
                      <DropdownMenuItem onClick={() => handleRestoreVersion(version.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore This Version
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Star className="mr-2 h-4 w-4" />
                      Mark as Major Version
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

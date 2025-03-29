'use client';

import { useState } from 'react';
import { useFindManyViewer } from '@/services/api/hooks';
import { Check, Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/shared/empty-state';

interface MembersManagementProps {
  tenantId: string;
  isLoading: boolean;
  dataroomId: string;
  selectedGroupId: string;
}

interface Viewer {
  id: string;
  email: string;
  verified: boolean;
  name?: string;
}

export function MembersManagement({ isLoading, tenantId, dataroomId, selectedGroupId }: MembersManagementProps) {
  const [isAddViewerDialogOpen, setIsAddViewerDialogOpen] = useState(false);
  const [newViewerEmail, setNewViewerEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groupViewers = [] } = useFindManyViewer({
    where: {
      tenantId,
      dataroomId,
      id: selectedGroupId,
    },
    select: {
      id: true,
      email: true,
      verified: true,
    },
  });

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

    setNewViewerEmail('');
    setIsAddViewerDialogOpen(false);

    toast.success(`Viewer "${newViewer.email}" added to group`);
  };

  const handleRemoveViewer = (id: string) => {
    // In a real application, you would call your API to remove the viewer
    toast.success('Viewer removed from the group' + ` "${id}"`);
  };

  const filteredViewers = searchQuery ? groupViewers.filter((viewer) => viewer.email.toLowerCase().includes(searchQuery.toLowerCase())) : groupViewers;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
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
              <DialogDescription>Add a viewer to the group</DialogDescription>
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
        <EmptyState
          className="flex-1"
          icons={[UserPlus]}
          title="No Viewers"
          description={searchQuery ? 'No viewers match your search' : 'No viewers in this group'}
          actions={[
            {
              label: 'Add Viewer',
              icon: UserPlus,
              onClick: () => setIsAddViewerDialogOpen(true),
            },
          ]}
        />
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-muted-foreground italic">Not provided</span>
                  </td>
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
    </>
  );
}

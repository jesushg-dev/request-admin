import { Download, FilePlus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Hint } from '@/components/hint';

import { mockAttachments } from './mock-data';

export const Attachments = ({ type }: { type: string }) => {
  return (
    <div>
      <div className="flex gap-4 pb-4">
        {mockAttachments
          .filter((file) => file.type === type)
          .map((file) => (
            <Card key={file.id} className="min-w-[200px]">
              <CardContent className="pt-6">
                <div className="space-y-2 text-center">
                  <Badge variant={file.isActive ? 'default' : 'secondary'}>{file.isActive ? 'Active' : 'Inactive'}</Badge>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-sm">{file.size}</p>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export const AddAttachment = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Hint label="Add New Document">
            <FilePlus className="h-4 w-4" />
          </Hint>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="filename" className="text-right">
              File Name
            </label>
            <Input id="filename" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="file" className="text-right">
              File
            </label>
            <Input id="file" type="file" className="col-span-3" />
          </div>
        </div>
        <Button type="submit">Upload</Button>
      </DialogContent>
    </Dialog>
  );
};

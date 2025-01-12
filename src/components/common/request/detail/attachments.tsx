import { Download, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AttachmentsProps {
  files: { id: number; name: string; type: string; size: string }[];
}

export default function Attachments({ files }: AttachmentsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attachments ({files.length})</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Document
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
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <span className="material-symbols-outlined text-4xl text-muted-foreground">{file.type}</span>
              <p className="mt-2 text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
              <Button variant="ghost" size="sm" className="mt-2">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

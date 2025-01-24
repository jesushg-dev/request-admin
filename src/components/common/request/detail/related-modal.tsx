import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { RelatedIncidentForm } from './related-form';

interface RelatedIncidentModalProps {
  currentRequestId: string;
}

export function RelatedIncidentModal({ currentRequestId }: RelatedIncidentModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Relate Incident</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Relate Incident</DialogTitle>
          <DialogDescription>Relate this request to another incident.</DialogDescription>
        </DialogHeader>
        <RelatedIncidentForm currentRequestId={currentRequestId} onComplete={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

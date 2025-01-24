import { useState } from 'react';
import { LandPlotIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormData = {
  areaId: string;
  statusId: string;
  comment: string;
  slaStart: string;
  slaDeadline: string;
  documents: string[];
};

interface AreaAssignmentFormProps {
  onComplete: () => void;
}

export const mockSLA = {
  id: '1234-5678-9012-3456',
  resolutionTime: 24,
  escalationTime: 12,
  requestCategoryId: 'category-1',
};
export const mockAreas = [
  { id: 'area-1', name: 'IT Support' },
  { id: 'area-2', name: 'HR' },
  { id: 'area-3', name: 'Finance' },
];

export const mockRequestStatusTypes = [
  { id: 'status-1', name: 'Open' },
  { id: 'status-2', name: 'In Progress' },
  { id: 'status-3', name: 'Closed' },
];

export const mockDocuments = [
  { id: 'doc-1', name: 'Report.pdf', url: 'https://example.com/report.pdf', status: 1, requestId: 'request-1' },
  { id: 'doc-2', name: 'Invoice.docx', url: 'https://example.com/invoice.docx', status: 1, requestId: 'request-1' },
  { id: 'doc-3', name: 'Contract.pdf', url: 'https://example.com/contract.pdf', status: 2, requestId: 'request-2' },
  { id: 'doc-4', name: 'Proposal.pptx', url: 'https://example.com/proposal.pptx', status: 1, requestId: 'request-3' },
];

export function AreaAssignmentModal({ onComplete }: AreaAssignmentFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      slaStart: new Date().toISOString().slice(0, 16),
      slaDeadline: new Date(Date.now() + mockSLA.resolutionTime * 60 * 60 * 1000).toISOString().slice(0, 16),
      documents: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Area Assignment Form Data:', data);
    // Here you would typically send this data to your API
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LandPlotIcon className="h-4 w-4" />
          <span className="sr-only">Assign Area</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Area</DialogTitle>
          <DialogDescription>Assign an area to this request and update the status.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRequestStatusTypes.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <textarea className="w-full rounded border p-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slaStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLA Start</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slaDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLA Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value);
                        const maxDate = new Date(form.getValues().slaStart);
                        maxDate.setHours(maxDate.getHours() + mockSLA.resolutionTime);
                        if (selectedDate > maxDate) {
                          e.target.value = maxDate.toISOString().slice(0, 16);
                        }
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Assign Documents</FormLabel>
                  </div>
                  {mockDocuments.map((document) => (
                    <FormField
                      key={document.id}
                      control={form.control}
                      name="documents"
                      render={({ field }) => {
                        return (
                          <FormItem key={document.id} className="flex flex-row items-start space-y-0 space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(document.id)}
                                onCheckedChange={(checked) => {
                                  return checked ? field.onChange([...field.value, document.id]) : field.onChange(field.value?.filter((value) => value !== document.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{document.name}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Assign Area</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

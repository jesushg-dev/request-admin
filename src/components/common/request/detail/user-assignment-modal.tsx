import { useState } from 'react';
import { Checkbox } from '@radix-ui/react-checkbox';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { UserPlusIcon } from 'lucide-react';
import { Select } from 'react-day-picker';
import { Form, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { mockDocuments, mockRequestStatusTypes } from './area-assignment-modal';

export const mockSLA = {
  id: '1234-5678-9012-3456',
  resolutionTime: 24,
  escalationTime: 12,
  requestCategoryId: 'category-1',
};

export const mockCategories = {
  requestCategories: [
    { id: 'req-cat-1', name: 'Technical Issue' },
    { id: 'req-cat-2', name: 'Service Request' },
    { id: 'req-cat-3', name: 'Incident' },
  ],
  assignmentCategories: [
    { id: 'assign-cat-1', name: 'First Level Support' },
    { id: 'assign-cat-2', name: 'Second Level Support' },
    { id: 'assign-cat-3', name: 'Specialist' },
  ],
};

export const mockUsers = [
  { id: 'user-1', name: 'John Doe' },
  { id: 'user-2', name: 'Jane Smith' },
  { id: 'user-3', name: 'Bob Johnson' },
];

type FormData = {
  slaStart: string;
  slaDeadline: string;
  documents: string[];
  userId: string;
  requestCategoryId: string;
  assignmentCategoryId: string;
  statusId: string;
  comment: string;
};

type AreaAssignmentFormProps = {
  onComplete: () => void;
};

export function UserAssignmentModal({ onComplete }: AreaAssignmentFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      slaStart: new Date().toISOString().slice(0, 16),
      slaDeadline: new Date(Date.now() + mockSLA.resolutionTime * 60 * 60 * 1000).toISOString().slice(0, 16),
      documents: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('User Assignment Form Data:', data);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlusIcon className="h-4 w-4" />
          <span className="sr-only">Assign User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
          <DialogDescription>Assign a user to this request and update the status.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign User</FormLabel>
                  <Select onChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
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
              name="requestCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Category</FormLabel>
                  <Select onChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a request category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCategories.requestCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="assignmentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Category</FormLabel>
                  <Select onChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assignment category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCategories.assignmentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                  <Select onChange={field.onChange} defaultValue={field.value}>
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
            <Button type="submit">Assign User</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

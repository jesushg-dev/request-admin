import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { UserPlusIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Mock data (mantenemos los mismos datos de ejemplo)
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
  const formMethods = useForm<FormData>({
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
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={formMethods.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              control={formMethods.control}
              name="requestCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              control={formMethods.control}
              name="assignmentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              control={formMethods.control}
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
              control={formMethods.control}
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
              control={formMethods.control}
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
                        const maxDate = new Date(formMethods.getValues().slaStart);
                        maxDate.setHours(maxDate.getHours() + mockSLA.resolutionTime);

                        if (selectedDate > maxDate) {
                          formMethods.setValue('slaDeadline', maxDate.toISOString().slice(0, 16));
                        } else {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Assign User</Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

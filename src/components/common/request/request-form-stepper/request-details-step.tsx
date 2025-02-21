'use client';

import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import Select, { OptionType } from '@/components/select/select';

export const requestDetailSchema = z.object({
  id: z.string(),
  issueSubject: z.string(),
  description: z.string().max(5000).optional(),
  comment: z.string().max(255).optional(),
  priorityId: z.object({ value: z.string(), label: z.string() }),
  statusId: z.object({ value: z.string(), label: z.string() }),
});

export type RequestDetailValues = z.infer<typeof requestDetailSchema>;

export const getDefaultDetailsValues = () => ({
  id: generateUuid(),
  issueSubject: '',
  description: '',
  comment: '',
  priorityId: { value: '', label: '' },
  statusId: { value: '', label: '' },
});

interface RequestDetailsStepProps {
  statusesOptions: OptionType[];
  prioritiesOptions: OptionType[];
}

const RequestDetailsStep: FC<RequestDetailsStepProps> = ({ statusesOptions, prioritiesOptions }) => {
  const { control } = useFormContext<RequestDetailValues>();

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 mx-1">
        <FormField
          control={control}
          name="issueSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Subject</FormLabel>
              <FormControl>
                <Input id="issueSubject" placeholder="Enter issue subject" {...field} />
              </FormControl>
              <FormDescription>Issue Subject is used to describe the main issue of the request.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <FormField
            control={control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} onChange={field.onChange} options={statusesOptions} />
                </FormControl>
                <FormDescription>Status is used to determine the current state of the request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="priorityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} onChange={field.onChange} options={prioritiesOptions} />
                </FormControl>
                <FormDescription>Priority is used to determine the order in which requests are handled.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea id="description" placeholder="Enter description" {...field} />
              </FormControl>
              <FormDescription>Description is used to provide more information about the request.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Input id="comment" placeholder="Enter comment" {...field} />
              </FormControl>
              <FormDescription>Comment is used to provide even more information about the request.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </ScrollArea>
  );
};

export default RequestDetailsStep;

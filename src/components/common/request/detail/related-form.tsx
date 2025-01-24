import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { mockRequests } from '../mockData';
import { Request, type RelatedIncident } from '../types/relatedIncident';

interface RelatedIncidentFormProps {
  currentRequestId: string;
}

export function RelatedIncidentForm({ currentRequestId }: RelatedIncidentFormProps) {
  const form = useForm<RelatedIncident>({
    defaultValues: {
      requestId: currentRequestId,
    },
  });

  const onSubmit = (data: RelatedIncident) => {
    console.log('Related Incident Form Data:', data);
    // Here you would typically send this data to your API
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="relatedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Incident</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a related incident" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockRequests
                    .filter((request) => request.id !== currentRequestId)
                    .map((request) => (
                      <SelectItem key={request.id} value={request.id}>
                        {request.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Related Incident</Button>
      </form>
    </Form>
  );
}

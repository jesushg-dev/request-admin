import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const mockRequests: Request[] = [
  { id: 'request-1', title: 'Network Issue' },
  { id: 'request-2', title: 'Software Bug' },
  { id: 'request-3', title: 'Hardware Failure' },
  { id: 'request-4', title: 'Access Problem' },
];
export interface RelatedIncident {
  id: string;
  requestId: string;
  relatedId: string;
}

export interface Request {
  id: string;
  title: string;
  // Add other relevant fields here
}

interface RelatedIncidentFormProps {
  currentRequestId: string;
  onComplete?: () => void;
}

export function RelatedIncidentForm({ currentRequestId, onComplete }: RelatedIncidentFormProps) {
  const form = useForm<RelatedIncident>({
    defaultValues: {
      requestId: currentRequestId,
    },
  });

  const onSubmit = (data: RelatedIncident) => {
    console.log('Related Incident Form Data:', data);
    if (onComplete) {
      onComplete();
    }
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

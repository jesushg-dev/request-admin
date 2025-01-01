'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Datos simulados para clientes y estados
const mockClients = [
  { id: 'client1', name: 'Client 1' },
  { id: 'client2', name: 'Client 2' },
];

const mockStatuses = [
  { id: 'status1', name: 'Open' },
  { id: 'status2', name: 'In Progress' },
];

export default function RequestDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="m-1 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Request Details</h2>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client</Label>
        <Select onValueChange={(value) => register('requestDetails.clientId').onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {mockClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.requestDetails?.clientId && <p className="text-sm text-red-500">{errors.requestDetails.clientId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issueSubject">Issue Subject</Label>
        <Input id="issueSubject" {...register('requestDetails.issueSubject')} />
        {errors.requestDetails?.issueSubject && <p className="text-sm text-red-500">{errors.requestDetails.issueSubject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('requestDetails.description')} />
        {errors.requestDetails?.description && <p className="text-sm text-red-500">{errors.requestDetails.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select onValueChange={(value) => register('requestDetails.priority').onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {errors.requestDetails?.priority && <p className="text-sm text-red-500">{errors.requestDetails.priority.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Input id="comment" {...register('requestDetails.comment')} />
        {errors.requestDetails?.comment && <p className="text-sm text-red-500">{errors.requestDetails.comment.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalDocuments">Additional Documents</Label>
        <Input id="additionalDocuments" type="file" multiple {...register('requestDetails.additionalDocuments')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="statusId">Status</Label>
        <Select onValueChange={(value) => register('requestDetails.statusId').onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {mockStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.requestDetails?.statusId && <p className="text-sm text-red-500">{errors.requestDetails.statusId.message}</p>}
      </div>
    </div>
  );
}

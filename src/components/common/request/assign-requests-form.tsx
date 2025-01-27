'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface User {
  id: string;
  name: string;
}

export interface Request {
  id: string;
  title: string;
}

export interface IFormInput {
  userId: string;
  requestIds?: string[];
}

const users: User[] = [
  { id: '1', name: 'Usuario 1' },
  { id: '2', name: 'Usuario 2' },
  { id: '3', name: 'Usuario 3' },
];

const requests: Request[] = [
  { id: '1', title: 'Solicitud 1' },
  { id: '2', title: 'Solicitud 2' },
  { id: '3', title: 'Solicitud 3' },
  { id: '4', title: 'Solicitud 4' },
  { id: '5', title: 'Solicitud 5' },
];

const formSchema = z.object({
  userId: z.string().min(1, 'Debes seleccionar un usuario'),
  requestIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una solicitud'),
});

export default function AssignRequestsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IFormInput>({
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'requestIds',
  });

  async function onSubmit(values: IFormInput) {
    setIsSubmitting(true);
    console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
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

        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`requestIds.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{index === 0 ? 'Solicitudes' : `Solicitud ${index + 1}`}</FormLabel>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una solicitud" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {requests.map((request) => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {index > 0 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar otra solicitud
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Asignar solicitudes'}
        </Button>
      </form>
    </Form>
  );
}

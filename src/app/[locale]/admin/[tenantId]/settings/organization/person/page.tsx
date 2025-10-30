'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const personFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  phone: z.string().optional(),
  identificationNumber: z.string().min(1, {
    message: 'Identification number is required.',
  }),
  identificationTypeId: z.string({
    error: 'Please select an identification type.',
  }),
  image: z.string().optional(),
});

type PersonFormValues = z.infer<typeof personFormSchema>;

// Mock data for identification types
const identificationTypes = [
  { id: 'id_1', name: 'National ID' },
  { id: 'id_2', name: 'Passport' },
  { id: 'id_3', name: "Driver's License" },
  { id: 'id_4', name: 'Social Security Number' },
  { id: 'id_5', name: 'Tax ID' },
];

export default function PersonForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Default values for the form
  const defaultValues: PersonFormValues = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    identificationNumber: '123-45-6789',
    identificationTypeId: 'id_1',
    image: '',
  };

  const form = useForm({
    resolver: zodResolver(personFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  // Eliminar todas las notificaciones y alertas
  function onSubmit(data: PersonFormValues) {
    setIsLoading(true);

    // Simplemente usar console.log
    console.log('Actualizando información personal:', data);

    setTimeout(() => {
      console.log('Información personal actualizada');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Person Information</CardTitle>
        <CardDescription>Manage your personal information specific to this organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Organization-specific information</AlertTitle>
          <AlertDescription>This information is specific to your profile within this organization and may differ from your account profile or other organizations.</AlertDescription>
        </Alert>

        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Person" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Change photo
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>This phone number is unique within this organization.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identificationTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identification Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select identification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {identificationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                name="identificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identification Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123-45-6789" {...field} />
                    </FormControl>
                    <FormDescription>This identification number is unique within this organization.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

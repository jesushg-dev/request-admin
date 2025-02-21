'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, { message: 'error.firstNameRequired' }),
  lastName: z.string().min(1, { message: 'error.lastNameRequired' }),
  phone: z.string().min(1, { message: 'error.phoneRequired' }),
  identificationNumber: z.string().min(1, { message: 'error.identificationNumberRequired' }),
  identificationTypeId: z.string().min(1, { message: 'error.identificationTypeRequired' }),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

// Mock data for identification types (replace with actual data fetching)
const identificationTypes = [
  { id: '1', name: 'Passport' },
  { id: '2', name: "Driver's License" },
  { id: '3', name: 'National ID' },
];

type PersonFormProps = {
  index: number;
};

export function PersonForm({ index }: PersonFormProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      {/* First Name */}
      <FormField
        control={control}
        name={`tenants.${index}.personalInfo.firstName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'personal.firstName'}</FormLabel>
            <FormControl>
              <Input placeholder="Enter first name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Last Name */}
      <FormField
        control={control}
        name={`tenants.${index}.personalInfo.lastName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'personal.lastName'}</FormLabel>
            <FormControl>
              <Input placeholder="Enter last name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone */}
      <FormField
        control={control}
        name={`tenants.${index}.personalInfo.phone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'personal.phone'}</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Identification Number */}
      <FormField
        control={control}
        name={`tenants.${index}.personalInfo.identificationNumber`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'personal.identificationNumber'}</FormLabel>
            <FormControl>
              <Input placeholder="Enter identification number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Identification Type */}
      <FormField
        control={control}
        name={`tenants.${index}.personalInfo.identificationTypeId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'personal.identificationType'}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an identification type" />
                </SelectTrigger>
                <SelectContent>
                  {identificationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

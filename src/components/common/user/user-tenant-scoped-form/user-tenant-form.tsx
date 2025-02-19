'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CustomCheckbox } from './custom-checkbox';
import { PersonForm } from './person-form';

// ===================
// Zod Schemas
// ===================
// Schema for personal information fields
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, { message: 'error.firstNameRequired' }),
  lastName: z.string().min(1, { message: 'error.lastNameRequired' }),
  phone: z.string().min(1, { message: 'error.phoneRequired' }),
  identificationNumber: z.string().min(1, { message: 'error.identificationNumberRequired' }),
  identificationTypeId: z.string().min(1, { message: 'error.identificationTypeRequired' }),
});

// Schema for a tenant entry
export const tenantSchema = z.object({
  tenantId: z.string().nonempty({ message: 'error.tenantRequired' }),
  isActive: z.boolean(),
  isTermAccepted: z.boolean(),
  isSuperAdmin: z.boolean(),
  personalInfo: personalInfoSchema.optional(),
});

// Schema for the entire form
export const userTenantFormSchema = z.object({
  tenants: z.array(tenantSchema),
});

// Type for the form values
export type UserTenantFormValues = z.infer<typeof userTenantFormSchema>;

// ===================
// Component
// ===================

// Mock data for tenants (replace with actual data fetching)
const tenants = [
  { id: '1', name: 'Tenant 1' },
  { id: '2', name: 'Tenant 2' },
  { id: '3', name: 'Tenant 3' },
];

export function UserTenantForm() {
  const { control } = useFormContext<UserTenantFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tenants',
  });

  return (
    <div className="m-1 flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">Tenant {index + 1}</h3>

          {/* Tenant selection field */}
          <FormField
            control={control}
            name={`tenants.${index}.tenantId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{'tenant.select'}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Active Checkbox */}
          <FormField
            control={control}
            name={`tenants.${index}.isActive`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomCheckbox id={`tenants.${index}.isActive`} checked={field.value} onCheckedChange={field.onChange} label="tenant.active" description="Enable this tenant for the user" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accept Terms Checkbox */}
          <FormField
            control={control}
            name={`tenants.${index}.isTermAccepted`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomCheckbox
                    id={`tenants.${index}.isTermAccepted`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="tenant.acceptTerms"
                    description="User accepts the terms and conditions for this tenant"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Super Admin Checkbox */}
          <FormField
            control={control}
            name={`tenants.${index}.isSuperAdmin`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomCheckbox
                    id={`tenants.${index}.isSuperAdmin`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="tenant.superAdmin"
                    description="Grant super administrative privileges for this tenant"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dialog to edit personal information */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{'tenant.editPersonalInfo'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Personal Information for Tenant {index + 1}</DialogTitle>
                <DialogDescription>Make changes to your personal information for this tenant.</DialogDescription>
              </DialogHeader>
              <PersonForm index={index} />
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={() => remove(index)}>
            {'tenant.remove'}
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={() =>
          append({
            tenantId: '', // tenantId must be selected by the user
            isActive: true,
            isTermAccepted: false,
            isSuperAdmin: false,
            personalInfo: {
              firstName: '',
              lastName: '',
              phone: '',
              identificationNumber: '',
              identificationTypeId: '',
            },
          })
        }>
        {'tenant.add'}
      </Button>

      <Button type="button">{'tenant.associateInformation'}</Button>
    </div>
  );
}

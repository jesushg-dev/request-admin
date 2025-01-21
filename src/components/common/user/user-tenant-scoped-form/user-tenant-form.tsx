'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CustomCheckbox } from './custom-checkbox';
import { PersonForm } from './person-form';

// Mock data for tenants (replace with actual data fetching)
const tenants = [
  { id: '1', name: 'Tenant 1' },
  { id: '2', name: 'Tenant 2' },
  { id: '3', name: 'Tenant 3' },
];

export function UserTenantForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tenants',
  });

  return (
    <div className="m-1 flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">Tenant {index + 1}</h3>
          <div>
            <Label htmlFor={`tenants.${index}.tenantId`}>Select Tenant</Label>
            <Select onValueChange={(value) => register(`tenants.${index}.tenantId`).onChange(value)}>
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
            {errors.tenants?.[index]?.tenantId && <p className="text-red-500">{errors.tenants[index].tenantId.message}</p>}
          </div>
          <div>
            <CustomCheckbox id={`tenants.${index}.isActive`} {...register(`tenants.${index}.isActive`)} label="Active" description="Enable this tenant for the user" />
          </div>
          <div>
            <CustomCheckbox
              id={`tenants.${index}.isTermAccepted`}
              {...register(`tenants.${index}.isTermAccepted`)}
              label="Accept Terms"
              description="User accepts the terms and conditions for this tenant"
            />
          </div>
          <div>
            <CustomCheckbox
              id={`tenants.${index}.isSuperAdmin`}
              {...register(`tenants.${index}.isSuperAdmin`)}
              label="Super Admin"
              description="Grant super administrative privileges for this tenant"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Personal Info</Button>
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
            Remove Tenant
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ isActive: true, isTermAccepted: false, isSuperAdmin: false, personalInfo: {} })}>
        Add Tenant
      </Button>
      <Button type="button">Associate Information to All Tenants</Button>
    </div>
  );
}

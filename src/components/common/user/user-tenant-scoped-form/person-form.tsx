'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`tenants.${index}.personalInfo.firstName`}>First Name</Label>
        <Input id={`tenants.${index}.personalInfo.firstName`} {...register(`tenants.${index}.personalInfo.firstName`)} />
        {errors.tenants?.[index]?.personalInfo?.firstName && <p className="text-red-500">{errors.tenants[index].personalInfo.firstName.message}</p>}
      </div>
      <div>
        <Label htmlFor={`tenants.${index}.personalInfo.lastName`}>Last Name</Label>
        <Input id={`tenants.${index}.personalInfo.lastName`} {...register(`tenants.${index}.personalInfo.lastName`)} />
        {errors.tenants?.[index]?.personalInfo?.lastName && <p className="text-red-500">{errors.tenants[index].personalInfo.lastName.message}</p>}
      </div>
      <div>
        <Label htmlFor={`tenants.${index}.personalInfo.phone`}>Phone</Label>
        <Input id={`tenants.${index}.personalInfo.phone`} {...register(`tenants.${index}.personalInfo.phone`)} />
        {errors.tenants?.[index]?.personalInfo?.phone && <p className="text-red-500">{errors.tenants[index].personalInfo.phone.message}</p>}
      </div>
      <div>
        <Label htmlFor={`tenants.${index}.personalInfo.identificationNumber`}>Identification Number</Label>
        <Input id={`tenants.${index}.personalInfo.identificationNumber`} {...register(`tenants.${index}.personalInfo.identificationNumber`)} />
        {errors.tenants?.[index]?.personalInfo?.identificationNumber && <p className="text-red-500">{errors.tenants[index].personalInfo.identificationNumber.message}</p>}
      </div>
      <div>
        <Label htmlFor={`tenants.${index}.personalInfo.identificationTypeId`}>Identification Type</Label>
        <Select onValueChange={(value) => setValue(`tenants.${index}.personalInfo.identificationTypeId`, value)}>
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
        {errors.tenants?.[index]?.personalInfo?.identificationTypeId && <p className="text-red-500">{errors.tenants[index].personalInfo.identificationTypeId.message}</p>}
      </div>
    </div>
  );
}

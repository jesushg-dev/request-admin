'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mock data for roles (replace with actual data fetching)
const roles = [
  { id: '1', name: 'Admin', modules: [{ name: 'Users', permissions: [{ name: 'Create' }, { name: 'Read' }, { name: 'Update' }, { name: 'Delete' }] }] },
  { id: '2', name: 'Editor', modules: [{ name: 'Content', permissions: [{ name: 'Create' }, { name: 'Read' }, { name: 'Update' }] }] },
  { id: '3', name: 'Viewer', modules: [{ name: 'Reports', permissions: [{ name: 'Read' }] }] },
];

export function UserRoleForm() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'roles',
  });
  const [selectedRoles, setSelectedRoles] = useState<((typeof roles)[0] | null)[]>(fields.map(() => null));

  const handleRoleChange = (roleId: string, index: number) => {
    setValue(`roles.${index}.roleId`, roleId);
    setSelectedRoles((prev) => {
      const newSelectedRoles = [...prev];
      newSelectedRoles[index] = roles.find((role) => role.id === roleId) || null;
      return newSelectedRoles;
    });
  };

  return (
    <div className="m-1 flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">Role {index + 1}</h3>
          <div>
            <Label htmlFor={`roles.${index}.roleId`}>Select Role</Label>
            <Select onValueChange={(value) => handleRoleChange(value, index)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roles?.[index]?.roleId && <p className="text-red-500">{errors.roles[index].roleId.message}</p>}
          </div>

          {selectedRoles[index] && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">View Role Details</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <h3 className="font-bold">{selectedRoles[index]?.name} Modules:</h3>
                    <ul>
                      {selectedRoles[index]?.modules.map((module, moduleIndex) => (
                        <li key={moduleIndex}>
                          {module.name}: {module.permissions.map((p) => p.name).join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button variant="destructive" onClick={() => remove(index)}>
            Remove Role
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ roleId: '' })}>
        Add Role
      </Button>
    </div>
  );
}

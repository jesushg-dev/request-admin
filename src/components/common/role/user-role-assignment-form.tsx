'use client';

import React, { FC, useMemo } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Control, FieldErrors, useController, useFieldArray, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import Select, { OptionType } from '@/components/custom-ui/select';

import { type TUserRoleAssignmentSchema } from '@/services/schemas/role';

// Base schema for defineStepper (without internationalization)
// This is used only for the stepper definition
export const userRoleAssignmentFormSchema = z.object({
  userRoles: z.array(
    z.object({
      id: z.string().uuid().default(generateUuid),
      isActive: z.boolean().default(true),
      userId: z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
      roleId: z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    })
  ),
});

export type userRoleAssignmentFormValues = TUserRoleAssignmentSchema;

export const getDefaultUserRole = (role: OptionType) => ({
  id: generateUuid(),
  userId: { value: '', label: '' },
  roleId: { value: String(role.value), label: role.label },
  isActive: true,
});

interface UserRoleAssignmentFormProps {
  userOptions: OptionType[];
  roleOptions: OptionType[];
}

export const UserRoleAssignmentForm: FC<UserRoleAssignmentFormProps> = ({ userOptions, roleOptions }) => {
  const t = useTranslations('component.userRoleAssignmentForm');
  const { control, formState } = useFormContext<userRoleAssignmentFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'userRoles',
    keyName: '_id',
  });

  const onAppendUser = () => {
    if (roleOptions.length === 0) {
      toast.warning(t('user.toast.noRoles'));
      return;
    }
    const newUser = {
      ...getDefaultUserRole(roleOptions.length === 1 ? roleOptions[0] : { value: '', label: '' }),
    };
    append(newUser);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <ScrollArea className="w-full flex-1 overflow-y-hidden">
          <div className="mx-1 mr-4 flex flex-col gap-2">
            {fields.map((row, index) => (
              <div key={row._id || index} className="flex w-full items-center gap-4 border rounded-md p-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 flex-1 items-center">
                  <UserSelectField index={index} userArray={userOptions} selectedUsers={fields.map((u) => u.userId.value)} control={control} errors={formState.errors} />
                  {roleOptions.length > 1 && <RoleSelectField index={index} roleArray={roleOptions} control={control} errors={formState.errors} />}
                  <FormField
                    control={control}
                    name={`userRoles.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`userRoles.${index}.isActive`} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor={`userRoles.${index}.isActive`}>{t('user.active.label')}</FormLabel>
                          <FormDescription>{field.value ? t('user.active.description.true') : t('user.active.description.false')}</FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                  <Trash className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={onAppendUser}>
          <Plus className="mr-2 size-4" />
          {t('user.add')}
        </Button>
      </CardContent>
    </Card>
  );
};

interface UserSelectFieldProps {
  index: number;
  userArray: OptionType[];
  selectedUsers: string[];
  control: Control<userRoleAssignmentFormValues>;
  errors: FieldErrors<userRoleAssignmentFormValues>;
}

export const UserSelectField: FC<UserSelectFieldProps> = ({ index, userArray, selectedUsers, control, errors }) => {
  const t = useTranslations('component.userRoleAssignmentForm');
  const { field } = useController({ name: `userRoles.${index}.userId`, control });

  const filteredUsers = useMemo(() => {
    const currentValue = field.value?.value;
    return userArray.filter((opt) => opt.value === currentValue || !selectedUsers.includes(String(opt.value)));
  }, [userArray, selectedUsers, field.value]);

  return (
    <FormItem className="flex-1">
      <FormLabel>{t('user.label')}</FormLabel>
      <FormControl>
        <Select value={field.value} options={filteredUsers} onChange={(selected) => field.onChange(selected || null)} className="w-full" />
      </FormControl>
      <FormDescription>{filteredUsers.length === 0 ? t('user.description.none') : t('user.description.select')}</FormDescription>
      <FormMessage>{errors.userRoles?.[index]?.userId?.value?.message || errors.userRoles?.[index]?.userId?.label?.message || errors.userRoles?.[index]?.userId?.message}</FormMessage>
    </FormItem>
  );
};

interface RoleSelectFieldProps {
  index: number;
  roleArray: OptionType[];
  control: Control<userRoleAssignmentFormValues>;
  errors: FieldErrors<userRoleAssignmentFormValues>;
}

export const RoleSelectField: FC<RoleSelectFieldProps> = ({ index, roleArray, control, errors }) => {
  const t = useTranslations('component.userRoleAssignmentForm');
  const { field } = useController({ name: `userRoles.${index}.roleId`, control });
  const currentValue = field.value?.value;

  return (
    <FormItem className="flex-1">
      <FormLabel>{t('role.label')}</FormLabel>
      <FormControl>
        <Select
          value={roleArray.find((r) => r.value === currentValue) || null}
          options={roleArray}
          onChange={(selected) => field.onChange(selected ? { value: selected.value, label: selected.label } : { value: '', label: '' })}
          className="w-full"
        />
      </FormControl>
      <FormDescription>{t('role.description')}</FormDescription>
      <FormMessage>{errors.userRoles?.[index]?.roleId?.value?.message || errors.userRoles?.[index]?.roleId?.label?.message || errors.userRoles?.[index]?.roleId?.message}</FormMessage>
    </FormItem>
  );
};
export default UserRoleAssignmentForm;

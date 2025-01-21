'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { CustomCheckbox } from './custom-checkbox';

export function UserForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="m-1 flex flex-col gap-4">
      <div>
        <Label htmlFor="user.username">Username</Label>
        <Input id="user.username" {...register('user.username')} />
        {errors.user?.username && <p className="text-red-500">{errors.user.username.message as string}</p>}
      </div>
      <div>
        <Label htmlFor="user.email">Email</Label>
        <Input id="user.email" type="email" {...register('user.email')} />
        {errors.user?.email && <p className="text-red-500">{errors.user.email.message as string}</p>}
      </div>
      <div>
        <Label htmlFor="user.password">Password</Label>
        <Input id="user.password" type="password" {...register('user.password')} />
        {errors.user?.password && <p className="text-red-500">{errors.user.password.message as string}</p>}
      </div>
      <CustomCheckbox id="user.isTwoFactorEnabled" {...register('user.isTwoFactorEnabled')} label="Enable Two-Factor Authentication" description="Add an extra layer of security to your account" />
      <CustomCheckbox id="user.isGlobalAdmin" {...register('user.isGlobalAdmin')} label="Global Admin" description="Grant global administrative privileges across all tenants" />
    </div>
  );
}

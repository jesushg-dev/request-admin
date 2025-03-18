'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const userTenantFormSchema = z.object({
  isActive: z.boolean().default(true),
  isTermAccepted: z.boolean().default(false),
  isSuperAdmin: z.boolean().default(false),
  isTwoFactorRequired: z.boolean().default(false),
  role: z.string().min(1, {
    message: 'Please select a role.',
  }),
  areas: z.array(z.string()).default([]),
});

type UserTenantFormValues = z.infer<typeof userTenantFormSchema>;

// Mock data for roles and areas
const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'user', name: 'Regular User' },
  { id: 'guest', name: 'Guest' },
];

const areas = [
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'support', name: 'Customer Support' },
  { id: 'development', name: 'Development' },
  { id: 'finance', name: 'Finance' },
];

export default function UserTenantForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLeavingOrg, setIsLeavingOrg] = useState(false);

  // Default values for the form
  const defaultValues: Partial<UserTenantFormValues> = {
    isActive: true,
    isTermAccepted: false,
    isSuperAdmin: false,
    isTwoFactorRequired: false,
    role: 'user',
    areas: ['sales', 'support'],
  };

  const form = useForm<UserTenantFormValues>({
    resolver: zodResolver(userTenantFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: UserTenantFormValues) {
    setIsLoading(true);

    // Simplemente usar console.log
    console.log('Actualizando configuración de roles:', data);

    setTimeout(() => {
      console.log('Configuración de roles actualizada');
      setIsLoading(false);
    }, 1000);
  }

  function handleLeaveOrganization() {
    setIsLeavingOrg(true);

    // Simplemente usar console.log
    console.log('Abandonando organización');

    setTimeout(() => {
      console.log('Has abandonado la organización');
      setIsLeavingOrg(false);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles & Access</CardTitle>
          <CardDescription>Manage your roles, permissions, and access within the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Account Status</h3>
                <p className="text-sm text-muted-foreground">Configure your account status within this organization.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Account</FormLabel>
                        <FormDescription>Your account is active in this organization.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTermAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Terms Accepted</FormLabel>
                        <FormDescription>You have accepted the organization's terms and conditions.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTwoFactorRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Two-Factor Required</FormLabel>
                        <FormDescription>Two-factor authentication is required for this organization.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium">Role & Permissions</h3>
                <p className="text-sm text-muted-foreground">Set your role and permissions within the organization.</p>
              </div>

              <Alert variant="default" className="mb-6">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Super Admin Access</AlertTitle>
                <AlertDescription>Super admins have full access to all features and settings within the organization.</AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="isSuperAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-base">Super Admin</FormLabel>
                        <Badge variant="destructive">Powerful</Badge>
                      </div>
                      <FormDescription>Grant super admin privileges to this account.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Your role determines your permissions within the organization.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium">Area Access</h3>
                <p className="text-sm text-muted-foreground mb-4">Select the areas you have access to within the organization.</p>

                <FormField
                  control={form.control}
                  name="areas"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {areas.map((area) => (
                          <div key={area.id} className="flex items-start space-x-2 rounded-md border p-4">
                            <Checkbox
                              id={`area-${area.id}`}
                              checked={field.value?.includes(area.id)}
                              onCheckedChange={(checked) => {
                                const updatedAreas = checked ? [...field.value, area.id] : field.value?.filter((value) => value !== area.id);
                                field.onChange(updatedAreas);
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label htmlFor={`area-${area.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {area.name}
                              </label>
                              <p className="text-sm text-muted-foreground">Access to {area.name.toLowerCase()} area and its features.</p>
                            </div>
                          </div>
                        ))}
                      </div>
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

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Leave Organization</CardTitle>
          <CardDescription>Permanently remove yourself from this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>This action cannot be undone. You will lose access to all resources in this organization.</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            When you leave an organization, you will no longer have access to any of the organization's resources, including projects, documents, and settings. Your account will remain active, but you
            will be removed from this organization.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Leave Organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove your account from this organization and remove your access to all of its resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeaveOrganization} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLeavingOrg}>
                  {isLeavingOrg ? 'Leaving...' : 'Yes, leave organization'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

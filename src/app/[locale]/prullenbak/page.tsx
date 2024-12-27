'use client';

import { admin } from '@/actions/admin';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RoleGate } from '@/components/auth/role-gate';
import { FormSuccess } from '@/components/prullenbak/form-success';

const AdminPage = () => {
  const onServerActionClick = async () => {
    try {
      const data = await admin();

      if (data.error) {
        toast.error(data.error);
      }

      if (data.success) {
        toast.success(data.success);
      }
    } catch (error) {
      toast.error('An error occurred while performing the server action.');
      console.error(error);
    }
  };

  const onApiRouteClick = async () => {
    try {
      const response = await fetch('/api/admin');

      if (response.ok) {
        toast.success('Allowed API Route!');
      } else {
        toast.error('Forbidden API Route!');
      }
    } catch (error) {
      toast.error('An error occurred while accessing the API route.');
      console.error(error);
    }
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">🔑 Admin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole="ADMIN">
          <FormSuccess message="You are allowed to see this content!" />
        </RoleGate>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only API Route</p>
          <Button onClick={onApiRouteClick}>Click to test</Button>
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only Server Action</p>
          <Button onClick={onServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;

import { Metadata } from 'next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesTable } from '@/components/common/security/roles-table';
import { UsersTable } from '@/components/common/security/users-table';
import { StatCard } from '@/components/stat-card';

export const metadata: Metadata = {
  title: 'Security Dashboard',
  description: "A comprehensive view of your system's security status",
};

export default function SecurityDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Security Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="2,350" description="Active accounts in the system" addLink="/users/add" viewLink="/users" />
        <StatCard title="Active Roles" value="15" description="Defined system roles" addLink="/roles/add" viewLink="/roles" />
        <StatCard title="Failed Login Attempts" value="23" description="In the last 24 hours" addLink="/security/login-attempts/add" viewLink="/security/login-attempts" />
        <StatCard title="Password Resets" value="8" description="Requests in the last 7 days" addLink="/security/password-resets/add" viewLink="/security/password-resets" />
      </div>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UsersTable />
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <RolesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

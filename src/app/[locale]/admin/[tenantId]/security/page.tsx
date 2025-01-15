import { Metadata } from 'next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesTable } from '@/components/common/security/roles-table';
import { StatsCard } from '@/components/common/security/stats-card';
import { UsersTable } from '@/components/common/security/users-table';

export const metadata: Metadata = {
  title: 'Security Dashboard',
  description: "A comprehensive view of your system's security status",
};

export default function SecurityDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Security Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value="2,350" description="Active accounts in the system" trend="no-change" addLink="/users/add" viewLink="/users" />
        <StatsCard title="Active Roles" value="15" description="Defined system roles" trend="no-change" addLink="/roles/add" viewLink="/roles" />
        <StatsCard title="Failed Login Attempts" value="23" description="In the last 24 hours" trend="no-change" addLink="/security/login-attempts/add" viewLink="/security/login-attempts" />
        <StatsCard title="Password Resets" value="8" description="Requests in the last 7 days" trend="no-change" addLink="/security/password-resets/add" viewLink="/security/password-resets" />
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

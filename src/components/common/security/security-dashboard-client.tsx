'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesTable } from '@/components/common/security/roles-table';
import { UsersTable } from '@/components/common/security/users-table';
import StatCard from '@/components/stat-card';
import { SecurityStats } from '@/actions/security';

interface SecurityDashboardClientProps {
  tenantId: string;
  initialStats: SecurityStats;
}

export function SecurityDashboardClient({ tenantId, initialStats }: SecurityDashboardClientProps) {
  const t = useTranslations('admin.security.dashboard');
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalUsers.title')}
          value={formatNumber(initialStats.totalUsers)}
          description={t('stats.totalUsers.description')}
          addLink={`/admin/${tenantId}/security/users/add`}
          viewLink={`/admin/${tenantId}/security/users`}
        />
        <StatCard
          title={t('stats.activeRoles.title')}
          value={formatNumber(initialStats.activeRoles)}
          description={t('stats.activeRoles.description')}
          addLink={`/admin/${tenantId}/security/roles/add`}
          viewLink={`/admin/${tenantId}/security/roles`}
        />
        <StatCard
          title={t('stats.failedLoginAttempts.title')}
          value={formatNumber(initialStats.failedLoginAttempts)}
          description={t('stats.failedLoginAttempts.description')}
          viewLink={`/admin/${tenantId}/security/login-attempts`}
        />
        <StatCard
          title={t('stats.passwordResets.title')}
          value={formatNumber(initialStats.passwordResets)}
          description={t('stats.passwordResets.description')}
          viewLink={`/admin/${tenantId}/security/password-resets`}
        />
      </div>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="roles">{t('tabs.roles')}</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UsersTable tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <RolesTable tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

